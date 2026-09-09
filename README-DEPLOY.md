# Deploying to Vercel

This folder is restructured for Vercel (same business logic as the main project,
just laid out to match Vercel's static + serverless-function convention):

```
index.html, styles.css, app.js    -> served as static files at the root
api/index.js                      -> one serverless function handling all /api/* routes
src/                               -> unchanged: models, repositories, services, routes
vercel.json                        -> rewrites /api/(.*) to the function
```

## Option A — Vercel Drop (drag-and-drop, no CLI)

1. Zip this folder (or use `kangasys-vercel.zip` if you already have it).
2. Go to **vercel.com/drop**, sign in, and drag the zip onto the page.
3. Pick a team + project name → **Deploy**.
4. Vercel detects the `/api` folder, builds `api/index.js` as a serverless
   function, and serves `index.html` / `styles.css` / `app.js` as static
   files. You'll get a live `*.vercel.app` URL in seconds.

## Option B — Vercel CLI (from your terminal)

```bash
npm i -g vercel
cd kangasys-vercel
vercel --prod
```

Same result, useful if you want to redeploy later without re-dragging a zip.

## Important — read this before you rely on it

**In-memory data on a serverless platform is not real persistence.** `api/index.js`
builds one `container` (the same in-memory repositories from the main project) when
the function cold-starts, and reuses it for as long as that particular lambda
instance stays warm. In practice, during a normal demo session this behaves like a
regular stateful app — add a device, submit a reading, it's still there a minute
later. But:

- A cold start after a period of inactivity resets everything back to the seed data.
- Under concurrent traffic, Vercel may route different requests to different lambda
  instances that don't share this memory — so two people hitting the deployed URL
  at the same time can see different states.
- There is no guarantee of how long an instance stays warm.

This is fine for showing the app working end-to-end. It is **not** a substitute for
a real database. The repository layer in `src/repositories/` is already shaped so
this is a contained swap later (implement the same five methods —
`findAll`/`findById`/`create`/`update`/`delete` — against Vercel Postgres or Vercel
KV instead of a JS `Map`), but that swap hasn't been done here.

If a demo session ends up in a confusing state, `POST /api/_reset` clears all three
repositories and re-seeds from `sample-data/` without waiting for a cold start:

```bash
curl -X POST https://<your-deployment-url>/api/_reset
```

## What I verified locally before handing this off

- The serverless function (`api/index.js`) boots and serves `/api/health`,
  `/api/devices`, `/api/alerts`, and device creation + anomaly-triggering reading
  submission correctly when run as a plain Node server (the closest local
  equivalent to how Vercel invokes it).
- I did **not** run an actual `vercel deploy` from this environment — the sandbox's
  network allowlist doesn't include Vercel's domains, so I can't push this live
  myself. Everything above is prepared and locally verified, but the live deploy
  step is yours to run.
