import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { USERS, URLS } from '../../utils/testData';

test.describe('Product Detail Page Tests', () => {
    let loginPage: LoginPage;
    let inventoryPage: InventoryPage;
    let productDetailPage: ProductDetailPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        inventoryPage = new InventoryPage(page);
        productDetailPage = new ProductDetailPage(page);

        // Login and navigate to inventory
        await loginPage.navigateToLogin();
        await loginPage.login({
            username: USERS.STANDARD.username,
            password: USERS.STANDARD.password,
        });
        await inventoryPage.waitForInventoryPageLoad();
    });

    test.describe('Product Detail Navigation', () => {
        test('should navigate to product detail page from inventory', async () => {
            // Arrange
            const productName = 'Sauce Labs Backpack';

            // Act
            await inventoryPage.goToProductDetail(productName);
            await productDetailPage.waitForProductDetailLoad();

            // Assert
            const isValidUrl = await productDetailPage.validateProductDetailUrl();
            expect(isValidUrl).toBe(true);

            const areElementsPresent = await productDetailPage.areAllElementsPresent();
            expect(areElementsPresent).toBe(true);
        });

        test('should navigate back to inventory from product detail', async () => {
            // Arrange
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();

            // Act
            await productDetailPage.goBackToProducts();

            // Assert
            const currentUrl = await productDetailPage.getCurrentUrl();
            expect(currentUrl).toContain(URLS.INVENTORY);

            const isInventoryLoaded = await inventoryPage.isLoaded();
            expect(isInventoryLoaded).toBe(true);
        });
    });

    test.describe('Product Information Display', () => {
        test('should display complete product information', async () => {
            // Arrange
            const productName = 'Sauce Labs Backpack';

            // Act
            await inventoryPage.goToProductDetail(productName);
            await productDetailPage.waitForProductDetailLoad();
            const productDetails = await productDetailPage.getProductDetails();

            // Assert
            expect(productDetails.name).toBe(productName);
            expect(productDetails.price).toBeGreaterThan(0);
            expect(productDetails.description).toBeTruthy();
        });

        test('should match product information between inventory and detail pages', async () => {
            // Arrange
            const productName = 'Sauce Labs Backpack';
            const inventoryProduct = await inventoryPage.getProductInfo(productName);

            // Act
            await inventoryPage.goToProductDetail(productName);
            await productDetailPage.waitForProductDetailLoad();
            const detailProduct = await productDetailPage.getProductDetails();

            // Assert
            expect(detailProduct.name).toBe(inventoryProduct?.name);
            expect(detailProduct.price).toBe(inventoryProduct?.price);
            expect(detailProduct.description).toBe(inventoryProduct?.description);
        });
    });

    test.describe('Add to Cart from Product Detail', () => {
        test('should add product to cart from detail page', async () => {
            // Arrange
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();
            const initialCartCount = await productDetailPage.getCartBadgeCount();

            // Act
            await productDetailPage.addToCart();

            // Assert
            const newCartCount = await productDetailPage.getCartBadgeCount();
            expect(newCartCount).toBe(initialCartCount + 1);

            const isInCart = await productDetailPage.isProductInCart();
            expect(isInCart).toBe(true);
        });

        test('should remove product from cart from detail page', async () => {
            // Arrange
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();
            await productDetailPage.addToCart();
            const initialCartCount = await productDetailPage.getCartBadgeCount();

            // Act
            await productDetailPage.removeFromCart();

            // Assert
            const newCartCount = await productDetailPage.getCartBadgeCount();
            expect(newCartCount).toBe(initialCartCount - 1);

            const isInCart = await productDetailPage.isProductInCart();
            expect(isInCart).toBe(false);
        });

        test('should update button text when adding/removing from cart', async () => {
            // Arrange
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();

            // Act & Assert - Initially should show "Add to cart"
            const addButtonText = await productDetailPage.getAddToCartButtonText();
            expect(addButtonText.toLowerCase()).toContain('add to cart');

            // Add to cart
            await productDetailPage.addToCart();
            const isInCart = await productDetailPage.isProductInCart();
            expect(isInCart).toBe(true);

            // Remove from cart
            await productDetailPage.removeFromCart();
            const isNotInCart = await productDetailPage.isProductInCart();
            expect(isNotInCart).toBe(false);
        });

        test('should navigate to cart from product detail page', async () => {
            // Arrange
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();
            await productDetailPage.addToCart();

            // Act
            await productDetailPage.goToCart();

            // Assert
            const currentUrl = await productDetailPage.getCurrentUrl();
            expect(currentUrl).toContain(URLS.CART);
        });
    });

    test.describe('Multiple Product Detail Tests', () => {
        const testProducts = [
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light',
            'Sauce Labs Bolt T-Shirt',
            'Sauce Labs Fleece Jacket'
        ];

        testProducts.forEach(productName => {
            test(`should display correct details for ${productName}`, async () => {
                // Act
                await inventoryPage.goToProductDetail(productName);
                await productDetailPage.waitForProductDetailLoad();
                const productDetails = await productDetailPage.getProductDetails();

                // Assert
                expect(productDetails.name).toBe(productName);
                expect(productDetails.price).toBeGreaterThan(0);
                expect(productDetails.description).toBeTruthy();

                // Verify all required elements are present
                const areElementsPresent = await productDetailPage.areAllElementsPresent();
                expect(areElementsPresent).toBe(true);
            });
        });
    });

    test.describe('Cart Badge Functionality', () => {
        test('should update cart badge when adding multiple products from detail pages', async () => {
            const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
            let expectedCartCount = 0;

            for (const product of products) {
                // Navigate to product detail
                if (expectedCartCount > 0) {
                    await productDetailPage.goBackToProducts();
                    await inventoryPage.waitForInventoryPageLoad();
                }

                await inventoryPage.goToProductDetail(product);
                await productDetailPage.waitForProductDetailLoad();

                // Add to cart
                await productDetailPage.addToCart();
                expectedCartCount++;

                // Verify cart count
                const cartCount = await productDetailPage.getCartBadgeCount();
                expect(cartCount).toBe(expectedCartCount);
            }
        });
    });

    test.describe('Button State Tests', () => {
        test('should have enabled add to cart button initially', async () => {
            // Arrange
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();

            // Act
            const isEnabled = await productDetailPage.isAddToCartButtonEnabled();

            // Assert
            expect(isEnabled).toBe(true);
        });

        test('should maintain cart state when navigating between pages', async () => {
            // Arrange
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();
            await productDetailPage.addToCart();

            // Act - Navigate back and forth
            await productDetailPage.goBackToProducts();
            await inventoryPage.waitForInventoryPageLoad();
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();

            // Assert - Product should still be in cart
            const isInCart = await productDetailPage.isProductInCart();
            expect(isInCart).toBe(true);

            const cartCount = await productDetailPage.getCartBadgeCount();
            expect(cartCount).toBe(1);
        });
    });

    test.describe('Error Handling Tests', () => {
        test('should handle direct navigation to product detail URL', async ({ page }) => {
            // Act - Navigate directly to a product detail URL
            await page.goto('/inventory-item.html?id=4');
            await productDetailPage.waitForProductDetailLoad();

            // Assert
            const areElementsPresent = await productDetailPage.areAllElementsPresent();
            expect(areElementsPresent).toBe(true);

            const productDetails = await productDetailPage.getProductDetails();
            expect(productDetails.name).toBeTruthy();
            expect(productDetails.price).toBeGreaterThan(0);
        });
    });

    test.describe('Special User Behavior Tests', () => {
        test('should handle problem user on product detail page', async ({ page }) => {
            // Arrange - Login with problem user
            const problemLoginPage = new LoginPage(page);
            const problemInventoryPage = new InventoryPage(page);
            const problemDetailPage = new ProductDetailPage(page);

            await problemLoginPage.navigateToLogin();
            await problemLoginPage.login({
                username: USERS.PROBLEM.username,
                password: USERS.PROBLEM.password,
            });

            // Act
            await problemInventoryPage.waitForInventoryPageLoad();
            await problemInventoryPage.goToProductDetail('Sauce Labs Backpack');
            await problemDetailPage.waitForProductDetailLoad();

            // Assert - Basic functionality should work despite UI issues
            const areElementsPresent = await problemDetailPage.areAllElementsPresent();
            expect(areElementsPresent).toBe(true);

            // Document image loading issues for problem user
            const isImageLoaded = await problemDetailPage.isProductImageLoaded();
            console.log('Problem user product image loaded:', isImageLoaded);

            // Take screenshot for bug reporting
            await page.screenshot({ path: 'test-results/problem-user-product-detail.png' });
        });
    });

    test.describe('Performance Tests', () => {
        test('@performance should load product detail page quickly', async () => {
            // Arrange
            const startTime = Date.now();

            // Act
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();

            // Assert
            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(3000); // 3 seconds max
        });
    });

    test.describe('Cross-Browser Compatibility', () => {
        test('should work consistently across browsers', async ({ browserName }) => {
            // Act
            await inventoryPage.goToProductDetail('Sauce Labs Backpack');
            await productDetailPage.waitForProductDetailLoad();
            const productDetails = await productDetailPage.getProductDetails();

            // Assert
            expect(productDetails.name).toBe('Sauce Labs Backpack');
            expect(productDetails.price).toBeGreaterThan(0);

            // Take browser-specific screenshot
            await productDetailPage.takeScreenshot(`product-detail-${browserName}`);
        });
    });
});