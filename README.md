# MCP Registry

A representative recreation of an MCP (Model Context Protocol) server registry, built to support
the **MCP Server Registration** case study on
[christopherrangelux-dev.github.io/Portfolio](https://christopherrangelux-dev.github.io/Portfolio/).

The case study has two connected layers, and this demo shows both:

- **Discovery** — a human-facing directory where developers browse available MCP servers and
  request access, without needing to understand the underlying registration architecture.
- **Registry (Admin)** — the registration and governance side: category-filtered server list,
  permission graph/list views, security approval workflow for pending servers, connection config
  generation, and a server-creation flow with live validation and a chat-style sandbox for testing
  tool calls before submitting.

No real company data or branding — mock content only, genericized for public use.

## Running locally

```bash
npm install
npm run dev
```

```bash
npm run build
```
