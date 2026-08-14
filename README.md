# អង្គរ​ផ្លូវ (Angkor Trails) — Tourist Website

React + Firebase frontend for a Cambodia tourism company, covering the four
pages from the assignment brief: Home, About, Services, Contact.

## Stack
- **Frontend:** React 18 + React Router, built with Vite
- **Backend:** Google Firebase (Firestore for data, Firebase Auth for login/signup/logout)
- **Fonts:** Noto Serif/Sans Khmer (Google Fonts) for full Khmer script support

## Features
- **Green brand color** — a single green (`--saffron` / `--jade` tokens in
  `src/index.css`) drives buttons, links, and highlights across the whole
  site, layered over neutral cream/ink tones only.
- **Site-wide language switching** — pick Khmer or English from the Navbar
  and every page (Home, About, Services, Contact, Navbar, Footer) updates
  immediately. Powered by `src/context/LanguageContext.jsx` +
  `src/i18n/translations.js`, and the choice is remembered in `localStorage`.
- **Real login / signup / logout** — `src/context/AuthContext.jsx` wires the
  Navbar's Login/Signup modals to Firebase Authentication (email + password).
  Logging out asks for confirmation first.
- **Booking & Contact → Firestore** — the Services booking form writes to
  the `bookings` collection, the Contact form writes to `messages`.
- **Reader vs Admin/User access** — anyone can browse the site freely. Only
  a signed-in account can add ("Post") or delete a destination on the Home
  page's "Popular Destinations" section — that's the site's editable content.
  The Add/Delete buttons are hidden for logged-out visitors, and
  `firestore.rules` (included) enforces the same rule on the server, since
  UI-only gating can always be bypassed from a browser console.

## Pages implemented
| Page | Sections |
|---|---|
| **Home** (`/`) | Hero banner, welcome message, popular destinations (Firestore-backed, admin add/delete), popular packages, why choose us, testimonials |
| **About** (`/about`) | Company intro, stats, description, about us |
| **Services** (`/services`) | 6 service cards, pricing table, booking form (writes to Firestore `bookings`) |
| **Contact** (`/contact`) | Contact form (writes to Firestore `messages`), address/phone/email, Google Map embed, social links, working hours |

Navbar and footer are shared across all pages (`src/components`).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Connect Firebase

1. Create a project at https://console.firebase.google.com
2. In **Build → Firestore Database**, click "Create database".
3. In **Build → Authentication**, enable the **Email/Password** provider —
   this is what powers Login / Signup / Logout.
4. In **Project settings → General → Your apps**, add a Web app and copy the
   config values.
5. Copy `.env.example` to `.env` and paste your values in:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`src/firebase.js` reads these automatically. Until you set them, the app will
still render, but auth/booking/contact will fail to save (the error message
will show in the browser console).

6. **Deploy the security rules** in `firestore.rules` (Build → Firestore
   Database → Rules tab, or `firebase deploy --only firestore:rules` with the
   Firebase CLI). This is what actually enforces "Reader can view freely,
   only a signed-in Admin/User can post or delete" — the UI hiding the
   buttons is only a convenience, not real security on its own.

### Firestore structure
- `destinations` — { title, price, image, description, rating, participants, places, galleryImages, createdAt } — public read, signed-in create/delete
- `bookings` — { name, phone, packageName, date, createdAt } — public create, signed-in read/manage
- `messages` — { fullName, email, phone, message, createdAt } — public create, signed-in read/manage
- `users` — { username, email, role, createdAt } — created automatically on signup

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Design notes

The visual identity is a single green as the primary brand color, layered
over warm neutrals (cream/ink) so the palette stays simple rather than
multi-colored. The five-tower Angkor skyline silhouette
(`src/components/TowerSkyline.jsx`) is the signature motif reused as the nav
mark, hero backdrop, and section divider — see `src/index.css` for the full
token system.

## Next steps

- Richer role management (e.g. a distinct "editor" vs "super admin" role,
  currently every signed-in account can post/delete)
- Admin dashboard listing all bookings/messages in one place
- Forgot-password flow

