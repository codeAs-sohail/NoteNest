# 🚀 NoteNest Deployment Handoff Document

*This document contains all critical project state and configuration details necessary for deploying NoteNest to Render.*

## 📁 Project Architecture
*   **Frontend:** React.js powered by Vite, utilizing `react-router-dom` for client-side routing. Located in `/frontend`.
*   **Backend:** Django & Django REST Framework (DRF), utilizing Simple JWT for authentication. Located in `/NoteNest`.

## ⚙️ Backend Deployment Profile (Render Web Service)
*   **Language/Environment:** Python 3.x
*   **Dependencies:** Requirements are explicitly listed in `/NoteNest/requirements.txt` (includes Django, DRF, JWT, bcrypt, CORS headers, etc.).
*   **Build Command:** `pip install -r requirements.txt && python manage.py migrate`
*   **Start Command:** `gunicorn NoteNest.wsgi:application` 
    *   *(Note to AI: Ensure `gunicorn` is added to `requirements.txt` immediately prior to Render deployment if not already present).*
*   **Required Environment Variables:**
    *   `SECRET_KEY` (Django security key)
    *   `EMAIL_HOST_USER` (SMTP Auth)
    *   `EMAIL_HOST_PASSWORD` (SMTP password)
    *   `DEFAULT_FROM_EMAIL` (Sender address)
*   **Critical Infrastructure Notes:** 
    *   **Database:** Currently defaults to `db.sqlite3`. Must be migrated to a hosted PostgreSQL instance (Render provides a free tier) via `dj-database-url` in `settings.py` for production.
    *   **Media Files:** PDFs currently save locally to `/media`. A cloud bucket (e.g., AWS S3 or Cloudinary via `django-storages`) must be configured to prevent Render from wiping user uploads upon instance sleep.
    *   **Settings File:** `settings.py` correctly uses `dotenv` and `os.getenv()` and is safe/required to be committed to the repo.

## ⚛️ Frontend Deployment Profile (Render Static Site)
*   **Environment:** Node.js
*   **Build Command:** `npm install && npm run build`
*   **Publish Directory:** `dist`
*   **Required Environment Variable:** 
    *   `VITE_API_URL` (Must point exactly to the live backend Render URL, e.g., `https://notenest-api.onrender.com/api`).
*   **Critical Platform Configurations:**
    *   Because the frontend uses `react-router-dom`, **Rewrite Rules** strictly must be applied in the Render dashboard:
        *   **Source:** `/*`
        *   **Destination:** `/index.html`
        *   **Action:** `Rewrite`

## 🛡️ Git Configuration (`.gitignore` state)
The repository is perfectly pre-configured to block sensitive and heavy files.
*   **Ignored Frontend:** `node_modules/`, `dist/`, `build/`, `.env`, `.env.local`
*   **Ignored Backend:** `/env/`, `db.sqlite3`, `/media/`, `/staticfiles/`, `.env`
*   **Result:** Render will pull exclusively the raw source code and dynamically build the environments.
