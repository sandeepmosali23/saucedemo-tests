import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Product, SortOption } from '../utils/testData';

/**
 * Inventory page object class
 */
export class InventoryPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly addToCartButtons: Locator;
  readonly removeButtons: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly productImages: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.pageTitle = page.locator('.title');
    this.inventoryContainer = page.locator('.inventory_container');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('.product_sort_container');
    this.cartIcon = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.addToCartButtons = page.locator('[data-test^="add-to-cart"]');
    this.removeButtons = page.locator('[data-test^="remove"]');
    this.productNames = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
    this.productImages = page.locator('.inventory_item_img img');
  }

  /**
   * Wait for inventory page to load
   */
  async waitForInventoryPageLoad(): Promise<void> {
    await this.waitForElement(this.pageTitle);
    await this.waitForElement(this.inventoryContainer);
  }

  /**
   * Get all product names on the page
   */
  async getProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productNames.count();
    
    for (let i = 0; i < count; i++) {
      const name = await this.productNames.nth(i).textContent();
      if (name) names.push(name);
    }
    
    return names;
  }

  /**
   * Get all product prices on the page
   */
  async getProductPrices(): Promise<number[]> {
    const prices: number[] = [];
    const count = await this.productPrices.count();
    
    for (let i = 0; i < count; i++) {
      const priceText = await this.productPrices.nth(i).textContent();
      if (priceText) {
        const price = parseFloat(priceText.replace('$', ''));
        prices.push(price);
      }
    }
    
    return prices;
  }

  /**
   * Sort products by specified option
   */
  async sortProducts(sortOption: SortOption): Promise<void> {
    await this.selectOption(this.sortDropdown, sortOption);
    await this.page.waitForTimeout(1000); // Wait for sorting animation
  }

  /**
   * Add product to cart by name
   */
  async addProductToCart(productName: string): Promise<void> {
    const productLocator = this.getProductByName(productName);
    const addButton = productLocator.locator('[data-test^="add-to-cart"]');
    await this.clickElement(addButton);
  }

  /**
   * Remove product from cart by name
   */
  async removeProductFromCart(productName: string): Promise<void> {
    const productLocator = this.getProductByName(productName);
    const removeButton = productLocator.locator('[data-test^="remove"]');
    await this.clickElement(removeButton);
  }

  /**
   * Get product locator by name
   */
  private getProductByName(productName: string): Locator {
    return this.page.locator('.inventory_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName })
    });
  }

  /**
   * Check if product is in cart (has remove button)
   */
  async isProductInCart(productName: string): Promise<boolean> {
    const productLocator = this.getProductByName(productName);
    const removeButton = productLocator.locator('[data-test^="remove"]');
    return await this.isElementVisible(removeButton);
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
   * Click on cart icon
   */
  async goToCart(): Promise<void> {
    await this.clickElement(this.cartIcon);
  }

  /**
   * Click on product name to go to product detail
   */
  async goToProductDetail(productName: string): Promise<void> {
    const productNameLocator = this.page.locator('.inventory_item_name', { hasText: productName });
    await this.clickElement(productNameLocator);
  }

  /**
   * Get product information by name
   */
  async getProductInfo(productName: string): Promise<Product | null> {
    const productLocator = this.getProductByName(productName);
    const isVisible = await this.isElementVisible(productLocator);
    
    if (!isVisible) return null;

    const name = await this.getElementText(productLocator.locator('.inventory_item_name'));
    const priceText = await this.getElementText(productLocator.locator('.inventory_item_price'));
    const description = await this.getElementText(productLocator.locator('.inventory_item_desc'));
    const imageSrc = await productLocator.locator('.inventory_item_img img').getAttribute('src');

    const price = parseFloat(priceText.replace('$', ''));
    const imageName = imageSrc?.split('/').pop() || '';

    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      price,
      description,
      imageName,
    };
  }

  /**
   * Get all products on the page
   */
  async getAllProducts(): Promise<Product[]> {
    const products: Product[] = [];
    const productNames = await this.getProductNames();
    
    for (const name of productNames) {
      const product = await this.getProductInfo(name);
      if (product) products.push(product);
    }
    
    return products;
  }

  /**
   * Check if products are sorted correctly
   */
  async areProductsSortedBy(sortOption: SortOption): Promise<boolean> {
    const products = await this.getAllProducts();
    
    switch (sortOption) {
      case SortOption.NAME_A_TO_Z:
        return this.isSortedAlphabetically(products.map(p => p.name), true);
      
      case SortOption.NAME_Z_TO_A:
        return this.isSortedAlphabetically(products.map(p => p.name), false);
      
      case SortOption.PRICE_LOW_TO_HIGH:
        return this.isSortedNumerically(products.map(p => p.price), true);
      
      case SortOption.PRICE_HIGH_TO_LOW:
        return this.isSortedNumerically(products.map(p => p.price), false);
      
      default:
        return false;
    }
  }

  /**
   * Check if array is sorted alphabetically
   */
  private isSortedAlphabetically(arr: string[], ascending: boolean): boolean {
    for (let i = 1; i < arr.length; i++) {
      const comparison = arr[i-1]!.localeCompare(arr[i]!);
      if (ascending && comparison > 0) return false;
      if (!ascending && comparison < 0) return false;
    }
    return true;
  }

  /**
   * Check if array is sorted numerically
   */
  private isSortedNumerically(arr: number[], ascending: boolean): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (ascending && arr[i-1]! > arr[i]!) return false;
      if (!ascending && arr[i-1]! < arr[i]!) return false;
    }
    return true;
  }

  /**
   * Open burger menu
   */
  async openMenu(): Promise<void> {
    await this.clickElement(this.menuButton);
  }

  /**
   * Check if all product images are loaded
   */
  async areAllImagesLoaded(): Promise<boolean> {
    const images = await this.getAllElements(this.productImages);
    
    for (const image of images) {
      const src = await image.getAttribute('src');
      const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
      
      if (!src || naturalWidth === 0) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get number of products displayed
   */
  async getProductCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  /**
   * Check if inventory page is loaded
   */
  async isLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.pageTitle) && 
           await this.isElementVisible(this.inventoryContainer);
  }
}