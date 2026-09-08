# Deployment

Covers: the build-script changes every workspace needs first, then Vercel (`apps/web`),
Render (`apps/api`), and — if you build it — Expo/EAS for `apps/mobile`. Deploy the API
first; the web app's env var depends on its URL.

## 0. Build scripts every workspace needs (do this before touching Vercel/Render)

`ts-node-dev` (used in local dev) transpiles TypeScript on the fly, but a production Node
process needs plain compiled JS. So `packages/shared` needs a real `tsc` build, and both apps
consume its compiled output — not the raw `.ts` — identically in dev and in production.

**`packages/shared/tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**`packages/shared/package.json`** — add/confirm:
```json
{
  "name": "@1fi/shared",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  }
}
```

**`apps/api/tsconfig.json`** — same shape as shared's, `rootDir: "src"`, `outDir: "dist"`.

**`apps/api/package.json`** — add/confirm:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}
```

**Root `package.json`** — the scripts `AGENTS.md` already documents, made concrete:
```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run build --workspace=packages/shared && concurrently \"npm run dev --workspace=apps/api\" \"npm run dev --workspace=apps/web\"",
    "build": "npm run build --workspace=packages/shared && npm run build --workspace=apps/api && npm run build --workspace=apps/web",
    "typecheck": "npm run typecheck --workspace=packages/shared && npm run typecheck --workspace=apps/api && npm run typecheck --workspace=apps/web",
    "lint": "npm run lint --workspace=apps/web"
  },
  "devDependencies": { "concurrently": "^8.0.0" }
}
```

Because `packages/shared` now has a normal `main`/`types` pointing at `dist/`, neither
Next.js nor Express needs any special "transpile this workspace package" config — they both
just resolve it like any other npm dependency once it's built.

## 1. Render — `apps/api`

**The gotcha**: Render's Root Directory setting hides everything outside it at build *and*
run time. Set Root Directory to `apps/api` and `packages/shared` simply won't exist as far
as that build is concerned. The fix is to leave Root Directory at the repo root and scope
the commands instead:

| Setting | Value |
|---|---|
| Root Directory | *(leave empty — repo root)* |
| Build Command | `npm install && npm run build --workspace=packages/shared && npm run build --workspace=apps/api` |
| Start Command | `npm run start --workspace=apps/api` |
| Build Filters → Included Paths | `apps/api/**`, `packages/shared/**` (otherwise a shared-package-only change won't trigger a redeploy) |

Environment variables:
| Key | Value |
|---|---|
| `PORT` | Render sets this automatically — your `server.ts` should read `process.env.PORT` |
| `CORS_ORIGIN` | your Vercel URL, e.g. `https://1fi-marketplace.vercel.app` (set after step 2, redeploy) |

Free-tier note for your README: Render's free web services spin down after inactivity, so
the first request after idle time takes ~30-50s. Not a bug, just don't be surprised live.

## 2. Vercel — `apps/web`

| Setting | Value |
|---|---|
| Root Directory | `apps/web` |
| Framework Preset | Next.js *(auto-detected)* |
| Build Command (override) | `cd ../.. && npm run build --workspace=packages/shared && cd apps/web && npm run build` |
| Install Command | leave default — Vercel installs from the repo root automatically once it sees the `workspaces` field |

Environment variables:
| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | your Render service URL from step 1, e.g. `https://onefi-api.onrender.com` |

Push to `main` → Vercel builds and deploys automatically from here on.

## 3. Wiring order
1. Deploy `apps/api` to Render first, copy its URL.
2. Set `NEXT_PUBLIC_API_BASE_URL` on Vercel to that URL, deploy `apps/web`, copy *its* URL.
3. Go back to Render, set `CORS_ORIGIN` to the Vercel URL, redeploy the API so CORS isn't
   left wide open.

## 4. React Native / Expo (`apps/mobile`), if you build it later
There's no server to stand up — the RN app is a client, same as the web app, and hits the
*same* Render API. Add it to the workspace like any other app:
```
apps/
  mobile/         # Expo app, imports @1fi/shared exactly like apps/web does
```
Point it at the API with Expo's env convention (mirrors Next's `NEXT_PUBLIC_` prefix):
```
EXPO_PUBLIC_API_BASE_URL=https://onefi-api.onrender.com
```

"Deployment" here means getting a build onto a reviewer's device, not a URL for a browser.
Two options:

**Quick, for a live walkthrough** — `npx expo start`, share the QR code, reviewer opens it in
the Expo Go app. Zero cost, zero EAS usage, but the link only works while your dev server is
running.

**Shareable, works async** — EAS Build with internal distribution produces an installable
`.apk` behind a stable URL; the reviewer taps it and installs directly, no Expo Go needed.
Free tier covers 15 Android builds/month, one is all this needs.

`apps/mobile/eas.json`:
```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": { "EXPO_PUBLIC_API_BASE_URL": "https://onefi-api.onrender.com" }
    }
  }
}
```
Then: `eas build --platform android --profile preview` — EAS prints the install link when
it finishes.

## Checklist
- [ ] `packages/shared` builds cleanly to `dist/` with `main`/`types` set
- [ ] `apps/api` builds and its `dist/server.js` runs standalone
- [ ] Render: Root Directory empty, build filters include both paths
- [ ] Vercel: `NEXT_PUBLIC_API_BASE_URL` set, build command builds shared first
- [ ] `CORS_ORIGIN` on Render locked to the real Vercel URL, not a wildcard
- [ ] (optional) `apps/mobile` added, `EXPO_PUBLIC_API_BASE_URL` set, one EAS preview build made
