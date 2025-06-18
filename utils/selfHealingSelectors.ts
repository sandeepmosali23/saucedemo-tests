/**
 * Self-healing selector definitions for SauceDemo application
 * Multiple selector strategies for each element to ensure test resilience
 */

import { SelectorStrategy } from './selfHealing';

/**
 * Login page selectors with self-healing capabilities
 */
export const LOGIN_SELECTORS = {
    USERNAME_INPUT: {
        primary: '[data-test="username"]',
        fallbacks: [
            'input[name="user-name"]',
            'input[placeholder*="Username"]',
            'input[id*="username"]',
            'input[type="text"]',
            '.login_wrapper input[type="text"]'
        ],
        description: 'username input field',
        elementType: 'input'
    } as SelectorStrategy,

    PASSWORD_INPUT: {
        primary: '[data-test="password"]',
        fallbacks: [
            'input[name="password"]',
            'input[placeholder*="Password"]',
            'input[id*="password"]',
            'input[type="password"]',
            '.login_wrapper input[type="password"]'
        ],
        description: 'password input field',
        elementType: 'input'
    } as SelectorStrategy,

    LOGIN_BUTTON: {
        primary: '[data-test="login-button"]',
        fallbacks: [
            'input[type="submit"]',
            'button[type="submit"]',
            '.btn_action',
            'button:has-text("Login")',
            '.login-btn',
            '#login-button'
        ],
        description: 'login submit button',
        elementType: 'button'
    } as SelectorStrategy,

    ERROR_MESSAGE: {
        primary: '[data-test="error"]',
        fallbacks: [
            '.error-message-container',
            '.error',
            '[role="alert"]',
            '.alert-error',
            '.login-error'
        ],
        description: 'login error message',
        elementType: 'text'
    } as SelectorStrategy,

    LOGIN_LOGO: {
        primary: '.login_logo',
        fallbacks: [
            '.logo',
            'img[alt*="logo"]',
            '.brand',
            '.header-logo'
        ],
        description: 'login page logo',
        elementType: 'generic'
    } as SelectorStrategy
};

/**
 * Inventory page selectors with self-healing capabilities
 */
export const INVENTORY_SELECTORS = {
    PAGE_TITLE: {
        primary: '.title',
        fallbacks: [
            '.header_secondary_container .title',
            'h1',
            '.page-title',
            '[data-test="title"]'
        ],
        description: 'inventory page title',
        elementType: 'text'
    } as SelectorStrategy,

    PRODUCT_SORT_DROPDOWN: {
        primary: '.product_sort_container',
        fallbacks: [
            'select[data-test="product_sort_container"]',
            '.sort-dropdown',
            'select.product_sort_container',
            '.inventory_container select'
        ],
        description: 'product sort dropdown',
        elementType: 'generic'
    } as SelectorStrategy,

    PRODUCT_ITEMS: {
        primary: '.inventory_item',
        fallbacks: [
            '[data-test="inventory-item"]',
            '.product-item',
            '.inventory_list .inventory_item',
            '.product'
        ],
        description: 'product items',
        elementType: 'generic'
    } as SelectorStrategy,

    ADD_TO_CART_BUTTON: {
        primary: '[data-test^="add-to-cart"]',
        fallbacks: [
            'button:has-text("Add to cart")',
            '.btn_inventory',
            '.add-to-cart-btn',
            'button.btn_primary'
        ],
        description: 'add to cart button',
        elementType: 'button'
    } as SelectorStrategy,

    REMOVE_BUTTON: {
        primary: '[data-test^="remove"]',
        fallbacks: [
            'button:has-text("Remove")',
            '.btn_secondary',
            '.remove-btn',
            'button.btn_secondary'
        ],
        description: 'remove from cart button',
        elementType: 'button'
    } as SelectorStrategy,

    SHOPPING_CART_LINK: {
        primary: '.shopping_cart_link',
        fallbacks: [
            '[data-test="shopping-cart-link"]',
            '.cart-link',
            'a[href*="cart"]',
            '#shopping_cart_container a'
        ],
        description: 'shopping cart link',
        elementType: 'link'
    } as SelectorStrategy,

    CART_BADGE: {
        primary: '.shopping_cart_badge',
        fallbacks: [
            '[data-test="shopping-cart-badge"]',
            '.cart-badge',
            '.badge',
            '.cart-count'
        ],
        description: 'shopping cart badge',
        elementType: 'text'
    } as SelectorStrategy,

    BURGER_MENU: {
        primary: '#react-burger-menu-btn',
        fallbacks: [
            '.bm-burger-button',
            '[data-test="burger-menu"]',
            '.menu-button',
            '.hamburger'
        ],
        description: 'burger menu button',
        elementType: 'button'
    } as SelectorStrategy
};

/**
 * Cart page selectors with self-healing capabilities
 */
export const CART_SELECTORS = {
    CART_ITEMS: {
        primary: '.cart_item',
        fallbacks: [
            '[data-test="cart-item"]',
            '.item',
            '.cart_list .cart_item',
            '.cart-product'
        ],
        description: 'cart items',
        elementType: 'generic'
    } as SelectorStrategy,

    CONTINUE_SHOPPING_BUTTON: {
        primary: '[data-test="continue-shopping"]',
        fallbacks: [
            'button:has-text("Continue Shopping")',
            '.btn_secondary',
            '.continue-shopping-btn',
            'a:has-text("Continue Shopping")'
        ],
        description: 'continue shopping button',
        elementType: 'button'
    } as SelectorStrategy,

    CHECKOUT_BUTTON: {
        primary: '[data-test="checkout"]',
        fallbacks: [
            'button:has-text("Checkout")',
            '.btn_action',
            '.checkout-btn',
            '#checkout'
        ],
        description: 'checkout button',
        elementType: 'button'
    } as SelectorStrategy,

    CART_QUANTITY: {
        primary: '.cart_quantity',
        fallbacks: [
            '[data-test="cart-quantity"]',
            '.quantity',
            '.qty',
            '.item-quantity'
        ],
        description: 'cart item quantity',
        elementType: 'text'
    } as SelectorStrategy,

    ITEM_NAME: {
        primary: '.inventory_item_name',
        fallbacks: [
            '[data-test="inventory-item-name"]',
            '.item-name',
            '.product-name',
            '.cart_item .inventory_item_name'
        ],
        description: 'cart item name',
        elementType: 'text'
    } as SelectorStrategy
};

/**
 * Checkout page selectors with self-healing capabilities
 */
export const CHECKOUT_SELECTORS = {
    FIRST_NAME_INPUT: {
        primary: '[data-test="firstName"]',
        fallbacks: [
            'input[name="firstName"]',
            'input[placeholder*="First"]',
            'input[id*="first"]',
            '.checkout_info input[type="text"]:first-of-type'
        ],
        description: 'first name input',
        elementType: 'input'
    } as SelectorStrategy,

    LAST_NAME_INPUT: {
        primary: '[data-test="lastName"]',
        fallbacks: [
            'input[name="lastName"]',
            'input[placeholder*="Last"]',
            'input[id*="last"]',
            '.checkout_info input[type="text"]:nth-of-type(2)'
        ],
        description: 'last name input',
        elementType: 'input'
    } as SelectorStrategy,

    POSTAL_CODE_INPUT: {
        primary: '[data-test="postalCode"]',
        fallbacks: [
            'input[name="postalCode"]',
            'input[placeholder*="Zip"]',
            'input[placeholder*="Postal"]',
            'input[id*="postal"]',
            '.checkout_info input[type="text"]:last-of-type'
        ],
        description: 'postal code input',
        elementType: 'input'
    } as SelectorStrategy,

    CONTINUE_BUTTON: {
        primary: '[data-test="continue"]',
        fallbacks: [
            'input[type="submit"]',
            'button:has-text("Continue")',
            '.btn_primary',
            '.continue-btn'
        ],
        description: 'continue button',
        elementType: 'button'
    } as SelectorStrategy,

    CANCEL_BUTTON: {
        primary: '[data-test="cancel"]',
        fallbacks: [
            'button:has-text("Cancel")',
            '.btn_secondary',
            '.cancel-btn',
            'a:has-text("Cancel")'
        ],
        description: 'cancel button',
        elementType: 'button'
    } as SelectorStrategy,

    FINISH_BUTTON: {
        primary: '[data-test="finish"]',
        fallbacks: [
            'button:has-text("Finish")',
            '.btn_action',
            '.finish-btn',
            '#finish'
        ],
        description: 'finish order button',
        elementType: 'button'
    } as SelectorStrategy,

    CHECKOUT_ERROR: {
        primary: '[data-test="error"]',
        fallbacks: [
            '.error-message-container',
            '.error',
            '[role="alert"]',
            '.checkout-error'
        ],
        description: 'checkout error message',
        elementType: 'text'
    } as SelectorStrategy,

    ORDER_COMPLETE_HEADER: {
        primary: '[data-test="complete-header"]',
        fallbacks: [
            '.complete-header',
            'h2:has-text("Thank you")',
            '.checkout_complete_container h2',
            '.success-header'
        ],
        description: 'order complete header',
        elementType: 'text'
    } as SelectorStrategy,

    BACK_HOME_BUTTON: {
        primary: '[data-test="back-to-products"]',
        fallbacks: [
            'button:has-text("Back Home")',
            '.btn_primary',
            '.back-to-products-btn',
            'a:has-text("Back")'
        ],
        description: 'back to products button',
        elementType: 'button'
    } as SelectorStrategy
};

/**
 * Product detail page selectors with self-healing capabilities
 */
export const PRODUCT_DETAIL_SELECTORS = {
    BACK_TO_PRODUCTS_BUTTON: {
        primary: '[data-test="back-to-products"]',
        fallbacks: [
            'button:has-text("Back to products")',
            '.btn_secondary',
            '.back-btn',
            'a:has-text("Back")'
        ],
        description: 'back to products button',
        elementType: 'button'
    } as SelectorStrategy,

    PRODUCT_NAME: {
        primary: '[data-test="inventory-item-name"]',
        fallbacks: [
            '.inventory_details_name',
            '.product-name',
            '.item-name',
            'h1'
        ],
        description: 'product detail name',
        elementType: 'text'
    } as SelectorStrategy,

    PRODUCT_DESCRIPTION: {
        primary: '[data-test="inventory-item-desc"]',
        fallbacks: [
            '.inventory_details_desc',
            '.product-description',
            '.item-description',
            '.description'
        ],
        description: 'product detail description',
        elementType: 'text'
    } as SelectorStrategy,

    PRODUCT_PRICE: {
        primary: '.inventory_details_price',
        fallbacks: [
            '[data-test="inventory-item-price"]',
            '.price',
            '.product-price',
            '.cost'
        ],
        description: 'product detail price',
        elementType: 'text'
    } as SelectorStrategy
};

/**
 * Get all selectors for a specific page
 */
export const SELECTORS_BY_PAGE = {
    LOGIN: LOGIN_SELECTORS,
    INVENTORY: INVENTORY_SELECTORS,
    CART: CART_SELECTORS,
    CHECKOUT: CHECKOUT_SELECTORS,
    PRODUCT_DETAIL: PRODUCT_DETAIL_SELECTORS
} as const;

/**
 * Helper function to get selector strategy by name
 */
export function getSelectorStrategy(page: keyof typeof SELECTORS_BY_PAGE, elementName: string): SelectorStrategy | null {
    const pageSelectors = SELECTORS_BY_PAGE[page];
    const selector = (pageSelectors as any)[elementName];
    return selector || null;
}