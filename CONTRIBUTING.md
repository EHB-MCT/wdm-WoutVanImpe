# Contributing to WDM Finance Tracker

Thank you for your interest in contributing to this project! This guide will help you get started with contributing effectively.

## 🤝 Table of Contents

- [Development Workflow](#-development-workflow)
- [Code Standards](#-code-standards)
- [Commit Conventions](#-commit-conventions)
- [Pull Request Process](#-pull-request-process)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation](#-documentation)
- [Types of Contributions](#-types-of-contributions)
- [Community Guidelines](#-community-guidelines)

---

## 🛠 Development Workflow

### Prerequisites

Before contributing, ensure you have:

- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)
- Familiarity with [STANDARDS.md](./docs/STANDARDS.md)

### Setup Steps

1. **Fork the Repository**

   ```bash
   git clone https://github.com/WoutVanImpe/wdm-WoutVanImpe.git wdm-WoutVanImpe-fork
   cd wdm-WoutVanImpe-fork
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name develop
   ```

3. **Set Up Development Environment**

   ```bash
   cp .env.template .env
   # Configure your local ports and settings
   docker-compose up -d
   ```

4. **Verify Setup**
   - Frontend: http://localhost:3005
   - API: http://localhost:8000
   - Database: http://localhost:8080 (Adminer)

---

## 📏 Code Standards

Follow the comprehensive coding standards outlined in [STANDARDS.md](./STANDARDS.md):

### Key Requirements

- **TypeScript**: All new code should use TypeScript for type safety
- **JSDoc Documentation**: Document all exported functions, classes, and API endpoints
- **Error Handling**: Use try/catch blocks with meaningful error messages
- **Security**: Validate inputs, sanitize data, follow OWASP best practices
- **Testing**: Write tests for new features (when test framework is implemented)

### Code Organization

```javascript
// ✅ Good: Clear separation of concerns
class UserService {
	async createUser(userData) {
		// Validate input
		const validatedData = this.validateUserData(userData);

		// Database operation with error handling
		try {
			const user = await this.db.create(validatedData);
			return { success: true, data: user };
		} catch (error) {
			throw new Error(`User creation failed: ${error.message}`);
		}
	}
}

// ❌ Avoid: Business logic mixed with database operations
class BadService {
	async createOrder(orderData) {
		// Direct DB access without validation - security risk!
		return await this.db.create(orderData);
	}
}
```

---

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>
```

### Types

- `feat`: New feature (user authentication, receipt upload)
- `fix`: Bug fix (validation error, UI issue)
- `docs`: Documentation changes (README, API docs, JSDoc)
- `style`: Code formatting without logic changes
- `refactor`: Code improvement without feature changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, configuration

### Examples

```bash
# ✅ Good commits
feat(auth): implement JWT token refresh mechanism
fix(api): resolve memory leak in tesseract service
docs(readme): update installation instructions for Docker
style(ui): fix button spacing inconsistency

# ❌ Poor commits
added new login
fixed bug
updated docs
made changes
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Ensure your code follows [STANDARDS.md](./STANDARDS.md)
- [ ] Run all available tests: `npm test` (when implemented)
- [ ] Update documentation for new features
- [ ] Add tests for new functionality
- [ ] Ensure no console.log statements for production code
- [ ] Verify the application builds successfully

### PR Template

```markdown
## Description

Brief description of changes and their purpose.

### Type

- [ ] Bug fix
- [ ] Feature
- [ ] Breaking change
- [ ] Documentation update

### Testing

- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Cross-browser compatibility checked (if applicable)

### Checklist

- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Pull Request Guidelines

- Use clear, descriptive title following commit format
- Provide detailed description of changes
- Link to related issues using GitHub syntax (fixes #123)
- Keep PRs focused on a single feature or fix
- Respond to code review feedback promptly

---

## 🧪 Testing Guidelines

### Testing Strategy

This project uses a multi-layered testing approach:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration     # Integration tests
npm run test:e2e            # End-to-end tests
```

### Test Structure

```
tests/
├── unit/                    # Unit tests for individual functions
│   ├── api/                # API endpoint tests
│   ├── services/            # Business logic tests
│   └── utils/               # Utility function tests
├── integration/             # Service integration tests
├── e2e/                   # End-to-end workflow tests
└── fixtures/                # Test data and mocks
```

### Writing Tests

```javascript
// Example test file
describe("UserService", () => {
	describe("createUser", () => {
		it("should create user with valid data", async () => {
			const userData = { name: "Test User", email: "test@example.com" };
			const result = await userService.createUser(userData);

			expect(result.success).toBe(true);
			expect(result.data.email).toBe(userData.email);
		});

		it("should reject invalid email format", async () => {
			const userData = { name: "Test User", email: "invalid-email" };

			await expect(userService.createUser(userData)).rejects.toThrow("Invalid email format");
		});
	});
});
```

---

## 📚 Documentation

### When to Update Documentation

- New features or API endpoints
- Changes in project structure or architecture
- Updated installation or setup instructions
- Changes in development workflow

### Documentation Files

- **README.md**: Project overview, installation, and usage
- **STANDARDS.md**: Coding conventions and best practices
- **API Documentation**: JSDoc comments in source code
- **Code Comments**: Inline comments for complex logic

### Documentation Standards

```javascript
/**
 * Creates a new user account with email validation.
 * @param {Object} userData - User information including email, password, name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password (will be hashed)
 * @returns {Promise<Object>} Created user object with ID and JWT token
 * @throws {Error} If email is invalid or user already exists
 */
async function createUser(userData) {
	// Implementation here
}
```

---

## 🎯 Types of Contributions

### 🐛 Bug Reports

- Use GitHub Issues with descriptive titles
- Include steps to reproduce the issue
- Provide environment details (OS, browser, Node.js version)
- Add screenshots if the issue is UI-related
- Include error logs and stack traces

### ✨ Feature Requests

- Use GitHub Issues with `[Feature Request]` label
- Describe the problem you're trying to solve
- Suggest potential implementation approaches
- Consider edge cases and user experience

### 📝 Documentation Improvements

- Fix typos, grammar issues, or unclear explanations
- Add missing examples or use cases
- Improve installation or setup instructions
- Update outdated information

### 🧪 Code Contributions

- Implement new features following the feature development workflow
- Fix bugs with proper test coverage
- Refactor existing code for better maintainability
- Add performance optimizations

### 🧪 Security Contributions

- Report security vulnerabilities responsibly
- Help implement security best practices
- Audit code for common vulnerabilities (XSS, SQL injection, etc.)

---

## 👥 Community Guidelines

### Code of Conduct

1. **Be Respectful**: Welcome contributors of all experience levels
2. **Be Constructive**: Provide helpful feedback and suggestions
3. **Be Inclusive**: Welcome contributions from diverse backgrounds
4. **Be Professional**: Maintain professional communication standards
5. **Be Patient**: Allow time for review and discussion

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **Pull Requests**: For code review and discussion
- **Email**: wout.vanimpe@student.ehb.be (for sensitive matters)

### Getting Help

- **Questions**: Check existing issues and documentation first
- **Discussions**: Use GitHub Discussions for general questions
- **Mentorship**: Help newcomers understand project structure and standards

---

## 🎉 Recognition

Contributors of all types are valued and recognized! Whether you're:

- 🐛 Reporting bugs
- ✨ Adding features
- 📝 Improving documentation
- 🧪 Fixing security issues
- 💡 Sharing ideas

Your contributions help make this project better for everyone. Thank you! 🚀

---

## 📞 Getting Help

If you're stuck or need guidance:

1. **Check Documentation**: Review [README.md](../README.md) and [STANDARDS.md](./STANDARDS.md)
2. **Search Issues**: Look for similar problems or questions
3. **Ask Questions**: Use GitHub Discussions or contact maintainers
4. **Start Small**: Begin with documentation improvements or small bug fixes
5. **Learn Standards**: Familiarize yourself with project conventions before contributing

---

> 💡 **Pro Tip**: The best way to learn the codebase is to:
>
> 1. Set up the project locally
> 2. Read through existing code and documentation
> 3. Try to reproduce existing issues
> 4. Start with small, well-defined contributions
> 5. Ask questions early and often

**Happy contributing!** 🎉
