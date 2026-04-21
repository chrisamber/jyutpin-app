# CI/CD

## What runs on deploy

There is currently **no GitHub Actions**. Deploy pipeline is Vercel-only:

| Trigger | Action |
|---|---|
| Push to any branch | Vercel creates a **preview deployment** — unique URL per branch |
| Push to `main` | Vercel promotes the preview to **production** |
| PR open/update | Vercel comment on PR with preview URL |

## Local pre-deploy checklist

Before merging to `main`, run manually:

```bash
npm run build   # must exit cleanly
npm run lint    # should pass (30 pre-existing errors in legacy files — acceptable)
```

## To add CI (when ready)

Recommended `.github/workflows/ci.yml`:

```yaml
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

Vercel continues to handle preview/production independently — no changes needed there.