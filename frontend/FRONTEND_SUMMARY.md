# NoteNest Frontend — Claude Handoff

Use this as the current-state briefing when asking Claude to work on the NoteNest frontend. Treat the repository as the source of truth, inspect the active route/component before changing it, and preserve the current design system unless a redesign is explicitly requested.

## What the frontend is

NoteNest is a student-focused academic notes platform. Users can register and sign in, share PDF notes, explore other students' notes, like and comment on notes, download PDFs, and manage their profile and uploads.

## Stack and build

- React 18 with JSX; entry point is `src/main.jsx`, which mounts `App` inside `React.StrictMode`.
- Vite 6 provides the dev server and production bundling.
- React Router 6 handles client-side routes.
- Tailwind CSS 4 is processed by PostCSS; design tokens and global styles are in `src/index.css` using `@theme`.
- Framer Motion provides interaction and entrance animations; Lucide React provides icons.
- Axios handles API requests; `date-fns` formats dates; `react-hot-toast` provides toast notifications.
- From `frontend/`, run `npm install`, `npm run dev`, `npm run build`, or `npm run preview`. Vite's production output is the usual `dist/` directory.
- During development, `/api` is proxied to `http://localhost:8000` by `vite.config.js`. `VITE_API_URL` can override the API base URL; otherwise the client uses `/api`.
- `index.html` loads Outfit and Plus Jakarta Sans from Google Fonts.

## App structure

- `src/App.jsx`: providers, toast setup, lazy-loaded route definitions, and the auth boundary.
- `src/layouts/RootLayout.jsx`: authenticated application shell, responsive navigation, notification dropdown, profile menu, mobile drawer, footer, scroll progress, ambient background, and routed content outlet.
- `src/pages/`: screens; `src/pages/Auth/` contains the login and registration screens currently used by the router.
- `src/components/`: reusable note cards, note/edit modals, route guard, toast wrapper, and shared primitives in `src/components/ui/`.
- `src/context/`: authentication, aggregated notifications, and toast context.
- `src/services/noteService.js`: note, social, download, and notification API calls.
- `src/api/axios.js`: API base URL, bearer-token attachment, and refresh handling.
- `src/utils/`: PDF download and backend error helpers.

## Current routes and screens

| Route | Access | Screen |
|---|---|---|
| `/login` | Public | `pages/Auth/Login.jsx` |
| `/register` | Public | `pages/Auth/Register.jsx` |
| `/` | Signed in | `pages/Home.jsx` — welcome/dashboard hero, note and profile stats, recent uploads |
| `/explore` | Signed in | `pages/Explore.jsx` — archive search, university/subject filters, and note cards |
| `/notes/:id` | Signed in | `pages/NoteDetail.jsx` — note details, likes, PDF download, and comments |
| `/profile` | Signed in | `pages/Profile.jsx` — profile editing, own notes, download history, notifications, account deletion |
| `/create` | Signed in | `pages/AddNote.jsx` — PDF upload and note metadata form |
| `/notifications`, `/settings` | Signed in | Both currently render `Profile.jsx`; they are not separate screens |

Unknown routes redirect to `/`. `ProtectedRoute` waits for auth initialization and sends signed-out visitors to `/login`.

## Main interaction and data flow

- `AuthContext` stores access/refresh tokens in `localStorage` (`notenest_access`, `notenest_refresh`), loads the profile on startup, and exposes login, register, profile update, account deletion, and logout actions.
- Login submits username, email, and password. Registration submits username, email, password, university, year, and bio.
- Note upload builds `FormData` with the note fields and `pdf_file`; the UI accepts PDF files and supports drag/drop.
- Explore searches by title, university, and subject. Note cards support opening details, likes, owner edit/delete actions, and PDF download.
- Note detail and the note modal support comments. PDF downloads use the browser `fetch`/blob flow and attempt to record a download.
- The notification context combines backend like notifications with comments found on the current user's notes, marks items as seen in local storage, and refreshes once per minute while signed in.

## Visual system: current colors and type

The interface is dark-first; there is no visible theme toggle.

- Page background: `#0a0b0f`; surfaces: `#101218` and `#161922`.
- Glass fill: `rgba(255,255,255,0.04)`; hover fill: `rgba(255,255,255,0.07)`; border: `rgba(255,255,255,0.08)`.
- Primary accent: azure `#2f7cff`, hover `#4a90ff`; use gradients sparingly for primary actions only.
- Semantic colors: teal `#2dd4bf` for success/download, rose `#f43f5e` for like/danger, amber `#f59e0b` for warning.
- Primary text: `#f4f5f7`; secondary: `#a1a7b3`; muted: `#6b7280`.
- Body and headings use **Geist**, with **Inter** as fallback. Heading weights are moderate (typically 600), with tight tracking.
- Common visual traits: restrained glass surfaces, subtle azure/teal ambient lighting, thin borders, low-opacity shadows, Lucide icons, and responsive Tailwind layouts. Corner radii top out around 24px.
- `index.css` is the canonical token source. `tailwind.config.js` is kept minimal and does not define a competing color palette.

## Current animation and interaction language

- Framer Motion supports page/card reveals, staggered lists, the active navigation indicator, dropdowns, and modal transitions.
- Note cards reveal once in view, lift slightly on hover, and animate their like state. Cursor spotlight and button state feedback use CSS/transform transitions.
- The fixed two-pixel scroll-progress line, scroll-reactive navbar, subtle ambient parallax, and back-to-top button are in the authenticated shell. Respect `MotionConfig reducedMotion="user"` and the CSS reduced-motion rules.
- Note/edit dialogs trap keyboard focus, close on Escape, and lock body scrolling.
- The upload flow changes its drop-zone state on drag/drop, displays file name and size, supports removing the selected PDF, and shows an indeterminate shimmer while uploading.

## Important current-state caveats for future work

1. `AddNote.jsx` navigates to `/dashboard` after upload, but `/dashboard` is not registered in `App.jsx`. The catch-all sends that URL to `/`, so a successful upload currently returns to Home rather than a dashboard route.
2. `Dashboard.jsx`, the top-level `pages/Login.jsx` and `pages/Register.jsx`, `components/Navbar.jsx`, and `components/PrivateRoute.jsx` are legacy/unrouted implementations; the app currently uses `Home.jsx`, `pages/Auth/*`, `RootLayout.jsx`, and `ProtectedRoute.jsx`. Avoid editing a similarly named but inactive file without checking its imports.
3. `/notifications` and `/settings` are route aliases for the full profile screen at present.
4. The Axios 401 interceptor tries `auth/token/refresh/`; its source comment says the backend does not currently expose that endpoint. Check backend support before relying on automatic refresh.

## Guidance for Claude

Before implementing a requested change, trace the active route/component and existing API flow rather than assuming a similarly named legacy file is live. Keep the near-black/azure palette, Geist typography, responsive behavior, keyboard focus treatment, and reduced-motion support consistent. Do not silently change route/API contracts; call out the route and refresh-token caveats above if the requested feature touches them.
