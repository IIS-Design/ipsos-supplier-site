# Feature modules

Reserved for domain-specific application composition after the shell foundation:

- `auth/`
- `projects/`
- `subsamples/`
- `reports/`
- `costs/`
- `settings/`

Keep feature UI and business workflows out of shared shell components. App Router pages should call domain services and compose feature modules; they must not read JSON fixtures directly.
