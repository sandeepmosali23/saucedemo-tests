import { test, expect } from '@playwright/test';
import { SelfHealingBasePage } from '../../pages/SelfHealingBasePage';
import { SelfHealingUtils } from '../../utils/selfHealing';
import {
    LOGIN_SELECTORS,
    INVENTORY_SELECTORS,
    CART_SELECTORS,
    CHECKOUT_SELECTORS
} from '../../utils/selfHealingSelectors';
import { USERS, CHECKOUT_INFO } from '../../utils/testData';

test.describe.only('Self-Healing Test Suite', () => {
    let selfHealingPage: SelfHealingBasePage;
    let healingUtils: SelfHealingUtils;

    test.beforeEach(async ({ page }) => {
        selfHealingPage = new SelfHealingBasePage(page);
        healingUtils = new SelfHealingUtils(page);
        await selfHealingPage.healingNavigateTo();
    });

    test.afterEach(async () => {
        // Export healing report after each test
        await selfHealingPage.exportHealingReport();

        // Log healing activities
        const healingLog = selfHealingPage.getHealingLog();
        if (healingLog.length > 0) {
            console.log('🔧 Self-healing activities in this test:');
            healingLog.forEach(log => console.log(log));
        }
    });

    test.describe('Login Page Self-Healing Tests', () => {
        test('should heal login form interactions with multiple selector strategies', async () => {
            // Test self-healing username input
            await test.step('Fill username with self-healing', async () => {
                const success = await selfHealingPage.healingFill(
                    LOGIN_SELECTORS.USERNAME_INPUT,
                    USERS.STANDARD.username
                );
                expect(success).toBe(true);
            });

            // Test self-healing password input
            await test.step('Fill password with self-healing', async () => {
                const success = await selfHealingPage.healingFill(
                    LOGIN_SELECTORS.PASSWORD_INPUT,
                    USERS.STANDARD.password
                );
                expect(success).toBe(true);
            });

            // Test self-healing login button click
            await test.step('Click login button with self-healing', async () => {
                const success = await selfHealingPage.healingClick(LOGIN_SELECTORS.LOGIN_BUTTON);
                expect(success).toBe(true);
            });

            // Verify successful login
            await test.step('Verify login success', async () => {
                const titleVisible = await selfHealingPage.healingIsVisible(INVENTORY_SELECTORS.PAGE_TITLE);
                expect(titleVisible).toBe(true);
            });
        });

        test('should handle broken selectors gracefully with fallbacks', async () => {
            // Simulate broken primary selector
            const brokenUsernameSelector = {
                primary: '[data-test="broken-username-selector"]', // This will fail
                fallbacks: [
                    'input[name="user-name"]',
                    'input[type="text"]',
                    '.login_wrapper input[type="text"]'
                ],
                description: 'username input with broken primary selector',
                elementType: 'input' as const
            };

            await test.step('Test fallback mechanism', async () => {
                const success = await selfHealingPage.healingFill(
                    brokenUsernameSelector,
                    USERS.STANDARD.username
                );
                expect(success).toBe(true);
            });

            // Verify healing log contains fallback usage
            const healingLog = selfHealingPage.getHealingLog();
            expect(healingLog.length).toBeGreaterThan(0);
            expect(healingLog.some(log => log.includes('HEALED'))).toBe(true);
        });

        test('should test error message visibility with self-healing', async () => {
            // Enter invalid credentials to trigger error
            await selfHealingPage.healingFill(LOGIN_SELECTORS.USERNAME_INPUT, 'invalid_user');
            await selfHealingPage.healingFill(LOGIN_SELECTORS.PASSWORD_INPUT, 'invalid_password');
            await selfHealingPage.healingClick(LOGIN_SELECTORS.LOGIN_BUTTON);

            // Test self-healing error message detection
            await test.step('Verify error message with self-healing', async () => {
                const errorVisible = await selfHealingPage.healingIsVisible(LOGIN_SELECTORS.ERROR_MESSAGE);
                expect(errorVisible).toBe(true);

                const errorText = await selfHealingPage.healingGetText(LOGIN_SELECTORS.ERROR_MESSAGE);
                expect(errorText).toContain('do not match');
            });
        });

        test('should handle different user types with self-healing', async () => {
            const userTypes = [
                USERS.STANDARD,
                USERS.PROBLEM,
                USERS.PERFORMANCE_GLITCH
            ];

            for (const user of userTypes) {
                await test.step(`Test self-healing with ${user.username}`, async () => {
                    // Clear form first
                    await selfHealingPage.healingNavigateTo();

                    // Fill credentials with self-healing
                    await selfHealingPage.healingFill(LOGIN_SELECTORS.USERNAME_INPUT, user.username);
                    await selfHealingPage.healingFill(LOGIN_SELECTORS.PASSWORD_INPUT, user.password);
                    await selfHealingPage.healingClick(LOGIN_SELECTORS.LOGIN_BUTTON);

                    // Verify login success
                    const titleVisible = await selfHealingPage.healingIsVisible(INVENTORY_SELECTORS.PAGE_TITLE);
                    expect(titleVisible).toBe(true);
                });
            }
        });
    });
    test.describe('Cross-Browser Self-Healing Tests', () => {
        test('should work consistently across browsers with healing', async ({ browserName }) => {
            await test.step(`Test self-healing in ${browserName}`, async () => {
                // Complete login flow with self-healing
                await selfHealingPage.healingFill(LOGIN_SELECTORS.USERNAME_INPUT, USERS.STANDARD.username);
                await selfHealingPage.healingFill(LOGIN_SELECTORS.PASSWORD_INPUT, USERS.STANDARD.password);
                await selfHealingPage.healingClick(LOGIN_SELECTORS.LOGIN_BUTTON);

                // Verify success
                const titleVisible = await selfHealingPage.healingIsVisible(INVENTORY_SELECTORS.PAGE_TITLE);
                expect(titleVisible).toBe(true);

                // Take screenshot with healing context
                await selfHealingPage.healingTakeScreenshot(`self-healing-${browserName}`);
            });

            // Log browser-specific healing activities
            const healingLog = selfHealingPage.getHealingLog();
            if (healingLog.length > 0) {
                console.log(`🔧 ${browserName} healing activities:`, healingLog.length);
            }
        });
    });

    test.describe('Performance Impact of Self-Healing', () => {
        test('should measure performance impact of self-healing', async () => {
            const startTime = Date.now();

            await test.step('Execute self-healing operations', async () => {
                await selfHealingPage.healingFill(LOGIN_SELECTORS.USERNAME_INPUT, USERS.STANDARD.username);
                await selfHealingPage.healingFill(LOGIN_SELECTORS.PASSWORD_INPUT, USERS.STANDARD.password);
                await selfHealingPage.healingClick(LOGIN_SELECTORS.LOGIN_BUTTON);
                await selfHealingPage.healingWaitForElement(INVENTORY_SELECTORS.PAGE_TITLE);
            });

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            console.log(`⏱️ Self-healing operations completed in ${executionTime}ms`);

            // Self-healing should not significantly impact performance
            expect(executionTime).toBeLessThan(30000); // 30 seconds max
        });
    });

    test.describe('Self-Healing Reporting and Analytics', () => {
        test('should generate comprehensive healing reports', async () => {
            // Perform various operations to generate healing data
            await selfHealingPage.healingFill(LOGIN_SELECTORS.USERNAME_INPUT, USERS.STANDARD.username);
            await selfHealingPage.healingFill(LOGIN_SELECTORS.PASSWORD_INPUT, USERS.STANDARD.password);
            await selfHealingPage.healingClick(LOGIN_SELECTORS.LOGIN_BUTTON);

            // Get healing statistics
            const healingLog = selfHealingPage.getHealingLog();

            console.log('📊 Self-Healing Test Statistics:');
            console.log(`   Total healing attempts: ${healingLog.length}`);
            console.log(`   Successful healings: ${healingLog.filter(log => log.includes('HEALED')).length}`);
            console.log(`   Failed healings: ${healingLog.filter(log => log.includes('FAILED')).length}`);

            // Export detailed report
            await selfHealingPage.exportHealingReport();
        });

        test('should validate healing log structure', async () => {
            // Create some healing activity
            const brokenSelector = {
                primary: '[data-test="non-existent"]',
                fallbacks: ['input[type="text"]'],
                description: 'test healing log',
                elementType: 'input' as const
            };

            await selfHealingPage.healingFill(brokenSelector, 'test');

            const healingLog = selfHealingPage.getHealingLog();
            expect(healingLog.length).toBeGreaterThan(0);

            // Validate log entry structure
            const logEntry = healingLog[0]!;
            expect(logEntry).toContain('HEALED');
            expect(logEntry).toContain('test healing log');
            expect(logEntry).toContain('non-existent');
        });
    });
    });
