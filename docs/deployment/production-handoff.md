# Production deployment handoff

This repository is prepared for the existing IIS-Design reusable container workflow. No production host, proxy, GitHub setting, or deployment was changed by this setup.

## Application settings

| Setting | Value |
| --- | --- |
| Application / GHCR image | `ipsos-supplier-site` / `ghcr.io/iis-design/ipsos-supplier-site` |
| Deployment branch | `main` |
| Public URL | `https://design.go.ar/supplier/` |
| Next.js base path | `/supplier` (baked in at build time) |
| Build runner | `ipsos-devops-01` (rootless Podman) |
| Production host | `ipsos-apps-01` (Docker Compose) |
| Production directory | `/srv/apps/ipsos-supplier-site` |
| Docker network | `ipsos-edge` (external) |
| Container port | `3000` |
| Local and production health path | `/supplier/_health/` |

The caller in `.github/workflows/ci.yml` uses only the supported reusable-workflow inputs: `app`, `container-port`, `smoke-path`, and `deploy-branch`. It grants `contents: read` and `packages: write`; GHCR login uses the workflow's `GITHUB_TOKEN`. No additional GitHub secret is required by the caller. The workflow runs on pushes; only `main` deploys to production. Other pushed branches are still built and smoke-tested by the shared workflow.

## Required production setup

On `ipsos-apps-01` as root, create `/srv/apps/ipsos-supplier-site` and install this `compose.yaml` there:

```yaml
services:
  ipsos-supplier-site:
    image: ghcr.io/iis-design/ipsos-supplier-site:main
    container_name: ipsos-supplier-site
    restart: unless-stopped
    env_file:
      - .env
    environment:
      NODE_ENV: production
      PORT: "3000"
      HOSTNAME: 0.0.0.0
    expose:
      - "3000"
    healthcheck:
      test:
        - CMD
        - node
        - -e
        - fetch('http://127.0.0.1:3000/supplier/_health/').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))
      interval: 30s
      timeout: 3s
      start_period: 10s
      retries: 3
    networks:
      - ipsos-edge

networks:
  ipsos-edge:
    external: true
```

The health check is also declared in the image. The deployment engine's rollback gate is configured separately by `.iis-deploy` and must not be replaced by the container health check.

Create `/srv/apps/ipsos-supplier-site/.env` on the production host with a newly generated, unique value:

```dotenv
MOCK_AUTH_SECRET=<unique-random-secret-at-least-32-bytes>
```

For example, generate a value directly on the host with `openssl rand -base64 48`. Keep this file root-owned with mode `0600`; it is not a repository file and must never be committed or put in GitHub Actions logs. `MOCK_AUTH_SECRET` is the only application runtime secret currently required. The deployment workflow does not need it because CI only starts the container and requests the unauthenticated health endpoint.

Create the root-managed `/srv/apps/ipsos-supplier-site/.iis-deploy` with exactly:

```dotenv
IMAGE_REPO=ghcr.io/iis-design/ipsos-supplier-site
SERVICE=ipsos-supplier-site
HEALTH_URL=http://ipsos-supplier-site:3000/supplier/_health/
```

Keep this file root-owned and do not edit the deployment-generated `compose.override.yaml` manually. The platform writes that override to pin the deployed image by immutable registry digest; it is authoritative over the moving `:main` tag.

Ensure the external Docker network exists before starting the service:

```sh
docker network inspect ipsos-edge >/dev/null 2>&1 || docker network create ipsos-edge
```

## Nginx route

The existing `design-proxy` is a container attached to `ipsos-edge`; its read-only host config is `/srv/apps/design-proxy/nginx.conf`. Add the following locations to its existing server block only after `ipsos-supplier-site` is running on `ipsos-edge`. Current proxy routes use static Docker service names in `proxy_pass`; Nginx resolves these while loading the configuration, so testing or reloading this route before the backend DNS name exists can fail. `proxy_pass` intentionally has no URI suffix, so Nginx passes `/supplier/...` upstream unchanged; Next.js expects that prefix because `basePath` is enabled.

```nginx
location = /supplier {
    return 301 /supplier/;
}

location ^~ /supplier/ {
    proxy_pass http://ipsos-supplier-site:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The proxy container is already attached to `ipsos-edge`. After the first successful application deployment, add the route to `/srv/apps/design-proxy/nginx.conf`, then validate and reload without restarting the container:

```sh
cd /srv/apps/design-proxy
docker compose exec -T proxy nginx -t
docker compose exec -T proxy nginx -s reload
```

Do not reload the proxy before the application service name resolves on `ipsos-edge`.

## Deployment and rollback checks

Before enabling the first deployment, check the service and routing configuration on `ipsos-apps-01`:

```sh
cd /srv/apps/ipsos-supplier-site
docker compose config --quiet
docker network inspect ipsos-edge
```

The manual go-live sequence is:

1. Install `compose.yaml`, `.env`, and `.iis-deploy` under `/srv/apps/ipsos-supplier-site`; keep the secret and deployment config root-managed.
2. Ensure `ipsos-edge` exists and `design-proxy` is attached to it.
3. Before exposing the route, create a Cloudflare Access application/policy for `design.go.ar/supplier/*` and allow only named prototype testers.
4. Merge/push the application workflow to `main` when deployment is approved. The shared workflow performs the first image deployment and writes the digest override; do not manually deploy the moving `:main` image with `docker compose up`.
5. After the backend service is running and resolvable, add the Nginx locations above, run `docker compose exec -T proxy nginx -t`, reload `design-proxy`, then verify the public health and app URLs.
6. Confirm the workflow, digest pin, container health, and internal health URL using the checks below.

After the shared workflow completes, confirm the running service and image pin:

```sh
docker compose ps
docker inspect --format '{{.State.Health.Status}}' ipsos-supplier-site
cat compose.override.yaml
docker compose logs --tail=100 ipsos-supplier-site
curl --fail --silent --show-error http://127.0.0.1:3000/supplier/_health/
curl --fail --silent --show-error https://design.go.ar/supplier/_health/
```

The local smoke test uses `/supplier/_health/`; `.iis-deploy` uses the service-network health URL above. The deploy engine validates health after Compose starts the digest-pinned image and restores the previous digest if it fails. For a failed release, verify the GitHub run is red, `compose.override.yaml` is back on the previous digest, the service is healthy, and the public health URL responds. Do not deliberately deploy an unhealthy image to production solely to test rollback; the shared platform runbook records that automatic rollback has already been validated.

## Authentication release blocker

This application currently has **mock prototype authentication**, not production identity. Setting a strong `MOCK_AUTH_SECRET` only protects the integrity of its signed session cookies. It does not make authentication safe: before a fixture account resets its password, any non-empty password is accepted; demo administrator and user accounts are present; there is no SSO, MFA, rate limiting, lockout, or verified email; and passwords, recovery tokens, sessions, and application changes are process-local. A fixture review found internal `@ipsos.com` contact values in the sample Subsample data, so the repository cannot currently be certified as containing only synthetic personal data. Remove or replace those values and obtain data-owner confirmation before exposing the route. The application must not be exposed as a real supplier portal or used with real supplier data until mock authentication and prototype data/storage are replaced with production-grade services. A public deployment with mock auth exposes the prototype's demo accounts and functionality to anyone who can reach it. Cloudflare Access restricting `/supplier/*` to named prototype testers is a practical interim restriction, not a substitute for production authentication.
## Subpath routing audit

The public application lives at `https://design.go.ar/supplier/`, including local
production builds at `http://localhost:3000/supplier/`. `basePath` is compiled into
the application; changing it requires rebuilding the image. The proxy must retain
the `/supplier` prefix. Direct root paths such as `/forgot-password` are outside
this application.

Use Next.js `Link`, App Router `push`/`replace`, and page `redirect` with application
paths such as `/forgot-password`; Next.js applies the prefix. Use `withBasePath`
for browser `fetch`, native download links, email previews, and cookie paths.
Do not add the prefix twice. External report URLs, mail links, query strings, and
fragments remain unchanged. `notFound()` renders within the application and does
not require a URL. There is no middleware or proxy source file in this repository.

Email preview absolute links use the public `Host`/`X-Forwarded-Host` and
`X-Forwarded-Proto` supplied by the trusted reverse proxy, rather than the
standalone server's `http://0.0.0.0:3000` request origin. The Nginx settings above
already preserve `Host` and set `X-Forwarded-Proto`. If another proxy changes those
headers, set optional runtime `APP_ORIGIN=https://design.go.ar` in the application's
host `.env` (origin only, without `/supplier`). It overrides forwarded headers.

The Forgot Password entry uses Next.js Link. Administrator-initiated reset emails
scope their receipt cookie to `/supplier/email-preview`, matching self-service
recovery. Preview state remains process-local: a restart or multiple application
replicas can invalidate a receipt independently of URL correctness. Authentication
cookies require HTTPS in production. Fixture-backed settings, reports and recovery
remain prototype behavior; this routing audit does not introduce external services.
