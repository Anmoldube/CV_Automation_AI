# CV_Automation_AI
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**From repo root:**
```bash
npm run dev           # Start both frontend (Vite :5173) and backend (Express :3001) concurrently
npm run dev:backend   # Backend only (Node --watch)
npm run dev:frontend  # Frontend only (Vite)
npm run build         # Build frontend to dist/
npm run install:all   # Install dependencies for both packages
```

**Backend-only (from `backend/`):**
```bash
npm start     # Production start
npm run dev   # Dev with hot reload
```

**Frontend-only (from `frontend/`):**
```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
```

**Environment setup:** Copy `backend/.env.example` to `backend/.env` and set `OPENROUTER_API_KEY`. Without it the backend cannot call the LLM.

## Architecture

This is a monorepo with separate `backend/` (Express, Node ES modules) and `frontend/` (React + Vite) packages. Vite proxies `/api/*` → `localhost:3001`, so there's no CORS issue in dev.

### Request lifecycle

1. User submits job description + current resume text via the form
2. `POST /api/generate` → `backend/routes/generate.js` calls `services/openrouter.js`
3. OpenRouter returns a strict JSON blob (matchScore, keywords, sections) parsed in `optimizeResume()`
4. Frontend displays the result; user picks a download format
5. `POST /api/download/{pdf|docx|latex}` → corresponding generator in `backend/utils/` applies template styling and streams the file blob back
6. Frontend creates a temporary `<a>` element to trigger browser download

### Backend key files

| File | Role |
|------|------|
| `backend/server.js` | Express app, middleware, mounts `/api` routes |
| `backend/routes/generate.js` | Endpoint handlers: `/generate`, `/download/pdf`, `/download/docx`, `/download/latex`, `/health` |
| `backend/services/openrouter.js` | LLM integration — `callOpenRouter()` with 3-attempt retry on 429, `optimizeResume()` orchestrates call and JSON parsing. `MODEL_MAP` maps display names → OpenRouter IDs (all free tier). |
| `backend/utils/pdfGenerator.js` | PDFKit-based generation with 5 `TEMPLATE_CONFIGS` (colors, fonts) |
| `backend/utils/docxGenerator.js` | `docx` library generation with 5 template color schemes |
| `backend/utils/latexGenerator.js` | String-based LaTeX generation with 5 preambles; `escapeLatex()` for safety |

### Frontend key files

| File | Role |
|------|------|
| `frontend/src/App.jsx` | All state lives here: `selectedTemplate`, `status` lifecycle, `result`, user inputs |
| `frontend/src/components/GeneratorForm.jsx` | Renders form (idle), progress bar (analyzing/rewriting…), results + download buttons (done), error card (error) |
| `frontend/src/components/TemplateSelector.jsx` | Grid of 5 template previews that update `selectedTemplate` |

### Resume data schema

The AI returns (and generators consume) this JSON shape:
```json
{
  "matchScore": 0-100,
  "keywords": ["string"],
  "sections": {
    "header": { "name", "email", "phone", "location", "linkedin", "website", "github" },
    "professionalSummary": "string",
    "skills": ["string"],
    "experience": [{ "company", "position", "dates", "location", "bullets": ["string"] }],
    "education": [{ "institution", "degree", "field", "dates", "gpa" }],
    "projects": [{ "name", "technologies", "description", "bullets": ["string"] }],
    "certifications": ["string"],
    "publications": [{ "title", "journal", "year" }]
  }
}
```

### Templates

Templates 1–5 are hardcoded design configurations (colors, fonts, spacing). To add a new template, extend `TEMPLATE_CONFIGS` in each of the three generator files and add a preview in `TemplateSelector.jsx`.

### Status lifecycle (App.jsx)

`idle` → `analyzing` → `extracting` → `rewriting` → `formatting` → `compiling` → `generating-docx` → `done` | `error`

These string values drive the progress bar UI in `GeneratorForm.jsx`.
