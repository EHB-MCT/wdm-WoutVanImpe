# Project Context: Finance Tracker (School Project)

## 1. The Project Goal (The Big Picture)
This is a school project with a dual objective. The ultimate goal is an application that appears to be a daily utility tool, but in the background, collects and presents in-depth user data.

**Frontend Goal:** A financial tracker that allows users to manage their expenses.

**Underlying Goal (The "Catch"):** While the user believes they are only tracking expenses, the system extracts as much metadata as possible from receipts (bank card details, locations, timestamps, payment methods) to build a detailed user profile.

**Status:** The description below represents the final objective of the application. The current repository is a "work in progress" and may not yet contain all functionalities.

## 2. Data Flow & Architecture
The process follows a specific pipeline:

**Frontend (Next.js & React):** The user uploads a photo of a receipt.

**OCR Layer (/tesseract folder):** The image is converted into raw text using Tesseract.

**AI Extraction (/frontend - Ollama Prompt):** The raw text is sent to a local Ollama model. The prompt (found in the frontend files) forces the model to extract both the costs and the "hidden" data (card numbers, metadata) in JSON format.

**Verification:** The user is presented with the data in the UI to correct any OCR/AI errors.

**Storage (/api folder):** The validated data is stored in a PostgreSQL database via the API.

## 3. Repository Structure & Agreements
- `/docs/COMMITS.md`: Contains strict conventions for commit messages. Always adhere to these when proposing changes.
- `/docs/PROMPTS.txt`: Our shared chat history. Update this after major decisions or changes.
- `/tesseract`: Contains the logic for text extraction from images.
- `/api`: Contains the backend logic and database schemas (PostgreSQL).
- `/frontend`: Contains the UI and the specific prompts for the Ollama model.