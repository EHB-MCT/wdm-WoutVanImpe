# Coding Conventions & Project Standards

This document outlines coding standards, file structures, and naming conventions for our software stack. Adhering to these guidelines ensures code consistency, readability, and maintainability across Frontend (Next.js/React) and Backend (Node.js/Express/Tesseract).

> **Note:** This document was created as a reference guide for the Development course and serves as a coding standards template for this project.

## 📚 External References

- [Next.js App Router project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Node.js Module conventions](https://nodejs.org/docs/v24.12.0/api/module.html#conventions-of-hooks)
- [Node.js API Documentation](https://nodejs.org/docs/latest/api/)

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

### Documentation & Comments

Code should be self-documenting where possible. Comments should explain why something is done, not what is being done.

#### 1. JSDoc (Contextual Documentation)

Use JSDoc (`/** ... */`) for all exported functions, hooks, classes, and API endpoints. This generates the "gray text" context/tooltip in IDEs.

**Format:**
```typescript
/**
 * Short description of the function's goal.
 * @param {Type} name - Description of the parameter.
 * @returns {Type} Description of the return value.
 */
```

**Example:**
```typescript
/**
 * Processes the image and extracts text using Tesseract.
 * @param {string} localPath - The filesystem path to the temp image.
 * @returns {Promise<string>} The raw text extracted from the OCR.
 */
async function processImage(localPath: string): Promise<string> { ... }
```

#### 2. Inline Comments

Use `//` for single-line explanations within logic blocks. Only use these for complex logic or business rule exceptions.

**Example:**
```javascript
// We add a 500ms delay to allow the Tesseract worker to initialize fully
await delay(500);
```

#### 3. React/JSX Comments

Inside JSX/HTML blocks, use the brace syntax.

**Example:**
```typescript
return (
  <div>
    {/* The sidebar is hidden on mobile screens */}
    <Sidebar />
  </div>
)
```

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

### 5.1 Branching Strategy & Naming

- Production Branch Name: The production branch is strictly named main. Do not use "master".

- Branch Source: All feature, bug, and hotfix branches must originate from the develop branch.

    - Strict Rule: Never create a branch directly off main.

- Protected Main: Direct commits or pushes to main are forbidden. main is only updated via release merges from the development workflow.

**Branch Naming:** `type/description`

- `feat/add-login`
- `fix/ocr-memory-leak`
- `chore/update-dependencies`

### 5.2 Commit Message Convention

- All commits must follow the Conventional Commits format:

        `<type>(<module>): <message>`


- Format: `<type>` is mandatory, `<module>` is optional but recommended, and `<message>` must be imperative and descriptive.

- Allowed Types:

    - feat: A new feature

    - fix: A bug fix

    - docs: Documentation only changes

    - style: Changes that do not affect the meaning of the code (white-space, formatting, etc.)

    - refactor: A code change that neither fixes a bug nor adds a feature

    - test: Adding missing tests or correcting existing tests

    - chore: Changes to the build process or auxiliary tools

    - Example: feat(auth): add new oauth2 scopes for user login



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

## 📚 Git Workflow & Course Reference

This project follows established Git workflows suitable for educational environments:

### Branch Strategy
- **Main branch:** `main` (production)
- **Development:** Work from feature branches, merge to develop
- **Course example:** `git checkout -b feature/your-feature-name develop`

### Commit Standards
- Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- All commits should be atomic and well-described
- Use descriptive commit messages that explain the "why" not just the "what"

### Example Course Workflow
```bash
# Start new feature from develop
git checkout -b feature/user-authentication develop

# Make changes and commit
git add .
git commit -m "feat(auth): implement user authentication with JWT"

# Push and create pull request
git push origin feature/user-authentication
```

> This project demonstrates best practices for full-stack web development using modern technologies and follows industry-standard Git workflows.

---