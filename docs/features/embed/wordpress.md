# WordPress embed

The museum goes on any WordPress page as one Custom HTML block with an iframe. No plugin, no upload.

| Item | Where |
|---|---|
| Embed page (poster, Start, Fullscreen) | `app/embed.html`, `app/public/embed.js` |
| Guide for IHH's editors (snippet, steps, troubleshooting) | [docs/revamp/wordpress-embed.md](../../revamp/wordpress-embed.md) |
| Paste-ready code and how-to videos (block editor, Classic editor, each inductee's page) | [docs/revamp/wordpress-code/](../../revamp/wordpress-code/README.md) |
| Whole-site package (all five inductees) | [docs/revamp/wordpress-site/](../../revamp/wordpress-site/README.md) |

Open on one inductee: `embed.html?inductee=<slug>` (einstein, lamarr, muir, albright, naismith).

Who can add it: Editors and Administrators. For Authors and Contributors WordPress removes the iframe.

Tests: `npm run e2e:embed` (sandboxed frames), `npm run e2e:wordpress` (real WordPress in Playground), `npm run e2e:wordpress-site`.

Related: [hosting](../ops/hosting.md)
