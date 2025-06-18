/**
 * Self-healing utilities for robust test automation
 * Provides fallback mechanisms when primary selectors fail
 */

import { Page, Locator } from '@playwright/test';

/**
 * Interface for defining multiple selector strategies
 */
export interface SelectorStrategy {
    primary: string;
    fallbacks: string[];
    description: string;
    elementType: 'button' | 'input' | 'link' | 'text' | 'generic';
}

/**
 * Interface for self-healing configuration
 */
export interface SelfHealingConfig {
    maxRetries: number;
    retryDelay: number;
    enableLogging: boolean;
    screenshotOnFailure: boolean;
}

/**
 * Self-healing test utilities class
 */
export class SelfHealingUtils {
    private page: Page;
    private config: SelfHealingConfig;
    private healingLog: string[] = [];

    constructor(page: Page, config?: Partial<SelfHealingConfig>) {
        this.page = page;
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            enableLogging: true,
            screenshotOnFailure: true,
            ...config
        };
    }

    /**
     * Find element using multiple selector strategies with self-healing
     */
    async findElement(strategy: SelectorStrategy): Promise<Locator | null> {
        const { primary, fallbacks, description, elementType } = strategy;

        // Try primary selector first
        try {
            const primaryLocator = this.page.locator(primary);
            await primaryLocator.waitFor({ timeout: 5000 });

            if (this.config.enableLogging) {
                console.log(`✅ Primary selector worked: ${primary} (${description})`);
            }

            return primaryLocator;
        } catch (error) {
            if (this.config.enableLogging) {
                console.log(`❌ Primary selector failed: ${primary} (${description})`);
            }
        }

        // Try fallback selectors
        for (let i = 0; i < fallbacks.length; i++) {
            const fallbackSelector = fallbacks[i]!;

            try {
                const fallbackLocator = this.page.locator(fallbackSelector);
                await fallbackLocator.waitFor({ timeout: 3000 });

                this.logHealing(primary, fallbackSelector, description);
                return fallbackLocator;
            } catch (error) {
                if (this.config.enableLogging) {
                    console.log(`❌ Fallback ${i + 1} failed: ${fallbackSelector}`);
                }
            }
        }

        // Try intelligent fallback based on element type
        const intelligentLocator = await this.intelligentFallback(elementType, description);
        if (intelligentLocator) {
            this.logHealing(primary, 'intelligent-fallback', description);
            return intelligentLocator;
        }

        // All strategies failed
        if (this.config.screenshotOnFailure) {
            await this.page.screenshot({
                path: `test-results/self-healing-failure-${Date.now()}.png`,
                fullPage: true
            });
        }

        this.logHealing(primary, 'FAILED', description, true);
        return null;
    }

    /**
     * Self-healing click with multiple strategies
     */
    async click(strategy: SelectorStrategy): Promise<boolean> {
        const element = await this.findElement(strategy);

        if (!element) {
            return false;
        }

        try {
            // Try different click strategies
            await this.retryOperation(async () => {
                await element.click();
            });

            return true;
        } catch (error) {
            // Try force click as fallback
            try {
                await element.click({ force: true });
                this.logHealing(strategy.primary, 'force-click', strategy.description);
                return true;
            } catch (forceError) {
                // Try JavaScript click as last resort
                try {
                    await element.evaluate(el => (el as HTMLElement).click());
                    this.logHealing(strategy.primary, 'js-click', strategy.description);
                    return true;
                } catch (jsError) {
                    return false;
                }
            }
        }
    }

    /**
     * Self-healing fill input with multiple strategies
     */
    async fill(strategy: SelectorStrategy, value: string): Promise<boolean> {
        const element = await this.findElement(strategy);

        if (!element) {
            return false;
        }

        try {
            await this.retryOperation(async () => {
                await element.clear();
                await element.fill(value);
            });

            return true;
        } catch (error) {
            // Try alternative fill strategies
            try {
                await element.click();
                await this.page.keyboard.press('Control+a');
                await this.page.keyboard.type(value);
                this.logHealing(strategy.primary, 'keyboard-fill', strategy.description);
                return true;
            } catch (keyboardError) {
                // Try JavaScript value setting
                try {
                    await element.evaluate((el, val) => {
                        (el as HTMLInputElement).value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }, value);
                    this.logHealing(strategy.primary, 'js-fill', strategy.description);
                    return true;
                } catch (jsError) {
                    return false;
                }
            }
        }
    }

    /**
     * Self-healing text extraction
     */
    async getText(strategy: SelectorStrategy): Promise<string | null> {
        const element = await this.findElement(strategy);

        if (!element) {
            return null;
        }

        try {
            return await element.textContent();
        } catch (error) {
            // Try alternative text extraction methods
            try {
                return await element.innerText();
            } catch (innerTextError) {
                try {
                    return await element.evaluate(el => el.textContent);
                } catch (evalError) {
                    return null;
                }
            }
        }
    }

    /**
     * Intelligent fallback based on element type and context
     */
    private async intelligentFallback(elementType: string, description: string): Promise<Locator | null> {
        const lowerDescription = description.toLowerCase();

        switch (elementType) {
            case 'button':
                return await this.findButtonByContext(lowerDescription);
            case 'input':
                return await this.findInputByContext(lowerDescription);
            case 'link':
                return await this.findLinkByContext(lowerDescription);
            case 'text':
                return await this.findTextByContext(lowerDescription);
            default:
                return await this.findGenericByContext(lowerDescription);
        }
    }

    /**
     * Find button by contextual clues
     */
    private async findButtonByContext(description: string): Promise<Locator | null> {
        const buttonStrategies = [
            // Common button patterns
            `button:has-text("${description}")`,
            `[role="button"]:has-text("${description}")`,
            `input[type="button"][value*="${description}"]`,
            `input[type="submit"][value*="${description}"]`,
            `.btn:has-text("${description}")`,
            `.button:has-text("${description}")`,
        ];

        // Context-specific button finding
        if (description.includes('login')) {
            buttonStrategies.push(
                'button[type="submit"]',
                '[data-test*="login"]',
                '[id*="login"]',
                '.login-btn'
            );
        }

        if (description.includes('add') && description.includes('cart')) {
            buttonStrategies.push(
                '[data-test*="add-to-cart"]',
                '[data-test*="add"]',
                '.add-to-cart',
                'button:has-text("Add")'
            );
        }

        if (description.includes('checkout')) {
            buttonStrategies.push(
                '[data-test*="checkout"]',
                '.checkout-btn',
                'button:has-text("Checkout")'
            );
        }

        return await this.tryStrategies(buttonStrategies);
    }

    /**
     * Find input by contextual clues
     */
    private async findInputByContext(description: string): Promise<Locator | null> {
        const inputStrategies = [
            `input[placeholder*="${description}"]`,
            `input[name*="${description}"]`,
            `input[id*="${description}"]`,
            `[data-test*="${description}"]`,
        ];

        if (description.includes('username')) {
            inputStrategies.push(
                'input[type="text"]',
                'input[name="username"]',
                'input[name="user"]',
                'input[id*="username"]',
                'input[id*="user"]'
            );
        }

        if (description.includes('password')) {
            inputStrategies.push(
                'input[type="password"]',
                'input[name="password"]',
                'input[name="pass"]',
                'input[id*="password"]'
            );
        }

        if (description.includes('email')) {
            inputStrategies.push(
                'input[type="email"]',
                'input[name="email"]',
                'input[id*="email"]'
            );
        }

        return await this.tryStrategies(inputStrategies);
    }

    /**
     * Find link by contextual clues
     */
    private async findLinkByContext(description: string): Promise<Locator | null> {
        const linkStrategies = [
            `a:has-text("${description}")`,
            `[role="link"]:has-text("${description}")`,
            `a[href*="${description}"]`,
            `.link:has-text("${description}")`,
        ];

        return await this.tryStrategies(linkStrategies);
    }

    /**
     * Find text by contextual clues
     */
    private async findTextByContext(description: string): Promise<Locator | null> {
        const textStrategies = [
            `:text("${description}")`,
            `:text-is("${description}")`,
            `*:has-text("${description}")`,
            `[aria-label*="${description}"]`,
            `.text:has-text("${description}")`,
        ];

        return await this.tryStrategies(textStrategies);
    }

    /**
     * Find element by generic contextual clues
     */
    private async findGenericByContext(description: string): Promise<Locator | null> {
        const genericStrategies = [
            `[data-test*="${description}"]`,
            `[data-testid*="${description}"]`,
            `[id*="${description}"]`,
            `[class*="${description}"]`,
            `[aria-label*="${description}"]`,
            `:has-text("${description}")`,
        ];

        return await this.tryStrategies(genericStrategies);
    }

    /**
     * Try multiple selector strategies
     */
    private async tryStrategies(strategies: string[]): Promise<Locator | null> {
        for (const strategy of strategies) {
            try {
                const locator = this.page.locator(strategy);
                await locator.waitFor({ timeout: 2000 });
                return locator;
            } catch (error) {
                // Continue to next strategy
            }
        }
        return null;
    }

    /**
     * Retry operation with exponential backoff
     */
    private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error;

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                if (attempt === this.config.maxRetries) {
                    throw lastError;
                }

                // Exponential backoff
                const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                await this.page.waitForTimeout(delay);
            }
        }

        throw lastError!;
    }

    /**
     * Log healing activity
     */
    private logHealing(originalSelector: string, healedSelector: string, description: string, failed = false): void {
        const timestamp = new Date().toISOString();
        const status = failed ? '❌ FAILED' : '🔧 HEALED';
        const logEntry = `${timestamp} - ${status} - ${description}: ${originalSelector} → ${healedSelector}`;

        this.healingLog.push(logEntry);

        if (this.config.enableLogging) {
            console.log(logEntry);
        }
    }

    /**
     * Get healing log
     */
    getHealingLog(): readonly string[] {
        return [...this.healingLog];
    }

    /**
     * Export healing report
     */
    async exportHealingReport(): Promise<void> {
        const report = {
            timestamp: new Date().toISOString(),
            totalHealingAttempts: this.healingLog.length,
            healingLog: this.healingLog,
            config: this.config
        };

        const fs = await import('fs/promises');
        await fs.writeFile(
            `test-results/self-healing-report-${Date.now()}.json`,
            JSON.stringify(report, null, 2)
        );
    }

    /**
     * Clear healing log
     */
    clearLog(): void {
        this.healingLog = [];
    }
}