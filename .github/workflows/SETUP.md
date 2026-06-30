# CD Secrets Setup Guide

## 1. Vercel Token & Project Info

```bash
# Install Vercel CLI (run once locally)
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Get a token: Vercel Dashboard → Settings → Tokens → Create
# Get Org ID & Project ID
vercel pull --yes --environment=production
# Check the .vercel/project.json file
```

Add these to GitHub: Settings → Secrets and variables → Actions:

| Secret | Source |
|---|---|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

## 2. Render Deploy Hook

In Render Dashboard:
1. Select your backend service
2. Settings → Deploy Hooks → **Create Deploy Hook**
3. Copy the generated URL

Add to GitHub Secrets:

| Secret | Source |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render Deploy Hook URL |

## 3. Verify

Push to `main` — you should see the `CI/CD` workflow run in GitHub Actions. After CI passes, both deploy jobs will trigger automatically.
