# SauceDemo Test Automation User Guide

## 🎯 Overview

This comprehensive user guide helps you understand and effectively use the SauceDemo TypeScript Playwright automation framework. Whether you're a beginner or experienced tester, this guide provides everything you need to get started and become productive quickly.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Application](#understanding-the-application)
3. [Framework Architecture](#framework-architecture)
4. [Writing Tests](#writing-tests)
5. [Running Tests](#running-tests)
6. [Debugging](#debugging)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** (LTS recommended)
- **npm or yarn** package manager
- **Git** for version control
- **VS Code** (recommended IDE)

### 5-Minute Setup
```bash
# 1. Clone the repository
git clone <repository-url>
cd saucedemo-automation

# 2. Install dependencies
npm install

# 3. Install browsers
npx playwright install

# 4. Run a quick test
npm run test:auth

# 5. View results
npm run test:report
```

## 🏪 Understanding the Application

### SauceDemo Application Overview
SauceDemo is a demo e-commerce application designed specifically for testing purposes. It simulates a real online shopping experience with intentional bugs and different user behaviors.

**URL**: https://www.saucedemo.com

### Available Test Users

| Username | Password | Behavior | Use Case |
|----------|----------|----------|----------|
| `standard_user` | `secret_sauce` | Normal functionality | Happy path testing, baseline behavior |
| `locked_out_user` | `secret_sauce` | Access denied | Security testing, error handling |
| `problem_user` | `secret_sauce` | UI/UX issues | Bug detection, image problems |
| `performance_glitch_user` | `secret_sauce` | Slow performance | Performance testing, timeout scenarios |
| `error_user` | `secret_sauce` | JavaScript errors | Error handling, console error detection |
| `visual_user` | `secret_sauce` | Visual styling issues | CSS testing, layout validation |

### Application Features

#### 🔐 Authentication System
- Login/logout functionality
- Session management
- Error handling for invalid credentials
- User-specific behaviors

#### 🛍️ Product Catalog
- Product listing with images and descriptions
- Sorting options (A-Z, Z-A, Price Low-High, High-Low)
- Product detail pages
- Add to cart functionality

#### 🛒 Shopping Cart
- Add/remove items
- Quantity management
- Cart persistence
- Cart badge counter

#### 💳 Checkout Process
- Customer information form
- Order summary
- Payment simulation
- Order confirmation

## 🏗️ Framework Architecture

### Project Structure Overview
```
saucedemo-automation/
├── 📄 Configuration Files     # TypeScript, ESLint, Prettier configs
├── 🗂️ pages/                  # Page Object Model classes
├── 🗂️ tests/                  # Test specifications
├── 🗂️ utils/                  # Utilities and test data
├── 🗂️ fixtures/               # Custom test fixtures
└── 🗂️ .github/workflows/      # CI/CD configuration
```

### Key Design Patterns

#### 1. Page Object Model (POM)
**Purpose**: Separates page elements and actions from test logic

```typescript
// Example: LoginPage.ts
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
    // Return typed result
  }
}
```

#### 2. Type-Safe Test Data
**Purpose**: Ensures data consistency and IDE support

```typescript
// Example: testData.ts
export interface User {
  readonly username: UserType;
  readonly password: string;
  readonly expectedBehavior: UserBehavior;
}

export const USERS: Record<string, User> = {
  STANDARD: {
    username: UserType.STANDARD,
    password: 'secret_sauce',
    expectedBehavior: UserBehavior.NORMAL
  }
  // ... more users
};
```

#### 3. Custom Fixtures
**Purpose**: Provides reusable test components

```typescript
// Example: Custom fixture usage
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  }
});
```

## ✍️ Writing Tests

### Test Structure

#### Basic Test Template
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { USERS } from '../../utils/testData';

test.describe('Feature Name', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should perform expected behavior', async () => {
    // Arrange
    const user = USERS.STANDARD;

    // Act
    const result = await loginPage.login({
      username: user.username,
      password: user.password
    });

    // Assert
    expect(result.success).toBe(true);
  });
});
```

### Test Categories and Naming

#### Test Categories
- **Smoke Tests**: Critical functionality verification
- **Regression Tests**: Full feature validation
- **Cross-browser Tests**: Browser compatibility
- **Performance Tests**: Response time validation
- **Error Handling Tests**: Error scenario validation

#### Naming Conventions
```typescript
// Good test names
test('should login successfully with valid credentials');
test('should show error message for invalid password');
test('should add product to cart and update badge counter');

// Avoid vague names
test('login test');
test('cart functionality');
test('checkout');
```

### Writing Assertions

#### Playwright Assertions
```typescript
// Element visibility
await expect(page.locator('.title')).toBeVisible();

// Text content
await expect(page.locator('.title')).toHaveText('Products');

// Element count
await expect(page.locator('.inventory_item')).toHaveCount(6);

// URL validation
await expect(page).toHaveURL(/.*\/inventory\.html/);
```

#### Custom Assertions
```typescript
// Type-safe custom assertions
expect(result.success).toBe(true);
expect(result.errorMessage).toContain('Username is required');
expect(products).toHaveLength(6);
expect(cartCount).toBeGreaterThan(0);
```

### Handling Different User Types

#### Standard User Testing
```typescript
test('standard user happy path', async () => {
  const user = USERS.STANDARD;
  // Test normal functionality
  await loginPage.login({ username: user.username, password: user.password });
  // Continue with standard flow
});
```

#### Error-Prone User Testing
```typescript
test('error user JavaScript error handling', async () => {
  const user = USERS.ERROR_USER;
  
  // Monitor console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await loginPage.login({ username: user.username, password: user.password });
  
  // Document errors for analysis
  if (errors.length > 0) {
    console.log('JavaScript errors detected:', errors);
  }
});
```

#### Visual User Testing
```typescript
test('visual user layout verification', async () => {
  const user = USERS.VISUAL_USER;
  
  await loginPage.login({ username: user.username, password: user.password });
  
  // Take screenshot for visual comparison
  await page.screenshot({ path: 'visual-user-layout.png' });
  
  // Verify essential elements are still functional
  await expect(inventoryPage.pageTitle).toBeVisible();
});
```

## 🏃 Running Tests

### Command Overview

#### Basic Commands
```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/auth/login.spec.ts

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

#### Browser-Specific Testing
```bash
# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Cross-browser testing
npm run test:cross-browser
```

#### Test Filtering
```bash
# Run tests with specific tag
npx playwright test --grep="@smoke"

# Exclude specific tests
npx playwright test --grep-invert="@slow"

# Run specific test suite
npm run test:auth
npm run test:products
npm run test:cart
npm run test:checkout
```

### Environment Configuration

#### Environment Variables
```bash
# Set base URL
BASE_URL=https://staging.saucedemo.com npm test

# Enable headed mode
HEADLESS=false npm test

# Set specific browser
BROWSERS=firefox npm test

# Enable debugging
DEBUG=true npm test
```

#### Configuration Files
```typescript
// playwright.config.ts - modify for different environments
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    headless: process.env.HEADLESS !== 'false',
    // ... other settings
  }
});
```

### Reports and Results

#### HTML Reports
```bash
# Generate and view HTML report
npm run test:report

# Reports are automatically generated in:
# playwright-report/index.html
```

#### Allure Reports
```bash
# Generate Allure report
npm run allure:generate

# Serve Allure report
npm run allure:serve
```

#### CI/CD Integration
The framework automatically generates reports in CI/CD:
- GitHub Actions workflow included
- Artifact storage for test results
- Report publishing to GitHub Pages

## 🐛 Debugging

### Debugging Strategies

#### 1. Interactive Debugging
```bash
# Run tests in debug mode
npm run test:debug

# This opens Playwright Inspector for step-by-step debugging
```

#### 2. Headed Mode Debugging
```bash
# See browser actions
npm run test:headed

# Slow down execution
npx playwright test --headed --slowMo=1000
```

#### 3. Screenshot Debugging
```typescript
// Take screenshot at any point
await page.screenshot({ path: 'debug-screenshot.png' });

// Screenshots are automatically taken on test failures
```

#### 4. Console Logging
```typescript
// Log page content for debugging
console.log(await page.content());

// Log element text
console.log(await page.locator('.title').textContent());

// Log network requests
page.on('request', request => {
  console.log('Request:', request.url());
});
```

### Common Debugging Scenarios

#### Test Timeouts
```typescript
// Increase timeout for slow operations
await expect(page.locator('.slow-loading')).toBeVisible({ timeout: 30000 });

// Check for network delays
await page.waitForLoadState('networkidle');
```

#### Element Not Found
```typescript
// Wait for element to appear
await page.waitForSelector('.dynamic-content');

// Check if element exists
const elementExists = await page.locator('.element').count() > 0;

// Use more specific selectors
await page.locator('[data-test="specific-element"]').click();
```

#### Flaky Tests
```typescript
// Add retry logic
test.describe.configure({ retries: 2 });

// Use stable wait conditions
await expect(page.locator('.cart-badge')).toHaveText('1');

// Avoid hard waits
// await page.waitForTimeout(1000); // ❌ Avoid
await page.waitForSelector('.loaded'); // ✅ Better
```

## 💡 Best Practices

### Code Quality

#### 1. Type Safety
```typescript
// ✅ Use interfaces for data structures
interface LoginCredentials {
  username: string;
  password: string;
}

// ✅ Use enums for constants
enum UserType {
  STANDARD = 'standard_user',
  PROBLEM = 'problem_user'
}

// ❌ Avoid any types
const userData: any = { /* ... */ }; // Avoid this
```

#### 2. Clear Test Structure
```typescript
// ✅ Use AAA pattern (Arrange, Act, Assert)
test('should add product to cart', async () => {
  // Arrange
  const product = 'Sauce Labs Backpack';
  await loginPage.login(USERS.STANDARD);

  // Act
  await inventoryPage.addProductToCart(product);

  // Assert
  const cartCount = await inventoryPage.getCartBadgeCount();
  expect(cartCount).toBe(1);
});
```

#### 3. Meaningful Assertions
```typescript
// ✅ Specific assertions
expect(result.errorMessage).toBe('Username is required');

// ❌ Vague assertions
expect(result.success).toBeFalsy(); // Not clear why it should fail
```

### Page Object Best Practices

#### 1. Keep Page Objects Focused
```typescript
// ✅ LoginPage handles only login-related functionality
class LoginPage extends BasePage {
  async login(credentials: LoginCredentials): Promise<LoginResult> { /* */ }
  async getErrorMessage(): Promise<string> { /* */ }
  async isLoginFormVisible(): Promise<boolean> { /* */ }
}

// ❌ Don't mix responsibilities
class LoginPage extends BasePage {
  async login() { /* */ }
  async addProductToCart() { /* */ } // This belongs in InventoryPage
}
```

#### 2. Use Descriptive Locators
```typescript
// ✅ Use data-test attributes when available
readonly loginButton: Locator = page.locator('[data-test="login-button"]');

// ✅ Use descriptive CSS selectors
readonly productTitle: Locator = page.locator('.inventory_item_name');

// ❌ Avoid fragile selectors
readonly button: Locator = page.locator('button:nth-child(3)');
```

### Test Data Management

#### 1. Use Constants
```typescript
// ✅ Define constants for reusable data
export const USERS = {
  STANDARD: {
    username: 'standard_user',
    password: 'secret_sauce'
  }
} as const;

// ❌ Hard-code values in tests
await loginPage.login({ username: 'standard_user', password: 'secret_sauce' });
```

#### 2. Environment-Specific Data
```typescript
// ✅ Use environment variables for URLs
const baseURL = process.env.BASE_URL || 'https://www.saucedemo.com';

// ✅ Different data for different environments
const testUsers = getTestUsersForEnvironment(process.env.NODE_ENV);
```

### Performance Considerations

#### 1. Efficient Waiting
```typescript
// ✅ Wait for specific conditions
await expect(page.locator('.loading')).toBeHidden();
await expect(page.locator('.content')).toBeVisible();

// ❌ Use arbitrary timeouts
await page.waitForTimeout(5000);
```

#### 2. Parallel Execution
```typescript
// ✅ Use test.describe.configure for parallel execution
test.describe.configure({ mode: 'parallel' });

// ✅ Keep tests independent
test.beforeEach(async ({ page }) => {
  // Fresh setup for each test
  await loginPage.navigateToLogin();
});
```

## ❗ Troubleshooting

### Common Issues and Solutions

#### 1. Browser Installation Issues
```bash
# Problem: Browsers not installed
# Solution: Reinstall browsers
npx playwright install --with-deps
```

#### 2. TypeScript Compilation Errors
```bash
# Problem: TypeScript errors
# Solution: Check and fix type issues
npm run type-check

# Update TypeScript configuration if needed
```

#### 3. Test Flakiness
```typescript
// Problem: Tests fail inconsistently
// Solutions:

// 1. Add proper waits
await page.waitForLoadState('networkidle');

// 2. Use retry logic
test.describe.configure({ retries: 2 });

// 3. Improve selectors
const button = page.locator('[data-test="submit-button"]');
```

#### 4. CI/CD Failures
```bash
# Problem: Tests pass locally but fail in CI
# Solutions:

# 1. Check environment variables
echo $BASE_URL
echo $HEADLESS

# 2. Verify browser installation in CI
npx playwright install --with-deps

# 3. Check for timing issues
# Add longer timeouts for CI environment
```

#### 5. Performance Issues
```typescript
// Problem: Tests run slowly
// Solutions:

// 1. Run tests in parallel
npx playwright test --workers=4

// 2. Use efficient selectors
const fastSelector = page.locator('[data-test="id"]');

// 3. Minimize browser startup
// Use same browser context for related tests
```

### Getting Help

#### 1. Framework Documentation
- Check the README.md for setup instructions
- Review TEST-STRATEGY.md for testing approach
- Consult DECISIONS-AND-REASONS.md for framework choices

#### 2. Playwright Documentation
- [Official Playwright Docs](https://playwright.dev)
- [Playwright TypeScript Guide](https://playwright.dev/docs/test-typescript)
- [Best Practices](https://playwright.dev/docs/best-practices)

#### 3. Community Resources
- [Playwright Discord](https://discord.gg/playwright-807756831384403968)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)
- [GitHub Issues](https://github.com/microsoft/playwright/issues)

### Error Messages Guide

#### Common Error Messages and Solutions

```typescript
// Error: "Locator not found"
// Solution: Add wait or check selector
await page.waitForSelector('.element');
await expect(page.locator('.element')).toBeVisible();

// Error: "Test timeout"
// Solution: Increase timeout or optimize waits
test.setTimeout(60000);
await expect(element).toBeVisible({ timeout: 30000 });

// Error: "Element not clickable"
// Solution: Wait for element to be ready
await element.waitFor({ state: 'visible' });
await element.scrollIntoViewIfNeeded();
await element.click();
```

## 🎓 Advanced Topics

### Custom Fixtures
Create reusable test components:

```typescript
export const test = base.extend<{
  authenticatedUser: void;
  productPage: InventoryPage;
}>({
  authenticatedUser: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login(USERS.STANDARD);
    await use();
  },

  productPage: async ({ page, authenticatedUser }, use) => {
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  }
});
```

### Visual Testing
Implement visual regression testing:

```typescript
test('visual regression test', async ({ page }) => {
  await page.goto('/inventory');
  await expect(page).toHaveScreenshot('inventory-page.png');
});
```

### API Testing Integration
Combine UI and API testing:

```typescript
test('UI and API validation', async ({ page, request }) => {
  // UI action
  await inventoryPage.addProductToCart('Backpack');
  
  // API validation
  const response = await request.get('/api/cart');
  expect(response.status()).toBe(200);
});
```

This comprehensive user guide should help team members of all skill levels effectively use the SauceDemo TypeScript Playwright automation framework.