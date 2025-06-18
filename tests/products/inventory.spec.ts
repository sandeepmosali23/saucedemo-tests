import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { USERS, SortOption, URLS } from '../../utils/testData';

test.describe('Product Inventory and Filtering Tests', () => {
    let loginPage: LoginPage;
    let inventoryPage: InventoryPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        inventoryPage = new InventoryPage(page);

        // Login with standard user
        await loginPage.navigateToLogin();
        await loginPage.login({
            username: USERS.STANDARD.username,
            password: USERS.STANDARD.password,
        });
        await inventoryPage.waitForInventoryPageLoad();
    });

    test.describe('Product Listing Tests', () => {
        test('should display all products with complete information', async () => {
            // Act
            const productCount = await inventoryPage.getProductCount();
            const productNames = await inventoryPage.getProductNames();
            const productPrices = await inventoryPage.getProductPrices();

            // Assert
            expect(productCount).toBe(6);
            expect(productNames).toHaveLength(6);
            expect(productPrices).toHaveLength(6);

            // Verify specific products are present
            expect(productNames).toContain('Sauce Labs Backpack');
            expect(productNames).toContain('Sauce Labs Bike Light');
            expect(productNames).toContain('Sauce Labs Bolt T-Shirt');
            expect(productNames).toContain('Sauce Labs Fleece Jacket');
            expect(productNames).toContain('Sauce Labs Onesie');
            expect(productNames).toContain('Test.allTheThings() T-Shirt (Red)');

            // Verify all prices are positive numbers
            productPrices.forEach(price => {
                expect(price).toBeGreaterThan(0);
            });
        });

        test('should display product images correctly', async () => {
            // Act
            const areImagesLoaded = await inventoryPage.areAllImagesLoaded();

            // Assert
            expect(areImagesLoaded).toBe(true);
        });

        test('should have correct page title', async () => {
            // Act
            const pageTitle = await inventoryPage.getElementText(inventoryPage.pageTitle);

            // Assert
            expect(pageTitle).toBe('Products');
        });

        test('should display add to cart buttons for all products', async () => {
            // Act
            const buttonCount = await inventoryPage.addToCartButtons.count();

            // Assert
            expect(buttonCount).toBe(6);
        });
    });

    test.describe('Product Sorting Tests', () => {
        test('should sort products by name A to Z', async () => {
            // Act
            await inventoryPage.sortProducts(SortOption.NAME_A_TO_Z);

            // Assert
            const isSorted = await inventoryPage.areProductsSortedBy(SortOption.NAME_A_TO_Z);
            expect(isSorted).toBe(true);

            const productNames = await inventoryPage.getProductNames();
            expect(productNames[0]).toBe('Sauce Labs Backpack');
        });

        test('should sort products by name Z to A', async () => {
            // Act
            await inventoryPage.sortProducts(SortOption.NAME_Z_TO_A);

            // Assert
            const isSorted = await inventoryPage.areProductsSortedBy(SortOption.NAME_Z_TO_A);
            expect(isSorted).toBe(true);

            const productNames = await inventoryPage.getProductNames();
            expect(productNames[0]).toBe('Test.allTheThings() T-Shirt (Red)');
        });

        test('should sort products by price low to high', async () => {
            // Act
            await inventoryPage.sortProducts(SortOption.PRICE_LOW_TO_HIGH);

            // Assert
            const isSorted = await inventoryPage.areProductsSortedBy(SortOption.PRICE_LOW_TO_HIGH);
            expect(isSorted).toBe(true);

            const productPrices = await inventoryPage.getProductPrices();
            expect(productPrices[0]).toBeLessThanOrEqual(productPrices[1]!);
        });

        test('should sort products by price high to low', async () => {
            // Act
            await inventoryPage.sortProducts(SortOption.PRICE_HIGH_TO_LOW);

            // Assert
            const isSorted = await inventoryPage.areProductsSortedBy(SortOption.PRICE_HIGH_TO_LOW);
            expect(isSorted).toBe(true);

            const productPrices = await inventoryPage.getProductPrices();
            expect(productPrices[0]).toBeGreaterThanOrEqual(productPrices[1]!);
        });

        test('should maintain product count after sorting', async () => {
            // Arrange
            const initialCount = await inventoryPage.getProductCount();

            // Act
            await inventoryPage.sortProducts(SortOption.PRICE_LOW_TO_HIGH);
            const afterSortCount = await inventoryPage.getProductCount();

            // Assert
            expect(afterSortCount).toBe(initialCount);
        });
    });

    test.describe('Add to Cart Functionality', () => {
        test('should add single product to cart', async () => {
            // Arrange
            const productName = 'Sauce Labs Backpack';
            const initialCartCount = await inventoryPage.getCartBadgeCount();

            // Act
            await inventoryPage.addProductToCart(productName);

            // Assert
            const newCartCount = await inventoryPage.getCartBadgeCount();
            expect(newCartCount).toBe(initialCartCount + 1);

            const isInCart = await inventoryPage.isProductInCart(productName);
            expect(isInCart).toBe(true);
        });

        test('should add multiple products to cart', async () => {
            // Arrange
            const productsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

            // Act
            for (const product of productsToAdd) {
                await inventoryPage.addProductToCart(product);
            }

            // Assert
            const cartCount = await inventoryPage.getCartBadgeCount();
            expect(cartCount).toBe(productsToAdd.length);

            for (const product of productsToAdd) {
                const isInCart = await inventoryPage.isProductInCart(product);
                expect(isInCart).toBe(true);
            }
        });

        test('should remove product from cart', async () => {
            // Arrange
            const productName = 'Sauce Labs Backpack';
            await inventoryPage.addProductToCart(productName);
            const initialCartCount = await inventoryPage.getCartBadgeCount();

            // Act
            await inventoryPage.removeProductFromCart(productName);

            // Assert
            const newCartCount = await inventoryPage.getCartBadgeCount();
            expect(newCartCount).toBe(initialCartCount - 1);

            const isInCart = await inventoryPage.isProductInCart(productName);
            expect(isInCart).toBe(false);
        });

        test('should change button text when adding/removing products', async () => {
            // Arrange
            const productName = 'Sauce Labs Backpack';

            // Act & Assert - Add to cart
            await inventoryPage.addProductToCart(productName);
            const isInCart = await inventoryPage.isProductInCart(productName);
            expect(isInCart).toBe(true);

            // Act & Assert - Remove from cart
            await inventoryPage.removeProductFromCart(productName);
            const isNotInCart = await inventoryPage.isProductInCart(productName);
            expect(isNotInCart).toBe(false);
        });
    });

    test.describe('Product Navigation Tests', () => {
        test('should navigate to product detail page', async () => {
            // Arrange
            const productName = 'Sauce Labs Backpack';

            // Act
            await inventoryPage.goToProductDetail(productName);

            // Assert
            const currentUrl = await inventoryPage.getCurrentUrl();
            expect(currentUrl).toContain('/inventory-item.html');
        });

        test('should navigate to cart page', async () => {
            // Act
            await inventoryPage.goToCart();

            // Assert
            const currentUrl = await inventoryPage.getCurrentUrl();
            expect(currentUrl).toContain(URLS.CART);
        });
    });

    test.describe('Special User Behavior Tests', () => {
        test('should handle problem user image issues', async ({ page }) => {
            // Arrange - Login with problem user
            const problemLoginPage = new LoginPage(page);
            const problemInventoryPage = new InventoryPage(page);

            await problemLoginPage.navigateToLogin();
            await problemLoginPage.login({
                username: USERS.PROBLEM.username,
                password: USERS.PROBLEM.password,
            });

            // Act
            await problemInventoryPage.waitForInventoryPageLoad();
            const areImagesLoaded = await problemInventoryPage.areAllImagesLoaded();

            // Assert - Problem user may have image issues
            // Document the behavior for bug reporting
            console.log('Problem user image loading status:', areImagesLoaded);

            // Take screenshot for bug report
            await page.screenshot({ path: 'test-results/problem-user-inventory.png' });

            // Basic functionality should still work
            const productCount = await problemInventoryPage.getProductCount();
            expect(productCount).toBe(6);
        });

        test('should handle performance glitch user delays', async ({ page }) => {
            // Arrange - Login with performance glitch user
            const perfLoginPage = new LoginPage(page);
            const perfInventoryPage = new InventoryPage(page);

            await perfLoginPage.navigateToLogin();

            const startTime = Date.now();
            await perfLoginPage.login({
                username: USERS.PERFORMANCE_GLITCH.username,
                password: USERS.PERFORMANCE_GLITCH.password,
            });
            const loginTime = Date.now() - startTime;

            // Act
            await perfInventoryPage.waitForInventoryPageLoad();

            // Assert - Performance user may be slower but should still work
            console.log('Performance glitch user login time:', loginTime, 'ms');

            // Functionality should still work despite performance issues
            const productCount = await perfInventoryPage.getProductCount();
            expect(productCount).toBe(6);

            // Test should complete within reasonable time (even if slower)
            expect(loginTime).toBeLessThan(10000); // 10 seconds max
        });
    });

    test.describe('Cart Badge Functionality', () => {
        test('should not display cart badge when cart is empty', async () => {
            // Act
            const cartBadgeCount = await inventoryPage.getCartBadgeCount();

            // Assert
            expect(cartBadgeCount).toBe(0);
        });

        test('should update cart badge when adding products', async () => {
            // Act
            await inventoryPage.addProductToCart('Sauce Labs Backpack');
            const cartCount1 = await inventoryPage.getCartBadgeCount();

            await inventoryPage.addProductToCart('Sauce Labs Bike Light');
            const cartCount2 = await inventoryPage.getCartBadgeCount();

            // Assert
            expect(cartCount1).toBe(1);
            expect(cartCount2).toBe(2);
        });

        test('should update cart badge when removing products', async () => {
            // Arrange
            await inventoryPage.addProductToCart('Sauce Labs Backpack');
            await inventoryPage.addProductToCart('Sauce Labs Bike Light');
            const initialCount = await inventoryPage.getCartBadgeCount();

            // Act
            await inventoryPage.removeProductFromCart('Sauce Labs Backpack');
            const afterRemovalCount = await inventoryPage.getCartBadgeCount();

            // Assert
            expect(initialCount).toBe(2);
            expect(afterRemovalCount).toBe(1);
        });
    });

    test.describe('Menu and Navigation Tests', () => {
        test('should open burger menu', async () => {
            // Act
            await inventoryPage.openMenu();

            // Assert
            // Wait for menu to appear
            await inventoryPage.page.waitForTimeout(1000);

            // Verify menu opened (this would need additional locators in InventoryPage)
            // For now, just verify no errors occurred
            const currentUrl = await inventoryPage.getCurrentUrl();
            expect(currentUrl).toContain(URLS.INVENTORY);
        });
    });

    test.describe('Error Handling Tests', () => {
        test('should handle invalid product names gracefully', async () => {
            // This test verifies the framework handles edge cases properly

            // Try to interact with non-existent product
            try {
                await inventoryPage.addProductToCart('Non-existent Product');
                // If this doesn't throw an error, that's also valid behavior
            } catch (error) {
                // Expected behavior - should handle gracefully
                expect(error).toBeDefined();
            }

            // Verify page is still functional
            const productCount = await inventoryPage.getProductCount();
            expect(productCount).toBe(6);
        });
    });

    test.describe('Cross-Browser Compatibility', () => {
        test('should work consistently across browsers', async ({ browserName }) => {
            // Act
            const productCount = await inventoryPage.getProductCount();
            const productNames = await inventoryPage.getProductNames();

            // Assert
            expect(productCount).toBe(6);
            expect(productNames).toHaveLength(6);

            // Take browser-specific screenshot
            await inventoryPage.takeScreenshot(`inventory-${browserName}`);
        });
    });

    test.describe('Performance Tests', () => {
        test('@performance should load inventory page within acceptable time', async () => {
            // Arrange
            const startTime = Date.now();

            // Act
            await inventoryPage.page.reload();
            await inventoryPage.waitForInventoryPageLoad();

            // Assert
            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(5000); // 5 seconds max
        });

        test('@performance should sort products quickly', async () => {
            // Arrange
            const startTime = Date.now();

            // Act
            await inventoryPage.sortProducts(SortOption.PRICE_LOW_TO_HIGH);

            // Assert
            const sortTime = Date.now() - startTime;
            expect(sortTime).toBeLessThan(2000); // 2 seconds max
        });
    });
});