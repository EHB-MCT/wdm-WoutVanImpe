# Coding Conventions & Project Standards

This document outlines coding standards, file structures, and naming conventions for our software stack. Adhering to these guidelines ensures code consistency, readability, and maintainability across Frontend (Next.js/React) and Backend (Node.js/Express/Tesseract).

---

## 1. General JavaScript/TypeScript Standards

These rules apply to both Frontend and Backend environments.

### Naming Conventions

| Type | Convention | Example | Notes |
| :--- | :--- | :--- | :--- |
| **Variables** | `camelCase` | `userName`, `itemCount` | Be descriptive. Avoid single letters (except `i` in loops). |
| **Booleans** | `camelCase` (Prefix) | `isLoggedIn`, `hasAccess`, `canEdit` | Always prefix with `is`, `has`, or `can`. |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `API_URL` | Only for values that *never* change during runtime (config/env). |
| **Functions** | `camelCase` | `fetchUserData()`, `parseImage()` | Use verbs to describe an action. |
| **Classes** | `PascalCase` | `UserController`, `ImageProcessor` | |
| **Files** | `kebab-case` | `user-controller.js`, `date-utils.ts` | **Exception:** React Components (see Frontend section). |

### Formatting & Syntax

- **Quotes:** Use double quotes `"` for strings (or adhere to Prettier defaults).
- **Semicolons:** Always use semicolons `;`.
- **Equality:** Always use strict equality `===` and `!==`.
- **Async/Await:** Prefer `async/await` over `.then()` chains for better readability.
- **Comments:** Use JSDoc format for complex functions.

---

## 2. Frontend: Next.js & React

Based on [Next.js App Router project structure](https://nextjs.org/docs/app/getting-started/project-structure).

### Folder Structure

We follow **App Router** strategy.

```text
/src
  /app                 # App Router directories
    /dashboard         # Route segment
      page.tsx         # UI for this route
      layout.tsx       # Shared UI for this route
    global.css         # Global styles
    layout.tsx         # Root layout
    page.tsx           # Home page
  /components          # Reusable React components
    /ui                # Generic UI (Buttons, Inputs)
    /dashboard         # Components specific to dashboard
  /lib                 # Utility functions, helpers, API clients
  /hooks               # Custom React hooks
  /types               # TypeScript interfaces/types
/public                # Static assets (images, fonts)
```

### React Conventions

**Component Filenames:** Use PascalCase matching component name.

**Example:** `PrimaryButton.tsx`

**Component Definition:** Use Functional Components with Named Exports.

```typescript
// Good
export function UserProfile({ name }: UserProps) { ...
```

**Hooks:** Must start with `use`.

**Example:** `useWindowSize.ts`

**Directives:**
Place `'use client'` at the very top of files that require browser APIs or interactivity (`useState`, `useEffect`).

Default to Server Components whenever possible for performance.

**Props:** Use TypeScript interfaces for Props. Destructure props in function arguments.

---

## 3. Backend: Node.js & Express

Standard architecture for API server.

### Folder Structure (MVC Pattern)

```text
/src
  /config              # Environment variables and configuration
  /controllers         # Request logic (req, res handling)
  /middlewares         # Express middlewares (auth, validation)
  /models              # Database schemas (if using MongoDB/SQL)
  /routes              # Route definitions
  /services            # Business logic (database calls, external APIs)
  /utils               # Helper functions
  app.js               # App entry point
```

### Express Conventions

**Controller Naming:** `[Resource]Controller.js`.

**Example:** `authController.js`, `imageController.js`.

**Route Naming:** `[resource].routes.js`.

**Example:** `users.routes.js`.

**Logic Separation:**
- **Routes:** Only define endpoints and attach middleware.
- **Controllers:** Handle HTTP status codes, request parsing, and response sending.
- **Services:** Handle the actual "heavy lifting" (DB queries, Tesseract processing).

**Error Handling:** Use try/catch blocks in controllers and pass errors to a global error handling middleware using `next(error)`.

---

## 4. Tesseract.js (OCR) Implementation

Specific conventions for handling OCR tasks within Node.js.

**Isolation:** OCR is CPU-intensive. Never run Tesseract logic directly inside the main Express route handler (it blocks the Event Loop). Move it to a service.

**Workers:** Always properly initialize and terminate workers to prevent memory leaks.

**File Handling:**
- Store temporary uploads in a `/temp` directory.
- Ensure files are deleted using `fs.unlink` after processing (even if OCR fails).

**Example Tesseract Service Pattern:**

```javascript
// services/ocrService.js
const { createWorker } = require('tesseract.js');

async function extractTextFromImage(imagePath) {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    return text;
  } finally {
    // Always terminate to free memory
    await worker.terminate();
  }
}
```

---

## 5. Git & Version Control

**Branch Naming:** `type/description`

- `feat/add-login`
- `fix/ocr-memory-leak`
- `chore/update-dependencies`

**Commit Messages:** Conventional Commits

- `feat: add user registration endpoint`
- `fix: resolve layout issue on mobile`
- `docs: update API documentation`

---

## 6. Environment Variables

Never commit `.env` files.

Maintain a `.env.example` file with keys but no values.

**Naming:**
- **Server:** `PORT`, `DB_HOST`
- **Next.js (Public):** Must start with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_API_URL`).

---

## 7. Project-Specific Standards

### Finance Tracker Specific Conventions

#### Database Conventions
- Table names in `snake_case` (e.g., `receipt_items`, `purchase_dates`)
- Foreign keys follow pattern `{table}_id` (e.g., `user_id`, `receipt_id`)
- Timestamps use `created_at` and `updated_at`
- Use Dutch language for database column names where applicable

#### API Response Conventions
- Error messages in Dutch
- Success responses follow consistent structure
- Use `status` field for operation results
- Pagination with `limit` and `offset` parameters

#### Frontend Localization
- All user-facing text in Dutch
- Date formatting: `DD-MM-YYYY`
- Currency formatting: `€1.234,56` (Dutch format)
- Number formatting uses Dutch decimal separators

#### Security Conventions
- JWT tokens with 15-minute expiration
- Automatic token refresh mechanism
- Password hashing with SHA256
- Input validation on both client and server

---

## How to use this file

1. **Copy** the content inside the code block above.
2. **Create** a new file named `CONVENTIONS.md` in your project root.
3. **Paste** the content.
4. **Share** it with your team or keep it as a reference for yourself.

Would you like me to set up a configuration file for **ESLint** or **Prettier** that automatically enforces these rules?