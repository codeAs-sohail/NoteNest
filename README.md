# 📝 NoteNest: The Global Academic Network

NoteNest is a premium academic note-sharing platform meticulously designed for university students. It empowers scholars to upload, organize, and explore educational materials across different subjects and universities. Built with a highly interactive, Instagram-style social architecture, it encourages seamless peer collaboration through likes, real-time comments, and sophisticated notification logic.

> **Fun Fact:** The entire frontend architecture, UI redesign, and optimistic logic layer were built using **Antigravity**! 🚀

---

## 🌟 What Can You Do on NoteNest? (Feature Deep-Dive)

NoteNest isn't just a basic file upload site; it's a social learning network built around engagement and premium aesthetics. Here is what you can experience:

### 1. 🔍 The Global Explore Feed
Browse an entire ecosystem of academic knowledge.
*   **Smart Filtering:** Quickly search for notes by Title, University, or specific Subject via query parameters.
*   **Paginated Results:** The explore feed returns paginated results (10 notes per page) so performance stays sharp even with a large dataset.
*   **Live Preview Modals:** Click on any note card to open a stunning glassmorphism modal, allowing you to read descriptions, view PDF attachments, and interact with the content instantly without leaving the page.

### 2. ❤️ Social Interactions (Likes & Comments)
Engage with your peers just like you would on social media.
*   **Toggle "Likes":** Hit the heart icon on any note — the backend toggles the like (creates if missing, deletes if already liked) and atomically updates the `likes_count` counter via Django's `F()` expression.
*   **Integrated Commenting System:** Got a question about a physics formula? Leave a comment directly on the note! NoteNest enforces a strict **"One comment per user, per note"** rule (enforced at the DB level with `unique_together`) to prevent spam, with UI inputs automatically disabling if you've already shared your thoughts.

### 3. 🔔 Instagram-Style Notification Center
Never miss an interaction on your uploaded materials.
*   **Unified Activity Feed:** The navbar bell icon and Profile page both aggregate **Likes** (from the backend `Notification` model) and **Comments** (fetched per-note) into a single, chronological feed.
*   **Unread Indicators:** Unseen notifications are highlighted with a distinct blue dot and tinted background. Once you open the dropdown, the dots disappear — states are persisted in your local cache (`notenest_seen_notifs` in `localStorage`).
*   **Auto-Polling:** The `NotificationContext` polls the backend every **60 seconds** to keep the feed fresh automatically.
*   **Relative Timestamps:** Notifications seamlessly format time relative to exactly when the interaction happened (e.g., *"3 minutes ago"* or *"just now"*) using `date-fns`.

### 4. 🗂️ Personal Dashboard & Download Tracking
Manage your brand and your academic uploads in one spot.
*   **Live Analytics:** See at a glance how many total "Community Impacts" (Likes) and "Downloads" your collective notes have generated.
*   **Download History Tracker:** Your Profile page keeps a beautiful timeline of exactly what notes you downloaded and when, ordered by most recent first.
*   **Seamless CRUD Operations:** Update a note's title, replace an outdated PDF, or delete a note forever from your customized dashboard. The interface guarantees immediate visual feedback!
*   **Account Management:** Users can edit their profile (username, email, university, year, bio) and permanently delete their account from the Danger Zone section.

### 5. 🛡️ Fortress-Level Authentication
*   **Encrypted Accounts:** All users are secured behind encrypted JWT (JSON Web Tokens) issued by **Simple JWT**. Passwords are hashed with **bcrypt** before being stored.
*   **Token Blacklisting:** On logout, the refresh token is blacklisted (`rest_framework_simplejwt.token_blacklist`) so stolen tokens can't be reused.
*   **Custom Token Auth:** The backend uses a custom `get_user_from_token()` helper instead of DRF's default auth classes, validating the `Bearer` token on each request manually.
*   **Protected Routes:** Unauthenticated users are completely locked out of the global network via `ProtectedRoute` on the frontend.
*   **Silent Token Refresh:** The Axios interceptor automatically attempts to silently refresh expired access tokens using the stored refresh token before prompting a re-login.

### 6. ☁️ Cloud PDF Storage (Supabase)
*   All uploaded PDFs are stored directly in a **Supabase Storage bucket** (`notes/pdfs/`), not on the local server. This ensures files persist across server restarts and deployments.
*   Each file is prefixed with a UUID hex to prevent duplicate collisions on upload.
*   The public Supabase URL is saved in the database (`pdf_file` field on the `Notes` model).

### 7. 📧 Welcome Email on Registration
*   When a new user registers, a **welcome email** is sent asynchronously in a background thread so it doesn't slow down the registration response.
*   Emails are rendered from an HTML template (`Emails/Welcome.html`) using Django's template engine.
*   The email backend is currently configured to use **Gmail SMTP** (or Resend SMTP — see `.env`).

---

## 🛠️ Tech Stack Overview

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** (Vite) | UI framework & build tool |
| **React Router DOM v6** | Client-side routing & protected routes |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Animations & micro-interactions |
| **Axios** | HTTP client with request/response interceptors |
| **Lucide React** | Icon library |
| **date-fns** | Timestamp formatting |
| **react-hot-toast** | Toast notification system |

### Backend
| Technology | Purpose |
|---|---|
| **Django 6.0.3** | Web framework |
| **Django REST Framework** | API layer |
| **Simple JWT** | JWT-based authentication + token blacklisting |
| **bcrypt** | Password hashing |
| **django-cors-headers** | CORS handling |
| **Supabase (Python SDK)** | Cloud PDF storage bucket |
| **dj-database-url** | Database URL parsing for PostgreSQL |
| **psycopg2-binary** | PostgreSQL adapter |
| **Whitenoise** | Static file serving |
| **python-decouple** | Environment variable management |
| **gunicorn** | Production WSGI server |

### Architecture Pattern (Backend)
The backend follows a layered architecture:
- **Views** → receive requests and return responses
- **Service** (`service.py`) → business logic and authentication checks
- **Repository** (`repository.py`) → database queries and data mutations

---

## 📁 Project Structure

```
NOTES/                          ← Root workspace
├── NoteNest/                   ← Django backend
│   ├── NoteNest/               ← Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/               ← Auth app
│   │   ├── models.py           ← Userregister, Profile
│   │   ├── views.py            ← Register, Login, Logout, Userprofile
│   │   ├── serializer.py
│   │   ├── helper.py           ← JWT helper, send_welcome_email
│   │   └── urls.py
│   ├── notes/                  ← Notes app
│   │   ├── models.py           ← Notes, Likes, Comments, Notification, Download
│   │   ├── views.py            ← NoteDetail, NotesAll, Notesexplore, Likes, Comments, Downloads, notification
│   │   ├── service.py          ← Business logic layer
│   │   ├── repository.py       ← DB access layer + Supabase upload
│   │   ├── Serializers.py
│   │   ├── helper.py           ← JWT helper + upload_pdf (Supabase)
│   │   ├── signals.py
│   │   └── urls.py
│   ├── media/                  ← Local media fallback (dev only)
│   ├── db.sqlite3              ← Dev database (not used in production)
│   ├── manage.py
│   └── requirements.txt
├── frontend/                   ← React/Vite frontend
│   ├── src/
│   │   ├── api/axios.js        ← Axios instance with interceptors
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoteCard.jsx
│   │   │   ├── NoteModal.jsx
│   │   │   ├── EditNoteModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Toast.jsx
│   │   ├── layouts/RootLayout.jsx
│   │   ├── pages/
│   │   │   ├── Auth/Login.jsx
│   │   │   ├── Auth/Register.jsx
│   │   │   ├── Home.jsx        ← Personal dashboard / recent uploads
│   │   │   ├── Explore.jsx     ← Global note feed
│   │   │   ├── Profile.jsx     ← Full profile, notes, downloads, notifications
│   │   │   ├── AddNote.jsx     ← Note creation form
│   │   │   └── NoteDetail.jsx  ← Individual note view
│   │   ├── services/noteService.js
│   │   └── utils/
│   │       ├── downloadPdf.js
│   │       └── errorHandler.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── Emails/
│   └── Welcome.html            ← Welcome email HTML template
├── DEPLOYSUMMARY.md
└── README.md
```

---

## 🗄️ Database Models

### `accounts` App
| Model | Key Fields |
|---|---|
| `Userregister` | `username`, `email` (unique), `password` (bcrypt hash), `university`, `year`, `bio` |
| `Profile` | One-to-one with `Userregister`; mirrors user fields for fast serialization |

### `notes` App
| Model | Key Fields |
|---|---|
| `Notes` | `user`, `profile`, `title`, `description`, `subject`, `university`, `pdf_file` (Supabase URL), `download_count`, `likes_count`, `comments_count` |
| `Likes` | `user`, `note` — `unique_together('user', 'note')` enforces one-like-per-user |
| `Comments` | `user`, `note`, `sender`, `comment` — `unique_together('user', 'note')` enforces one-comment-per-user |
| `Notification` | Created when a like is recorded; stores `sender`, `receiver`, `receiver_id`, `note_title` |
| `Download` | `user`, `note`, `note_title`, `note_subject`, `downloaded_at` (ordered by most recent) |

---

## 🔌 API Endpoints

### Auth (`/api/auth/`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register/` | Register a new user (bcrypt hashed password, creates Profile, sends welcome email) |
| `POST` | `/api/auth/login/` | Login — returns `access` + `refresh` JWT tokens |
| `POST` | `/api/auth/logout/` | Blacklist the refresh token |
| `GET` | `/api/auth/profile/` | Get authenticated user's profile |
| `PUT` | `/api/auth/profile/` | Update profile (username, email, university, year, bio) |
| `DELETE` | `/api/auth/profile/` | Delete user profile |

### Notes (`/api/notes/`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes/all/` | Get all notes for the authenticated user |
| `GET` | `/api/notes/explore/` | Get all notes (excluding own) — paginated (10/page), filterable by `title`, `subject`, `university` |
| `GET` | `/api/notes/<id>/` | Get a specific note by ID |
| `POST` | `/api/notes/0/` | Create a new note (PDF upload to Supabase) |
| `PUT` | `/api/notes/<id>/` | Update a note (can replace PDF) |
| `DELETE` | `/api/notes/<id>/` | Delete a note |

### Social
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/notes/ likes/<id>/` | Toggle like on a note (creates or deletes) |
| `GET` | `/api/notes/comment/<id>/` | Get all comments for a note |
| `POST` | `/api/notes/comment/<id>/` | Add a comment to a note |
| `DELETE` | `/api/notes/comment/<id>/` | Delete a comment |
| `GET` | `/api/notes/notification/` | Get all notifications for the authenticated user |

### Downloads
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/notes/download/<id>/` | Record a download & increment `download_count` |
| `GET` | `/api/notes/downloads/` | Get download history for the authenticated user |

### Utility
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health/` | Health check endpoint (returns `"OK"`) — used to keep the Render instance awake |

> **Note:** The likes endpoint URL contains a literal space: `/api/notes/ likes/<id>/`. This is a known quirk in `notes/urls.py` that the frontend handles by using the space character directly in its Axios call.

---

## ⚙️ Installation & Setup Guide

Because sensitive keys and tokens are **not** committed to GitHub for security reasons, you will need to set up your `.env` files locally before flying.

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd NOTES
```

### Step 2: Backend Setup (Django)

1. **Navigate to the backend directory:**
   ```bash
   cd NoteNest
   ```
2. **Create and activate a virtual environment (Recommended):**
   ```bash
   python -m venv env
   # On Windows:   env\Scripts\activate
   # On macOS/Linux: source env/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Create the `.env` file:**
   In the root of the `NoteNest` directory, create a `.env` file with the following variables:
   ```ini
   SECRET_KEY='your-secure-django-secret-key-here'
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   # PostgreSQL (for production) — leave as SQLite for local if preferred
   DATABASE_URL='your-postgres-database-url-here'

   # Email (Gmail SMTP example)
   DEFAULT_FROM_EMAIL="your-email@gmail.com"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_HOST_USER="your-email@gmail.com"
   EMAIL_HOST_PASSWORD="your-app-password-here"
   EMAIL_USE_TLS=True
   EMAIL_USE_SSL=False

   # Supabase (for PDF cloud storage)
   SUPABASE_URL='your-supabase-project-url-here'
   SUPABASE_KEY='your-supabase-service-role-key-here'
   ```

   > **Note on Email:** The project supports both Gmail SMTP and Resend SMTP. Configure whichever provider you prefer in the `.env` — just make sure `EMAIL_BACKEND` in `settings.py` is set to `django.core.mail.backends.smtp.EmailBackend` for emails to actually send (currently it uses the **console backend** which only prints to the terminal).

   > **Note on Database:** In `settings.py`, the database is configured via `dj_database_url` using `DATABASE_URL`. For pure local development without PostgreSQL, you can temporarily comment out the `dj_database_url` block and uncomment the SQLite config.

5. **Apply database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. **Start the development server:**
   ```bash
   python manage.py runserver
   ```
   *The backend will be running on `http://localhost:8000/`*

### Step 3: Frontend Setup (React/Vite)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install Node modules:**
   ```bash
   npm install
   ```
3. **Create the `.env` file:**
   In the root of the `frontend` directory, create a `.env` file:
   ```ini
   VITE_API_URL=/api
   ```
   This tells Vite to proxy all `/api/*` requests to `http://localhost:8000` (configured in `vite.config.js`).

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   *The frontend will typically run on `http://localhost:5173/`. Navigate here in your browser to experience NoteNest!*

---

## 🚀 Deployment (Render)

See [DEPLOYSUMMARY.md](./DEPLOYSUMMARY.md) for the full deployment guide. Key notes:

- **Backend:** Deploy as a Render **Web Service** using `gunicorn NoteNest.wsgi:application`
- **Frontend:** Deploy as a Render **Static Site** — set a rewrite rule `/* → /index.html` to support React Router
- **Environment variable:** Set `VITE_API_URL` on the frontend to your live backend URL (e.g., `https://notenest-api.onrender.com/api`)
- **PDFs:** Already handled by Supabase Storage — no extra config needed for file persistence

---

## 🔑 JWT Token Details

| Token | Lifetime |
|---|---|
| Access Token | 120 minutes |
| Refresh Token | 1 day |

Tokens are stored in `localStorage` under the keys `notenest_access` and `notenest_refresh`. The Axios instance automatically attaches the access token as a `Bearer` header on every request.

---

*Happy coding, collaborating, & sharing! 🎓*
