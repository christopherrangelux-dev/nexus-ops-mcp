---
name: run-nexus-ops-mcp
description: Build, run, and drive the nexus-ops-mcp React/Vite SPA (christopherrangelux-dev.github.io/nexus-ops-mcp). Use when asked to start the dev server, build the site, take a screenshot, or interact with its UI (MCP server registry, discovery, detail/lifecycle panels, registration wizard).
---

nexus-ops-mcp is a Vite + React 18 SPA (GitHub Pages, project base path `/nexus-ops-mcp/`), no router — `App.tsx` switches views via component state. `chromium-cli` is not available in this environment, so a Playwright driver at `.claude/skills/run-nexus-ops-mcp/driver.mjs` is the agent-facing way to drive it — it starts the dev server itself and exposes a small REPL of commands over stdin. Modeled directly on the sibling `nexus-ops` repo's `run-nexus-ops` skill (same driver, unchanged aside from comments/paths) — see that repo if this one's gotchas section is missing something already solved there.

All paths below are relative to the repo root (`nexus-ops-mcp/`).

## Prerequisites

```bash
npm install   # includes playwright as a devDependency
npx playwright install chromium   # no-op if already cached
```

## Build

```bash
npm run build   # outputs to dist/
```

## Run (agent path)

The driver manages its own dev server (kills stray `vite` processes first, clears `node_modules/.vite`) and a headless Chromium page. Pipe commands to it via a heredoc:

```bash
node .claude/skills/run-nexus-ops-mcp/driver.mjs <<'EOF'
launch
click-text Registry (Admin)
ss registry
quit
EOF
```

Screenshots land in `/tmp/shots/` (override: `SCREENSHOT_DIR`). Commands run strictly in the order given, even though the dev server takes a few seconds to come up on `launch`.

For interactive back-and-forth instead of a fixed script, run it without a heredoc and type commands at the `driver>` prompt (foreground only — there's no tmux on this machine).

### Commands

| command | what it does |
|---|---|
| `launch` | kill stray dev servers, start `vite`, open a headless page at the site root |
| `click <css-sel>` | click an element, then settle ~350ms (no URL to wait on — pure React state) |
| `click-text <text>` | click the first element containing `<text>`, same settle wait |
| `ss [name]` | screenshot → `/tmp/shots/<name>.png` |
| `hover <css-sel>` | hover an element |
| `type <text>` / `press <key>` | keyboard input (e.g. `press Enter`, `press Tab`) |
| `wait <css-sel>` | wait up to 10s for a selector to appear |
| `eval <js>` | evaluate an expression in the page, print JSON |
| `text [css-sel]` | print `innerText` of a selector (or `document.body`) |
| `console` | print and clear captured browser console/page errors since last call |
| `quit` | close the browser and kill the dev server |

## Run (human path)

```bash
npm run dev   # opens http://localhost:5173/nexus-ops-mcp/ — Ctrl-C to stop
```

## App map (for navigating without a router)

- Default view on load is **Discovery** (developer-facing). A pill toggle at the top switches to **Registry (Admin)** — `click-text Discovery` / `click-text "Registry (Admin)"`.
- **Discovery** → grid of `APPROVED` servers only (`DiscoveryView`), each card has a "Request Access" button.
- **Registry (Admin)** → left `Sidebar` filters by category; main list (`RegistryView`) shows all servers regardless of status, click a row to open `ServerDetail`. A "Create New Server" button (top right, only visible in this view) opens `ServerCreator`.
- **Server Detail** (`click-text` a server name from Registry) — sections top to bottom: header card, `ApprovalDiff` (only if `PENDING`), Permission Policy View (Strategic Map / Execution List toggle), Connection Configuration (`ConnectionClipboard`, only if `APPROVED`/`DEACTIVATED`), Agent Connections (`AgentConnectionsPanel`, only if `APPROVED`/`DEACTIVATED`), History (`AuditHistoryTable`, always visible). Back button (`ArrowLeft` + "Back to Registry" text) returns to Registry.
- **Create New Server** → `ServerCreator`, reachable only from Registry's "Create New Server" button.
- Flagship server for screenshots: **Customer Data MCP** (`mcp-customer-data`) — `APPROVED`, heaviest audit trail and agent-connection count. **Data Warehouse Connector** (`mcp-analytics-warehouse`) has zero agent connections — use it for the Agent Connections empty-state. **Document Intelligence MCP** (`mcp-document-processor`) is the one `REJECTED` server, useful for confirming approved-only sections correctly hide.

## Test

No test suite exists in this repo (`package.json` only has `dev`/`build`). `npm run build` succeeding is the correctness gate.

---

## Gotchas

- **`.overflow-y-auto` matches more than one element — don't `querySelector` it blindly.** `Sidebar.tsx` also has `overflow-y-auto` and sits earlier in the DOM than the main content pane (`ServerDetail`/`RegistryView`/`DiscoveryView`), so `document.querySelector('.overflow-y-auto')` grabs the sidebar, not the scrollable content — an `eval` setting `.scrollTop` on it silently scrolls the wrong element (no error, just a screenshot that looks unscrolled). Use `[...document.querySelectorAll('.overflow-y-auto')].find(el => el.scrollHeight > el.clientHeight).scrollTop = 99999` instead, which picks the element that actually has overflow.
- **Two dev servers running at once on the same port** will make the second `vite` instance pick a different port — the driver parses the real port out of `vite`'s own "Local: http://localhost:PORT/nexus-ops-mcp/" line rather than hardcoding 5173, so this is handled, but if you started a manual `npm run dev` separately in another terminal, kill it first (`pkill -f 'node_modules/.bin/vite'`) to avoid two servers serving slightly different in-memory state.
- **No router means no URL to poll.** `click`/`click-text` here don't wait for `location.href` to change — they just click and settle. If a future interaction here ever becomes async (e.g. a real API call), revisit this.
- **Scripted clicks need more settle time than you'd expect — 150ms isn't enough.** A real trusted mouse click flushes React's state update synchronously before paint; clicks dispatched via Playwright (or raw `element.click()` via `eval`) appear to commit measurably slower in this headless setup (confirmed empirically in the sibling `nexus-ops` repo — same driver code, same effect expected here). `click`/`click-text` settle for 350ms for this reason — if you bypass them with a raw `eval(...).click()`, add your own `await new Promise(r => setTimeout(r, 350))` before reading computed styles or taking a screenshot.
- **Piped/heredoc stdin races the REPL's own queue.** An explicit FIFO queue serializes commands, and `close` (EOF) waits for the queue to drain before tearing down the browser/dev server.

## Troubleshooting

- **`ERROR: launch first` on every command:** `launch` is still starting the dev server — use a heredoc with `launch` as line 1 so the queue handles the ordering correctly.
- **Click-text matches the wrong element:** `click-text` matches the *first* element containing the given text, including badges/labels nested inside larger clickable rows. If two rows share similar text, target unique text instead (a status badge, not a shared label).
