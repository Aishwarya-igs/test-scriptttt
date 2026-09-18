import { test, expect } from '../../src/fixtures/test-hooks';
import { verifySearchIconVisibilityOnAllPages, verifySearchQueryTyping, verifySearchResults, verifySearchAutoSuggestions, verifySearchNoResultsMessage } from '../../src/businessFunction/ott-auth-bfs';
import { addContentToWatchlistFromSearchPage, removeContentFromWatchlistFromSearchPage } from '../../src/businessFunction/ott-watchlist-bfs';
import { playPremiumContentFromSearch } from '../../src/businessFunction/ott-playback-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Search navigation', () => {
  test('@High IW3-T2060 : Verify the Search icon is visible in the top navigation bar on all pages', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-001-search-icon'];
    const result = await verifySearchIconVisibilityOnAllPages(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.homePageSearchIconVisible).toBe(true);
    expect(result.moviesPageSearchIconVisible).toBe(true);
    expect(result.showsPageSearchIconVisible).toBe(true);
    expect(result.watchlistPageSearchIconVisible).toBe(true);
    expect(result.gmaPageSearchIconVisible).toBe(true);
  });

  test('@High IW3-T2062 : Verify that the user can type a search query in the input box', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-002-search-query'];
    const result = await verifySearchQueryTyping(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.searchInputValue).toContain(data.query);
  });

  test('@High IW3-T2064 : Verify the search results are shown when a valid title is entered in the Search field', async ({ page }) => {
    const data = testCaseData['tc-nav-003-search-results'];
    const result = await verifySearchResults(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.resultsVisible).toBe(true);
  });

  test('@Medium IW3-T2058 : Verify user is able to add content to My Watchlist via hover from search page', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-004-watchlist-hover'];
    const result = await addContentToWatchlistFromSearchPage(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.isVisibleInMyWatchlist).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('added');
  });

  test('@Medium IW3-T2059 : Verify user is able to remove content from my watchlist via hover from search page', async ({ page }) => {
        test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-005-watchlist-remove'];
    const result = await removeContentFromWatchlistFromSearchPage(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.removedFromWatchlist).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('removed');
  });

  test('@Medium IW3-T2063 : Verify the auto-suggestions while typing in the search field', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-006-search-auto-suggestions'];
    const result = await verifySearchAutoSuggestions(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.suggestionsVisible).toBe(true);
    expect(result.suggestionsCount).toBeGreaterThan(0);
    expect(result.suggestionsList.length).toBeGreaterThan(0);
    expect(result.suggestionsContainQuery).toBe(true);
  });

  test('@Medium IW3-T2065 : Verify the message like "No results found." is shown for irrelevant search terms', async ({ page }) => {
    const data = testCaseData['tc-nav-007-search-no-results'];
    const result = await verifySearchNoResultsMessage(page, {
      mode: data.mode,
      searchQuery: data.searchQuery,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.searchQueryTyped).toBe(true);
    expect(result.noResultsMessageVisible).toBe(true);
    expect(result.messageText).toContain(data.expectedNoResultsMessage);
  });

  test('@Medium IW3-T2066 : Verify if subscribed users can play premium content from search results', async ({ page }) => {
    test.setTimeout(120000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-008-premium-playback'];
    const result = await playPremiumContentFromSearch(page, {
      mode: data.mode,
      searchQuery: data.searchQuery,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.searchQueryTyped).toBe(true);
    expect(result.searchResultsVisible).toBe(true);
    expect(result.detailsVisible).toBe(true);
    expect(result.playerVisible).toBe(true);
    expect(result.playbackStarted).toBe(true);
  });

  test('@Medium NEW-4 - Verify search results are returned regardless of query letter casing', async ({ page }) => {
    const data = testCaseData['tc-nav-009-search-case-insensitive'];
    const result = await verifySearchResults(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.resultsVisible).toBe(true);
  });
})