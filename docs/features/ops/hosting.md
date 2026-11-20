# Hosting and deploy

| Item | Value |
|---|---|
| Host | Vercel, static files only (no server functions, no database) |
| Current preview | https://ihh-turning-points-duayridvf-ihh4.vercel.app (version 8) |
| Config | `app/vercel.json` (long cache on `/models/*`, which carry a content version) |
| Deploy | Build locally with every gate green, then deploy the built output. Each deploy is approved by the owner |

No visitor data is stored. Quiz answers and the ticket stay in the browser.

Details: [app/README.md, Deploy notes](../../../app/README.md#deploy-notes).
