# UI Test Automation – Playwright + TypeScript

End-to-end test automation framework for web applications that:

- runs UI tests on **desktop and mobile viewports** (real device descriptors + custom screen sizes),
- prepares test data through an **API layer** (typed clients, no UI-driven setup),
- supports **multiple environments** via JSON config + env-var overrides (validated at startup),
- runs on **Chromium, Firefox and WebKit**,
- executes **fully in parallel** locally and sharded in CI.

The framework is currently wired to a public demo web shop as a placeholder target so that every
layer can be executed today. See [docs/GUIDE.md §12](docs/GUIDE.md#12-adapting-the-framework-to-your-application)
for the short list of files to change when pointing it at your application.

## Quick start

```bash
npm ci
npx playwright install --with-deps
cp .env.example .env            # optional local overrides

npm run test:api                # API tests (no browser, ~5s)
npm run test:chromium           # UI tests on desktop Chromium
npm run test:mobile             # Pixel 7, iPhone 14, 320px phone, iPad
TEST_ENV=dev npm run test:smoke # smoke tag on another environment
npm run report                  # open HTML report
```

## Layout

```
config/          environments/*.json, env.ts (loader + validation), devices.ts (browser/device matrix)
src/api/         API clients, models, base HTTP client
src/pages/       page objects & components (responsive logic lives here)
src/fixtures/    custom `test` with api / users / session / page-object fixtures
src/data/        factories, static test data, tags, breakpoints
tests/setup/     provisions the default user via API before UI projects
tests/api/       API tests            tests/ui/   UI tests by feature
docs/GUIDE.md    full framework & usage guide
```

## Documentation

The complete guide — technology stack, architecture, configuration, device matrix, parallelism,
writing tests, API layer, reporting, CI and troubleshooting — is in [docs/GUIDE.md](docs/GUIDE.md).
