import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page class containing common functionality for all page objects
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'https://www.saucedemo.com';
  }

  /**
   * Navigate to a specific path
   * @param path - The path to navigate to (default: empty string for base URL)
   */
  async navigateTo(path: string = ''): Promise<void> {
    const url = `${this.baseURL}${path}`;
    await this.page.goto(url);
  }

  /**
   * Take a screenshot with timestamp
   * @param name - Name for the screenshot file
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    
    return await this.page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true,
    });
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if an element is visible
   * @param locator - The element locator
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for an element to be visible
   * @param locator - The element locator
   * @param timeout - Timeout in milliseconds
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Scroll to an element
   * @param locator - The element locator
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get text content of an element
   * @param locator - The element locator
   */
  async getElementText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  /**
   * Click an element with retry mechanism
   * @param locator - The element locator
   * @param options - Click options
   */
  async clickElement(
    locator: Locator,
    options?: { timeout?: number; force?: boolean }
  ): Promise<void> {
    await locator.click(options);
  }

  /**
   * Fill an input field with text
   * @param locator - The input element locator
   * @param text - Text to fill
   */
  async fillInput(locator: Locator, text: string): Promise<void> {
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Select an option from a dropdown
   * @param locator - The select element locator
   * @param value - Value to select
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  /**
   * Wait for a specific URL pattern
   * @param urlPattern - URL pattern to wait for
   */
  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Check if current URL matches pattern
   * @param urlPattern - URL pattern to check
   */
  async urlMatches(urlPattern: string | RegExp): Promise<boolean> {
    const currentUrl = this.page.url();
    if (typeof urlPattern === 'string') {
      return currentUrl.includes(urlPattern);
    }
    return urlPattern.test(currentUrl);
  }

  /**
   * Get all elements matching a locator
   * @param locator - The element locator
   */
  async getAllElements(locator: Locator): Promise<Locator[]> {
    const elements: Locator[] = [];
    const count = await locator.count();
    
    for (let i = 0; i < count; i++) {
      elements.push(locator.nth(i));
    }
    
    return elements;
  }

  /**
   * Hover over an element
   * @param locator - The element locator
   */
  async hoverElement(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Double click an element
   * @param locator - The element locator
   */
  async doubleClickElement(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Right click an element
   * @param locator - The element locator
   */
  async rightClickElement(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  /**
   * Check if element has specific class
   * @param locator - The element locator
   * @param className - Class name to check
   */
  async elementHasClass(locator: Locator, className: string): Promise<boolean> {
    const classAttribute = await locator.getAttribute('class');
    return classAttribute?.includes(className) || false;
  }

  /**
   * Get element attribute value
   * @param locator - The element locator
   * @param attributeName - Attribute name
   */
  async getElementAttribute(locator: Locator, attributeName: string): Promise<string | null> {
    return await locator.getAttribute(attributeName);
  }

  /**
   * Check if element is enabled
   * @param locator - The element locator
   */
  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Check if element is checked (for checkboxes/radio buttons)
   * @param locator - The element locator
   */
  async isElementChecked(locator: Locator): Promise<boolean> {
    return await locator.isChecked();
  }
}