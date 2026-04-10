# 📝 NoteNest: The Global Academic Network

NoteNest is a premium academic note-sharing platform meticulously designed for university students. It empowers scholars to upload, organize, and explore educational materials across different subjects and universities. Built with a highly interactive, Instagram-style social architecture, it encourages seamless peer collaboration through likes, real-time comments, and sophisticated notification logic.

> **Fun Fact:** The entire frontend architecture, UI redesign, and optimistic logic layer were built using **Antigravity**! 🚀

---

## 🌟 What Can You Do on NoteNest? (Feature Deep-Dive)

NoteNest isn't just a basic file upload site; it's a social learning network built around engagement and premium aesthetics. Here is what you can experience:

### 1. 🔍 The Global Explore Feed
Browse an entire ecosystem of academic knowledge.
*   **Smart Filtering:** Quickly search for notes by Title, University, or specific Subject arrays.
*   **Live Preview Modals:** Click on any note card to open a stunning glassmorphism modal, allowing you to read descriptions, view PDF attachments, and interact with the content instantly without leaving the page.

### 2. ❤️ Social Interactions (Likes & Comments)
Engage with your peers just like you would on social media.
*   **Optimistic "Likes":** Hit the heart icon on any note, and watch it instantly turn custom rose-red, incrementing the like-counter immediately via zero-latency optimistic UI updates.
*   **Integrated Commenting System:** Got a question about a physics formula? Leave a comment directly on the note! NoteNest enforces a strict "One comment per user, per note" rule to prevent spam, with UI inputs automatically disabling if you've already shared your thoughts.

### 3. 🔔 Instagram-Style Notification Center
Never miss an interaction on your uploaded materials.
*   **Unified Activity Feed:** Your navbar bell icon aggregates both new "Likes" and "Comments" into a single, chronological feed. 
*   **Unread Indicators:** Unseen notifications are highlighted with a distinct blue dot and tinted background. Once you open the dropdown, the dots disappear (states are persisted in your local cache).
*   **Relative Timestamps:** Notifications seamlessly format time relative to exactly when the interaction happened (e.g., *"3 minutes ago"* or *"just now"*).

### 4. 🗂️ Personal Dashboard & Download Tracking
Manage your brand and your academic uploads in one spot.
*   **Live Analytics:** See at a glance how many total "Community Impacts" (Likes) and "Downloads" your collective notes have generated.
*   **Download History Tracker:** Did you download a great PDF last week but forgot where it is? Your profile keeps a beautiful timeline of exactly what notes you downloaded and when.
*   **Seamless CRUD Operations:** Update a note's title, replace an outdated PDF, or delete a note forever from your customized dashboard. The interface guarantees immediate visual feedback!

### 5. 🛡️ Fortress-Level Authentication
*   **Encrypted Accounts:** All users are secured behind encrypted JWT (JSON Web Tokens). Passwords are bcrypt-hashed.
*   **Protected Routes:** Unauthenticated users are completely locked out of the global network, securing the academic materials.

---

## 🛠️ Tech Stack Overview
**Frontend:** React.js (Vite), Tailwind CSS, Framer Motion, Axios, Lucide React, and `date-fns`. *(Architected by Antigravity).*
**Backend:** Django, Django REST Framework, Simple JWT, bcrypt, SQLite/PostgreSQL.

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
   # On Windows: env\Scripts\activate
   # On MacOS/Linux: source env/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Create the `.env` file:** 
   In the root of the `NoteNest` directory, create a `.env` file and strictly add your environment variables. It should look like this:
   ```ini
   SECRET_KEY='your-secure-django-secret-key-here'
   DEFAULT_FROM_EMAIL="your-email@gmail.com"
   EMAIL_HOST_USER="your-email@gmail.com"
   EMAIL_HOST_PASSWORD="your-app-password-here"
   ```
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
   In the root of the `frontend` directory, create a `.env` file for Vite to properly proxy API calls to your backend:
   ```ini
   VITE_API_URL=/api
   ```
4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   *The frontend will typically run on `http://localhost:5173/`. Navigate here in your browser to experience NoteNest!*

---
*Happy coding, collaborating, & sharing! 🎓*
