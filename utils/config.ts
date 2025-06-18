/**
 * Configuration management for test environment
 */

/**
 * Environment configuration interface
 */
export interface TestConfig {
    readonly baseURL: string;
    readonly timeout: number;
    readonly retries: number;
    readonly workers: number;
    readonly headless: boolean;
    readonly viewport: {
        readonly width: number;
        readonly height: number;
    };
    readonly browsers: readonly string[];
    readonly environment: 'development' | 'staging' | 'production';
}

/**
 * Browser configuration interface
 */
export interface BrowserConfig {
    readonly name: string;
    readonly userAgent: string;
    readonly viewport: { width: number; height: number };
    readonly permissions?: readonly string[];
    readonly deviceScaleFactor?: number;
}

/**
 * Test data configuration
 */
export interface TestDataConfig {
    readonly useRandomData: boolean;
    readonly dataRefreshInterval: number;
    readonly enableMockData: boolean;
    readonly apiBaseUrl?: string;
}

/**
 * Reporting configuration
 */
export interface ReportingConfig {
    readonly enableScreenshots: boolean;
    readonly enableVideo: boolean;
    readonly enableTracing: boolean;
    readonly reportFormats: readonly string[];
    readonly outputDirectory: string;
}

/**
 * Parse boolean environment variable
 */
const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
};

/**
 * Parse number environment variable
 */
const parseNumber = (value: string | undefined, defaultValue: number): number => {
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse string array environment variable
 */
const parseStringArray = (value: string | undefined, defaultValue: readonly string[]): readonly string[] => {
    if (value === undefined) return defaultValue;
    return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Main test configuration
 */
export const CONFIG: TestConfig = {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    timeout: parseNumber(process.env.TIMEOUT, 30000),
    retries: parseNumber(process.env.RETRIES, process.env.CI ? 2 : 0),
    workers: parseNumber(process.env.WORKERS, process.env.CI ? 1 : undefined),
    headless: parseBoolean(process.env.HEADLESS, process.env.CI === 'true'),
    viewport: {
        width: parseNumber(process.env.VIEWPORT_WIDTH, 1280),
        height: parseNumber(process.env.VIEWPORT_HEIGHT, 720),
    },
    browsers: parseStringArray(process.env.BROWSERS, ['chromium']),
    environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
} as const;

/**
 * Browser-specific configurations
 */
export const BROWSER_CONFIGS: Record<string, BrowserConfig> = {
    chromium: {
        name: 'chromium',
        userAgent: 'Chrome/Latest',
        viewport: { width: 1280, height: 720 },
        permissions: ['clipboard-read', 'clipboard-write'],
        deviceScaleFactor: 1,
    },
    firefox: {
        name: 'firefox',
        userAgent: 'Firefox/Latest',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
    },
    webkit: {
        name: 'webkit',
        userAgent: 'Safari/Latest',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
    },
    'mobile-chrome': {
        name: 'mobile-chrome',
        userAgent: 'Chrome Mobile',
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
    },
    'mobile-safari': {
        name: 'mobile-safari',
        userAgent: 'Safari Mobile',
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
    },
} as const;

/**
 * Test data configuration
 */
export const TEST_DATA_CONFIG: TestDataConfig = {
    useRandomData: parseBoolean(process.env.USE_RANDOM_DATA, false),
    dataRefreshInterval: parseNumber(process.env.DATA_REFRESH_INTERVAL, 3600000), // 1 hour
    enableMockData: parseBoolean(process.env.ENABLE_MOCK_DATA, false),
    apiBaseUrl: process.env.API_BASE_URL,
} as const;

/**
 * Reporting configuration
 */
export const REPORTING_CONFIG: ReportingConfig = {
    enableScreenshots: parseBoolean(process.env.ENABLE_SCREENSHOTS, true),
    enableVideo: parseBoolean(process.env.ENABLE_VIDEO, process.env.CI === 'true'),
    enableTracing: parseBoolean(process.env.ENABLE_TRACING, false),
    reportFormats: parseStringArray(process.env.REPORT_FORMATS, ['html', 'allure']),
    outputDirectory: process.env.OUTPUT_DIR || 'test-results',
} as const;

/**
 * Environment-specific URLs
 */
export const ENVIRONMENT_URLS = {
    development: 'https://www.saucedemo.com',
    staging: process.env.STAGING_URL || 'https://staging.saucedemo.com',
    production: 'https://www.saucedemo.com',
} as const;

/**
 * Test timeouts for different operations
 */
export const TIMEOUTS = {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    NAVIGATION: 15000,
    API: 10000,
    ELEMENT_INTERACTION: 5000,
} as const;

/**
 * Test retry configurations for different scenarios
 */
export const RETRY_CONFIG = {
    FLAKY_TESTS: 3,
    NETWORK_REQUESTS: 2,
    ELEMENT_INTERACTIONS: 2,
    NAVIGATION: 1,
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
    PAGE_LOAD_TIME: 3000, // 3 seconds
    LOGIN_TIME: 2000, // 2 seconds
    CART_OPERATION: 1000, // 1 second
    PRODUCT_SORT: 1500, // 1.5 seconds
} as const;

/**
 * Accessibility configuration
 */
export const ACCESSIBILITY_CONFIG = {
    enableA11yTesting: parseBoolean(process.env.ENABLE_A11Y, false),
    wcagLevel: (process.env.WCAG_LEVEL as 'A' | 'AA' | 'AAA') || 'AA',
    includeTags: parseStringArray(process.env.A11Y_TAGS, ['wcag2a', 'wcag2aa']),
    excludeTags: parseStringArray(process.env.A11Y_EXCLUDE_TAGS, []),
} as const;

/**
 * Security testing configuration
 */
export const SECURITY_CONFIG = {
    enableSecurityTests: parseBoolean(process.env.ENABLE_SECURITY, false),
    checkForSqlInjection: parseBoolean(process.env.CHECK_SQL_INJECTION, true),
    checkForXss: parseBoolean(process.env.CHECK_XSS, true),
    checkForCsrf: parseBoolean(process.env.CHECK_CSRF, false),
} as const;

/**
 * Get configuration for specific environment
 */
export function getEnvironmentConfig(env: string): Partial<TestConfig> {
    const baseConfig = { ...CONFIG };

    switch (env.toLowerCase()) {
        case 'staging':
            return {
                ...baseConfig,
                baseURL: ENVIRONMENT_URLS.staging,
                retries: 1,
                timeout: 45000,
            };

        case 'production':
            return {
                ...baseConfig,
                baseURL: ENVIRONMENT_URLS.production,
                retries: 3,
                timeout: 60000,
                headless: true,
            };

        default:
            return baseConfig;
    }
}

/**
 * Get browser configuration
 */
export function getBrowserConfig(browserName: string): BrowserConfig {
    const config = BROWSER_CONFIGS[browserName];
    if (!config) {
        throw new Error(`Unknown browser configuration: ${browserName}`);
    }
    return config;
}

/**
 * Validate configuration
 */
export function validateConfig(): void {
    const errors: string[] = [];

    if (!CONFIG.baseURL) {
        errors.push('BASE_URL is required');
    }

    if (CONFIG.timeout <= 0) {
        errors.push('TIMEOUT must be greater than 0');
    }

    if (CONFIG.retries < 0) {
        errors.push('RETRIES must be 0 or greater');
    }

    if (CONFIG.viewport.width <= 0 || CONFIG.viewport.height <= 0) {
        errors.push('VIEWPORT dimensions must be greater than 0');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
}

/**
 * Log configuration (without sensitive data)
 */
export function logConfig(): void {
    console.log('Test Configuration:');
    console.log(`  Base URL: ${CONFIG.baseURL}`);
    console.log(`  Environment: ${CONFIG.environment}`);
    console.log(`  Headless: ${CONFIG.headless}`);
    console.log(`  Browsers: ${CONFIG.browsers.join(', ')}`);
    console.log(`  Viewport: ${CONFIG.viewport.width}x${CONFIG.viewport.height}`);
    console.log(`  Timeout: ${CONFIG.timeout}ms`);
    console.log(`  Retries: ${CONFIG.retries}`);
    console.log(`  Workers: ${CONFIG.workers || 'auto'}`);
}

// Validate configuration on import
validateConfig();