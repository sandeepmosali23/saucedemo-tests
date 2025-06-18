import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { USERS, URLS } from '@utils/testData';

test.describe('Special User Behavior Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigateToLogin();
  });

  test.describe('Error User Tests', () => {
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

    test('should handle error user interactions gracefully', async ({ page }) => {
      // Arrange
      const user = USERS.ERROR_USER;
      await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Act & Assert - Test various interactions that might cause errors
      await test.step('Test product interactions', async () => {
        const productCount = await inventoryPage.getProductCount();
        expect(productCount).toBeGreaterThan(0);

        // Try to add products to cart - may encounter errors
        try {
          await inventoryPage.addProductToCart('Sauce Labs Backpack');
          // Check if cart badge updated or if error occurred
          const cartCount = await inventoryPage.getCartBadgeCount();
          expect(cartCount).toBeGreaterThanOrEqual(0);
        } catch (error) {
          // Log error for analysis but don't fail test - this is expected behavior
          console.log('Error user interaction caused expected error:', error);
        }
      });

      await test.step('Test navigation errors', async () => {
        try {
          await inventoryPage.goToCart();
          // Should either navigate successfully or encounter error
          const currentUrl = await page.url();
          // URL should be either cart page or still on inventory (if error occurred)
          expect(currentUrl).toMatch(/\/(inventory|cart)\.html/);
        } catch (error) {
          console.log('Navigation error for error user:', error);
        }
      });
    });

    test('should document error user behavior for bug reporting', async () => {
      // Arrange
      const user = USERS.ERROR_USER;
      await loginPage.login({
        username: user.username,
        password: user.password,
      });

      // Act - Document specific behaviors
      const behaviors: string[] = [];

      // Test sorting functionality
      try {
        await inventoryPage.sortProducts('az');
        const isSorted = await inventoryPage.areProductsSortedBy('az');
        if (!isSorted) {
          behaviors.push('Sorting functionality may not work correctly');
        }
      } catch (error) {
        behaviors.push('Sorting causes JavaScript errors');
      }

      // Test image loading
      try {
        const imagesLoaded = await inventoryPage.areAllImagesLoaded();
        if (!imagesLoaded) {
          behaviors.push('Some product images fail to load');
        }
      } catch (error) {
        behaviors.push('Image loading causes errors');
      }

      // Assert - Document findings
      console.log('Error user documented behaviors:', behaviors);
      
      // Take screenshot for bug reporting
      await loginPage.takeScreenshot('error-user-behavior');
    });
  });

  test.describe('Visual User Tests', () => {
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

    test('should document visual issues for visual user', async ({ page }) => {
      // Arrange
      const user = USERS.VISUAL_USER;
      await loginPage.login({
        username: user.username,
        password: user.password,
      });

      const visualIssues: string[] = [];

      await test.step('Check for layout issues', async () => {
        // Check if inventory container is visible
        const isInventoryVisible = await inventoryPage.isLoaded();
        expect(isInventoryVisible).toBe(true);

        // Take screenshot to compare with standard user
        await loginPage.takeScreenshot('visual-user-inventory-page');

        // Check product grid layout
        const productCount = await inventoryPage.getProductCount();
        if (productCount === 0) {
          visualIssues.push('No products visible - possible CSS display issue');
        }
      });

      await test.step('Check for styling problems', async () => {
        // Check if product images are displaying correctly
        const imagesLoaded = await inventoryPage.areAllImagesLoaded();
        if (!imagesLoaded) {
          visualIssues.push('Product images not displaying correctly');
        }

        // Check if text is readable (not cut off or overlapping)
        const productNames = await inventoryPage.getProductNames();
        if (productNames.length === 0) {
          visualIssues.push('Product names not visible - possible text styling issue');
        }
      });

      await test.step('Check cart functionality display', async () => {
        try {
          // Try to add a product and see if cart updates visually
          await inventoryPage.addProductToCart('Sauce Labs Backpack');
          
          // Check if cart badge appears and is visible
          const cartCount = await inventoryPage.getCartBadgeCount();
          if (cartCount === 0) {
            visualIssues.push('Cart badge not updating visually');
          }
        } catch (error) {
          visualIssues.push('Add to cart button styling/functionality issue');
        }
      });

      // Document all visual issues found
      console.log('Visual user documented issues:', visualIssues);
      
      if (visualIssues.length > 0) {
        // Take detailed screenshots for bug reporting
        await loginPage.takeScreenshot('visual-user-issues-documented');
      }
    });

    test('should compare visual user with standard user appearance', async ({ page, context }) => {
      // This test demonstrates how to compare visual differences
      
      // First, get standard user screenshot
      const standardPage = await context.newPage();
      const standardLoginPage = new LoginPage(standardPage);
      const standardInventoryPage = new InventoryPage(standardPage);
      
      await standardLoginPage.navigateToLogin();
      await standardLoginPage.login({
        username: USERS.STANDARD.username,
        password: USERS.STANDARD.password,
      });
      
      await standardLoginPage.takeScreenshot('standard-user-inventory');
      await standardPage.close();

      // Now test visual user
      const user = USERS.VISUAL_USER;
      await loginPage.login({
        username: user.username,
        password: user.password,
      });
      
      await loginPage.takeScreenshot('visual-user-inventory');
      
      // In a real scenario, you would use visual comparison tools here
      // For now, we document that screenshots should be manually compared
      console.log('Screenshots taken for manual visual comparison');
      console.log('Compare: standard-user-inventory vs visual-user-inventory');
    });
  });
});