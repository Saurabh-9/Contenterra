# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Contenterra — Hiring Project (React Developer Assignment)

This repository implements the React Developer assignment you were given.

Goal (from the assignment):
- Fetch JSON from: https://www.reddit.com/r/reactjs.json
- Display each item in a responsive card grid (default visual resolution 1280×720)
- Each card should show: Title, SelfText_HTML, URL and score (fields from each child in the response)

What this project provides
- A beautiful, responsive UI that fetches and displays posts from /r/reactjs.
- Cards include: Title, rendered SelfText_HTML, URL (clickable), score, author and time-ago metadata.
- Search box to filter posts by title/self-text.

Files of interest (changed/created)
- `src/App.jsx` — main UI and fetch logic (fetches reddit JSON, filters, renders cards). This uses `dangerouslySetInnerHTML` to render `selftext_html` (as requested).
- `src/App.css` — styling for the responsive grid, cards, header, and animations.
- `vite.config.js` — dev server proxy to route `/api/reddit/*` to `https://www.reddit.com/*` during development (avoids CORS).
- `index.html` — includes Google Fonts and theme color tweaks.

How the assignment requirements are covered
- Data source: The app fetches the JSON at `https://www.reddit.com/r/reactjs.json` (in development the request goes to `/api/reddit/r/reactjs.json` which the dev server proxies to Reddit).
- Card fields: each card displays the `title`, the `selftext_html` (rendered), the `url` (opens in new tab), and the `score`.
- Responsiveness & default resolution: The layout is responsive and the container targets a max-width of 1280px and a visual min-height of 720px to match the requested default resolution.

Quick start (development)
1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open the local URL printed by Vite (for example `http://localhost:5174/`) and resize the browser to 1280×720 to see the default layout.

Notes and suggestions
- SelfText_HTML rendering: The app renders `selftext_html` using `dangerouslySetInnerHTML` to match the assignment. If you prefer safer output, add HTML sanitization (e.g., DOMPurify) before injecting.
- Production build: use `npm run build` to create a production-ready `dist/` folder. Serve it with `npm run preview` or deploy to a static host.
- .gitignore: Consider adding a standard Node/Vite `.gitignore` (node_modules, dist, .env, .DS_Store, etc.).

Next steps you might want me to do
- Add DOMPurify and sanitize `selftext_html` before rendering.
- Add pagination or a "load more" button for larger subreddits.
- Provide a small test (vitest + msw) to mock the Reddit response and assert rendering.

Contact / Repository
- Remote origin: `git@github.com:Saurabh-9/Contenterra.git`

If you want, I can now commit the rest of the project files (source, styles) to this repository and push them under the same remote. Tell me which additional changes you'd like and I'll apply them.

