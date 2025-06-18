import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { USERS, ERROR_MESSAGES, URLS } from '@utils/testData';

test.describe('Authentication Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  const user = USERS.STANDARD;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigateToLogin();
  });

  test.describe('Valid Login Scenarios', () => {
    test('should login successfully with standard user', async () => {
      // Act
      const result = await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.redirectUrl).toContain(URLS.INVENTORY);
      await expect(inventoryPage.pageTitle).toBeVisible();
      await expect(inventoryPage.pageTitle).toHaveText('Products');
    });

    test('should login successfully with problem user', async () => {
      // Arrange
      const user = USERS.PROBLEM;

      // Act
      const result = await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.redirectUrl).toContain(URLS.INVENTORY);
      await expect(inventoryPage.pageTitle).toBeVisible();
    });

    test('should login successfully with performance glitch user', async () => {
      // Arrange
      const user = USERS.PERFORMANCE_GLITCH;

      // Act
      const result = await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.redirectUrl).toContain(URLS.INVENTORY);
      await expect(inventoryPage.pageTitle).toBeVisible();
    });

    test('should login successfully with error user', async () => {
      // Arrange
      const user = USERS.ERROR_USER;

      // Act
      const result = await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.redirectUrl).toContain(URLS.INVENTORY);
      await expect(inventoryPage.pageTitle).toBeVisible();
    });

    test('should login successfully with visual user', async () => {
      // Arrange
      const user = USERS.VISUAL_USER;

      // Act
      const result = await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.redirectUrl).toContain(URLS.INVENTORY);
      await expect(inventoryPage.pageTitle).toBeVisible();
    });
  });

  test.describe('Invalid Login Scenarios', () => {
    test('should show error for invalid credentials', async () => {
      // Arrange
      const invalidCredentials = {
        username: 'invalid_user',
        password: 'wrong_password',
      };

      // Act
      const result = await loginPage.login(invalidCredentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain(ERROR_MESSAGES.LOGIN.INVALID_CREDENTIALS);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test('should show error for locked out user', async () => {
      // Arrange
      const user = USERS.LOCKED_OUT;

      // Act
      const result = await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain(ERROR_MESSAGES.LOGIN.LOCKED_OUT_USER);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test('should show error for empty username', async () => {
      // Arrange
      const credentials = {
        username: '',
        password: 'secret_sauce',
      };

      // Act
      const result = await loginPage.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain(ERROR_MESSAGES.LOGIN.EMPTY_USERNAME);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test('should show error for empty password', async () => {
      // Arrange
      const credentials = {
        username: 'standard_user',
        password: '',
      };

      // Act
      const result = await loginPage.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain(ERROR_MESSAGES.LOGIN.EMPTY_PASSWORD);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    test('should show error for empty username and password', async () => {
      // Arrange
      const credentials = {
        username: '',
        password: '',
      };

      // Act
      const result = await loginPage.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain(ERROR_MESSAGES.LOGIN.EMPTY_USERNAME);
      await expect(loginPage.errorMessage).toBeVisible();
    });
  });

  test.describe('Login Form Validation', () => {
    test('should have login form elements visible', async () => {
      // Assert
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.loginLogo).toBeVisible();
    });

    test('should show accepted usernames and password info', async () => {
      // Assert
      await expect(loginPage.acceptedUsernames).toBeVisible();
      await expect(loginPage.passwordForAllUsers).toBeVisible();
      expect( await loginPage.getAcceptedUsernames()).toContain(user.username);
      expect( await loginPage.getAcceptedPassword()).toContain(user.password);

    });

    test('should enable login button by default', async () => {
      // Assert
      const isEnabled = await loginPage.isLoginButtonEnabled();
      expect(isEnabled).toBe(true);
    });

    test('should clear form fields when cleared', async () => {
      // Arrange
      await loginPage.enterUsername('test_user');
      await loginPage.enterPassword('test_password');

      // Act
      await loginPage.clearLoginForm();

      // Assert
      const isUsernameEmpty = await loginPage.isUsernameEmpty();
      const isPasswordEmpty = await loginPage.isPasswordEmpty();
      expect(isUsernameEmpty).toBe(true);
      expect(isPasswordEmpty).toBe(true);
    });
  });

  test.describe('Login Button Behavior', () => {
    test('should have correct login button text', async () => {
      // Assert
      const buttonText = await loginPage.getLoginButtonText();
      expect(buttonText).toContainText('Login');
    });

    test('should navigate to inventory page after successful login', async () => {
      // Arrange
      const user = USERS.STANDARD;

      // Act
      await loginPage.loginAndWaitForResult(
        {
          username: user.username,
          password: user.password,
        },
        URLS.INVENTORY
      );

      // Assert
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain(URLS.INVENTORY);
    });
  });

  test.describe('Error Message Behavior', () => {
    test('should hide error message initially', async () => {
      // Assert
      const isErrorDisplayed = await loginPage.isErrorDisplayed();
      expect(isErrorDisplayed).toBe(false);
    });

    test('should show error message after invalid login attempt', async () => {
      // Act
      await loginPage.login({
        username: 'invalid',
        password: 'invalid',
      });

      // Assert
      const isErrorDisplayed = await loginPage.isErrorDisplayed();
      expect(isErrorDisplayed).toBe(true);
    });

    test('should persist error message until next login attempt', async () => {
      // Arrange
      await loginPage.login({
        username: 'invalid',
        password: 'invalid',
      });

      // Act - Clear form and check error is still visible
      await loginPage.clearLoginForm();

      // Assert
      const isErrorDisplayed = await loginPage.isErrorDisplayed();
      expect(isErrorDisplayed).toBe(true);

      // Act - Try valid login
      await loginPage.login({
        username: USERS.STANDARD.username,
        password: USERS.STANDARD.password,
      });

      // Assert - Should redirect successfully
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain(URLS.INVENTORY);
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across browsers', async ({ browserName }) => {
      // Arrange
      const user = USERS.STANDARD;

      // Act
      const result = await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Assert
      expect(result.success).toBe(true);
      
      // Take browser-specific screenshot for comparison
      await loginPage.takeScreenshot(`login-success-${browserName}`);
      
      await expect(inventoryPage.pageTitle).toBeVisible();
    });
  });
  //
  // test.describe('Performance Tests', () => {
  //   test('should complete login within acceptable time', async () => {
  //     // Arrange
  //     const user = USERS.STANDARD;
  //     const startTime = Date.now();
  //
  //     // Act
  //     await loginPage.login({
  //       username: user.username,
  //       password: user.password,
  //     });
  //
  //     // Assert
  //     const endTime = Date.now();
  //     const loginDuration = endTime - startTime;
  //
  //     // Login should complete within 5 seconds
  //     expect(loginDuration).toBeLessThan(5000);
  //   });
  //
  //   test('should handle performance glitch user appropriately', async () => {
  //     // Arrange
  //     const user = USERS.PERFORMANCE_GLITCH;
  //     const startTime = Date.now();
  //
  //     // Act
  //     const result = await loginPage.login({
  //       username: user.username,
  //       password: user.password,
  //     });
  //
  //     // Assert
  //     const endTime = Date.now();
  //     const loginDuration = endTime - startTime;
  //
  //     expect(result.success).toBe(true);
  //
  //     // Performance glitch user may take longer but should still complete
  //     expect(loginDuration).toBeLessThan(10000);
  //   });
  // });
});