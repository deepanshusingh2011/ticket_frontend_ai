# ticket_frontend_ai — Ticket System UI (Vite + React 18)

Standalone frontend for the Support Ticket Management System. Talks to the
backend REST API (`ticket-ai` repo, `backend/`) via `/api` proxy in dev or
direct CORS in production builds.

## Prerequisites

- Node 18+ (`node -v`)
- Backend running at `http://localhost:8080` (see backend repo README)

## Run

```bash
npm install
npm run dev
# UI at http://localhost:5174 (proxies /api → http://localhost:8080)
```

## Build

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build on :5174
```

## Backend URL

- Dev (default): relative URLs (`BASE = ''`) go through the Vite proxy
  (`/api → http://localhost:8080`, see `vite.config.js`), so no extra config.
- Direct/remote backend: set `VITE_API_URL` before dev/build, e.g.

```bash
VITE_API_URL=http://localhost:8080 npm run dev
```

The backend allows CORS from `http://localhost:5174` (plus `:5173`, `:3000`).

## Routes (react-router-dom)

| Path | Page | Description |
| ---- | ---- | ----------- |
| `/` | `ListPage` | Ticket table with search + status filter + pagination (`page`/`size` → backend) |
| `/create` | `CreatePage` | Create form (POST), redirects to `/tickets/:id` |
| `/tickets/:id` | `DetailPage` | Status buttons, comments, edit link, delete (confirm → `/`) |
| `/tickets/:id/edit` | `EditPage` | Edit form (PUT) + delete button (confirm → `/`) |

Unknown paths fall back to the list page.

## Pagination

The list page sends `page` (0-based) and `size` to `GET /api/tickets` and
renders the paged envelope `{ content, page, size, totalElements, totalPages }`.
Controls: Prev/Next, numbered pages (window of 5), page-size selector (5/10/20),
and a "Showing X–Y of Z" summary. Search/status filters reset to page 0.

## Structure

```
index.html · package.json · vite.config.js
src/
  main.jsx     # React root + BrowserRouter
  App.jsx      # header nav + <Routes>
  pages/
    ListPage.jsx    # table, filters, pagination, ErrorBanner
    CreatePage.jsx  # create form
    DetailPage.jsx  # status buttons, comments, delete
    EditPage.jsx    # edit form + delete
  api.js       # fetch wrapper (list w/ page/size/sort, delete) + constants
  styles.css
```
