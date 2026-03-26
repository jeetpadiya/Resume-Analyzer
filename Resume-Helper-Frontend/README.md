# Resume Helper Frontend

The frontend is a React + TypeScript + Vite application for the Resume Helper project. It handles user authentication, resume upload, job description input, and ATS analysis result display.

## What It Does

- Lets users register and log in
- Stores auth state in local storage through a React context
- Protects the dashboard for authenticated users only
- Uploads PDF and DOCX resumes to the backend
- Sends a job description for ATS-style scoring
- Displays score, label, missing skills, suggestions, and score breakdown

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind Vite plugin
- Custom CSS modules per page/component

## Project Structure

```text
src/
  Context/
    AuthContext.tsx        # auth state and helpers
  components/
    Navigation.tsx         # top nav and user menu
  pages/
    Login.tsx              # sign-in screen
    SignUp.tsx             # registration screen
    Dashboard.tsx          # resume upload + analysis UI
  routes/
    ProtectedRoutes.tsx    # guards dashboard routes
    PublicRoutes.tsx       # blocks auth pages for logged-in users
  service/
    api.ts                 # axios instance + interceptors
  styles/
    Dashboard.css
    Navigation.css
    login.css
  type/
    types.ts               # shared frontend result types
  App.tsx                  # router setup
  main.tsx                 # app bootstrap
```

## User Flow

1. A user signs up or logs in.
2. The token and user profile are saved in local storage.
3. The dashboard becomes accessible through protected routes.
4. The user uploads a resume file.
5. The backend parses the resume and returns a saved resume document id.
6. The user pastes a job description and runs analysis.
7. The UI renders the ATS score and supporting insights.

## Environment Variables

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:3000/api
```

This should point to the backend API base path.

## Available Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## API Usage

The frontend talks to these backend endpoints:

- `POST /user/register`
- `POST /user/login`
- `POST /resume/upload`
- `POST /resume/analyze`

The configured axios instance:

- reads the auth token from local storage
- adds `Authorization: Bearer <token>` automatically
- clears auth state and redirects to `/login` on `401`

## Routing

- `/` redirects to `/dashboard` if a token exists, otherwise `/login`
- `/login` shows the login page
- `/signup` shows the registration page
- `/dashboard` shows the protected analyzer UI

## Main Frontend Modules

### `AuthContext`

Handles:

- `login`
- `register`
- `logout`
- restoring saved auth data on page refresh

### `Dashboard`

Handles:

- file selection and upload
- job description input
- ATS analysis request
- rendering success and error states
- result visualization with score ring and cards

### `api.ts`

Centralizes API requests and keeps authentication behavior consistent across the app.

## Expected Backend Response Shape

The dashboard expects analysis data roughly like this:

```ts
{
  score: number;
  lable: string;
  missingSkills?: string[];
  suggestions?: string[];
  breakdown?: Record<string, number>;
}
```

Note: the backend currently uses the field name `lable`, not `label`, and the frontend matches that existing contract.

## Styling Notes

- `login.css` powers both login and signup pages
- `Dashboard.css` styles the upload, results, and score display
- `Navigation.css` styles the top navigation and dropdown

## Development Notes

- The app uses `BrowserRouter`
- Auth state is persisted in local storage
- Protected and public route wrappers prevent invalid navigation states
- The dashboard requires a successful upload before analysis can run

## Current Limitations

- Error messaging on upload/analyze is still minimal in the UI
- The frontend includes a `Forgot password` link, but that route is not implemented yet
- Global styles from `index.css` are currently not imported in `main.tsx`
- The result contract mirrors backend naming inconsistencies such as `lable`

## Suggested Improvements

- Add a toast or alert system for API failures
- Add loading skeletons instead of returning `null` during auth boot
- Add a real forgot-password flow
- Add test coverage for auth routing and dashboard actions
- Normalize API field names with shared types between frontend and backend
