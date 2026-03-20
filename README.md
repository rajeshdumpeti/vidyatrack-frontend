# VidyaTrack Frontend

React + TypeScript + Vite frontend for VidyaTrack.

## Local Run

```bash
npm ci
cp .env.dev.example .env
npm run dev
```

## Build Profiles

```bash
npm run build:dev
npm run build:stage
npm run build:prod
```

## Environment Configuration

- [Frontend Environment Configuration](./docs/environment-configuration.md)

## Branch-to-Environment Mapping

- `dev` -> `https://vidyatrack-dev.vercel.app`
- `stage` -> `https://vidyatrack-stage.vercel.app`
- `main` -> `https://vidyatrack.vercel.app`
