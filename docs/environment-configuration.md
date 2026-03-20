# Frontend Environment Configuration

This frontend now uses one codebase for all environments:

- `dev` branch -> `https://vidyatrack-dev.vercel.app` -> dev backend
- `stage` branch -> `https://vidyatrack-stage.vercel.app` -> stage backend
- `main` branch -> `https://vidyatrack.vercel.app` -> prod backend

## Automatic environment detection

The runtime selection logic lives in [src/app/env.shared.ts](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/src/app/env.shared.ts).

At runtime the app checks `window.location.hostname` and maps it to:

1. `VITE_APP_HOST_DEV`
2. `VITE_APP_HOST_STAGE`
3. `VITE_APP_HOST_PROD`

Then it picks the matching API base URL:

1. `VITE_API_BASE_URL_DEV`
2. `VITE_API_BASE_URL_STAGE`
3. `VITE_API_BASE_URL_PROD`

No component imports a hardcoded URL.

## File-by-file notes

### [src/app/env.shared.ts](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/src/app/env.shared.ts)

Use:

```bash
cp .env.dev.example .env
npm run dev
```

Test:

```bash
VITE_BUILD_ENVIRONMENT=dev VITE_FALLBACK_ENVIRONMENT=dev npm run build:dev
VITE_BUILD_ENVIRONMENT=stage VITE_FALLBACK_ENVIRONMENT=stage npm run build:stage
VITE_BUILD_ENVIRONMENT=prod VITE_FALLBACK_ENVIRONMENT=prod npm run build:prod
```

Security:

- Only public frontend config is exposed through `VITE_` variables.
- Invalid or missing values fail fast instead of silently using the wrong backend.

### [src/app/env.ts](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/src/app/env.ts)

Use:

- Import `ENV` for `environment`, `apiBaseUrl`, and `featureFlags`.
- Import `FEATURE_FLAGS` if a component or hook needs a direct flag object.

Security:

- Components only read from one frozen runtime config object.

### [src/vite-env.d.ts](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/src/vite-env.d.ts)

Use:

- This gives TypeScript awareness of every required `VITE_` variable.

Security:

- Misspelled env names become compile-time TypeScript errors.

### [src/api/apiClient.ts](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/src/api/apiClient.ts)

Use:

- API traffic now always flows through `ENV.apiBaseUrl`.

Test:

```bash
npm run build:stage
```

Security:

- No component or API module needs to embed environment-specific backend URLs.

### [vite.config.ts](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/vite.config.ts)

Use:

- `VITE_BUILD_ENVIRONMENT=dev` keeps sourcemaps and disables minification.
- `VITE_BUILD_ENVIRONMENT=stage` or `prod` enables optimized builds.

Security:

- The build fails immediately if required env vars are missing or malformed.

### [vercel.json](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/vercel.json)

Use:

- Commit this once and keep Vercel Git auto-deploy disabled.
- Deploy through GitHub Actions so branch-to-project routing is explicit.

Security:

- Basic security headers are applied at the edge.

### [.github/workflows/ci.yml](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/.github/workflows/ci.yml)

Use:

- Create GitHub Environments: `development`, `staging`, `production`
- Add these secrets in each environment:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

Test:

- Open a PR into `dev`, `stage`, or `main` and confirm the build job runs.
- Push to one of those branches and confirm the matching Vercel project deploys.

Security:

- Vercel credentials stay in GitHub Environment secrets.
- Production deployment can be protected with manual approvals.

### [.env.example](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/.env.example), [.env.dev.example](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/.env.dev.example), [.env.stage.example](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/.env.stage.example), [.env.prod.example](/Users/rajeshdumpeti/Documents/vidyatrack/vidyatrack-frontend/.env.prod.example)

Use:

```bash
cp .env.dev.example .env
cp .env.stage.example .env
cp .env.prod.example .env
```

Security:

- Only example templates are committed.
- Real `.env`, `.env.dev`, `.env.stage`, `.env.prod`, and `.env.local` files are ignored.

## Recommended Vercel project layout

Use three Vercel projects pointing to the same repository:

- `vidyatrack-dev` for the `dev` branch
- `vidyatrack-stage` for the `stage` branch
- `vidyatrack` for the `main` branch

Set the same public `VITE_APP_HOST_*`, `VITE_API_BASE_URL_*`, and `VITE_FEATURE_*` values in each project, then keep `VITE_BUILD_ENVIRONMENT` and `VITE_FALLBACK_ENVIRONMENT` aligned with the target project.
