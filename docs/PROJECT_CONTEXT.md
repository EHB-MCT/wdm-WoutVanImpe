# Project Context: Finance Tracker (Assignment: Weapon of Math Destruction)

## 1. The Project Goal & Assignment Scope

This project is an implementation of the school assignment "Weapon of Math Destruction".

### The Core Concept
We are building a tool that collects data on an individual user level to build a profile and influence them, disguised as a helpful utility.

- **User-Facing App (The Mask)**: A financial tracker for managing expenses.
- **Backend & Data Collection (The "Weapon")**: While the user tracks expenses, the system extracts extensive metadata from receipts (card details, locations, timestamps, vendor info) via OCR and AI to profile the user.
- **The Feedback Loop (Crucial Requirement)**: The gathered data must "influence" the user-facing part. (e.g., targeted insights, changing UI based on spending habits, or subtle behavioral nudges).

### Required Components

- **User Client**: The Finance Tracker (Next.js).
- **Backend**: API for gathering, cleaning, and storing data (PostgreSQL).
- **Admin Dashboard**: A separate view to visualize data, filter by UID, and analyze trends.
- **Written Report**: Insights on data pitfalls (to be written based on findings).

## 2. Technical Constraints & Infrastructure

### Strict Technical Requirements

- **Local Execution**: Everything must run locally via Docker.
- **Docker Compose**: The entire system must start with `docker compose up --build`.
- **Configuration**: All secrets/configs must be handled via a `.env` file (provide `.env.template`).
- **No External APIs**: The project must run completely offline/locally (Ollama is used for this reason).

### Coding Standards

- **Git Flow**: Clean history, branched development.
- **Documentation**: Self-explanatory structure, documented choices/sources.
- **Cleanliness**: Only necessary files committed.

## 3. Data Flow & Architecture

The architecture is designed to fulfill the "collect everything" mandate:

### Input (Frontend - Next.js/React)

- User uploads a receipt photo.
- **Assignment Requirement**: Assign a UID (User ID) to differentiate users and build individual profiles.

### Processing (OCR & AI)

- **OCR Layer (/tesseract)**: Image converted to raw text.
- **AI Extraction (/frontend - Ollama)**: Raw text sent to local Ollama.
- **Goal**: Extract explicit data (total cost) AND hidden metadata (card type, location, time, payment method).

### Storage & Management (/api - PostgreSQL)

- Data is verified by the user (UI), then cleaned and stored.
- Database must be persistent (Volume mapping in Docker).

### Admin Layer (New Requirement)

- A dashboard interface for the "Administrator".
- **Capabilities**: Visualize data, select specific users (UID), filter data, and view the "profile" built from the receipts.

### Feedback Loop

- The backend analyzes the stored profile data.
- This analysis triggers changes or specific content in the User Frontend (fulfilling the "influence the user" requirement).

## 4. Repository Structure & Agreements

- `/docs/COMMITS.md`: Strict conventions for commit messages.
- `/docs/PROMPTS.txt`: Shared chat history/sources (Required for submission).
- `/docs/CONVENTIONS.md`: Conventions for all code (structure, naming, ...).
- `/tesseract`: Logic for text extraction.
- `/api`: Backend logic, database schemas, and data cleaning.
- `/frontend`: User UI, Admin UI, and Ollama prompts.
- `/docker-compose.yml`: Orchestration for App, DB, and AI services.