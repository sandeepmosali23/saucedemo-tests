import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Interface for login credentials
 */
export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

/**
 * Interface for login result
 */
export interface LoginResult {
  readonly success: boolean;
  readonly errorMessage?: string;
  readonly redirectUrl?: string;
}

/**
 * Login page object class
 */
export class LoginPage extends BasePage {
  // Page elements
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginContainer: Locator;
  readonly loginLogo: Locator;
  readonly acceptedUsernames: Locator;
  readonly passwordForAllUsers: Locator;
  readonly loginCredentialsDetails: Locator;
  readonly passwordDetails: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.loginContainer = page.locator('.login_container');
    this.loginLogo = page.locator('.login_logo');
    this.acceptedUsernames = page.locator('#login_credentials');
    this.passwordForAllUsers = page.locator('.login_password');
    this.loginCredentialsDetails = page.locator('[data-test="login-credentials"]');
    this.passwordDetails = page.locator('[data-test="login-password"]');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateTo();
    await this.waitForPageLoad();
  }

  /**
   * Perform login with credentials
   * @param credentials - Login credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    await this.fillInput(this.usernameInput, credentials.username);
    await this.fillInput(this.passwordInput, credentials.password);
    await this.clickElement(this.loginButton);

    // Wait a moment for the page to respond
    await this.page.waitForTimeout(1000);

    // Check if there's an error message
    const hasError = await this.isElementVisible(this.errorMessage);
    
    if (hasError) {
      const errorText = await this.getElementText(this.errorMessage);
      return {
        success: false,
        errorMessage: errorText,
      };
    }

    // If no error, login was successful
    return {
      success: true,
      redirectUrl: await this.getCurrentUrl(),
    };
  }

  /**
   * Get the current error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }

  /**
   * Check if error message is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Check if login form is displayed
   */
  async isLoginFormDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.loginContainer);
  }

  /**
   * Get accepted usernames from the page
   */
  async getAcceptedUsernames(): Promise<string[]> {
    return await this.getElementText(this.loginCredentialsDetails);
  }
  async getAcceptedPassword(): Promise<string[]> {
    return await this.getElementText(this.passwordDetails);
  }
  /**
   * Get password information from the page
   */
  async getPasswordInfo(): Promise<string> {
    return await this.getElementText(this.passwordForAllUsers);
  }

  /**
   * Clear username field
   */
  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  /**
   * Clear password field
   */
  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  /**
   * Clear both username and password fields
   */
  async clearLoginForm(): Promise<void> {
    await this.clearUsername();
    await this.clearPassword();
  }

  /**
   * Check if username field is empty
   */
  async isUsernameEmpty(): Promise<boolean> {
    const value = await this.usernameInput.inputValue();
    return value === '';
  }

  /**
   * Check if password field is empty
   */
  async isPasswordEmpty(): Promise<boolean> {
    const value = await this.passwordInput.inputValue();
    return value === '';
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isElementEnabled(this.loginButton);
  }

  /**
   * Get the text of the login button
   */
  async getLoginButtonText(): Promise<string> {
    return this.loginButton;
  }

  /**
   * Wait for login page to be fully loaded
   */
  async waitForLoginPageLoad(): Promise<void> {
    await this.waitForElement(this.usernameInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }

  /**
   * Enter username only
   * @param username - Username to enter
   */
  async enterUsername(username: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
  }

  /**
   * Enter password only
   * @param password - Password to enter
   */
  async enterPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  /**
   * Attempt login and wait for redirect or error
   * @param credentials - Login credentials
   * @param expectedUrl - Expected URL after successful login
   */
  async loginAndWaitForResult(
    credentials: LoginCredentials,
    expectedUrl?: string
  ): Promise<LoginResult> {
    const result = await this.login(credentials);

    if (result.success && expectedUrl) {
      await this.waitForUrl(expectedUrl);
    }

    return result;
  }

  /**
   * Perform quick login without waiting
   * @param credentials - Login credentials
   */
  async quickLogin(credentials: LoginCredentials): Promise<void> {
    await this.enterUsername(credentials.username);
    await this.enterPassword(credentials.password);
    await this.clickLogin();
  }
}