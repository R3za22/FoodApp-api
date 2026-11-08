# FoodApp

A recipe app in two parts: a **Django REST API** (recipes, tags, ingredients, image upload, token auth) and a **React client** in `web/` that works against the API or, on its own, against local sample data.

Built on the structure of a public Advanced Django REST API course (credit to the course author), then extended: ingredients on recipe detail and write, create endpoints for tags and ingredients, per-item recipe counts, env-based settings, an OpenAPI schema and a typed web client.

## API (Django 5.2 + DRF)

```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
export DJANGO_DEBUG=1            # local only; production needs DJANGO_SECRET_KEY instead
python manage.py migrate
python manage.py runserver       # Swagger UI at /api/schema/swagger-ui/
python manage.py test            # 57 tests
```

| Env var | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | required unless `DJANGO_DEBUG=1` (or running tests) |
| `DJANGO_DEBUG` | `1` to enable debug; **off by default** |
| `DJANGO_ALLOWED_HOSTS` | comma separated hosts |
| `DJANGO_MEDIA_ROOT`, `DJANGO_STATIC_ROOT` | upload/static paths |

Endpoints: `POST /api/user/create/`, `POST /api/user/token/`, `GET/PATCH /api/user/me/`, `/api/recipe/recipes/` (CRUD, `?tags=1,2&ingredients=3`, `POST .../{id}/upload-image/`), `/api/recipe/tags/`, `/api/recipe/ingredient/` (singular, kept for compatibility). Authenticate with `Authorization: Token <token>`.

The schema is committed at `docs/openapi.yaml`; regenerate with `DJANGO_DEBUG=1 python manage.py spectacular --file docs/openapi.yaml`.

Not done: pagination, CORS headers (use the Vite proxy in dev), Docker/Postgres, CI.

## Web client (`web/`)

Vite + React + TypeScript. Screens: sign up / log in, my recipes with tag, ingredient and title filters, recipe detail, create/edit with photo, tags and ingredients manager, profile with API token. English plus Persian (RTL), switchable from the header.

```bash
cd web && npm install
npm run dev            # mock mode: sample data in localStorage, demo login demo@example.com / demo12345
npm run gen:api        # regenerate src/api/schema.d.ts from ../docs/openapi.yaml
npm run lint && npm run typecheck && npm test
npm run test:e2e       # Playwright (builds and serves mock + demo builds)
npm run build:demo     # static demo, base /demos/foodapp/, output dist-demo/
```

**Modes.** `VITE_API_MODE=mock` (default) uses the in-browser adapter; `VITE_API_MODE=live` calls the Django API with token auth. Set `VITE_API_BASE_URL`, or leave it empty and run `VITE_PROXY_TARGET=http://127.0.0.1:8000 npm run dev` to use the dev proxy. Both adapters implement the same typed `Api` interface (`web/src/api/types.ts`, types generated from the schema). In mock mode no request leaves the origin (checked by Playwright). In mock mode the photo upload is an object URL that lasts for the session.

Tests: Vitest (mock and live adapters, validation, i18n parity) and Playwright (login/filter/create/edit/delete, manager, sign-up/token/log out, FA/RTL, error state, 360px layout, demo build).
