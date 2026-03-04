## System for Optimization of Team Software Development

Simple analytics dashboard for software teams built with **Next.js**, **Firebase**, and **Recharts**.

### Tech Stack

- Frontend: Next.js (App Router) + TypeScript  
- Styling: TailwindCSS  
- Charts: Recharts  
- Backend: Firebase  
- Database: Firebase Firestore  
- Auth: Firebase Email/Password  

---

### 1. Prerequisites

- Node.js (LTS recommended)  
- npm (comes with Node.js)  
- Firebase account  

---

### 2. Install dependencies

In the project folder:

```bash
npm install
```

---

### 3. Firebase setup

1. Go to the Firebase console and create a new project.  
2. Add a **Web app** to the project and copy the config values.  
3. Enable **Authentication → Email/Password**.  
4. Enable **Firestore Database**.  
5. Set Firestore security rules (example in `firestore.rules`).  

---

### 4. Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Restart the dev server after editing this file.

---

### 5. Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

- Root `/` redirects to `/login`.  
- `/login` – login form.  
- `/register` – registration form.  
- `/dashboard` – protected dashboard with KPIs and charts.  

---

### 6. Firestore collections (expected shape)

- `projects`: `{ id, name }`  
- `tasks`: `{ id, title, status, createdAt, completedAt, projectId }`  
- `bugs`: `{ id, projectId, createdAt, resolvedAt }`  
- `builds`: `{ id, projectId, status, duration, timestamp }`  

Timestamps should be stored as Firestore `Timestamp` and are converted to JavaScript `Date` objects in code.

---

### 7. Analytics logic

Located in `utils/analytics.ts`:

- Average completion time = `completedAt - createdAt`  
- Build failure rate = `failures / total builds`  
- Task completion rate = `completed / total`  

