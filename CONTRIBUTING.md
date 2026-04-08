# Contributing to StyleFit Studio

Thank you for your interest in contributing to StyleFit Studio! We welcome contributions in the form of bug reports, feature requests, and pull requests.

## 📋 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

## 🐛 Reporting Bugs

Before creating bug reports, please check if the issue has already been reported. When creating a bug report, include:

- **Clear descriptive title**
- **Detailed description** of the problem
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots/Videos** (if applicable)
- **Your environment** (OS, Node version, Python version, etc.)

---

## 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear descriptive title**
- **Detailed description** of the suggested enhancement
- **Step-by-step description** of the suggested enhancement
- **Use cases** and examples that demonstrate the enhancement
- **Why this enhancement would be useful**

---

## 🔧 Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR_USERNAME/style-fit-studio.git
   cd style-fit-studio
   ```

3. **Create a branch** for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**
   ```bash
   npm install
   cd backend && pip install -r requirements.txt && cd ..
   ```

5. **Make your changes** and test thoroughly

6. **Commit with clear messages**
   ```bash
   git commit -m "feat: add your feature description"
   ```

---

## 📝 Commit Message Convention

We follow conventional commits format:

```
type(scope): subject

body

footer
```

**Types:**
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, etc.

**Example:**
```
feat(avatar): add skin tone customization

- Added HSL color picker for skin tone selection
- Integrated with avatar rendering engine
- Added color preview before applying

Closes #123
```

---

## 🧪 Testing

### Frontend Tests
```bash
npm test                 # Run tests once
npm run test:watch     # Run tests in watch mode
```

### Backend Tests
```bash
cd backend
python -m pytest        # Run all tests
python -m pytest -v     # Verbose output
python -m pytest --cov  # With coverage
```

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

---

## 🎨 Code Style

### Frontend
- Use **TypeScript** for type safety
- Follow **ESLint** rules (run `npm lint`)
- Use **Prettier** for formatting
- Use **camelCase** for variables and functions
- Use **PascalCase** for React components and classes

### Backend
- Follow **PEP 8** style guide
- Use **type hints** in Python (Python 3.9+)
- Write **docstrings** for functions and classes
- Use descriptive variable names
- Use **snake_case** for variables and functions

---

## 📤 Submitting a Pull Request

1. **Update documentation** if you made changes that require it
2. **Add/update tests** for new functionality
3. **Ensure all tests pass**: `npm test` and `python -m pytest`
4. **Run linter**: `npm lint` and `pylint backend/`
5. **Push to your fork**
6. **Submit a pull request** to the `main` branch

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Testing Done
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

---

## 📚 Documentation

- Update [README.md](README.md) for major features
- Update relevant files in [docs/](docs/) directory
- Add inline code comments for complex logic
- Update API documentation in docstrings

---

## 🏗️ Project Structure

- `/src` - Frontend React application
- `/backend` - Python FastAPI backend
- `/docs` - Project documentation
- `/public` - Static assets
- `/.vscode` - VS Code settings

---

## 🤝 Community

- Discussions happen in GitHub Issues and Pull Requests
- Be respectful and constructive
- Help other contributors with their PRs

---

## 📞 Questions?

Feel free to open a GitHub discussion or issue if you have questions!

---

Thank you for contributing to StyleFit Studio! 🎉
