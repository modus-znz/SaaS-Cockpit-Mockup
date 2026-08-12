# Graph Report - SaaS-Cockpit-Mockup  (2026-07-17)

## Corpus Check
- 9 files · ~119,842 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 49 nodes · 43 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_cockpit-saas|cockpit-saas]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_server.js|server.js]]
- [[_COMMUNITY_.oxlintrc.json|.oxlintrc.json]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_React + Vite|React + Vite]]
- [[_COMMUNITY_App.jsx|App.jsx]]

## God Nodes (most connected - your core abstractions)
1. `scripts` - 5 edges
2. `cockpit-saas` - 4 edges
3. `rules` - 3 edges
4. `React + Vite` - 3 edges
5. `tools` - 2 edges
6. `App()` - 2 edges
7. `$schema` - 1 edges
8. `plugins` - 1 edges
9. `react/rules-of-hooks` - 1 edges
10. `react/only-export-components` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (9 total, 1 thin omitted)

### Community 0 - "cockpit-saas"
Cohesion: 0.25
Nodes (7): label, order, path, content-security-policy, tools, cockpit-saas, version

### Community 1 - "package.json"
Cohesion: 0.25
Nodes (7): dependencies, react, react-dom, name, private, type, version

### Community 2 - "server.js"
Cohesion: 0.25
Nodes (6): fs, HTML_FILE, http, path, REVENUE_DATA, server

### Community 3 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 4 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react

### Community 5 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 6 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **32 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `version` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._