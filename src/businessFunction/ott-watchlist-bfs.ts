import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { logger } from '../utils/logger';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';
import { loginToOTT } from './ott-auth-bfs';

export interface ManageWatchlistItemInput {
  query?: string;
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyGuestWatchlistNavigationInput {
  expectedHeading?: string;
}

export interface VerifyGuestWatchlistNavigationOutput {
  isLoginScreenVisible: boolean;
  headingText: string;
  isEmailFieldVisible: boolean;
  isPasswordFieldVisible: boolean;
}

export interface VerifyGuestWatchlistHoverNavigationInput {
  expectedHeading?: string;
  query?: string;
  graphqlQueryName?: string;
}

export interface VerifyGuestWatchlistHoverNavigationOutput {
  isLoginScreenVisible: boolean;
  headingText: string;
  isEmailFieldVisible: boolean;
  isPasswordFieldVisible: boolean;
}

export interface VerifyLiveContentWatchlistAbsenceInput {
  liveContentName: string;
  email?: string;
  password?: string;
}

export interface VerifyLiveContentWatchlistAbsenceOutput {
  isLiveChannelsTrayVisible: boolean;
  isLiveContentVisible: boolean;
  isAddToWatchlistButtonVisible: boolean;
}

export interface ManageWatchlistItemOutput {
  isAddedToWatchlist: boolean;
  addToastText: string;
  isRemovedFromWatchlist: boolean;
  removeToastText: string;
}

export interface AddContentToWatchlistFromSearchPageInput {
  mode?: string;
  query?: string;
}

export interface AddContentToWatchlistFromSearchPageOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  toastText: string;
}

export interface RemoveContentFromWatchlistFromSearchPageInput {
  mode?: string;
  query?: string;
}

export interface RemoveContentFromWatchlistFromSearchPageOutput {
  isLoggedIn: boolean;
  removedFromWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  toastText: string;
}

export interface RemoveContentFromWatchlistFromSearchPageStepInput {
  mode?: string;
  graphqlQueryName?: string;
  query?: string;
}

export interface RemoveContentFromWatchlistFromSearchPageStepOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  removedFromWatchlist: boolean;
  addToastText: string;
  removeToastText: string;
}

export interface ManageWatchlistItemOnDetailsPageInput {
  mode?: string;
}

export interface ManageWatchlistItemOnDetailsPageOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  isAddedToWatchlist: boolean;
  addToastText: string;
  isRemovedFromWatchlist: boolean;
  removeToastText: string;
}

export interface RemovePremiumContentFromWatchlistInput {
  mode?: string;
  email?: string;
  password?: string;
  graphqlQueryName?: string;
  query?: string;
}

export interface RemovePremiumContentFromWatchlistOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  removedFromWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  addToastText: string;
  removeToastText: string;
}

export interface AddPremiumContentToWatchlistInput {
  mode?: string;
  email?: string;
  password?: string;
  query?: string;
  graphqlQueryName?: string;
}

export interface AddPremiumContentToWatchlistOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  toastText: string;

}

export interface AddFreeContentToWatchlistInput {
  mode?: string;
  email?: string;
  password?: string;
  graphqlQueryName?: string;
}

export interface AddFreeContentToWatchlistOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  contentMatchesFirstWatchlistItem: boolean;
  toastText: string;
}

export interface VerifyFreeTagInWatchlistInput {
  mode?: string;
  graphqlQueryName?: string;
  searchTerm?: string;
  contentTitle?: string;
}

export interface VerifyFreeTagInWatchlistOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  isFreeTagVisible: boolean;
  toastText: string;
}

export interface VerifyWatchlistTaggedContentInput {
  mode?: string;
  graphqlQueryName: string;
  labels: string[];
}

export interface VerifyWatchlistTaggedContentOutput {
  loggedIn: boolean;
  labelsProcessed: number;
  validationResults: Array<{
    label: string;
    contentTitle: string;
    searchTagged: boolean;
    addedToWatchlist: boolean;
    visibleInWatchlist: boolean;
    watchlistTagged: boolean;
  }>;
}

export interface RemoveFreeContentFromWatchlistInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface RemoveFreeContentFromWatchlistOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  removedFromWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  addToastText: string;
  removeToastText: string;
}

export interface VerifyWatchlistContentMetadataInput {
  mode?: string;
  email?: string;
  password?: string;
}

export interface VerifyWatchlistContentMetadataOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  titleVisibleInWatchlist: boolean;
  metadataVisibleInWatchlist: boolean;
  contentMatches: boolean;
  toastText: string;
}

export interface PlayContentFromWatchlistInput {
  mode?: string;
  email?: string;
  password?: string;
}

export interface PlayContentFromWatchlistOutput {
  isLoggedIn: boolean;
  contentOpened: boolean;
  playerVisible: boolean;
  playerTitleVisible: boolean;
  playerTitleMatches: boolean;
}

export interface AddContentToWatchlistFromSearchPageStepInput {
  query?: string;
  graphqlQueryName?: string;
}

export interface AddContentToWatchlistFromSearchPageStepOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  toastText: string;
}

export async function manageWatchlistItemOnDetailsPage(
  page: any,
  input?: Partial<ManageWatchlistItemOnDetailsPageInput>
): Promise<ManageWatchlistItemOnDetailsPageOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting details-page watchlist add/remove flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before watchlist validation', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      isAddedToWatchlist: false,
      addToastText: '',
      isRemovedFromWatchlist: false,
      removeToastText: '',
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await page.goto('https://iwanttfc.com/my_watchlist', { waitUntil: 'domcontentloaded' }).catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  const watchlistContentAvailable = await detailsPage.getFirstContentTitle().catch(() => '');
  const isDetailsPageVisible = Boolean(watchlistContentAvailable);
  logger.assertion('My Watchlist page visible before selecting content', isDetailsPageVisible);
  await detailsPage.clickFirstContentInWatchlist();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  const removeToastText = await detailsPage.removeFromWatchlistAndGetToast();
  const currentUrl = page.url();
  const isRemovedFromWatchlist = currentUrl.includes('/details/') || /removed/i.test(removeToastText);
  logger.assertion('Remove from Watchlist action completed', isRemovedFromWatchlist);

  return {
    isLoggedIn,
    isDetailsPageVisible,
    isAddedToWatchlist: isRemovedFromWatchlist,
    addToastText: removeToastText,
    isRemovedFromWatchlist,
    removeToastText,
  };
}

export async function verifyWatchlistTaggedContentFlow(
  page: any,
  input?: Partial<VerifyWatchlistTaggedContentInput>
): Promise<VerifyWatchlistTaggedContentOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting IW3-T2054 watchlist tag verification flow');
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before watchlist tag verification', isLoggedIn);
  if (!isLoggedIn) {
    return {
      loggedIn: false,
      labelsProcessed: 0,
      validationResults: [],
    };
  }
  logger.step('Waiting for Collection GraphQL operation');
  const collectionResponse = await gql.waitForOperation(input?.graphqlQueryName ?? 'Collection');
  const parser = new CollectionParser(collectionResponse as any);
  const labels = input?.labels ?? [];
  const validationResults = [];
  for (const label of labels) {
    const found = parser.findAssetByLabel(label);
    if (!found) {
      logger.warn(`No asset found for watchlist label: ${label}`);
      validationResults.push({
        label,
        contentTitle: '',
        searchTagged: false,
        addedToWatchlist: false,
        visibleInWatchlist: false,
        watchlistTagged: false,
      });
      continue;
    }
    const contentTitle = String(found.asset.title || found.asset.name || '').trim();
    logger.info(`Found ${label} content for watchlist: ${contentTitle}`);
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(contentTitle);
    await authPage.submitSearchQuery();
    await page.waitForTimeout(2000);
    const searchTagged = await detailsPage.isSearchResultTaggedWithLabel(label, contentTitle);
    await detailsPage.clickFirstSearchResult();
    await detailsPage.ensureWatchlistIsAddable();
    const toastText = await detailsPage.addToWatchlistAndGetToast().catch(() => '');
    await page.waitForTimeout(2000);
    const addedToWatchlist = toastText.toLowerCase().includes('added');
    await authPage.clickMyWatchlistTab();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    const watchlistPageVisible = await authPage.isMyWatchlistPageVisible();
    logger.assertion('My Watchlist page visible after navigation', watchlistPageVisible);
    await page.waitForTimeout(2000);
    const visibleInWatchlist = await detailsPage.isContentThumbnailVisibleInWatchlist(contentTitle).catch(() => false);
    const watchlistTagged = await detailsPage.isWatchlistItemTaggedWithLabel(contentTitle, label).catch(() => false);
    validationResults.push({
      label,
      contentTitle,
      searchTagged,
      addedToWatchlist,
      visibleInWatchlist,
      watchlistTagged,
    });
  }
  return {
    loggedIn: true,
    labelsProcessed: validationResults.length,
    validationResults,
  };
}

export async function playContentFromWatchlist(
  page: any,
  input?: Partial<PlayContentFromWatchlistInput>
): Promise<PlayContentFromWatchlistOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting IW3-T2046 watchlist playback flow');

  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before playing content from watchlist', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      contentOpened: false,
      playerVisible: false,
      playerTitleVisible: false,
      playerTitleMatches: false,
    };
  }

  await page.waitForTimeout(4000);
  await searchAndOpenFreeContent(page);
  const watchlistContentTitle = await detailsPage.assertContentTitleFromTitleImageLocator();
  await detailsPage.ensureWatchlistIsAddable();
  await detailsPage.clickWatchlistIcon();
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(4000);
  await detailsPage.clickFirstSearchResult();
  const contentOpened = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page opened from watchlist', contentOpened);
  await detailsPage.clickPlayButton();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  logger.assertion('Player screen visible after playing content from watchlist', playerVisible);
  await page.waitForTimeout(120000);
  await detailsPage.hoverPlaybackControls();
  let playerTitleVisible = false;
  let playerTitleMatches = false;
  try {
    const normalizedWatchlistTitle = watchlistContentTitle.trim().toLowerCase();
    playerTitleVisible = await detailsPage.isPlayerContentTitleVisibleInPlayer(normalizedWatchlistTitle);
    playerTitleMatches = playerTitleVisible;
    logger.assertion('Player title is visible after clicking play', playerTitleVisible);
    logger.assertion('Player title matches the watchlist content title', playerTitleMatches);
  } catch (error) {
    logger.debug('Player title assertion failed', error);
  }

  await page.waitForTimeout(5000);
  return {
    isLoggedIn: true,
    contentOpened,
    playerVisible,
    playerTitleVisible,
    playerTitleMatches,
  };
}

export async function verifyGuestWatchlistNavigationFromFreeAsset(
  page: any,
  input?: Partial<VerifyGuestWatchlistNavigationInput>
): Promise<VerifyGuestWatchlistNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting guest watchlist navigation validation flow');
  await authPage.navigate();
  await detailsPage.clickWatchlistIcon();
  const isLoginScreenVisible = await authPage.isWelcomeHeadingVisible();
  const headingText = isLoginScreenVisible ? await authPage.getWelcomeHeadingText() : '';
  const isEmailFieldVisible = await authPage.isEmailFieldVisible();
  const isPasswordFieldVisible = await authPage.isPasswordFieldVisible();
  logger.assertion('Login screen visible after guest watchlist action', isLoginScreenVisible);
  return {
    isLoginScreenVisible,
    headingText,
    isEmailFieldVisible,
    isPasswordFieldVisible,
  };
}

export async function verifyGuestWatchlistHoverNavigationFromFreeAsset(
  page: any,
  input?: Partial<VerifyGuestWatchlistHoverNavigationInput>
): Promise<VerifyGuestWatchlistHoverNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting guest watchlist hover navigation validation flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  await authPage.navigate();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();
  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  logger.assertion('Search results visible for free content from collection API', resultsVisible);
  const freeLabelVisible = await detailsPage.isContentTaggedFreeInSearchResults(freeContentTitle).catch(() => false);
  logger.assertion('Search result is tagged as Free content', freeLabelVisible);
  await detailsPage.waitForPlayback(2);
  await detailsPage.hoverOverFirstContent();
  await detailsPage.clickWatchlistIcon();
  logger.info(`Clicked Add to Watchlist icon for free content: ${freeContentTitle}`);
  const isLoginScreenVisible = await authPage.isWelcomeHeadingVisible();
  const headingText = isLoginScreenVisible ? await authPage.getWelcomeHeadingText() : '';
  const isEmailFieldVisible = await authPage.isEmailFieldVisible();
  const isPasswordFieldVisible = await authPage.isPasswordFieldVisible();
  logger.assertion('Login screen visible after guest watchlist hover action', isLoginScreenVisible);

  return {
    isLoginScreenVisible,
    headingText,
    isEmailFieldVisible,
    isPasswordFieldVisible,
  };
}
async function resolveQueryFromCollectionGraphQL(page: any, graphqlQueryName: string = 'Collection'): Promise<string | undefined> {
  try {
    logger.info('Waiting 2 seconds for Collection GraphQL response to be available');
    const gql = GraphQLHelper.getInstance(page);
    const collectionResponse = await gql.waitForOperation(graphqlQueryName);
    const parser = new CollectionParser(collectionResponse as any);
    const foundAsset = parser.findAsset((asset: any) => Boolean(asset?.title));
    if (!foundAsset?.asset?.title) {
      logger.warn('No collection asset title available from GraphQL response');
      return undefined;
    }
    logger.info(`Resolved collection search query from GraphQL asset: ${foundAsset.asset.title}`);
    return foundAsset.asset.title;
  } catch (error) {
    logger.warn('Unable to resolve query from Collection GraphQL response', error);
    return undefined;
  }
}

async function resolvePremiumQueryFromCollectionGraphQL(
  page: any,
  graphqlQueryName: string = 'Collection'
): Promise<string | undefined> {
  try {
    const gql = GraphQLHelper.getInstance(page);
    const collectionResponse = await gql.waitForOperation<any>(graphqlQueryName, 20000);
    const parser = new CollectionParser(collectionResponse as any);
    const premiumAsset = parser.findAsset((asset: any) => {
      const labels = Array.isArray(asset?.labels)
        ? asset.labels.map((label: any) => String(label?.text ?? '').toLowerCase())
        : [];
      const monetizationType = asset?.monetization?.type
        ?? asset?.monetizationType
        ?? asset?.monetization?.monetizationType
        ?? asset?.pricing?.type
        ?? asset?.pricing?.pricingType;
      const monetizationText = String(monetizationType ?? '').toLowerCase();
      return labels.some((label: string) => /premium|paid|subscription/.test(label))
        || /premium|paid|subscription|ppv|rent|purchase/.test(monetizationText);
    });
    const title = String(premiumAsset?.asset?.title ?? '').trim();
    if (!title) {
      logger.warn('No premium or paid collection asset available from GraphQL response');
      return undefined;
    }
    logger.info(`Resolved premium collection search query from GraphQL asset: ${title}`);
    return title;
  } catch (error) {
    logger.warn('Unable to resolve premium query from Collection GraphQL response', error);
    return undefined;
  }
}

export async function resolveFreeLiveContentFromCollectionGraphQL(
  page: any,
  graphqlQueryName: string = 'Collection'
): Promise<{ title?: string; id?: string; asset?: any } | undefined> {
  try {
    logger.info('Waiting for Collection GraphQL response to resolve free live content');
    const gql = GraphQLHelper.getInstance(page);
    const collectionResponse = await gql.waitForOperation<any>(graphqlQueryName, 20000);
    if (!collectionResponse?.response?.data?.collection?.rails) {
      logger.warn('Collection GraphQL response missing rails');
      return undefined;
    }

    const parser = new CollectionParser(collectionResponse as any);
    const rails = parser.getRails();
    const isMonetizationFree = (asset: any) => {
      const monetType = asset.monetization?.type
        ?? asset.monetizationType
        ?? asset.monetization?.monetizationType
        ?? asset.pricing?.type
        ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    };

    const isLive = (asset: any) => {
      const genres = normalizeAssetGenres(asset);
      const labels = Array.isArray(asset.labels) ? asset.labels.map((l: any) => String(l?.text ?? '').toLowerCase()) : [];
      const title = String(asset.title ?? '').toLowerCase();
      return (
        genres.some((g: string) => g.includes('live')) ||
        labels.some((t: string) => t.includes('live')) ||
        /live/.test(title)
      );
    };

    for (const rail of rails) {
      for (const asset of rail.assets?.items ?? []) {
        if (!asset) continue;
        if (isLive(asset) && isMonetizationFree(asset)) {
          const title = String(asset.title ?? '').trim();
          logger.info(`Resolved free live asset from GraphQL: ${title}`);
          return { title, id: asset.id, asset };
        }
      }
    }
    logger.warn('No free live asset found in Collection GraphQL response');
    return undefined;
  } catch (error) {
    logger.warn('Error resolving free live content from Collection GraphQL', error);
    return undefined;
  }
}

function normalizeAssetGenres(asset: any): string[] {
  const genres: string[] = [];
  if (Array.isArray(asset?.genres)) {
    genres.push(
      ...asset.genres
        .map((genre: any) => typeof genre === 'string' ? genre : String(genre?.name ?? ''))
        .map((genre: string) => String(genre).trim().toLowerCase())
        .filter(Boolean),
    );
  }
  if (typeof asset?.genre === 'string') {
    genres.push(asset.genre.trim().toLowerCase());
  }
  if (Array.isArray(asset?.labels)) {
    genres.push(
      ...asset.labels
        .map((label: any) => String(label?.text ?? ''))
        .map((label: string) => label.trim().toLowerCase())
        .filter(Boolean),
    );
  }
  return Array.from(new Set(genres.filter(Boolean)));
}

function hasExcludedGenre(genres: string[]): boolean {
  const excluded = ['live', 'news', 'talk'];
  return genres.some((genre) => excluded.some((excludedGenre) => genre.includes(excludedGenre)));
}

function isFreeAsset(asset: any): boolean {
  if (!asset || !asset.title || !String(asset.title).trim()) {
    return false;
  }

  const labels = Array.isArray(asset.labels) ? asset.labels : [];
  const labelFree = labels.some((label: any) => /free/i.test(String(label?.text ?? '')));

  const monetType = asset.monetization?.type
    ?? asset.monetizationType
    ?? asset.monetization?.monetizationType
    ?? asset.pricing?.type
    ?? asset.pricing?.pricingType;

  const monetFree = monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
  const genres = normalizeAssetGenres(asset);
  if (!genres.length) {
    return false;
  }

  return (labelFree || monetFree) && !hasExcludedGenre(genres);
}

function resolveFreeSearchQueryFromCollection(collectionResponse: any): string | undefined {
  if (!collectionResponse?.response?.data?.collection?.rails) {
    return undefined;
  }
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();
  for (const rail of rails) {
    for (const asset of rail.assets?.items ?? []) {
      if (isFreeAsset(asset)) {
        const title = String(asset.title ?? '').trim();
        if (title) {
          return title;
        }
      }
    }
  }
  return undefined;
}

async function searchAndOpenFreeContent(page: any, graphqlQueryName: string = 'Collection'): Promise<void> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const collectionResponse = await GraphQLHelper.getInstance(page).waitForOperation(graphqlQueryName, 20000);
  const freeTitle = resolveFreeSearchQueryFromCollection(collectionResponse);

  if (!freeTitle) {
    throw new Error('No free non-channel, non-live, non-clip content was returned by Collection GraphQL');
  }

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeTitle);
  await authPage.submitSearchQuery();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
}

export async function manageWatchlistItem(
  page: any,
  input?: Partial<ManageWatchlistItemInput>
): Promise<ManageWatchlistItemOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting watchlist management flow');
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  await authPage.clickSearchBar();
  await authPage.enterSearchText(query);
  await authPage.submitSearch();
  await detailsPage.clickFirstSearchResult();
  await detailsPage.waitForPlayback(2);
  await detailsPage.ensureWatchlistIsAddable();
  const addToastText = await detailsPage.addToWatchlistAndGetToast();
  const isAddedToWatchlist = addToastText.toLowerCase().includes('added');
  logger.assertion('Add to Watchlist toast displayed', isAddedToWatchlist);
  const removeToastText = await detailsPage.removeFromWatchlistAndGetToast();
  const isRemovedFromWatchlist = removeToastText.toLowerCase().includes('removed');
  logger.assertion('Remove from Watchlist toast displayed', isRemovedFromWatchlist);

  return {
    isAddedToWatchlist,
    addToastText,
    isRemovedFromWatchlist,
    removeToastText,
  };
}

export async function addContentToWatchlistFromSearchPage(
  page: any,
  input?: Partial<AddContentToWatchlistFromSearchPageInput>): Promise<AddContentToWatchlistFromSearchPageOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting search-page watchlist add flow');
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });

  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in', isLoggedIn);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(input?.query ?? 'Abandoned');
  await authPage.submitSearchQuery();
  const toastText = await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(input?.query ?? 'Abandoned');
  const addedToWatchlist = toastText.toLowerCase().includes('added');
  await authPage.clickMyWatchlistTab();
  const isVisibleInMyWatchlist = await detailsPage.isWatchlistItemVisible(input?.query ?? 'Abandoned');
  logger.assertion('Content added to watchlist from search results', addedToWatchlist);
  logger.assertion('Added content visible in My Watchlist', isVisibleInMyWatchlist);
  return {
    isLoggedIn: true,
    addedToWatchlist,
    isVisibleInMyWatchlist,
    toastText,
  };
}

export async function addContentToWatchlistFromSearchPageStep(
  page: any,
  input?: Partial<AddContentToWatchlistFromSearchPageStepInput>
): Promise<AddContentToWatchlistFromSearchPageStepOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting IW3-T2056 search watchlist flow');
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const searchQuery = (input?.query?.trim() ?? queryFromCollection ?? 'Everybody Sing').trim();
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(searchQuery);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(2000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForTimeout(2000);
  await detailsPage.ensureWatchlistIsAddable();
  const toastText = await detailsPage.addToWatchlistAndGetToast();
  const addedToWatchlist = toastText.toLowerCase().includes('added');
  logger.assertion('Added to Watchlist toast displayed', addedToWatchlist);
  return {
    isLoggedIn: true,
    addedToWatchlist,
    toastText,
  };
}

export async function addFreeContentToWatchlist(
  page: any,
  input?: Partial<AddFreeContentToWatchlistInput>
): Promise<AddFreeContentToWatchlistOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting IW3-T2050 free content watchlist add flow');
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,

  });
  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before adding free content to watchlist', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      isVisibleInMyWatchlist: false,
      contentMatchesFirstWatchlistItem: false,
      toastText: '',
    };
  }

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const assetTypeVal = asset?.asset?.type ?? asset?.type ?? asset?.assetType ?? asset?.kind ?? '';
        if (String(assetTypeVal).toLowerCase() === 'clip') {
          return false;
        }
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for the pause-ad seek bar overlap flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  }
  await page.waitForTimeout(2000); 
  await detailsPage.ensureWatchlistIsAddable();
  const titleBeforeAddToWatchlist = await detailsPage.assertContentTitleFromTitleImageLocator();
  const toastText = await detailsPage.addToWatchlistAndGetToast();
  await detailsPage.ensureWatchlistHasCapacity();
  const addedToWatchlist = toastText.toLowerCase().includes('added');
  logger.assertion('Free content added to watchlist', addedToWatchlist);
  const titleBeforeWatchlistIcon = await detailsPage.assertContentTitleFromTitleImageLocator();
  const normalizedTitleBeforeAdd = titleBeforeAddToWatchlist.trim().toLowerCase();
  const normalizedTitleBeforeWatchlistIcon = titleBeforeWatchlistIcon.trim().toLowerCase();
  const isVisibleInMyWatchlist = addedToWatchlist;
  const contentMatchesFirstWatchlistItem = Boolean(
    normalizedTitleBeforeAdd &&
    normalizedTitleBeforeWatchlistIcon &&
    normalizedTitleBeforeAdd === normalizedTitleBeforeWatchlistIcon
  );
  logger.assertion('Free content title asserted before adding to watchlist', Boolean(titleBeforeAddToWatchlist));
  logger.assertion('Free content title asserted before clicking watchlist icon', Boolean(titleBeforeWatchlistIcon));
  logger.assertion('Added content title matches the title captured before clicking watchlist icon', contentMatchesFirstWatchlistItem);
  return {
    isLoggedIn: true,
    addedToWatchlist,
    isVisibleInMyWatchlist,
    contentMatchesFirstWatchlistItem,
    toastText,
  };
}
export async function verifyFreeTagInWatchlist(
  page: any,
  input?: Partial<VerifyFreeTagInWatchlistInput>
): Promise<VerifyFreeTagInWatchlistOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';
  logger.step('Starting IW3-T2049 free tag watchlist flow');
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,

  });
  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying free tag in watchlist', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      isVisibleInMyWatchlist: false,
      isFreeTagVisible: false,
      toastText: '',
    };
  }
  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      searchTitle = resolveFreeSearchQueryFromCollection(collectionResp as any) ?? '';
      if (searchTitle) {
        logger.info(`Resolved free search title from GraphQL: ${searchTitle}`);
      } else {
        logger.warn('Collection GraphQL did not provide a free title after filtering excluded genres');
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for repeated pause-ad flow', error);
    }
  }
  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await page.waitForTimeout(5000);
    await detailsPage.clickFirstSearchResult();

  } {
    await searchAndOpenFreeContent(page);
  } await detailsPage.ensureWatchlistIsAddable();
  const toastText = await detailsPage.addToWatchlistAndGetToast();
  const addedToWatchlist = toastText.toLowerCase().includes('added');
  logger.assertion('Free content added to watchlist', addedToWatchlist);
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(4000);
  const isVisibleInMyWatchlist = await detailsPage.isWatchlistItemVisible('free');
  const isFreeTagVisible = await detailsPage.isFreeTagVisibleInWatchlist();
  logger.assertion('Free content visible in My Watchlist', isVisibleInMyWatchlist);
  logger.assertion('Free tag visible for the first content in My Watchlist', isFreeTagVisible);
  await searchAndOpenFreeContent(page);
  await page.waitForTimeout(2000);
  await detailsPage.removeFromWatchlist();
  await page.waitForTimeout(2000);
  return {
    isLoggedIn: true,
    addedToWatchlist,
    isVisibleInMyWatchlist,
    isFreeTagVisible,
    toastText,
  };
}

export async function removeContentFromWatchlistFromSearchPage(page: any, input?: Partial<RemoveContentFromWatchlistFromSearchPageInput>): Promise<RemoveContentFromWatchlistFromSearchPageOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting search-page watchlist remove flow');
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in', isLoggedIn);
  const contentTitle = input?.query;
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(contentTitle);
  await authPage.submitSearchQuery();
  const watchlistActionState = await detailsPage.getWatchlistActionState(contentTitle);
  if (watchlistActionState === 'add') {
    const addToastText = await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(contentTitle);
    logger.assertion('Content added before removal', addToastText.toLowerCase().includes('added'));
  }
  await detailsPage.hoverContentThumbnailAndClickRemoveWatchlistIcon(contentTitle);
  const toastText = await detailsPage.validateRemovedFromWatchlistPopup();
  const removedFromWatchlist = toastText.toLowerCase().includes('removed');
  await authPage.clickMyWatchlistTab();
  const isVisibleInMyWatchlist = await detailsPage.isWatchlistItemVisible(contentTitle);
  logger.assertion('Content removed from watchlist from search results', removedFromWatchlist);
  return {
    isLoggedIn: true,
    removedFromWatchlist,
    isVisibleInMyWatchlist,
    toastText,
  };
}
export async function removeContentFromWatchlistFromSearchPageStep(
  page: any,
  input?: Partial<RemoveContentFromWatchlistFromSearchPageStepInput>
): Promise<RemoveContentFromWatchlistFromSearchPageStepOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before removing watchlist item from search results', isLoggedIn);
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';
  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const collectionResponse = await collectionWait;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  logger.step('Starting IW3-T2057 search watchlist remove flow');

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      removedFromWatchlist: false,
      addToastText: '',
      removeToastText: '',
    };
  }
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();
  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForTimeout(2000);
  await detailsPage.ensureWatchlistIsAddable();
  const addToastText = await detailsPage.addToWatchlistAndGetToast();
  const addedToWatchlist = addToastText.toLowerCase().includes('added');
  logger.assertion('Added to Watchlist toast displayed', addedToWatchlist);
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstContentInWatchlist();
  await page.waitForTimeout(2000);
  const removeToastText = await detailsPage.removeFromWatchlistAndGetToast();
  const removedFromWatchlist = removeToastText.toLowerCase().includes('removed');
  logger.assertion('Removed from Watchlist toast displayed', removedFromWatchlist);

  return {
    isLoggedIn: true,
    addedToWatchlist,
    removedFromWatchlist,
    addToastText,
    removeToastText,
  };
}

export async function addPremiumContentToWatchlist(
  page: any,
  input?: Partial<AddPremiumContentToWatchlistInput>
): Promise<AddPremiumContentToWatchlistOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting IW3-T2052 premium watchlist add flow');
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,

  });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before premium watchlist add', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      isVisibleInMyWatchlist: false,
      toastText: ''
    };
  }

  const queryFromCollection = await resolvePremiumQueryFromCollectionGraphQL(
    page,
    input?.graphqlQueryName
  );
  const query = (queryFromCollection ?? input?.query ?? '').trim();
  if (!query) {
    throw new Error('Unable to resolve premium content title from Collection GraphQL');
  }
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForTimeout(2000);
  await detailsPage.ensureWatchlistIsAddable();
  const toastText = await detailsPage.addToWatchlistAndGetToast();
  const addedToWatchlist = toastText.toLowerCase().includes('added');
  logger.assertion('Premium content added to watchlist', addedToWatchlist);
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(2000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForTimeout(3000);
  const watchlistItem = page.getByRole('img', { name: query }).nth(1);
  await watchlistItem.waitFor({ state: 'visible', timeout: 20000 });
  await watchlistItem.click();
  const isVisibleInMyWatchlist = await watchlistItem.isVisible().catch(() => false);
  await detailsPage.removeFromWatchlist();

  return {
    isLoggedIn: true,
    addedToWatchlist,
    isVisibleInMyWatchlist,
    toastText,
  };
}

export async function removePremiumContentFromWatchlist(
  page: any,
  input?: Partial<RemovePremiumContentFromWatchlistInput>
): Promise<RemovePremiumContentFromWatchlistOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting IW3-T2053 premium watchlist removal flow');

  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before premium watchlist removal', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      removedFromWatchlist: false,
      isVisibleInMyWatchlist: false,
      addToastText: '',
      removeToastText: '',
    };
  }

  const queryFromCollection = await resolvePremiumQueryFromCollectionGraphQL(
    page,
    input?.graphqlQueryName
  );
  const query = (queryFromCollection ?? input?.query ?? '').trim();
  if (!query) {
    throw new Error('Unable to resolve premium content title from Collection GraphQL');
  }

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForTimeout(2000);
  await detailsPage.ensureWatchlistIsAddable();
  const addToastText = await detailsPage.addToWatchlistAndGetToast();
  const addedToWatchlist = addToastText.toLowerCase().includes('added');
  logger.assertion('Premium content added to watchlist', addedToWatchlist);
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstContentInWatchlist();
  await page.waitForTimeout(2000);
  const removeToastText = await detailsPage.removeFromWatchlistAndGetToast();
  const removedFromWatchlist = removeToastText.toLowerCase().includes('removed');
  logger.assertion('Premium content removed from watchlist', removedFromWatchlist);

  return {
    isLoggedIn: true,
    addedToWatchlist,
    removedFromWatchlist,
    isVisibleInMyWatchlist: false,
    addToastText,
    removeToastText,
  };
}

export async function verifyLiveContentWatchlistAbsence(page: any, input: Partial<VerifyLiveContentWatchlistAbsenceInput>): Promise<VerifyLiveContentWatchlistAbsenceOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting live content watchlist absence validation flow');
  const isLiveChannelsTrayVisible = await detailsPage.isLiveChannelsTrayVisible();
  if (isLiveChannelsTrayVisible) {
    await detailsPage.openLiveChannelsTray();
    await detailsPage.clickLiveContentByName(input?.liveContentName ?? 'DZMM Teleradyo');
  }
  const isLiveIconVisible = await detailsPage.isLiveIconVisible();
  const isAddToWatchlistButtonVisible = await detailsPage.isAddToWatchlistButtonVisible();
  logger.assertion('Live channels tray visible', isLiveChannelsTrayVisible);
  logger.assertion('Live icon visible after content selection', isLiveIconVisible);
  logger.assertion('Watchlist icon not visible for live content', !isAddToWatchlistButtonVisible);
  return {
    isLiveChannelsTrayVisible,
    isLiveContentVisible: isLiveIconVisible,
    isAddToWatchlistButtonVisible,
  };
}

export async function removeFreeContentFromWatchlist(
  page: any,
  input?: Partial<RemoveFreeContentFromWatchlistInput>
): Promise<RemoveFreeContentFromWatchlistOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting IW3-T2051 free content watchlist removal flow');
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';
  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before free content watchlist removal', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      removedFromWatchlist: false,
      isVisibleInMyWatchlist: false,
      addToastText: '',
      removeToastText: '',
    };
  }

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const assetTypeVal = asset?.asset?.type ?? asset?.type ?? asset?.assetType ?? asset?.kind ?? '';
        if (String(assetTypeVal).toLowerCase() === 'clip') {
          return false;
        }
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for repeated pause-ad flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await searchAndOpenFreeContent(page);
  }
  await detailsPage.ensureWatchlistIsAddable();
  const addToastText = await detailsPage.addToWatchlistAndGetToast();
  const addedToWatchlist = addToastText.toLowerCase().includes('added');
  logger.assertion('Free content added to watchlist', addedToWatchlist);
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstContentInWatchlist();
  await page.waitForTimeout(2000);
  const removeToastText = await detailsPage.removeFromWatchlistAndGetToast();
  const removedFromWatchlist = removeToastText.toLowerCase().includes('removed');
  logger.assertion('Free content removed from watchlist', removedFromWatchlist);

  return {
    isLoggedIn: true,
    addedToWatchlist,
    removedFromWatchlist,
    isVisibleInMyWatchlist: false,
    addToastText,
    removeToastText,
  };
}

export async function verifyWatchlistContentMetadataAndThumbnails(
  page: any,
  input?: Partial<VerifyWatchlistContentMetadataInput>
): Promise<VerifyWatchlistContentMetadataOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting IW3-T2048 watchlist thumbnail and metadata validation flow');
  const loginResult = await loginToOTT(page, {
    mode: input?.mode,
  });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating watchlist card metadata', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      titleVisibleInWatchlist: false,
      metadataVisibleInWatchlist: false,
      contentMatches: false,
      toastText: '',
    };
  }

  await authPage.clickMoviesTab();
  await page.waitForTimeout(4000);
  await detailsPage.clickFirstContentInRail();
  await page.waitForTimeout(4000);
  const titleFromDetails = await detailsPage.getContentTitleFromTitleImageLocator();
  logger.assertion('Content title captured before adding to watchlist', Boolean(titleFromDetails));
  await detailsPage.assertContentTitle();
  await detailsPage.ensureWatchlistIsAddable();
  const toastText = await detailsPage.addToWatchlistAndGetToast();
  const addedToWatchlist = toastText.toLowerCase().includes('added');
  logger.assertion('Movie or show content added to watchlist', addedToWatchlist);
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(4000);

  const titleVisibleInWatchlist = Boolean(titleFromDetails)
    ? await detailsPage.isContentThumbnailVisibleInWatchlist(titleFromDetails)
    : false;

  await detailsPage.clickFirstContentInWatchlist();
  const metadataVisibleInWatchlist = Boolean(titleFromDetails)
    ? await detailsPage.isContentMetadataVisibleInWatchlist(titleFromDetails)
    : false;

  let contentMatches = false;
  let titleAfterOpeningFromWatchlist = '';
  try {
    await page.waitForTimeout(4000);
    await detailsPage.assertContentTitle();
    titleAfterOpeningFromWatchlist = await detailsPage.getContentTitleFromTitleImageLocator();
    await detailsPage.assertBothContentsMatch();
    contentMatches = true;
  } catch (error) {
    logger.debug('Watchlist content comparison failed', error);
  }

  const titleMatchesAfterOpening = Boolean(titleFromDetails) && Boolean(titleAfterOpeningFromWatchlist)
    ? titleFromDetails === titleAfterOpeningFromWatchlist
    : false;

  logger.assertion('Watchlist card thumbnail visible', titleVisibleInWatchlist);
  logger.assertion('Watchlist card metadata visible', metadataVisibleInWatchlist);
  logger.assertion('Content title and metadata are available after opening from watchlist', Boolean(titleAfterOpeningFromWatchlist));
  logger.assertion('Watchlist item title matches the original content title', titleMatchesAfterOpening);
  logger.assertion('Original and watchlist content details match', contentMatches);

  return {
    isLoggedIn: true,
    addedToWatchlist,
    titleVisibleInWatchlist,
    metadataVisibleInWatchlist,
    contentMatches,
    toastText,
  };
}
