import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
    test: {
        projects: [
            // Node environment testing: used to test the SDK of CommonJS, ESM, and TS formats
            {
                test: {
                    name: 'node-tests',
                    globals: true,
                    environment: 'node',
                    include: [
                        'tests/**/*.test.ts',
                        'tests/**/*.test.cjs',
                        'tests/**/*.test.mjs'
                    ]
                }
            },
            // JSDOM simulates browser environment testing: used to test the SDK in the browser environment
            {
                test: {
                    name: 'jsdom-tests',
                    globals: true,
                    environment: 'jsdom',
                    include: [
                        'tests/**/*.browser.test.ts'
                    ]
                }
            },
            // Real browser environment testing: Used to test the SDK in a real browser
            {
                test: {
                    name: 'real-browser-tests',
                    globals: true,
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [
                            { browser: 'chromium', headless: true }
                        ]
                    },
                    include: [
                        'tests/**/*.browser.real.test.ts'
                    ]
                }
            }
        ]
    },
    // TypeScript config
    resolve: {
        extensions: ['.ts', '.js', '.cjs', '.mjs']
    }
})