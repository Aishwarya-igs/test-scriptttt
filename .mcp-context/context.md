# OTT Application End to End QA Workflow - Test Case Centric
 
## Guardrailed Architecture Overview
 
This workflow enforces a **3-Layer Architecture** with strict guardrails:
 
### 🏗️ **Three Layers**
1. **Tests Layer**: Orchestrate flows by calling Business Functions only. No selectors, no waits, no DOM queries. Assert via Business Function return values.
2. **Business Functions (BF) Layer**: Express intent; compose Page Objects; expose typed inputs/outputs; **no Playwright usage, no selectors**.
3. **Page Objects (PO) Layer**: Own selectors, waits, retries; may reuse `src/utils/*` helpers; expose semantic methods (e.g., `searchForContent(query)`).
 
### 📋 **Key Guardrails**
- **Manifest Strict Rule**: `src/manifest.yaml` MUST list every Business Function with `id`, `name`, `path`, `export`, `tags`, and `dependsOn`.
  - No Business Function should be added to the codebase without a corresponding manifest entry.
  - No manifest entry should refer to a missing or deleted export.
- **Manifests**: `src/manifest.yaml` lists all Business Functions with `id`, `name`, `path`, `export`, `tags`, `dependsOn`.
- **ESLint Enforcement**:
  - Tests: Only `test`/`expect` imports, no Playwright, no DOM queries.
  - BFs: No Playwright imports, only call Page Objects.
  - POs: Can use Playwright and `src/utils/*`.
- **Environment Configuration**: Use `.env` for base URL selection. `TEST_ENV=dev|qa|prod` should point to env-specific URL keys, and Page Objects should read the URL from shared config utilities rather than hardcoding it.
- **Credential Configuration**: Authentication credentials for positive and negative login scenarios must come from `.env` using keys such as `VALID_LOGIN_EMAIL`, `VALID_LOGIN_PASSWORD`, `INVALID_LOGIN_EMAIL`, and `INVALID_LOGIN_PASSWORD`. Test data files and test code should not hard-code credentials when env values are available.
- **Data-Driven Flow Selection**: Login and other business-flow scenarios should be driven by test data entries such as `mode`, `scenario`, or `flowType` from the spec/test-data file. Business functions should receive that value from the test layer instead of embedding hard-coded flow strings like `'invalid'` inside the implementation.
- **Required Pattern**: The test file should pass the flow selector from the data file into the business function, and the business function should normalize that selector internally. Example pattern: `loginWithInvalidCredentials(page, { mode: data.mode })` where `data.mode` comes from the JSON test-case file and the BF handles the normalization.
- **Utility Reuse**: Page Objects must reuse existing helpers in `src/utils/*` wherever applicable. If a reusable helper does not already exist, the agent must ask for permission and a utility creation plan before generating or updating the page class.
- **Logging**: Use the existing `src/utils/logger.ts` singleton for step, action, page navigation, and assertion logging in Page Objects and Business Functions.
- **Naming**: BF names use `verbNoun` or `nounAction` format (e.g., `loginToOTT`, `searchForContent`).
- **Test Case Integrity Rule**: Do not modify test case steps, expected results, assertions, or test data definitions unless the owner explicitly requests a change. If the current test case appears incorrect, ambiguous, or infeasible, the agent must stop and ask the owner for clarification or approval before changing anything.
- **Prompt Workflow**:
  - **REUSE**: Map test cases to existing BFs. If all covered → generate test + JSON patch.
  - **GAP**: If BFs missing → create BF + PO needs + manifest patch + data keys.
 
