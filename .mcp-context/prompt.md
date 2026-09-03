## Workflow Overview
This prompt guides you through a complete 7-step QA workflow using AI Agents and MCP Servers for executing test cases on OTT (Over-The-Top) applications from test case definition until automation code is committed to the repository.
 
---
 
## 📖 STEP 1: Read and Analyze Test Cases
**Prompt**
```
I need to start a new testing workflow for an OTT Application based on test cases. Please read all test cases from the file: specs/demo-ott-test-plan.md
 
For each test case, extract and document:
 
1. Test Case Identification:
   - Test Case ID (e.g., TC_IW3_001, TC_PLAY_001)
   - Test Case Title
   - Feature/Module Being Tested
   - Priority (P0, P1, P2)
   - Subscription Tier Required (Free, Basic, Premium, Premium Plus)
 
2. Test Case Details:
   - Preconditions (what state the system should be in before test)
   - Test Steps (numbered, detailed steps)
   - Expected Results (what should happen after each step)
   - Test Data Required (credentials, content IDs, payment methods)
   - Device/Browser Requirements (mobile, desktop, specific browsers)
 
3. OTT-Specific Test Case Attributes:
   - Quality Level Tested (480p, 720p, 1080p, 4K)
   - Device Screen Limits (single screen, multi-screen)
   - Content Type (Movie, TV Show, Live Stream, Special)
   - Playback Features (quality selection, subtitles, seek, skip)
   - Account Features (watchlist, history, profiles, preferences)
   - Payment Features (subscription, upgrade, billing)
 
4. Test Case Dependencies:
   - Prerequisite Test Cases (e.g., TC_AUTH_001 must pass before TC_PLAY_001)
   - Data Dependencies
   - Environment Dependencies
 
5. Test Case Categorization:
   - Feature Area (Authentication, Discovery, Playback, Watchlist, Subscription, etc.)
   - Test Type (Functional, Regression, Smoke, Sanity)
   - Test Scope (Happy Path, Negative, Edge Case, Boundary)
 
Create a comprehensive summary that includes:
- Total number of test cases
- Test cases grouped by feature area
- Test cases grouped by subscription tier
- Test cases grouped by priority
- Any test case dependencies and execution order
- Test data requirements and mappings
```
 
**Expected Output**
- Complete analysis of all test cases from specs/demo-ott-test-plan.md
- Test cases organized by Subscription Tier (Free, Basic, Premium, Premium Plus)
- Test cases organized by Priority (P0, P1, P2)
- Test case dependency mapping
- Prerequisite test cases identified
- Test data requirements documented
- OTT-specific attributes extracted (quality, devices, content types)
- Total count of test cases to be automated
- Execution order recommendations based on dependencies
 
---
 
## 📋 STEP 2: Create Automation Test Specifications
**Prompt**
```
Based on the test cases read in STEP 1, create automation test specifications that map each test case to Business Functions.
 
Before creating specifications, review the guardrail architecture:
- Read: .mcp-context/context.md for 3-Layer Architecture
- Read: src/manifest.yaml to understand existing Business Functions
- Read: Naming conventions for Business Functions (verbNoun format)
 
For each test case from specs/demo-ott-test-plan.md, perform the following:
 
1. Test Case to Business Function Mapping:
   - Identify which Business Functions are required to execute the test case
   - Check src/manifest.yaml for existing BFs
   - Document which BFs can be reused
   - Identify gaps where new BFs are needed
 
2. For each Test Case, create a specification that includes:
   - Test Case ID and Title
   - Required Business Functions (in execution order)
   - Business Function Inputs (mapped from test data)
   - Expected Business Function Outputs (for assertions)
   - Test Data Key References (e.g., auth-valid-premium-user)
   - Assertion Strategy (what to verify after each BF call)
 
3. OTT-Specific Test Specifications:
   - Quality Level Verification:
     * For Premium user: Expect quality options up to 1080p
     * For Premium Plus user: Expect quality options up to 4K
     * For Basic user: Expect quality options up to 720p
     * For Free user: Expect quality options up to 480p only
   - Device Screen Limit Verification:
     * Free: Verify only 1 screen can play simultaneously
     * Basic: Verify only 2 screens can play simultaneously
     * Premium/Premium Plus: Verify up to 4 screens can play simultaneously
   - Content Type Handling:
     * Movie playback: Verify full duration, seek works, quality adjusts
     * TV Show: Verify episode selection, next episode auto-play, season navigation
     * Live Stream: Verify live playback, no seek, quality adaptation
   - Watchlist Synchronization:
     * Verify watchlist persists across devices
     * Verify continue watching updates across devices
     * Verify watch history syncs in real-time
 
4. Business Function Gap Analysis:
   - If test case requires Bussiness Function that doesn't exist → Document as GAP
   - List all missing Bussiness Functions per test case
   - Describe what the missing Bussiness Function should do
   - Note dependencies for new Bussiness Functions
 
5. Test Data Specification:
   - For each test case, identify required test data:
     * User credentials (with subscription tier)
     * Content IDs (movies, shows, live streams)
     * Quality levels to test
     * Device/browser combinations
     * Payment methods (for subscription tests)
   - Create data key naming (e.g., tc-auth-001-premium-user, tc-play-001-movie-1080p)
   - Map placeholders (<<<PREMIUM_USER_EMAIL>>>, etc.)
 
6. Save automation specifications as: specs/ott-test-specifications.md
 
Structure each specification as:

> 📌 See `skills/authentication.skill.md` for the TC_AUTH_001 specification format example.

 
7. Aggregate findings:
   - All test cases mapped to Business Functions (existing or new)
   - Total existing BFs that can be reused
   - Total new BFs that need to be created
   - Test data keys required
   - Dependencies between test cases
 
Save as: specs/ott-test-specifications.md
```
 
**Expected Output**
- Complete automation test specifications for all OTT test cases
- Each test case mapped to required Business Functions
- Business Functions documented with inputs/outputs/assertions
- OTT-specific quality/device limit verification specs
- Test data key specifications with placeholders
- Gap analysis identifying missing Business Functions
- Total count of existing BFs vs. new BFs needed
- Test case dependencies and execution order
- Watchlist/sync verification specifications documented
- Specification file saved as: specs/ott-test-specifications.md
 
---
 
## 🔍 STEP 3: Execute Test Cases Manually
**Prompt**
```
Based on the test specifications from STEP 2, execute all test cases manually on the OTT application.
 
Read test specifications from: specs/ott-test-specifications.md
 
Then execute each test case:
 
1. Test Case Execution:
   - For each test case, follow the exact steps defined
   - Execute test cases in dependency order (prerequisites first)
   - Test with actual subscription tier accounts matching test case requirements
   - Verify expected results match actual results
   - Take screenshots at key points
 
2. OTT-Specific Test Case Execution:
   - Authentication Test Cases: see `skills/authentication.skill.md`
   - Playback Test Cases:
     * Verify video plays immediately (within 3 seconds startup)
     * Verify quality selection shows only options available for user's plan
     * Verify quality adapts if quality option is selected
     * Verify seek works smoothly without long buffering
     * Verify subtitles load correctly
     * Verify audio tracks selectable (if available)
   - Quality Verification Test Cases:
     * For Free users: Verify only 480p available
     * For Basic users: Verify 720p available (not higher)
     * For Premium users: Verify 1080p available (not 4K)
     * For Premium Plus users: Verify 4K available if supported
     * Verify quality indicator shows current quality
   - Device Limit Test Cases:
     * For Free users: Attempt to play on 2 devices simultaneously - verify failure on 2nd
     * For Basic users: Verify can play on 2 screens simultaneously
     * For Premium users: Verify can play on 4 screens simultaneously
     * Verify appropriate error message when limit exceeded
   - Watchlist Test Cases:
     * Verify content added to watchlist appears in watchlist
     * Verify watchlist persists across sessions (login/logout)
     * Verify watchlist syncs across different devices
     * Verify continue watching updates after watching portion
     * Verify watch history accurate for time watched
   - Subscription Test Cases:
     * Verify current plan displayed correctly
     * Verify upgrade process works end-to-end
     * Verify billing information accurate
     * Verify plan change takes effect immediately
 
3. Document Test Case Execution Results:
   - Test Case ID
   - Actual Result (Pass / Fail / Blocked)
   - Screenshots at key execution points
   - Time to execute test case
   - Any deviations from expected behavior
   - Issues encountered
   - Environment details (Device, Browser, OS)
 
4. Test Case Failure Analysis:
   - For each failed test case, document:
     * Actual vs Expected behavior
     * Error messages received
     * Screenshots of failure state
     * Prerequisite issues (if any)
     * Whether issue is blocking other test cases
 
5. Test Data Validation:
   - Verify all test data used is valid
   - Verify test credentials work as expected
   - Verify test content IDs are accessible
   - Verify quality/device limits enforced correctly with test data
 
6. Create Execution Report:
   Save results as: test-results/ott-test-execution-manual.md
   
   Report should include:
   - Test Execution Summary (Pass/Fail/Blocked counts)
   - Test Case Results Table (TC_ID, Title, Status, Duration)
   - Test Cases Grouped by Status (Passed, Failed, Blocked)
   - Failed Test Cases Details (ID, Title, Expected vs Actual, Evidence)
   - OTT-Specific Findings:
     * Quality restriction enforcement
     * Device limit enforcement
     * Watchlist sync behavior
     * Subscription tier features
   - Issues discovered
   - Screenshots and evidence
   - Test data validation summary
   - Recommendations for automation
```
 
**Expected Output**
- Complete manual execution of all OTT test cases
- Test case execution results: Pass/Fail/Blocked status for each TC
- Screenshots at key execution points
- Failed test cases analyzed with Expected vs Actual results
- OTT-specific quality/device limit enforcement verified
- Watchlist synchronization behavior documented
- Subscription tier features validated
- Test data validation results
- Execution time for each test case
- Issues discovered during execution
- Execution report saved as: test-results/ott-test-execution-manual.md
- Prerequisites identified for automation
- Test cases ready for automation
 
---
 
## 🧪 STEP 4: Generate Test Case Automation Scripts
**Prompt**
```
Based on the test case specifications from STEP 2 and manual execution results from STEP 3, generate automated test scripts for all OTT test cases.
 
CRITICAL: Review materials BEFORE generation:
1. Test specifications: specs/ott-test-specifications.md
2. Manual execution results: test-results/ott-test-execution-manual.md
3. Current manifest: src/manifest.yaml
4. Do not create new files, use files attached to prompt and do not hallucinate anything

---

## 🚫 VIOLATION RULES (Absolute Prohibitions)
### ❌ WHAT IS STRICTLY FORBIDDEN

#### 1. **Hardcoded Locators in Test Files**
> 📌 See `skills/locator.skill.md`
#### 2. **Inline Playwright in Test Files**
> 📌 See `skills/playwright.skill.md`
#### 3. **Hardcoded Business Functions Logic in Test Files**
> 📌 See `skills/coding-standards.skill.md`
#### 4. **Duplicate Locator Definitions in Page Objects**
> 📌 See `skills/locator.skill.md`
#### 5. **Magic Strings and Hardcoded Values in Test Files**
> 📌 See `skills/coding-standards.skill.md`
#### 6. **Playwright Imports in Test Files (Except test/expect)** / #### 7. **Playwright Imports in Business Functions**
> 📌 See `skills/playwright.skill.md`
#### 8. **DOM Queries and Evaluations in Tests** / #### 9. **Waits and Timeouts in Tests**
> 📌 See `skills/coding-standards.skill.md`

#### 10. **Reusing Selectors Without PO Abstraction**
> 📌 See `skills/locator.skill.md`
### ✅ ENFORCEMENT CHECKLIST (Before Code Generation)
> 📌 See `skills/coding-standards.skill.md`

## THE 3-LAYER ARCHITECTURE (MUST FOLLOW):
 
🔷 LAYER 1 - TEST FILES (tests/ott-app/*.spec.ts):
> 📌 Assertion strategy details: see `skills/assertions.skill.md`
🔷 LAYER 2 - BUSINESS FUNCTIONS (src/businessFunction/ott-bfs.ts):
- Business Functions required for test cases:
  * Authentication: see `skills/authentication.skill.md`
  * Discovery: searchForContent, browseByGenre, getRecommendations, filterContent
  * Playback: playContent, changeQuality, selectSubtitle, seekToTime, skipIntro, verifyQualityLimit
  * Watchlist: addToWatchlist, removeFromWatchlist, viewWatchlist, verifyWatchlistSync, getContinueWatching
  * Subscription: viewPlanDetails, upgradePlan, downgradeplan, viewBillingHistory, verifyDeviceLimit
  * Profile: updateProfile, manageProfiles, setParentalControls
- Each BF corresponds to one or more test case steps
- BF names match test specification
- Define TypeScript interfaces for inputs/outputs
- NO Playwright imports
- NO PAGE OBJECTS
- Expose typed return values for test assertions
- Example:
  * export async function verifyQualityLimit(page: Page, input: QualityLimitInput): Promise<QualityLimitOutput> {
  *   // Compose Page Objects to verify quality restriction
  *   const availableQualities = await ottPlaybackPage.getAvailableQualities();
  *   const expectedMax = getMaxQualityForPlan(input.subscriptionPlan);
  *   return { qualitiesAvailable: availableQualities, limitEnforced: maxQuality <= expectedMax };
  * }
 
🔷 LAYER 3 - PAGE OBJECTS (src/pom/OTTAppPage.ts):
> 📌 See `skills/page-object.skill.md` (Page Object layer rules) and `skills/locator.skill.md` (locator-specific guidance)
MANIFEST FOR TEST CASE AUTOMATION:
- Update src/manifest.yaml with all required BFs
- Format: { id: "tc-auth-001", name: "Login to OTT - Premium User", ... }
- Include test case reference in BF metadata
- Example:
  * - id: "login-ott"
  *   name: "Login to OTT Application"
  *   testCases: ["TC_AUTH_001", "TC_AUTH_002"]
  *   tags: ["auth", "critical", "smoke"]
  *   dependsOn: []
 
GENERATION STEPS:
1. For each test case from specs/ott-test-specifications.md:
   - Check if required Business Functions already exist in manifest
   - Mark existing Business Functions as REUSE
   - Identify missing Business Functions as GAP
   - Assert using BF return values ONLY
  - NO Playwright direct usage
  - NO PAGE OBJECTS or waits
   - Create a test() block in the spec file referenced by specs/demo-ott-test-plan.md
   - Do not instantiate Page Object classes directly within test scripts. Use Business Functions to interact with Page Objects and rely on their return values for validations and assertions.
 
2. If Business Functions missing → emit GAP details (don't generate test code yet)
   - List missing Business Function names
   - List required test cases for each missing Business Function
   - Note dependencies
 
3. For each test case (after all Business Functions available):
   - Create test() block in appropriate spec file
   - Test name: 'TC_XXX_XXX - Test Title'
   - Call Business Functions in order from test specification
   - Assert on Business Function outputs
   - Add test data key reference
   - Handle test case dependencies (e.g., login before other tests)
 
4. Create test data in src/data/ott-test-cases.json:
   - Data key for each test case
   - If the test data is already available and commonly used across multiple test cases, define it as global test data and reuse the existing key. Avoid duplicate or new data keys for the same test data in individual test cases.
   - Include all required test data
   - Add placeholder mappings
   - Include expected outcomes
 
5. Create Business Functions in src/businessFunction/:
   - One file per feature area (auth-bfs.ts, playback-bfs.ts, etc.)
   - Or consolidated in ott-bfs.ts
   - TypeScript interfaces for inputs/outputs
   - Compose Page Objects to implement test steps
 
6. Create Page Objects in src/pom/:
   - OTTAuthPage, OTTPlaybackPage, OTTSearchPage, etc.
   - Semantic methods for each test case action
   - Selectors and waits for OTT-specific features
 
7. Update src/manifest.yaml:
   - Register all BFs with test case references
   - Document test case dependencies
 
VALIDATION BEFORE GENERATION:
- [ ] All test cases mapped to available Bussiness Functions
- [ ] No Playwright imports in tests
- [ ] No Playwright usage in Bussiness Functions
- [ ] All test case data in JSON file
- [ ] All Bussiness Functions in manifest
- [ ] OTT quality/device restrictions properly enforced in Bussiness Functions
- [ ] Test case dependencies documented
- [ ] Test case execution order respected
 
GENERATION RESTRICTIONS
- Do not create any unnecessary files or folders.
- Use `.env` for environment configuration and select environments via `TEST_ENV=dev|qa|prod`.
- No test data files should be created unless they are explicitly mentioned in `ott-test-cases.md`.
- Do not create any files that are not specified or required.
 
Output Structure:
- tests/ott-app/authentication.spec.ts (TC_AUTH_* tests)
- tests/ott-app/playback.spec.ts (TC_PLAY_* tests)
- tests/ott-app/discovery.spec.ts (TC_DISC_* tests)
- tests/ott-app/watchlist.spec.ts (TC_WATCH_* tests)
- tests/ott-app/subscription.spec.ts (TC_SUB_* tests)
- src/businessFunction/ott-bfs.ts (or organized by feature)
- src/pom/OTTAuthPage.ts, OTTPlaybackPage.ts, etc.
- src/data/ott-test-cases.json
- src/manifest.yaml (updated)
```
 
**Expected Output**
- Automated test scripts for all OTT test cases in tests/ott-app/
  - One test case = one test() block
  - Tests organized by feature area (authentication, playback, etc.)
  - Test case IDs as test names (TC_AUTH_001, TC_PLAY_001, etc.)
- Business Functions created in src/businessFunction/
  - All required Bussiness Functions for test case execution
  - Typed inputs/outputs matching test specifications
- Page Objects created in src/pom/
  - All required PO methods for Bussiness Function execution
  - Semantic methods matching test case steps
- Test data created in src/data/ott-test-cases.json
  - Data for each test case
  - Subscription tier, quality, device data
- Manifest updated in src/manifest.yaml
  - All Bussiness Functions registered with test case references
- Zero ESLint violations
- Tests → Bussiness Functions → POs layer separation verified
- Test case dependencies documented
- OTT quality/device restrictions enforced in automation
 
---
 
## 🛠️ STEP 5: Execute and Heal Test Case Automation
**Prompt**
```
Execute the generated test case automation scripts and heal any failures.
 
GUARDRAIL COMPLIANCE CHECKS (BEFORE execution):
1. ESLint Validation:
   - Run: npm run lint
   - Verify NO violations in:
     * Test layer: No Playwright imports except test/expect
     * Business Function layer: No Playwright usage
     * Page Object layer: Playwright usage verified
2. Architecture Validation:
   - Confirm tests/ott-app/*.spec.ts import ONLY from src/businessFunction/
   - Confirm src/businessFunction/*.ts imports ONLY from src/pom/
   - Confirm src/pom/*.ts imports from src/utils/ and Playwright
3. Test Case Mapping Validation:
   - Verify each test case TC_ID has corresponding test() block
   - Verify test name includes TC_ID
   - Verify test calls required Bussiness Functions from specification
4. Data Validation:
   - Verify src/data/ott-test-cases.json has data for all test cases
   - Verify placeholders match environment variables
   - Verify subscription tier test data present
 
Test Case Execution:
 
1. Run all test case automation:
   - Command: npx playwright test tests/ott-app/
   - Test with each subscription tier account
   - Verify device/quality restrictions enforced
 
2. Analyze execution results:
   - Count test cases passed
   - Count test cases failed
   - Count test cases blocked
   - Identify pattern of failures
 
3. For each failed test case:
   - Identify the test case ID
   - Determine which Bussiness Function call failed
   - Determine root cause:
     * Selector issue in PO layer
     * Quality/device restriction not enforced
     * Test data issue
     * Timing/buffering issue (playback)
     * Assertion logic error
     * Guardrail violation (test calling PO directly, etc.)
   
4. Heal failed test cases:
   - Fix selectors in PO layer (not in tests)
   - Fix Bussiness Function logic for quality/device enforcement
   - Fix waits for OTT-specific delays (video loading, quality change)
   - Fix test data if incorrect
   - Fix assertions if logic is wrong
   - Re-validate guardrails aren't violated
 
5. Re-run healed test cases:
   - Verify each test case passes individually
   - Verify test case dependencies still work
   - Verify no regression in previously passing tests
 
6. Run ESLint again:
   - Confirm no new violations introduced
 
7. Create healing report:
   Save as: test-results/ott-test-case-healing.md
   
   Report should include:
   - Test Execution Summary (before healing)
     * Total test cases: [X]
     * Passed: [X]
     * Failed: [X]
     * Blocked: [X]
   - Failed Test Cases Analysis:
     * TC_ID, Title, Root Cause, Bussiness Function/PO/Test Healed
   - Healing Activities:
     * List of changes made per test case
     * Selectors fixed
     * Wait timeouts adjusted
     * Assertion logic corrected
     * Quality/device restrictions enforced
   - Test Case Healing Results:
     * For each failed TC: Result after healing
   - Final Test Execution Summary (after healing)
     * Total test cases: [X]
     * Passed: [X]
     * Failed: [X] (if any still failing)
   - OTT-Specific Healing:
     * Quality restriction enforcement
     * Device limit enforcement
     * Watchlist sync timing
     * Subscription tier features
   - Guardrail Compliance Verification
```
 
**Expected Output**
- All test case automation executed
- Test case execution results documented (Pass/Fail/Blocked per TC)
- Failed test cases healed and re-tested
- Guardrails maintained (no violations introduced)
- Test case dependencies verified working
- Quality/device restrictions verified enforced
- Subscription tier features verified working
- Final stable test execution (all test cases passing)
- Healing report saved as: test-results/ott-test-case-healing.md
 
---
 
## Summary - Test Case Centric Workflow
 
This **OTT Application QA Workflow (Test Case Centric)** provides:
 
✅ **STEP 1** - Read and analyze all test cases with OTT-specific attributes
✅ **STEP 2** - Create automation specifications mapping test cases to Business Functions
✅ **STEP 3** - Execute all test cases manually with subscription tier verification
✅ **STEP 4** - Generate automation scripts (one test per test case)
✅ **STEP 5** - Execute and heal test case automation with OTT feature focus
 
**Key Advantages of Test Case Centric Approach:**
- Each test case has clear TC_ID and becomes a test() block
- Test case specifications guide automation directly
- Manual execution results inform automation design
- Test case failures are easily traceable to specific TCs
- Traceability between test cases and Business Functions
- Quality/device restrictions verified per test case
- Test case dependencies clearly documented
- Healing targets specific test cases
 
**OTT Test Case Categories:**
- **TC_AUTH_*** - Authentication & Account Management
- **TC_PLAY_*** - Playback & Quality Selection
- **TC_DISC_*** - Content Discovery & Search
- **TC_WATCH_*** - Watchlist & Watch History
- **TC_SUB_*** - Subscription & Billing
- **TC_PROF_*** - User Profile & Settings
 
---
 
**To Begin Test Case Automation:**
1. Start with STEP 1 prompt providing specs/demo-ott-test-plan.md
2. Follow through all 5 steps in sequence
3. Each test case becomes a test() block with TC_ID
4. Commit final automation to your OTT repository