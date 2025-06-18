import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartItem, Product } from '../utils/testData';

/**
 * Shopping cart page object class
 */
export class CartPage extends BasePage {
    // Page elements
    readonly pageTitle: Locator;
    readonly cartItems: Locator;
    readonly cartItemNames: Locator;
    readonly cartItemDescriptions: Locator;
    readonly cartItemPrices: Locator;
    readonly cartItemQuantities: Locator;
    readonly removeButtons: Locator;
    readonly continueShoppingButton: Locator;
    readonly checkoutButton: Locator;
    readonly cartBadge: Locator;
    readonly emptyCartMessage: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize locators
        this.pageTitle = page.locator('.title');
        this.cartItems = page.locator('.cart_item');
        this.cartItemNames = page.locator('.inventory_item_name');
        this.cartItemDescriptions = page.locator('.inventory_item_desc');
        this.cartItemPrices = page.locator('.inventory_item_price');
        this.cartItemQuantities = page.locator('.cart_quantity');
        this.removeButtons = page.locator('[data-test^="remove"]');
        this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.cartBadge = page.locator('.shopping_cart_badge');
        this.emptyCartMessage = page.locator('.cart_item', { hasText: 'Your cart is empty' });
    }

    /**
     * Navigate to cart page
     */
    async navigateToCart(): Promise<void> {
        await this.navigateTo('/cart.html');
        await this.waitForCartPageLoad();
    }

    /**
     * Wait for cart page to load
     */
    async waitForCartPageLoad(): Promise<void> {
        await this.waitForElement(this.pageTitle);
        // Wait for either cart items or continue shopping button
        try {
            await this.waitForElement(this.continueShoppingButton, 5000);
        } catch {
            // Cart might be loading, wait a bit more
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Get all items in cart
     */
    async getCartItems(): Promise<CartItem[]> {
        const cartItems: CartItem[] = [];
        const itemCount = await this.cartItems.count();

        for (let i = 0; i < itemCount; i++) {
            const itemElement = this.cartItems.nth(i);

            const name = await itemElement.locator('.inventory_item_name').textContent() || '';
            const description = await itemElement.locator('.inventory_item_desc').textContent() || '';
            const priceText = await itemElement.locator('.inventory_item_price').textContent() || '';
            const quantityText = await itemElement.locator('.cart_quantity').textContent() || '1';

            const price = parseFloat(priceText.replace('$', ''));
            const quantity = parseInt(quantityText);

            const product: Product = {
                id: name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
                name,
                price,
                description,
                imageName: '', // Not easily accessible from cart page
            };

            cartItems.push({
                product,
                quantity,
                addedAt: new Date(), // Mock timestamp
            });
        }

        return cartItems;
    }

    /**
     * Get number of items in cart
     */
    async getCartItemCount(): Promise<number> {
        return await this.cartItems.count();
    }

    /**
     * Remove item from cart by name
     */
    async removeItemByName(productName: string): Promise<void> {
        const itemElement = this.page.locator('.cart_item', {
            has: this.page.locator('.inventory_item_name', { hasText: productName })
        });

        const removeButton = itemElement.locator('[data-test^="remove"]');
        await this.clickElement(removeButton);
    }

    /**
     * Remove item from cart by index
     */
    async removeItemByIndex(index: number): Promise<void> {
        const removeButton = this.removeButtons.nth(index);
        await this.clickElement(removeButton);
    }

    /**
     * Check if cart is empty
     */
    async isCartEmpty(): Promise<boolean> {
        const itemCount = await this.getCartItemCount();
        return itemCount === 0;
    }

    /**
     * Get cart badge count
     */
    async getCartBadgeCount(): Promise<number> {
        const isVisible = await this.isElementVisible(this.cartBadge);
        if (!isVisible) return 0;

        const badgeText = await this.getElementText(this.cartBadge);
        return parseInt(badgeText) || 0;
    }

    /**
     * Continue shopping (go back to inventory)
     */
    async continueShopping(): Promise<void> {
        await this.clickElement(this.continueShoppingButton);
    }

    /**
     * Proceed to checkout
     */
    async proceedToCheckout(): Promise<void> {
        await this.clickElement(this.checkoutButton);
    }

    /**
     * Get total cart value
     */
    async getCartTotal(): Promise<number> {
        const cartItems = await this.getCartItems();
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    /**
     * Check if specific product is in cart
     */
    async isProductInCart(productName: string): Promise<boolean> {
        const cartItems = await this.getCartItems();
        return cartItems.some(item => item.product.name === productName);
    }

    /**
     * Get product quantity in cart
     */
    async getProductQuantity(productName: string): Promise<number> {
        const cartItems = await this.getCartItems();
        const item = cartItems.find(item => item.product.name === productName);
        return item?.quantity || 0;
    }

    /**
     * Verify cart page title
     */
    async getPageTitle(): Promise<string> {
        return await this.getElementText(this.pageTitle);
    }

    /**
     * Check if checkout button is enabled
     */
    async isCheckoutButtonEnabled(): Promise<boolean> {
        return await this.isElementEnabled(this.checkoutButton);
    }

    /**
     * Check if continue shopping button is visible
     */
    async isContinueShoppingButtonVisible(): Promise<boolean> {
        return await this.isElementVisible(this.continueShoppingButton);
    }

    /**
     * Get all product names in cart
     */
    async getProductNames(): Promise<string[]> {
        const names: string[] = [];
        const nameElements = await this.getAllElements(this.cartItemNames);

        for (const element of nameElements) {
            const name = await this.getElementText(element);
            if (name) names.push(name);
        }

        return names;
    }

    /**
     * Get all product prices in cart
     */
    async getProductPrices(): Promise<number[]> {
        const prices: number[] = [];
        const priceElements = await this.getAllElements(this.cartItemPrices);

        for (const element of priceElements) {
            const priceText = await this.getElementText(element);
            const price = parseFloat(priceText.replace('$', ''));
            if (!isNaN(price)) prices.push(price);
        }

        return prices;
    }

    /**
     * Clear entire cart (remove all items)
     */
    async clearCart(): Promise<void> {
        const removeButtons = await this.getAllElements(this.removeButtons);

        // Remove items in reverse order to avoid index issues
        for (let i = removeButtons.length - 1; i >= 0; i--) {
            await this.clickElement(removeButtons[i]!);
            // Wait briefly between removals
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Validate cart page URL
     */
    async validateCartUrl(): Promise<boolean> {
        const currentUrl = await this.getCurrentUrl();
        return currentUrl.includes('/cart.html');
    }

    /**
     * Check if cart data matches expected items
     */
    async validateCartContents(expectedItems: CartItem[]): Promise<boolean> {
        const actualItems = await this.getCartItems();

        if (actualItems.length !== expectedItems.length) {
            return false;
        }

        for (const expectedItem of expectedItems) {
            const actualItem = actualItems.find(item => item.product.name === expectedItem.product.name);
            if (!actualItem || actualItem.quantity !== expectedItem.quantity) {
                return false;
            }
        }

        return true;
    }
}