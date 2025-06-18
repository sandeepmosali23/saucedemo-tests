import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { USERS, URLS, TestDataFactory } from '../../utils/testData';

test.describe('Shopping Cart Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    // Login and navigate to inventory
    await loginPage.navigateToLogin();
    await loginPage.login({
      username: USERS.STANDARD.username,
      password: USERS.STANDARD.password,
    });
    await inventoryPage.waitForInventoryPageLoad();
  });

  test.describe('Cart Navigation Tests', () => {
    test('should navigate to cart page from inventory', async () => {
      // Act
      await inventoryPage.goToCart();

      // Assert
      const isValidUrl = await cartPage.validateCartUrl();
      expect(isValidUrl).toBe(true);

      const pageTitle = await cartPage.getPageTitle();
      expect(pageTitle).toBe('Your Cart');
    });

    test('should navigate back to inventory from cart', async () => {
      // Arrange
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      await cartPage.continueShopping();

      // Assert
      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl).toContain(URLS.INVENTORY);

      const isInventoryLoaded = await inventoryPage.isLoaded();
      expect(isInventoryLoaded).toBe(true);
    });
  });

  test.describe('Empty Cart Tests', () => {
    test('should display empty cart correctly', async () => {
      // Act
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);

      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(0);

      const isContinueButtonVisible = await cartPage.isContinueShoppingButtonVisible();
      expect(isContinueButtonVisible).toBe(true);
    });

    test('should not show cart badge when cart is empty', async () => {
      // Act
      const cartBadgeCount = await cartPage.getCartBadgeCount();

      // Assert
      expect(cartBadgeCount).toBe(0);
    });
  });

  test.describe('Add Items to Cart Tests', () => {
    test('should add single item to cart', async () => {
      // Arrange
      const productName = 'Sauce Labs Backpack';

      // Act
      await inventoryPage.addProductToCart(productName);
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);

      const isProductInCart = await cartPage.isProductInCart(productName);
      expect(isProductInCart).toBe(true);

      const cartItems = await cartPage.getCartItems();
      expect(cartItems).toHaveLength(1);
      expect(cartItems[0]?.product.name).toBe(productName);
    });

    test('should add multiple items to cart', async () => {
      // Arrange
      const productsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

      // Act
      for (const product of productsToAdd) {
        await inventoryPage.addProductToCart(product);
      }
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(productsToAdd.length);

      const cartItems = await cartPage.getCartItems();
      expect(cartItems).toHaveLength(productsToAdd.length);

      for (const product of productsToAdd) {
        const isInCart = await cartPage.isProductInCart(product);
        expect(isInCart).toBe(true);
      }
    });

    test('should maintain cart contents when navigating between pages', async () => {
      // Arrange
      const productName = 'Sauce Labs Backpack';
      await inventoryPage.addProductToCart(productName);

      // Act - Navigate to cart and back to inventory
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();
      await cartPage.continueShopping();
      await inventoryPage.waitForInventoryPageLoad();
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const isProductInCart = await cartPage.isProductInCart(productName);
      expect(isProductInCart).toBe(true);

      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);
    });
  });

  test.describe('Remove Items from Cart Tests', () => {
    test('should remove single item from cart', async () => {
      // Arrange
      const productName = 'Sauce Labs Backpack';
      await inventoryPage.addProductToCart(productName);
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      await cartPage.removeItemByName(productName);

      // Assert
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);

      const isProductInCart = await cartPage.isProductInCart(productName);
      expect(isProductInCart).toBe(false);
    });

    test('should remove specific item from cart with multiple items', async () => {
      // Arrange
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
      for (const product of products) {
        await inventoryPage.addProductToCart(product);
      }
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      await cartPage.removeItemByName('Sauce Labs Bike Light');

      // Assert
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(2);

      const isRemovedProductInCart = await cartPage.isProductInCart('Sauce Labs Bike Light');
      expect(isRemovedProductInCart).toBe(false);

      const isOtherProduct1InCart = await cartPage.isProductInCart('Sauce Labs Backpack');
      expect(isOtherProduct1InCart).toBe(true);

      const isOtherProduct2InCart = await cartPage.isProductInCart('Sauce Labs Bolt T-Shirt');
      expect(isOtherProduct2InCart).toBe(true);
    });

    test('should clear entire cart', async () => {
      // Arrange
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
      for (const product of products) {
        await inventoryPage.addProductToCart(product);
      }
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      await cartPage.clearCart();

      // Assert
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);

      const cartBadgeCount = await cartPage.getCartBadgeCount();
      expect(cartBadgeCount).toBe(0);
    });
  });

  test.describe('Cart Information Display Tests', () => {
    test('should display correct product information in cart', async () => {
      // Arrange
      const productName = 'Sauce Labs Backpack';
      const inventoryProduct = await inventoryPage.getProductInfo(productName);
      await inventoryPage.addProductToCart(productName);
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      const cartItems = await cartPage.getCartItems();

      // Assert
      expect(cartItems).toHaveLength(1);
      const cartItem = cartItems[0]!;
      expect(cartItem.product.name).toBe(inventoryProduct?.name);
      expect(cartItem.product.price).toBe(inventoryProduct?.price);
      expect(cartItem.quantity).toBe(1);
    });

    test('should display all product names correctly', async () => {
      // Arrange
      const expectedProducts = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
      for (const product of expectedProducts) {
        await inventoryPage.addProductToCart(product);
      }
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      const productNames = await cartPage.getProductNames();

      // Assert
      expect(productNames).toHaveLength(expectedProducts.length);
      for (const expectedProduct of expectedProducts) {
        expect(productNames).toContain(expectedProduct);
      }
    });

    test('should display correct product prices', async () => {
      // Arrange
      const productName = 'Sauce Labs Backpack';
      await inventoryPage.addProductToCart(productName);
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      const productPrices = await cartPage.getProductPrices();

      // Assert
      expect(productPrices).toHaveLength(1);
      expect(productPrices[0]).toBeGreaterThan(0);
    });
  });

  test.describe('Cart Calculations Tests', () => {
    test('should calculate correct cart total for single item', async () => {
      // Arrange
      const productName = 'Sauce Labs Backpack';
      const productInfo = await inventoryPage.getProductInfo(productName);
      await inventoryPage.addProductToCart(productName);
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      const cartTotal = await cartPage.getCartTotal();

      // Assert
      expect(cartTotal).toBe(productInfo?.price);
    });

    test('should calculate correct cart total for multiple items', async () => {
      // Arrange
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
      let expectedTotal = 0;

      for (const productName of products) {
        const productInfo = await inventoryPage.getProductInfo(productName);
        expectedTotal += productInfo?.price || 0;
        await inventoryPage.addProductToCart(productName);
      }

      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      const cartTotal = await cartPage.getCartTotal();

      // Assert
      expect(Math.abs(cartTotal - expectedTotal)).toBeLessThan(0.01); // Allow for floating point precision
    });
  });

  test.describe('Cart Badge Tests', () => {
    test('should update cart badge when adding items', async () => {
      // Act
      await inventoryPage.addProductToCart('Sauce Labs Backpack');
      const cartCount1 = await cartPage.getCartBadgeCount();

      await inventoryPage.addProductToCart('Sauce Labs Bike Light');
      const cartCount2 = await cartPage.getCartBadgeCount();

      // Assert
      expect(cartCount1).toBe(1);
      expect(cartCount2).toBe(2);
    });

    test('should update cart badge when removing items from cart page', async () => {
      // Arrange
      await inventoryPage.addProductToCart('Sauce Labs Backpack');
      await inventoryPage.addProductToCart('Sauce Labs Bike Light');
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      await cartPage.removeItemByName('Sauce Labs Backpack');
      const cartCount = await cartPage.getCartBadgeCount();

      // Assert
      expect(cartCount).toBe(1);
    });
  });

  test.describe('Checkout Navigation Tests', () => {
    test('should navigate to checkout when cart has items', async () => {
      // Arrange
      await inventoryPage.addProductToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      await cartPage.proceedToCheckout();

      // Assert
      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl).toContain('/checkout-step-one.html');
    });

    test('should have enabled checkout button when cart has items', async () => {
      // Arrange
      await inventoryPage.addProductToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      const isCheckoutEnabled = await cartPage.isCheckoutButtonEnabled();

      // Assert
      expect(isCheckoutEnabled).toBe(true);
    });
  });

  test.describe('Cart Persistence Tests', () => {
    test('should persist cart contents across browser sessions', async ({ page }) => {
      // Arrange
      const productName = 'Sauce Labs Backpack';
      await inventoryPage.addProductToCart(productName);

      // Act - Simulate page refresh
      await page.reload();
      await inventoryPage.waitForInventoryPageLoad();
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const isProductInCart = await cartPage.isProductInCart(productName);
      expect(isProductInCart).toBe(true);

      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);
    });
  });

  test.describe('Error Handling Tests', () => {
    test('should handle direct navigation to cart URL', async ({ page }) => {
      // Act
      await page.goto('/cart.html');
      await cartPage.waitForCartPageLoad();

      // Assert
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);

      const isContinueButtonVisible = await cartPage.isContinueShoppingButtonVisible();
      expect(isContinueButtonVisible).toBe(true);
    });

    test('should handle removing non-existent items gracefully', async () => {
      // Arrange
      await inventoryPage.addProductToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act & Assert - Try to remove item that doesn't exist
      try {
        await cartPage.removeItemByName('Non-existent Product');
        // If no error thrown, that's fine too
      } catch (error) {
        // Should handle gracefully
        expect(error).toBeDefined();
      }

      // Verify cart is still functional
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);
    });
  });

  test.describe('Special User Behavior Tests', () => {
    test('should handle problem user cart behavior', async ({ page }) => {
      // Arrange - Login with problem user
      const problemLoginPage = new LoginPage(page);
      const problemInventoryPage = new InventoryPage(page);
      const problemCartPage = new CartPage(page);

      await problemLoginPage.navigateToLogin();
      await problemLoginPage.login({
        username: USERS.PROBLEM.username,
        password: USERS.PROBLEM.password,
      });

      // Act
      await problemInventoryPage.waitForInventoryPageLoad();
      await problemInventoryPage.addProductToCart('Sauce Labs Backpack');
      await problemInventoryPage.goToCart();
      await problemCartPage.waitForCartPageLoad();

      // Assert - Basic cart functionality should work
      const itemCount = await problemCartPage.getCartItemCount();
      expect(itemCount).toBe(1);

      // Document any issues for bug reporting
      const cartItems = await problemCartPage.getCartItems();
      console.log('Problem user cart items:', cartItems.length);

      // Take screenshot for bug reporting
      await page.screenshot({ path: 'test-results/problem-user-cart.png' });
    });
  });

  test.describe('Performance Tests', () => {
    test('@performance should load cart page quickly', async () => {
      // Arrange
      await inventoryPage.addProductToCart('Sauce Labs Backpack');
      const startTime = Date.now();

      // Act
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds max
    });

    test('@performance should handle large cart efficiently', async () => {
      // Arrange - Add all available products
      const allProducts = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Fleece Jacket', 'Sauce Labs Onesie', 'Test.allTheThings() T-Shirt (Red)'];

      for (const product of allProducts) {
        await inventoryPage.addProductToCart(product);
      }

      const startTime = Date.now();

      // Act
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 seconds max for full cart

      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(allProducts.length);
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across browsers', async ({ browserName }) => {
      // Arrange
      await inventoryPage.addProductToCart('Sauce Labs Backpack');
      await inventoryPage.addProductToCart('Sauce Labs Bike Light');

      // Act
      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Assert
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(2);

      const cartTotal = await cartPage.getCartTotal();
      expect(cartTotal).toBeGreaterThan(0);

      // Take browser-specific screenshot
      await cartPage.takeScreenshot(`cart-${browserName}`);
    });
  });

  test.describe('Data Validation Tests', () => {
    test('should validate cart data integrity', async () => {
      // Arrange
      const testProducts = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
      const expectedItems = [];

      for (const productName of testProducts) {
        const productInfo = await inventoryPage.getProductInfo(productName);
        if (productInfo) {
          expectedItems.push(TestDataFactory.createCartItem({
            product: productInfo,
            quantity: 1
          }));
        }
        await inventoryPage.addProductToCart(productName);
      }

      await inventoryPage.goToCart();
      await cartPage.waitForCartPageLoad();

      // Act
      const isValid = await cartPage.validateCartContents(expectedItems);

      // Assert
      expect(isValid).toBe(true);
    });
  });
});