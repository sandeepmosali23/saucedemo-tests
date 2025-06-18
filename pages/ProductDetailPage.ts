import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Product } from '../utils/testData';

/**
 * Product detail page object class
 */
export class ProductDetailPage extends BasePage {
    // Page elements
    readonly backToProductsButton: Locator;
    readonly productImage: Locator;
    readonly productName: Locator;
    readonly productDescription: Locator;
    readonly productPrice: Locator;
    readonly addToCartButton: Locator;
    readonly removeButton: Locator;
    readonly cartIcon: Locator;
    readonly cartBadge: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize locators
        this.backToProductsButton = page.locator('[data-test="back-to-products"]');
        this.productImage = page.locator('.inventory_details_img');
        this.productName = page.locator('[data-test="inventory-item-name"]');
        this.productDescription = page.locator('[data-test="inventory-item-desc"]');
        this.productPrice = page.locator('.inventory_details_price');
        this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
        this.removeButton = page.locator('[data-test^="remove"]');
        this.cartIcon = page.locator('.shopping_cart_link');
        this.cartBadge = page.locator('.shopping_cart_badge');
    }

    /**
     * Wait for product detail page to load
     */
    async waitForProductDetailLoad(): Promise<void> {
        await this.waitForElement(this.productName);
        await this.waitForElement(this.productPrice);
        await this.waitForElement(this.backToProductsButton);
    }

    /**
     * Get product information from detail page
     */
    async getProductDetails(): Promise<Product> {
        const name = await this.getElementText(this.productName);
        const description = await this.getElementText(this.productDescription);
        const priceText = await this.getElementText(this.productPrice);
        const price = parseFloat(priceText.replace('$', ''));
        // await this.page.pause();
        // const imageSrc = await this.productImage.locator('img').getAttribute('src');
        // const imageName = imageSrc?.split('/').pop() || '';

        return {
            id: name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
            name,
            price,
            description,
        };
    }

    /**
     * Add product to cart from detail page
     */
    async addToCart(): Promise<void> {
        await this.clickElement(this.addToCartButton);
    }

    /**
     * Remove product from cart from detail page
     */
    async removeFromCart(): Promise<void> {
        await this.clickElement(this.removeButton);
    }

    /**
     * Check if product is in cart (remove button visible)
     */
    async isProductInCart(): Promise<boolean> {
        return await this.isElementVisible(this.removeButton);
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
     * Go back to products page
     */
    async goBackToProducts(): Promise<void> {
        await this.clickElement(this.backToProductsButton);
    }

    /**
     * Go to cart page
     */
    async goToCart(): Promise<void> {
        await this.clickElement(this.cartIcon);
    }

    /**
     * Check if product image is loaded
     */
    async isProductImageLoaded(): Promise<boolean> {
        const image = this.productImage.locator('img');
        const src = await image.getAttribute('src');
        const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);

        return !!(src && naturalWidth > 0);
    }

    /**
     * Get product image source
     */
    async getProductImageSrc(): Promise<string | null> {
        return await this.productImage.locator('img').getAttribute('src');
    }

    /**
     * Check if all required elements are present
     */
    async areAllElementsPresent(): Promise<boolean> {
        const elements = [
            this.backToProductsButton,
            this.productName,
            this.productDescription,
            this.productPrice,
            this.productImage
        ];

        for (const element of elements) {
            const isVisible = await this.isElementVisible(element);
            if (!isVisible) return false;
        }

        return true;
    }

    /**
     * Get add to cart button text
     */
    async getAddToCartButtonText(): Promise<string> {
        return await this.getElementText(this.addToCartButton);
    }

    /**
     * Get remove button text
     */
    async getRemoveButtonText(): Promise<string> {
        return await this.getElementText(this.removeButton);
    }

    /**
     * Check if add to cart button is enabled
     */
    async isAddToCartButtonEnabled(): Promise<boolean> {
        return await this.isElementEnabled(this.addToCartButton);
    }

    /**
     * Validate product detail page URL
     */
    async validateProductDetailUrl(expectedProductId?: string): Promise<boolean> {
        const currentUrl = await this.getCurrentUrl();
        const hasInventoryItemPath = currentUrl.includes('/inventory-item.html');

        if (expectedProductId) {
            return hasInventoryItemPath && currentUrl.includes(`id=${expectedProductId}`);
        }

        return hasInventoryItemPath;
    }
}