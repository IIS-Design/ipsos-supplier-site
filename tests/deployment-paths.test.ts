import assert from "node:assert/strict";
import { test } from "node:test";
import { withBasePath } from "../src/lib/app-path";
import { getPublicOrigin } from "../src/lib/public-origin";

test("browser resource paths retain the deployment prefix without corrupting external URLs", () => {
  for (const path of ["/api/auth/mock-session/", "/api/settings/users/", "/mock-reports/sample.csv", "/email-preview/reset-password/?state=expired", "/logos/ipsos-logo.png"]) {
    assert.equal(withBasePath(path), `/supplier${path}`);
    assert.equal(withBasePath(withBasePath(path)), `/supplier${path}`);
  }
  for (const path of ["https://files.example.com/report.csv", "//files.example.com/report.csv", "mailto:support@example.com", "#main-content", "?view=queue", "/supplier?view=queue", "/supplier#main-content"]) {
    assert.equal(withBasePath(path), path);
  }
  assert.equal(withBasePath("/supplier-other/report.csv"), "/supplier/supplier-other/report.csv");
});

test("email URLs use the public HTTPS origin behind the deployment proxy", () => {
  const previous = process.env.APP_ORIGIN;
  delete process.env.APP_ORIGIN;
  try {
    const request = new Request("http://0.0.0.0:3000/supplier/email-preview/password-changed/", { headers: { host: "design.go.ar", "x-forwarded-proto": "https" } });
    assert.equal(getPublicOrigin(request), "https://design.go.ar");
    assert.equal(new URL(withBasePath("/login/"), getPublicOrigin(request)).href, "https://design.go.ar/supplier/login/");
    assert.equal(getPublicOrigin(new Request("http://localhost:3000/supplier/")), "http://localhost:3000");
    assert.equal(getPublicOrigin(new Request(request, { headers: { "x-forwarded-host": "staging.example.com, internal", "x-forwarded-proto": "https, http" } })), "https://staging.example.com");
    process.env.APP_ORIGIN = "https://design.go.ar";
    assert.equal(getPublicOrigin(new Request("http://internal:3000/")), "https://design.go.ar");
  } finally {
    if (previous === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = previous;
  }
});

test("native anchors cannot silently bypass the deployment prefix", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const ts = await import("typescript");
  const violations: string[] = [];
  async function inspect(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) { await inspect(file); continue; }
      if (!file.endsWith(".tsx")) continue;
      const source = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function visit(node: import("typescript").Node) {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(source) === "a") {
          for (const attribute of node.attributes.properties) {
            if (ts.isJsxAttribute(attribute) && attribute.name.getText(source) === "href" && attribute.initializer && ts.isStringLiteral(attribute.initializer)) {
              const href = attribute.initializer.text;
              if (href.startsWith("/") && !href.startsWith("//") && withBasePath(href) !== href) violations.push(`${file}: ${href}`);
            }
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  await inspect(join(process.cwd(), "src"));
  assert.deepEqual(violations, [], "Use Next.js Link or withBasePath for application anchors.");
});
