import { test, expect } from '@playwright/test';

/**
 * Security Headers Regression Tests
 * Verifies that critical security headers are present
 */
test.describe('Security Headers', () => {
  test('should enforce CSP on the production server', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    // CI starts `next start`: production uses an enforcing policy, while
    // the optional local development server uses report-only for HMR.
    const isProduction = !!process.env.CI || process.env.NODE_ENV === 'production';
    const csp = headers[isProduction ? 'content-security-policy' : 'content-security-policy-report-only'];
    expect(csp).toBeDefined();

    // Verify key CSP directives are present
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    if (isProduction) {
      expect(csp).toContain("upgrade-insecure-requests");
      expect(csp).not.toContain("'unsafe-eval'");
    }
  });

  test('should have X-Content-Type-Options nosniff', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('should have X-Frame-Options DENY', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    expect(headers['x-frame-options']).toBe('DENY');
  });

  test('should have Referrer-Policy header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    expect(headers['referrer-policy']).toMatch(/strict-origin-when-cross-origin|same-origin|strict-origin/);
  });

  test('should have Permissions-Policy header', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    const permissionsPolicy = headers['permissions-policy'];
    expect(permissionsPolicy).toBeDefined();

    // Verify privacy-restrictive policies
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
  });

  test('should have HSTS header in production', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    // HSTS should only be present in production (requires HTTPS)
    // Skip this test in development
    test.skip(!process.env.CI && process.env.NODE_ENV !== 'production', 'HSTS only applies in production');

    expect(headers['strict-transport-security']).toBeDefined();
    expect(headers['strict-transport-security']).toContain('max-age=');
  });

  test('should not have exposing headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    // These headers should NOT be present (they leak information)
    expect(headers['x-powered-by']).toBeUndefined();
    expect(headers['server']).toBeUndefined(); // Or should be minimal
  });
});
