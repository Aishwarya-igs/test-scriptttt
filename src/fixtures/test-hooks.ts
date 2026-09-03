import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import { logger } from '../utils/logger';
import { sanitizeDomSnapshot } from '../utils/domSnapshot';

export const test = base;
export { expect };

const truncateTitle = (title: string, limit = 70): string => {
    if (title.length <= limit) {
        return title;
    }

    const visibleLength = Math.floor(limit * 0.7);

    return `${title.substring(0, visibleLength)}...`;
};


test.beforeEach(async ({ }, testInfo) => {

    const testName = truncateTitle(testInfo.title);

    const retryText =
        testInfo.retry > 0
            ? ` (Retry ${testInfo.retry})`
            : '';

    logger.start(
        `============= Test Started: ${testName}${retryText} =============`
    );

});


test.afterEach(async ({ page }, testInfo) => {

    const testName = truncateTitle(testInfo.title);

    const status =
        testInfo.status === 'passed'
            ? 'PASSED'
            : testInfo.status === 'failed'
            ? 'FAILED'
            : 'ERROR';
            


    const retryText =
        testInfo.retry > 0
            ? ` (Retry ${testInfo.retry})`
            : '';


    const message =
        `============= Test Finished: ${testName}${retryText} - ${status} =============`;


    if (status === 'PASSED') {
        logger.success(message);
    } else {
        logger.failure(message);
    }

    // On success, capture the same real DOM as the failure path below — this
    // is the known-good baseline.
    //
    // Without it the fixer only ever sees broken pages, so repairing a stale
    // locator is guesswork: it can tell what IS on the failing page, never
    // what the locator used to match when it worked. That is how a page
    // <title> and a generic video player both got proposed as "the live
    // indicator" — each was genuinely present on the failing page, and there
    // was nothing to contradict them. With a passing snapshot stored per test
    // case, healing becomes matching a recorded element against candidates
    // rather than guessing (see dashboard/lib/spotfix/baselineStore.js).
    //
    // Same best-effort posture and the same attach-by-path requirement as the
    // failure capture; a baseline is an optimisation, and failing to record
    // one must never turn a passing test red.
    if (status === 'PASSED') {
        try {
            const html = await page.content();
            const outputFile = testInfo.outputPath('dom-baseline.json');
            fs.writeFileSync(outputFile, JSON.stringify({ url: page.url(), html: sanitizeDomSnapshot(html) }));
            await testInfo.attach('dom-baseline', { path: outputFile, contentType: 'application/json' });
        } catch {
            // Best-effort only — see comment above.
        }
    }

    // On failure, capture the real DOM (not just the accessibility tree
    // Playwright's own error-context.md already attaches) alongside the URL
    // it was captured from — see sanitizeDomSnapshot for why the ARIA
    // snapshot alone isn't enough for this repo's CSS-selector-based
    // locators. Best-effort only: the page may already be closed or crashed
    // by the time this runs, and that must never fail an already-failing
    // test with a second, unrelated error.
    if (status === 'FAILED') {
        try {
            const html = await page.content();
            // Written to disk ourselves and attached by `path` (not `body`) —
            // a body-only attachment stays an in-memory Buffer that most
            // reporters (including the ones this project uses) never
            // persist as a file, which is what the dashboard backend reads
            // by path (see dashboard/lib/rca/domSnapshot.js), the same way
            // it already does for error-context.md and screenshots.
            const outputFile = testInfo.outputPath('dom-snapshot.json');
            fs.writeFileSync(outputFile, JSON.stringify({ url: page.url(), html: sanitizeDomSnapshot(html) }));
            await testInfo.attach('dom-snapshot', { path: outputFile, contentType: 'application/json' });
        } catch {
            // Best-effort only — see comment above.
        }
    }

});