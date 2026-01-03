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

> **📝 Note on Model Accuracy**: The OCR and AI models in this demo run locally with smaller models for portability, which may result in reduced accuracy. For demonstration purposes, the account with username **"Wout"** has been populated with dummy data processed using more powerful OCR and AI models, showcasing the optimal performance and accuracy that would be achieved with production-grade models.

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

### Demo Accounts

The application comes with two pre-configured accounts for demonstration:

**👤 User Account (High-Quality Demo Data)**
- **Email**: `wout@example.com`
- **Password**: `student123`
- **Purpose**: Showcases optimal OCR/AI accuracy with receipts processed using production-grade models

**🔧 Admin Account (Administrative Access)**
- **Email**: `admin@system.local`  
- **Password**: `admin123`
- **Purpose**: Full admin access to user management and dangerous metadata analytics

### For Users

1. **Account Setup**: Login with demo credentials or register a new account

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
├── frontend/                 # Next.js 15 frontend application
│   ├── src/
│   │   ├── app/             # App Router pages and layouts
│   │   │   ├── account/     # User account pages
│   │   │   ├── admin/       # Admin dashboard
│   │   │   ├── dashboard/   # Main financial dashboard
│   │   │   └── upload/      # Receipt upload page
│   │   ├── components/      # Reusable React components
│   │   │   ├── account/     # Account-related components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   ├── ui/          # Generic UI components
│   │   │   └── upload/      # Upload processing components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities, API clients, and helpers
│   │   ├── styles/          # CSS Modules and design tokens
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── api/                     # Node.js Express backend API
│   ├── config/              # Database and app configuration
│   ├── controllers/         # Request handlers
│   ├── middlewares/         # Express middleware (auth, validation)
│   ├── migrations/          # Knex.js database migrations
│   ├── routes/              # API endpoint definitions
│   ├── seeds/               # Database seed data
│   ├── services/            # Business logic and external API calls
│   ├── utils/               # Helper functions and error handling
│   ├── app.js               # Express application setup
│   ├── knexfile.js          # Database configuration
│   └── package.json
├── tesseract/                # OCR microservice
│   ├── src/
│   │   └── index.js         # Tesseract.js OCR service
│   ├── *.traineddata        # Language data files
│   └── package.json
├── docs/                    # Project documentation
│   ├── AI_REFERENCE.txt     # AI development reference
│   ├── REFLECTION.MD        # Project reflections
│   └── STANDARDS.md         # Coding standards and conventions
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Multi-service Docker configuration
├── AGENTS.md                # Development commands and agent reference
├── CODE_OF_CONDUCT.md       # Community guidelines
├── CONTRIBUTING.md          # Contribution guidelines
├── LICENSE                  # MIT License
└── README.md               # This file
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

### Key Documentation Files

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Detailed contribution guidelines and workflow
- **[STANDARDS.md](./docs/STANDARDS.md)** - Coding conventions and best practices
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community guidelines
- **[docs/REFLECTION.MD](./docs/REFLECTION.MD)** - Project development reflections
- **[docs/AI_REFERENCE.txt](./docs/AI_REFERENCE.txt)** - AI development reference material

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

Contributions are welcome! Please read our comprehensive [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. **Read Standards**: Review [STANDARDS.md](./docs/STANDARDS.md) for coding conventions
2. **Fork & Branch**: Create feature branches from `develop`
3. **Follow Conventions**: Use conventional commits and proper documentation
4. **Test Thoroughly**: Ensure all functionality works as expected
5. **Submit PR**: Include detailed description and test results

### Development Commands

See [AGENTS.md](./AGENTS.md) for available development scripts and commands:

```bash
# Frontend development
cd frontend && npm run dev

# API development  
cd api && npm start

# Database migrations
cd api && npm run knex:migrate

# Linting
npm run lint
```

### Contribution Types

- 🐛 **Bug Reports**: Use GitHub Issues with reproduction steps
- ✨ **Features**: Follow the development workflow in CONTRIBUTING.md
- 📝 **Documentation**: Improvements to any documentation files
- 🧪 **Testing**: Test coverage and quality improvements

---



## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

### License Summary

- ✅ **Commercial use** allowed
- ✅ **Modification** allowed  
- ✅ **Distribution** allowed
- ✅ **Private use** allowed
- ⚠️ **Liability**: Software provided "AS IS" without warranty
- ⚠️ **Copyright**: Must include original license and copyright notice

Copyright © 2025 EHB MCT


