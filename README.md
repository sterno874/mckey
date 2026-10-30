# MCKey

**Keys for MCP agents — not raw secrets.**

MCKey is a simple vault that issues short-lived, scoped credentials (MCKeys) to AI agents. Master API keys stay sealed; agents only get what the allowlist permits.

## Local

```bash
npm install
npm run dev
```

- Marketing site: [http://localhost:3000](http://localhost:3000)
- Interactive prototype: [http://localhost:3000/app](http://localhost:3000/app)

## Deploy

Connected to Vercel. On every push to `main`, GitHub Actions builds the app and deploys when `VERCEL_TOKEN` (plus org/project ids) are set — or use Vercel’s GitHub integration on this repo.
