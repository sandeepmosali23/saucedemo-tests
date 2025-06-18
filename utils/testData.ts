/**
 * Test data and user definitions for SauceDemo application
 */

/**
 * Enum for user types
 */
export enum UserType {
  STANDARD = 'standard_user',
  LOCKED_OUT = 'locked_out_user',
  PROBLEM = 'problem_user',
  PERFORMANCE_GLITCH = 'performance_glitch_user',
  ERROR_USER = 'error_user',
  VISUAL_USER = 'visual_user',
}

/**
 * Enum for expected user behaviors
 */
export enum UserBehavior {
  NORMAL = 'normal',
  LOCKED = 'locked',
  PROBLEMATIC = 'problematic',
  SLOW = 'slow',
  ERROR_PRONE = 'error_prone',
  VISUAL_ISSUES = 'visual_issues',
}

/**
 * Enum for product sort options
 */
export enum SortOption {
  NAME_A_TO_Z = 'az',
  NAME_Z_TO_A = 'za',
  PRICE_LOW_TO_HIGH = 'lohi',
  PRICE_HIGH_TO_LOW = 'hilo',
}

/**
 * Interface for user data
 */
export interface User {
  readonly username: UserType;
  readonly password: string;
  readonly expectedBehavior: UserBehavior;
  readonly description: string;
}

/**
 * Interface for product data
 */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly description: string;
  readonly imageName: string;
  readonly category?: string;
}

/**
 * Interface for cart item
 */
export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
  readonly addedAt: Date;
}

/**
 * Interface for cart state
 */
export interface CartState {
  readonly items: CartItem[];
  readonly totalItems: number;
  readonly totalPrice: number;
  readonly isEmpty: boolean;
}

/**
 * Interface for checkout information
 */
export interface CheckoutInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
}

/**
 * Interface for order summary
 */
export interface OrderSummary {
  readonly items: CartItem[];
  readonly itemTotal: number;
  readonly tax: number;
  readonly total: number;
}

/**
 * Test users with different characteristics
 */
export const USERS: Record<string, User> = {
  STANDARD: {
    username: UserType.STANDARD,
    password: 'secret_sauce',
    expectedBehavior: UserBehavior.NORMAL,
    description: 'Standard user for normal flow testing',
  },
  LOCKED_OUT: {
    username: UserType.LOCKED_OUT,
    password: 'secret_sauce',
    expectedBehavior: UserBehavior.LOCKED,
    description: 'User that gets locked out',
  },
  PROBLEM: {
    username: UserType.PROBLEM,
    password: 'secret_sauce',
    expectedBehavior: UserBehavior.PROBLEMATIC,
    description: 'User with UI/UX issues',
  },
  PERFORMANCE_GLITCH: {
    username: UserType.PERFORMANCE_GLITCH,
    password: 'secret_sauce',
    expectedBehavior: UserBehavior.SLOW,
    description: 'User with performance issues',
  },
  ERROR_USER: {
    username: UserType.ERROR_USER,
    password: 'secret_sauce',
    expectedBehavior: UserBehavior.ERROR_PRONE,
    description: 'User that experiences various errors during interactions',
  },
  VISUAL_USER: {
    username: UserType.VISUAL_USER,
    password: 'secret_sauce',
    expectedBehavior: UserBehavior.VISUAL_ISSUES,
    description: 'User with visual display and styling issues',
  },
} as const;

/**
 * Product catalog data
 */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'sauce-labs-backpack',
    name: 'Sauce Labs Backpack',
    price: 29.99,
    description: 'carry.allTheThings() with the sleek, streamlined Sly Pack',
    imageName: 'sauce-labs-backpack.jpg',
    category: 'bags',
  },
  {
    id: 'sauce-labs-bike-light',
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    description: "A red light isn't the desired state in testing",
    imageName: 'sauce-labs-bike-light.jpg',
    category: 'accessories',
  },
  {
    id: 'sauce-labs-bolt-t-shirt',
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    description:
      'Get your testing superhero on with the Sauce Labs bolt T-shirt',
    imageName: 'sauce-labs-bolt-t-shirt.jpg',
    category: 'clothing',
  },
  {
    id: 'sauce-labs-fleece-jacket',
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    description:
      "It's not every day that you come across a midweight quarter-zip fleece jacket",
    imageName: 'sauce-labs-fleece-jacket.jpg',
    category: 'clothing',
  },
  {
    id: 'sauce-labs-onesie',
    name: 'Sauce Labs Onesie',
    price: 7.99,
    description:
      "Rib snap infant onesie for the junior automation engineer in development",
    imageName: 'sauce-labs-onesie.jpg',
    category: 'clothing',
  },
  {
    id: 'test-allthethings-t-shirt-red',
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    description:
      'This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard',
    imageName: 'red-tatt.jpg',
    category: 'clothing',
  },
] as const;

/**
 * Sample checkout information for testing
 */
export const CHECKOUT_INFO: Record<string, CheckoutInfo> = {
  VALID: {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345',
  },
  INVALID_EMPTY_FIRST_NAME: {
    firstName: '',
    lastName: 'Doe',
    postalCode: '12345',
  },
  INVALID_EMPTY_LAST_NAME: {
    firstName: 'John',
    lastName: '',
    postalCode: '12345',
  },
  INVALID_EMPTY_POSTAL_CODE: {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '',
  },
  INVALID_ALL_EMPTY: {
    firstName: '',
    lastName: '',
    postalCode: '',
  },
} as const;

/**
 * Error messages for validation
 */
export const ERROR_MESSAGES = {
  LOGIN: {
    INVALID_CREDENTIALS: 'Username and password do not match any user in this service',
    LOCKED_OUT_USER: 'Epic sadface: Sorry, this user has been locked out.',
    EMPTY_USERNAME: 'Epic sadface: Username is required',
    EMPTY_PASSWORD: 'Epic sadface: Password is required',
  },
  CHECKOUT: {
    FIRST_NAME_REQUIRED: 'Error: First Name is required',
    LAST_NAME_REQUIRED: 'Error: Last Name is required',
    POSTAL_CODE_REQUIRED: 'Error: Postal Code is required',
  },
} as const;

/**
 * Expected URLs for different pages
 */
export const URLS = {
  LOGIN: '',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
} as const;

/**
 * Test data factory for generating dynamic test data
 */
export class TestDataFactory {
  /**
   * Create a user with optional overrides
   */
  static createUser(overrides?: Partial<User>): User {
    const defaultUser: User = {
      username: UserType.STANDARD,
      password: 'secret_sauce',
      expectedBehavior: UserBehavior.NORMAL,
      description: 'Generated test user',
    };

    return { ...defaultUser, ...overrides };
  }

  /**
   * Create a product with optional overrides
   */
  static createProduct(overrides?: Partial<Product>): Product {
    const defaultProduct: Product = {
      id: `test-product-${Date.now()}`,
      name: 'Test Product',
      price: 19.99,
      description: 'A test product for automation',
      imageName: 'test-product.jpg',
      category: 'test',
    };

    return { ...defaultProduct, ...overrides };
  }

  /**
   * Create checkout information with optional overrides
   */
  static createCheckoutInfo(overrides?: Partial<CheckoutInfo>): CheckoutInfo {
    const defaultInfo: CheckoutInfo = {
      firstName: 'Test',
      lastName: 'User',
      postalCode: '12345',
    };

    return { ...defaultInfo, ...overrides };
  }

  /**
   * Create a cart item with optional overrides
   */
  static createCartItem(overrides?: Partial<CartItem>): CartItem {
    const defaultItem: CartItem = {
      product: this.createProduct(),
      quantity: 1,
      addedAt: new Date(),
    };

    return { ...defaultItem, ...overrides };
  }

  /**
   * Generate random checkout information
   */
  static generateRandomCheckoutInfo(): CheckoutInfo {
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
    const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Davis', 'Wilson'];
    const postalCodes = ['12345', '67890', '54321', '98765', '11111', '22222'];

    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)]!,
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)]!,
      postalCode: postalCodes[Math.floor(Math.random() * postalCodes.length)]!,
    };
  }

  /**
   * Get a random product from the catalog
   */
  static getRandomProduct(): Product {
    return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]!;
  }

  /**
   * Get multiple random products
   */
  static getRandomProducts(count: number): readonly Product[] {
    const shuffled = [...PRODUCTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, PRODUCTS.length));
  }

  /**
   * Get products by category
   */
  static getProductsByCategory(category: string): readonly Product[] {
    return PRODUCTS.filter(product => product.category === category);
  }

  /**
   * Get products by price range
   */
  static getProductsByPriceRange(min: number, max: number): readonly Product[] {
    return PRODUCTS.filter(product => product.price >= min && product.price <= max);
  }

  /**
   * Calculate cart total
   */
  static calculateCartTotal(items: readonly CartItem[]): number {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  /**
   * Calculate tax amount (8% tax rate)
   */
  static calculateTax(subtotal: number): number {
    return Math.round(subtotal * 0.08 * 100) / 100;
  }

  /**
   * Create order summary from cart items
   */
  static createOrderSummary(items: readonly CartItem[]): OrderSummary {
    const itemTotal = this.calculateCartTotal(items);
    const tax = this.calculateTax(itemTotal);
    const total = itemTotal + tax;

    return {
      items: [...items],
      itemTotal,
      tax,
      total,
    };
  }
}