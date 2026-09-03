# OTT Automation Test Specifications

## General Rules
- Manually execute each testcase step before generating automation for it.
- Use .env-based credentials and runtime values; do not hardcode credentials in tests, business functions, or JSON data files.
- If a testcase is blocked by environment access or missing app behavior, record it as Blocked in the manual execution report.

## Authentication Test Specifications

### TC_AUTH_001 - Login with valid credentials
- Business Function: loginToOTT
- Inputs: VALID_LOGIN_EMAIL, VALID_LOGIN_PASSWORD
- Assertions: isLoggedIn === true, homeTabVisible === true

### TC_AUTH_002 - Mobile number login
- Business Function: loginWithMobileNumber
- Inputs: MOBILE_LOGIN_COUNTRY_CODE, MOBILE_LOGIN_MOBILE_NUMBER, MOBILE_LOGIN_PASSWORD
- Assertions: isLoggedIn === true, homeTabVisible === true

### TC_AUTH_009 - Continue Watching absent for new/no-history user (IW3-T1931)
- Business Function: verifyContinueWatchingAbsent
- Inputs: VALID_LOGIN_EMAIL, VALID_LOGIN_PASSWORD (via `mode: valid`)
- Assertions: isContinueWatchingVisible === false
- Test data key: `tc-auth-009-continue-watching-no-history` in `src/data/ott-test-cases.json`

## Search Test Specifications

### IW3-T2073 - Verify if user can search with partial keyword in search field
  - User is logged in with valid credentials
  - A content item is available from the Collection GraphQL API
  1. Login to OTT.
  2. Wait for the Collection GraphQL API response and select any content title from the returned assets.
  3. Build a partial query from the returned content title.
  4. Open search, enter the partial query, and submit.
  5. Wait for the Search GraphQL API response.
  6. Verify the partial query is retained in the search input.
  7. Verify search results are visible and the Search GraphQL payload contains matching values for the partial query.
  - `isLoggedIn === true`
  - `partialQuery` is not empty
  - `queryTyped === true`
  - `resultsVisible === true`
  - `matchedSearchValues.length > 0`

### IW3-T2083 - Verify if user enters junk characters with space in search field
  - User is logged in with valid credentials
  - A junk search query is entered containing alphanumeric characters and spaces
  1. Login to OTT.
  2. Tap on the Search icon.
  3. Enter a junk search query such as `gdfy 6487yhgf y98yfgjkb nbdjgh`.
  4. Submit the search.
  5. Verify the user sees the `No results found.` message.
  - `isLoggedIn === true`
  - `searchQueryTyped === true`
  - `noResultsMessageVisible === true`
  - `messageText` contains `No results found.`

### IW3-T2076 - Verify that tapping on any search result redirects to the Detail page
  - User is logged in with valid credentials
  - A content item is available from the Collection GraphQL API
  1. Login to OTT.
  2. Wait for the Collection GraphQL API response and select a content title from the returned assets.
  3. Open search and enter the selected content title.
  4. Submit the search and verify results are visible.
  5. Tap the first search result.
  6. Verify the content detail page is displayed.
  - `isLoggedIn === true`
  - `collectionTitle` is not empty
  - `searchQueryTyped === true`
  - `searchResultsVisible === true`
  - `detailsPageVisible === true`

### IW3-T2088 - Verify that exact title matches appear at the top of the search results
  - User is logged in with valid credentials
  - A content item is available from the Collection GraphQL API
  1. Login to OTT.
  2. Wait for the Collection GraphQL API response and select a content title from the returned assets.
  3. Open search, enter the exact collection title, and submit.
  4. Wait for the Search GraphQL API response and capture the ordered result titles.
  5. Capture the ordered search result titles rendered on the search results screen.
  6. Verify the first result is an exact (case/punctuation-insensitive) match of the searched title.
  7. Verify the remaining results are partial or related matches (ranked below the exact match).
  - `isLoggedIn === true`
  - `collectionTitle` is not empty
  - `searchQueryTyped === true`
  - `searchResultsVisible === true`
  - `firstResultTitle` equals `collectionTitle` (normalized)
  - `exactMatchAtTop === true`
  - `exactMatchIndex === 0`

  **Business Function:** `verifySearchExactTitleMatchAtTop` (src/businessFunction/ott-auth-bfs.ts)
  **Test data key:** `tc-nav-020-search-exact-title-match-top` in `src/data/ott-test-cases.json`
  **Page Object additions:** `OTTAuthPage.getSearchResultTitles()` (ordered rendered result titles)

### IW3-T2089 - Verify that trending results are shown when the user taps on the Search icon without entering any query
  - User is logged in with valid credentials.
  1. Login to OTT.
  2. Open the Search experience without typing a query.
  3. Clear any pre-populated search input and wait for the search results area to stabilize.
  4. Verify that multiple trending-style result titles are rendered automatically.
  - `isLoggedIn === true`
  - `searchQueryTyped === true`
  - `searchInputCleared === true`
  - `trendingResultsVisible === true`
  - `trendingResultTitles.length > 0`

  **Business Function:** `verifySearchTrendingResults` (src/businessFunction/ott-auth-bfs.ts)
  **Test data key:** `tc-nav-021-search-trending-results` in `src/data/ott-test-cases.json`
  **Page Object additions:** `OTTAuthPage.getSearchResultTitles()` for retrieving the visible result list

### IW3-T2090 - Verify Trending search/Top picks near you title displayed on navigating to the search tab
  - User is logged in with valid credentials.
  1. Login to OTT.
  2. Open the Search experience without typing a query.
  3. Clear the search input and wait for the empty search state to render.
  4. Verify the page displays the `Top Picks Near You` heading.
  - `isLoggedIn === true`
  - `searchInputCleared === true`
  - `headingVisible === true`
  - `headingText` contains `Top Picks Near You`

  **Business Function:** `verifySearchTopPicksNearYouTitle` (src/businessFunction/ott-auth-bfs.ts)
  **Test data key:** `tc-nav-022-search-top-picks-title` in `src/data/ott-test-cases.json`
  **Page Object additions:** `OTTAuthPage.isSearchSectionHeadingVisible()` and `OTTAuthPage.getSearchSectionHeadingText()`

**Business Function:** `verifySearchSmoothScrolling` (src/businessFunction/ott-auth-bfs.ts)

**Purpose:** Ensure that when a user performs a search, the search results can be scrolled smoothly without UI freezes, crashes, or blocking behavior.

**Preconditions:**
  - User is logged in (use `mode` from test data).
  - The app is on the Home page and Collection GraphQL responses are available.

**Steps (automation):**
  1. Call `verifySearchSmoothScrolling(page, { mode, graphqlQueryName: 'Collection' })`.
  2. The BF will: log in, obtain a content title from the `Collection` GraphQL operation, perform the search, and exercise smooth scrolling over the results.

**Assertions (returned from BF):**
  - `isLoggedIn` is `true`.
  - `searchQueryTyped` is `true`.
  - `searchResultsVisible` is `true`.
  - `scrolled` is `true` (indicates the page scrolled forward during the check).
  - `positions` contains monotonic increasing scroll offsets.

**Notes:**
  - This BF focuses on a high-level smoke/performance verification (scroll progress and responsiveness), not on pixel-perfect smoothness measurements.
  - If more precise telemetry is required (frame-rate or jank detection), integrate with browser performance APIs or custom instrumentation.


