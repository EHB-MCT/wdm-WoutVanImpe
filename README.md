# 💰 WDM Finance Tracker

A full-stack web application for personal finance management with OCR-powered receipt processing and dangerous metadata analysis. Built as a course project demonstrating modern web development practices.

## 📋 Table of Contents

- [Features](#-features)

- [Technology Stack](#-technology-stack)

- [Installation](#-installation)

- [Usage](#-usage)

- [Project Structure](#-project-structure)

- [Development](#-development)

- [Contributing](#-contributing)

- [Credits](#-credits)

---

## ✨ Features

### 🧾 Core Functionality

- **Receipt Management**: Upload, store, and categorize financial receipts

- **OCR Processing**: Automatic text extraction from receipt images using Tesseract.js

- **AI-Powered Analysis**: Intelligent data extraction using Ollama LLM

- **User Authentication**: Secure JWT-based authentication system

- **Admin Dashboard**: User profiling with dangerous metadata analysis

### 📊 Data Visualization

- **Dashboard**: Interactive charts for spending patterns and category breakdowns

- **Financial Analytics**: Monthly/yearly spending trends

- **Category Insights**: Visual breakdown by expense categories

- **Risk Analytics**: Behavioral pattern analysis for admin users

### 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication

- **Role-Based Access**: User and admin role management

- **Input Validation**: Comprehensive data validation and sanitization

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router

- **Language**: TypeScript

- **Styling**: CSS Modules with custom design tokens

- **UI Components**: Custom component library

- **Charts**: Recharts for data visualization

- **Authentication**: Client-side JWT management

### Backend

- **Runtime**: Node.js with Express.js

- **Database**: PostgreSQL with Knex.js query builder

- **Authentication**: JWT with bcrypt password hashing

- **API**: RESTful API with comprehensive error handling

### External Services

- **OCR**: Tesseract.js for text extraction

- **AI**: Ollama with Llama 3.2 model

- **Containerization**: Docker & Docker Compose

---

## 🚀 Installation

### Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/) & Docker Compose

- [Node.js 18+](https://nodejs.org/) (for local development)

- [Git](https://git-scm.com/)

### Quick Start with Docker

1. **Clone the repository**:

   ```bash

   git clone https://github.com/your-username/wdm-WoutVanImpe.git

   cd wdm-WoutVanImpe

   ```

2. **Environment Configuration**:

   ```bash

   cp .env.template .env

   # Edit .env with your preferred ports and configuration

   ```

3. **Start all services**:

   ```bash

   docker-compose up --build

   ```

4. **Access the application**:

   - You can acces the correct links in the docker desktop.

### Local Development

For development without containers:

```bash

# Frontend

cd frontend

npm install

npm run dev



# API

cd api

npm install

npm run knex:migrate

npm run knex:seed

npm start



# Tesseract Service

cd tesseract

npm install

npm start

```

---

## 📖 Usage

### For Users

1. **Account Setup**: Register and create your account

2. **Upload Receipts**: Use the Upload page to add receipt images

3. **Automatic Processing**: OCR extracts text, AI analyzes and categorizes items

4. **Manage Receipts**: View, edit, or delete stored receipts

5. **Dashboard Analytics**: Track spending patterns and category breakdowns

### For Administrators

1. **Admin Dashboard**: Access user management and analytics

2. **User Profiling**: View dangerous metadata and behavioral patterns

3. **Risk Assessment**: Monitor user spending behaviors and categories

4. **System Analytics**: Overview of platform usage and statistics

### API Endpoints

- `POST /api/login` - User authentication

- `GET /api/receipts` - Get user receipts

- `POST /api/receipts` - Create new receipt

- `PUT /api/receipts/:id` - Update receipt

- `DELETE /api/receipts/:id` - Delete receipt

- `GET /api/admin/*` - Admin endpoints (protected)

---

## 📁 Project Structure

```

wdm-WoutVanImpe/

├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and API clients
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript definitions
│   └── package.json
├── api/                     # Node.js Express backend
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── middlewares/ # Express middleware
│   │   └── migrations/   # Database schema
│   └── package.json
├── tesseract/                # OCR microservice
│   ├── src/
│   │   └── index.js
│   └── package.json
├── docs/                    # Documentation
│   ├── PROJECT_CONTEXT.md
│   ├── STANDARDS.md
│   └── PROMPTS.txt
├── docker-compose.yml          # Service orchestration
└── README.md                 # This file

```

---

## 🛠️ Development

### Code Standards

This project follows comprehensive coding standards documented in [STANDARDS.md](./docs/STANDARDS.md):

- **Naming Conventions**: camelCase, PascalCase, kebab-case

- **Documentation**: JSDoc comments for all public APIs

- **Type Safety**: TypeScript throughout the codebase

- **Error Handling**: Comprehensive try/catch with proper responses

- **Git Workflow**: Feature branches, conventional commits

### Available Scripts

```bash

# Frontend

npm run dev          # Start development server

npm run build         # Build for production

npm run lint          # Run ESLint



# API

npm start              # Start API server

npm run knex:migrate    # Run database migrations

npm run knex:seed      # Seed initial data



# Tesseract

npm start              # Start OCR service

```

### Environment Variables

Refer to `.env.template` for all available configuration options:

```bash

# Service Ports

TESSERACT_PORT=3001

FRONTEND_PORT=3005

API_PORT=8000

DATABASE_PORT=5432



# Database

DATABASE_USER=finance_user

DATABASE_PASSWORD=your_secure_password

DATABASE_DB=finance_tracker



# Authentication

API_JWT_SECRET=your_jwt_secret_key

```

---

## 🤝 Contributing

This project serves as a reference implementation for web development best practices.

### For Course Participants

1. **Follow Standards**: Adhere to conventions in [STANDARDS.md](./docs/STANDARDS.md)

2. **Testing**: Add tests for new features and functionality

3. **Documentation**: Update README and JSDoc comments

4. **Git Workflow**: Use feature branches and conventional commits

### Git Workflow Example

```bash

# Create feature branch

git checkout -b feature/new-feature develop



# Make changes

git add .

git commit -m "feat(feature): add new user functionality"



# Push and create pull request

git push origin feature/new-feature

```

---



## 📄 License

This project is licensed under the ISC License - see individual package.json files for details.


