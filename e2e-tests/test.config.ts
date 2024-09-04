import {TestConfig} from '@e2e-types'

// All process.env should be defined here
const config: TestConfig = {
    // Server
    baseURL: process.env.TTE_PW_BASE_URL || 'https://ttedev.me:3030/',
    // User
    superAdminPassword: process.env.TTE_PW_SUPER_ADMIN_PASSWORD || 'Password@32#12',
    superAdminEmail: process.env.TTE_PW_SUPER_ADMIN_EMAIL || 'superadmin@example.com',
    clientAdminPassword: process.env.TTE_PW_CLIENT_ADMIN_PASSWORD || 'Password@32#12',
    clientAdminEmail: process.env.TTE_PW_CLIENT_ADMIN_EMAIL || 'superadmin@example.com',
    resetBeforeTest: parseBool(process.env.TTE_PW_RESET_BEFORE_TEST, false),
    // CI
    isCI: !!process.env.CI,
    // Playwright
    headless: parseBool(process.env.PW_HEADLESS, true),
    slowMo: parseNumber(process.env.PW_SLOWMO, 0),
    workers: parseNumber(process.env.PW_WORKERS, 1),
    // Visual tests
    snapshotEnabled: parseBool(process.env.PW_SNAPSHOT_ENABLE, false),
}

function parseBool(actualValue: string | undefined, defaultValue: boolean) {
    return actualValue ? actualValue === 'true' : defaultValue
}

function parseNumber(actualValue: string | undefined, defaultValue: number) {
    return actualValue ? parseInt(actualValue, 10) : defaultValue
}

export default config
