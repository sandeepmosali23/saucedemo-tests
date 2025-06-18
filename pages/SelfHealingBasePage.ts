/**
 * Self-healing base page class that extends BasePage with healing capabilities
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { SelfHealingUtils, SelectorStrategy } from '../utils/selfHealing';

/**
 * Enhanced base page with self-healing capabilities
 */
export class SelfHealingBasePage extends BasePage {
    protected healingUtils: SelfHealingUtils;

    constructor(page: Page) {
        super(page);
        this.healingUtils = new SelfHealingUtils(page, {
            maxRetries: 3,
            retryDelay: 1000,
            enableLogging: true,
            screenshotOnFailure: true
        });
    }

    /**
     * Self-healing click operation
     */
    async healingClick(strategy: SelectorStrategy): Promise<boolean> {
        const success = await this.healingUtils.click(strategy);

        if (!success) {
            throw new Error(`Failed to click element: ${strategy.description} (${strategy.primary})`);
        }

        return success;
    }

    /**
     * Self-healing fill operation
     */
    async healingFill(strategy: SelectorStrategy, value: string): Promise<boolean> {
        const success = await this.healingUtils.fill(strategy, value);

        if (!success) {
            throw new Error(`Failed to fill element: ${strategy.description} (${strategy.primary}) with value: ${value}`);
        }

        return success;
    }

    /**
     * Self-healing text extraction
     */
    async healingGetText(strategy: SelectorStrategy): Promise<string> {
        const text = await this.healingUtils.getText(strategy);

        if (text === null) {
            throw new Error(`Failed to get text from element: ${strategy.description} (${strategy.primary})`);
        }

        return text;
    }

    /**
     * Self-healing element finder
     */
    async healingFindElement(strategy: SelectorStrategy): Promise<Locator> {
        const element = await this.healingUtils.findElement(strategy);

        if (!element) {
            throw new Error(`Failed to find element: ${strategy.description} (${strategy.primary})`);
        }

        return element;
    }

    /**
     * Self-healing visibility check
     */
    async healingIsVisible(strategy: SelectorStrategy): Promise<boolean> {
        try {
            const element = await this.healingUtils.findElement(strategy);
            return element !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Self-healing wait for element
     */
    async healingWaitForElement(strategy: SelectorStrategy, timeout: number = 10000): Promise<Locator> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                const element = await this.healingUtils.findElement(strategy);
                if (element) {
                    return element;
                }
            } catch (error) {
                // Continue trying
            }

            await this.page.waitForTimeout(1000);
        }

        throw new Error(`Timeout waiting for element: ${strategy.description} (${strategy.primary})`);
    }

    /**
     * Self-healing attribute extraction
     */
    async healingGetAttribute(strategy: SelectorStrategy, attributeName: string): Promise<string | null> {
        const element = await this.healingUtils.findElement(strategy);

        if (!element) {
            return null;
        }

        try {
            return await element.getAttribute(attributeName);
        } catch (error) {
            return null;
        }
    }

    /**
     * Self-healing hover operation
     */
    async healingHover(strategy: SelectorStrategy): Promise<boolean> {
        const element = await this.healingUtils.findElement(strategy);

        if (!element) {
            return false;
        }

        try {
            await element.hover();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Self-healing double click
     */
    async healingDoubleClick(strategy: SelectorStrategy): Promise<boolean> {
        const element = await this.healingUtils.findElement(strategy);

        if (!element) {
            return false;
        }

        try {
            await element.dblclick();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Self-healing select option
     */
    async healingSelectOption(strategy: SelectorStrategy, value: string): Promise<boolean> {
        const element = await this.healingUtils.findElement(strategy);

        if (!element) {
            return false;
        }

        try {
            await element.selectOption(value);
            return true;
        } catch (error) {
            // Try alternative selection methods
            try {
                await element.click();
                await this.page.locator(`option[value="${value}"]`).click();
                return true;
            } catch (altError) {
                return false;
            }
        }
    }

    /**
     * Get healing report
     */
    getHealingLog(): readonly string[] {
        return this.healingUtils.getHealingLog();
    }

    /**
     * Export healing report
     */
    async exportHealingReport(): Promise<void> {
        await this.healingUtils.exportHealingReport();
    }

    /**
     * Clear healing log
     */
    clearHealingLog(): void {
        this.healingUtils.clearLog();
    }

    /**
     * Enhanced navigation with healing
     */
    async healingNavigateTo(path: string = ''): Promise<void> {
        const url = `${this.baseURL}${path}`;

        try {
            await this.page.goto(url);
        } catch (error) {
            // Retry navigation with different strategies
            try {
                await this.page.goto(url, { waitUntil: 'domcontentloaded' });
            } catch (retryError) {
                await this.page.goto(url, { waitUntil: 'networkidle' });
            }
        }
    }

    /**
     * Enhanced screenshot with healing context
     */
    async healingTakeScreenshot(name: string, fullPage: boolean = true): Promise<Buffer> {
        const healingContext = this.healingUtils.getHealingLog().length > 0 ? '-healed' : '';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}${healingContext}-${timestamp}.png`;

        return await this.page.screenshot({
            path: `test-results/screenshots/${filename}`,
            fullPage
        });
    }
}