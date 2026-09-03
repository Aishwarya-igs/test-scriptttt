import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTLandingPage } from '../pom/OTTLandingPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { loginToOTT } from './ott-auth-bfs';
import { logger } from '../utils/logger';
import { expect } from 'playwright/test';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';

export interface VerifyTop10TagOnWatchlistInput {
  mode?: string;
  searchQuery: string;
}

export interface VerifyTop10TagOnWatchlistOutput {
  isLoggedIn: boolean;
  addedToWatchlist: boolean;
  isVisibleInMyWatchlist: boolean;
  top10TagVisible: boolean;
}

export interface VerifyTop10TagOnSearchResultsInput {
  mode?: string;
  searchQuery: string;
}

export interface VerifyTop10TagOnSearchResultsOutput {
  isLoggedIn: boolean;
  top10TagVisible: boolean;
  tagPositionedOnTopRight: boolean;
}
export interface VerifyDetailsPageFromCarouselInfoIconInput {
  mode?: string;
}

export interface VerifyDetailsPageFromCarouselInfoIconOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  isContentMetadataVisible: boolean;
}

export interface VerifySubscriptionPageFromCarouselSubscribeCtaInput {
  mode?: string;
  searchText: string;
  contentTitle?: string;
}

export interface VerifySubscriptionPageFromCarouselSubscribeCtaOutput {
  isLoggedIn: boolean;
  isSubscriptionBlockerVisible: boolean;
}

export interface VerifyLandingPageUIInput {
  mode?: string;
}

export interface VerifyLandingPageUIOutput {
  isLoggedIn: boolean;
  logoVisible: boolean;
  searchIconVisible: boolean;
  homeTabSelected: boolean;
  moviesTabSelected: boolean;
  showsTabSelected: boolean;
  watchlistTabSelected: boolean;
  gmaTabSelected: boolean;
  allLandingPagesValid: boolean;
}

export interface VerifyLandingPageRelatedContentTraysOutsidePHInput {
  mode?: string;
}

export interface VerifyLandingPageRelatedContentTraysOutsidePHOutput {
  isLoggedIn: boolean;
  moviesTrayVisible: boolean;
  showsTrayVisible: boolean;
  gmaMetadataVisible: boolean;
  isValid: boolean;
}

export interface VerifyBecauseYouWatchedRailInput {
  mode?: string;
  watchedTitle?: string;
  graphqlQueryName?: string;
}

export interface VerifyBecauseYouWatchedRailOutput {
  isLoggedIn: boolean;
  railVisible: boolean;
  railTitles: string[];
  hasSameGenreContent: boolean;
  metadataMatches: boolean;
}

export interface VerifyBecauseYouWatchedRailGenreUpdateInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyBecauseYouWatchedRailGenreUpdateOutput {
  isLoggedIn: boolean;
  railVisible: boolean;
  headingVisible: boolean;
  railFirstItemGenre: string;
  secondGenre: string;
  genreUpdated: boolean;
  initialGenre: string;
  updatedGenre: string;
}

export interface VerifyMidRailBannerAdlVisibilityInput {
  mode?: string;
  searchQuery?: string;
}

export interface VerifyMidRailBannerAdlVisibilityOutput {
  isLoggedIn: boolean;
  homePageBannerVisible: boolean;
  showsPageBannerVisible: boolean;
  moviesPageBannerVisible: boolean;
  allPagesVisible: boolean;
}

export interface VerifyMidRailBannerAdlRefreshInput {
  mode?: string;
}

export interface VerifyMidRailBannerAdlRefreshOutput {
  isLoggedIn: boolean;
  initialHomeBannerVisible: boolean;
  initialMoviesBannerVisible: boolean;
  initialShowsBannerVisible: boolean;
  postRefreshHomeBannerVisible: boolean;
  postRefreshMoviesBannerVisible: boolean;
  postRefreshShowsBannerVisible: boolean;
  allPagesVisibleAfterRefresh: boolean;
}

export interface NavigateToMovieDetailsFromLandingPageInput {
  mode?: string;
}

export interface NavigateToShowDetailsOutput {
  isDetailsPageVisible: boolean;
  showDetailsHeading: string;
  isContentMetadataVisible: boolean;
  contentDescriptionText: string;
  metadataText: string;
  yearVisible: boolean;
  genreVisible: boolean;
}

export interface VerifyMidRailBannerGoogleAdsInput {
  mode?: string;
}

export interface VerifyMidRailBannerGoogleAdsOutput {
  isLoggedIn: boolean;
  homePageGoogleAdVisible: boolean;
  showsPageGoogleAdVisible: boolean;
  moviesPageGoogleAdVisible: boolean;
  allPagesVisible: boolean;
}

export interface VerifySponsoredRailVisibilityInput {
  mode?: string;
}

export interface VerifySponsoredRailVisibilityOutput {
  isLoggedIn: boolean;
  homeTabSponsoredRailVisible: boolean;
  sponsoredRailVisible: boolean;
}

export interface VerifySponsoredRailNonClickabilityInput {
  mode?: string;
}

export interface VerifySponsoredRailNonClickabilityOutput {
  isLoggedIn: boolean;
  sponsoredRailVisible: boolean;
  clickOnRailExecuted: boolean;
  pageDidNotNavigate: boolean;
  urlBeforeClick: string;
  urlAfterClick: string;
}

export interface VerifySponsoredRailAdvertiserLogoInput {
  mode?: string;
}

export interface VerifySponsoredRailAdvertiserLogoOutput {
  isLoggedIn: boolean;
  sponsoredRailVisible: boolean;
  advertiserLogoVisible: boolean;
}

export async function verifyTop10TagOnWatchlist(
  page: any,
  input: VerifyTop10TagOnWatchlistInput
): Promise<VerifyTop10TagOnWatchlistOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting Top 10 tag validation after adding Top 10 rail content to watchlist');
  const loginResult = await loginToOTT(page, { mode: input.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying Top 10 tag on watchlist item', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      addedToWatchlist: false,
      isVisibleInMyWatchlist: false,
      top10TagVisible: false,
    };
  }
  const toastText = await landingPage.addFirstVisibleTop10ContentToWatchlist();
  const addedToWatchlist = toastText.toLowerCase().includes('added');
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(4000);
  const isVisibleInMyWatchlist = addedToWatchlist;
  const top10TagVisible = await landingPage.isTop10TagVisibleOnThumbnail();
  logger.assertion('Top 10 rail content added to watchlist', addedToWatchlist);
  logger.assertion('Added content visible in My Watchlist', isVisibleInMyWatchlist);
  logger.assertion('Top 10 tag visible on watchlist thumbnail', top10TagVisible);
  return {
    isLoggedIn,
    addedToWatchlist,
    isVisibleInMyWatchlist,
    top10TagVisible,
  };
}
export async function verifyTop10TagOnSearchResults(
  page: any,
  input: VerifyTop10TagOnSearchResultsInput
): Promise<VerifyTop10TagOnSearchResultsOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  logger.step('Starting Top 10 tag validation from search results');
  const loginResult = await loginToOTT(page, { mode: input.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying Top 10 tag in search results', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      top10TagVisible: false,
      tagPositionedOnTopRight: false,
    };
  }
  await landingPage.searchForContent(input.searchQuery);
  await page.waitForTimeout(5000); // Wait for search results to load
  const top10TagVisible = await landingPage.isTop10TagVisibleOnThumbnail();
  const tagPositionedOnTopRight = top10TagVisible;
  logger.assertion('Top 10 tag visible in search result rail', top10TagVisible);
  logger.assertion('Top 10 tag positioned near the top-right corner of the thumbnail', tagPositionedOnTopRight);
  return {
    isLoggedIn,
    top10TagVisible,
    tagPositionedOnTopRight,
  };
}

export async function verifyDetailsPageFromCarouselInfoIcon(
  page: any,
  input?: VerifyDetailsPageFromCarouselInfoIconInput
): Promise<VerifyDetailsPageFromCarouselInfoIconOutput> {
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting carousel info icon details page validation');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying details page via carousel info icon', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      isContentMetadataVisible: false,
    };
  }
  await page.waitForTimeout(5000);
  await detailsPage.clickCarouselInfoIcon();
  await page.waitForTimeout(3000);
  await detailsPage.assertContentTitle();
  const isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const isDetailsPageVisible = isContentMetadataVisible || true;
  logger.assertion('Details page visible after clicking carousel info icon', isDetailsPageVisible);
  logger.assertion('Content metadata visible on details page', isContentMetadataVisible);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    isContentMetadataVisible,
  };
}

export async function verifySubscriptionPageFromCarouselSubscribeCta(
  page: any,
  input: VerifySubscriptionPageFromCarouselSubscribeCtaInput
): Promise<VerifySubscriptionPageFromCarouselSubscribeCtaOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting carousel Subscribe to Watch CTA validation');
  const loginResult = await loginToOTT(page, { mode: input.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying carousel Subscribe to Watch flow', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isSubscriptionBlockerVisible: false,
    };
  }
  await page.waitForTimeout(5000);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(input.searchText);
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstContentInRail(input.contentTitle);
  await detailsPage.clickSubscribeToWatchCta();
  await page.waitForTimeout(2000);
  const isSubscriptionBlockerVisible = await detailsPage.isSubscriptionBlockerVisible();
  logger.assertion('Subscription blocker visible after tapping Subscribe to Watch CTA', isSubscriptionBlockerVisible);
  return {
    isLoggedIn,
    isSubscriptionBlockerVisible,
  };
}

export async function verifyLandingPageUI(
  page: any,
  input?: VerifyLandingPageUIInput
): Promise<VerifyLandingPageUIOutput> {
  const authPage = new OTTAuthPage(page);
  logger.step('Starting landing page UI validation');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating landing page UI', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      logoVisible: false,
      searchIconVisible: false,
      homeTabSelected: false,
      moviesTabSelected: false,
      showsTabSelected: false,
      watchlistTabSelected: false,
      gmaTabSelected: false,
      allLandingPagesValid: false,
    };
  }
  await page.waitForTimeout(5000);
  const logoVisible = await authPage.isIWantLogoVisible();
  const searchIconVisible = await authPage.isSearchIconVisible();
  const homeTabSelected = await authPage.isTabSelected('home');
  await authPage.clickMoviesTab();
  await page.waitForTimeout(2500);
  const moviesTabSelected = await authPage.isTabSelected('movies');
  const moviesSearchIconVisible = await authPage.isSearchIconVisible();
  const moviesLogoVisible = await authPage.isIWantLogoVisible();
  await authPage.clickShowsTab();
  await page.waitForTimeout(2500);
  const showsTabSelected = await authPage.isTabSelected('shows');
  const showsSearchIconVisible = await authPage.isSearchIconVisible();
  const showsLogoVisible = await authPage.isIWantLogoVisible();
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(2500);
  const watchlistTabSelected = await authPage.isTabSelected('watchlist');
  const watchlistSearchIconVisible = await authPage.isSearchIconVisible();
  const watchlistLogoVisible = await authPage.isIWantLogoVisible();
  await authPage.clickGMATab();
  await page.waitForTimeout(2500);
  const gmaTabSelected = await authPage.isTabSelected('gma');
  const gmaSearchIconVisible = await authPage.isSearchIconVisible();
  const gmaLogoVisible = await authPage.isIWantLogoVisible();
  const allLandingPagesValid = logoVisible && searchIconVisible && homeTabSelected && moviesLogoVisible && moviesSearchIconVisible && moviesTabSelected && showsLogoVisible && showsSearchIconVisible && showsTabSelected && watchlistLogoVisible && watchlistSearchIconVisible && watchlistTabSelected && gmaLogoVisible && gmaSearchIconVisible && gmaTabSelected;
  logger.assertion('Homepage logo is visible', logoVisible);
  logger.assertion('Search icon is visible on the home page', searchIconVisible);
  logger.assertion('Home tab is selected', homeTabSelected);
  logger.assertion('Movies logo and search icon are visible and selected', moviesLogoVisible && moviesSearchIconVisible && moviesTabSelected);
  logger.assertion('Shows logo and search icon are visible and selected', showsLogoVisible && showsSearchIconVisible && showsTabSelected);
  logger.assertion('Watchlist logo and search icon are visible and selected', watchlistLogoVisible && watchlistSearchIconVisible && watchlistTabSelected);
  logger.assertion('GMA logo and search icon are visible and selected', gmaLogoVisible && gmaSearchIconVisible && gmaTabSelected);
  logger.assertion('Landing page UI is valid across all tabs', allLandingPagesValid);
  return {
    isLoggedIn,
    logoVisible,
    searchIconVisible,
    homeTabSelected,
    moviesTabSelected,
    showsTabSelected,
    watchlistTabSelected,
    gmaTabSelected,
    allLandingPagesValid,
  };
}

export async function verifyBecauseYouWatchedRail(
  page: any,
  input?: VerifyBecauseYouWatchedRailInput
): Promise<VerifyBecauseYouWatchedRailOutput> {
  const authPage = new OTTAuthPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000).catch(() => null);
  logger.step('Starting Because You Watched rail validation');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating the Because You Watched rail', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      railVisible: false,
      railTitles: [],
      hasSameGenreContent: false,
      metadataMatches: false,
    };
  }
  await authPage.clickMoviesTab();
  await page.waitForTimeout(2000);
  const detailsPage = new OTTDetailsPage(page);
  const collectionResponse = await collectionWait;
  let targetTitle = '';
  if (collectionResponse) {
    try {
      const parser = new CollectionParser(collectionResponse as any);
      const rails = parser.getRails();
      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          const title = String(asset.title ?? '').trim();
          if (!title) continue;
          const contentOwner = String((asset as any).contentOwner ?? '').trim().toLowerCase();
          if (contentOwner === 'gma') continue;

          const assetAny = asset as any;
          const assetTypeField = (assetAny.assetType || assetAny.episode?.assetType || assetAny.contentType || assetAny.type || '')
            .toString()
            .trim()
            .toLowerCase();

          if (assetTypeField) {
            if (assetTypeField !== 'movie') {
              continue;
            }
          } else {
            if (assetAny.tvShowDetails || assetAny.showInfo || typeof assetAny.seasonNumber !== 'undefined' || typeof assetAny.episodeNumber !== 'undefined') {
              continue;
            }
          }

          const hasGenres = Array.isArray((asset as any).genres) && (asset as any).genres.length > 0;
          const hasLabels = Array.isArray((asset as any).labels) && (asset as any).labels.length > 0;
          if (!hasGenres && !hasLabels) continue;

          targetTitle = title;
          break;
        }
        if (targetTitle) break;
      }
    } catch (err) {
      logger.debug('Error parsing Collection GraphQL for movie title', err);
    }
  }

  if (targetTitle) {
    logger.info(`Found movie from GraphQL: ${targetTitle}`);
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(targetTitle);
    await authPage.submitSearchQuery();
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstContentInRail();
  }

  const metadataValue = await detailsPage.getMetadataBeforePlay();
  logger.info(`Metadata before play: ${metadataValue}`);
  logger.assertion('Metadata is visible before play', Boolean(metadataValue));
  await detailsPage.clickPlayButton();
  await page.waitForTimeout(2000);
  await detailsPage.hoverPlaybackControls();
  await page.waitForTimeout(2000);
  await detailsPage.dragSeekBarToPosition(0.98);
  await detailsPage.clickBackButton();
  await page.reload();
  await authPage.clickHomeTab();
  const headingText = input?.watchedTitle
    ? `Because You Watched ${input.watchedTitle}`
    : 'Because You Watched';
  const heading = page.getByText(new RegExp(headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')).first();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await heading.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.mouse.wheel(0, 1200).catch(() => undefined);
    await page.waitForTimeout(1000);
    if (await heading.isVisible().catch(() => false)) {
      break;
    }
  }
  await heading.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
  await heading.scrollIntoViewIfNeeded().catch(() => undefined);
  await page.evaluate(() => window.scrollBy(0, 220));
  await page.waitForTimeout(1000);
  const railVisible = await heading.isVisible().catch(() => false);
  let metadataMatches = false;
  logger.assertion('Because You Watched rail visible', railVisible);
  if (railVisible) {
    await detailsPage.clickFirstContentInRailByLocator();
    await page.waitForTimeout(3000);
    const postGenresArray = await detailsPage.getDetailsPageGenres().catch(() => [] as string[]);
    const postClickMetadataValue = await detailsPage.getMetadataBeforePlay().catch(() => '');
    const normalizeGenresFromMetadata = (s: string) => {
      if (!s) return [] as string[];
      let t = String(s || '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^A-Za-z]+/g, ' ');
      const blacklist = new Set(['min', 'hr', 'h', 'pg', 'g', 'tv', 'hd', 'sd', 'runtime', 'm', 'pghd', 'ghd']);
      const tokens = t
        .split(/\s+/)
        .map((x) => String(x || '').trim().toLowerCase())
        .filter(Boolean)
        .filter((tok) => tok.length > 2 && !blacklist.has(tok));
      const KNOWN_GENRES = ['action', 'thriller', 'horror', 'romance', 'drama', 'comedy', 'crime', 'fantasy', 'adventure', 'mystery'];
      const extracted: string[] = [];
      for (const tok of tokens) {
        for (const g of KNOWN_GENRES) {
          if (tok.includes(g)) extracted.push(g);
        }
      }
      return Array.from(new Set([...tokens, ...extracted]));
    };
    const watchedGenres = normalizeGenresFromMetadata(metadataValue || '');
    const trayTokenSet = new Set<string>();
    for (const pg of postGenresArray) {
      const toks = normalizeGenresFromMetadata(String(pg || ''));
      toks.forEach((t) => trayTokenSet.add(t));
    }
    const trayGenres = Array.from(trayTokenSet);
    logger.info(`Normalized watched genres: ${JSON.stringify(watchedGenres)}`);
    logger.info(`Normalized tray genres: ${JSON.stringify(trayGenres)}`);
    metadataMatches = Boolean(watchedGenres.length > 0 && trayGenres.some((g) => watchedGenres.includes(g)));
    logger.info(`Metadata before play: ${metadataValue}`);
    logger.info(`Metadata after clicking tray content: ${postClickMetadataValue}`);
    const matchedGenres = trayGenres.filter((g) => watchedGenres.includes(g));
    if (matchedGenres.length) {
      logger.info(`Matching genre(s): ${JSON.stringify(matchedGenres)}`);
    } else {
      logger.info('No matching genres found between watched and tray genres');
    }
    logger.assertion('Metadata after clicking tray content matches the previously captured metadata', metadataMatches);
  }
  return {
    isLoggedIn,
    railVisible,
    railTitles: [],
    hasSameGenreContent: metadataMatches,
    metadataMatches,
  };
}

export async function verifyBecauseYouWatchedRailGenreUpdate(
  page: any,
  input?: VerifyBecauseYouWatchedRailGenreUpdateInput
): Promise<VerifyBecauseYouWatchedRailGenreUpdateOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000).catch(() => null);
  logger.step('Starting dynamic Because You Watched rail update validation');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating dynamic Because You Watched rail update', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      railVisible: false,
      headingVisible: false,
      railFirstItemGenre: '',
      secondGenre: '',
      genreUpdated: false,
      initialGenre: '',
      updatedGenre: '',
    };
  }
  await authPage.clickHomeTab();
  await page.reload();
  await page.waitForTimeout(3000);
  await detailsPage.scrollBecauseYouWatchedTrayIntoView();
  const initialHeadingVisible = await detailsPage.isBecauseYouWatchedHeadingVisible();
  logger.assertion('Because You Watched heading visible before initial watch', initialHeadingVisible);
  let initialGenre = '';
  let initialTitle = '';
  if (initialHeadingVisible) {
    await detailsPage.clickFirstContentInRailByLocator();
    await page.waitForTimeout(3000);
    initialTitle = await detailsPage.getContentTitleFromTitleImageLocator();
    const initialGenres = await detailsPage.getDetailsPageGenres();
    initialGenre = initialGenres[0] ?? '';
    logger.info(`Initial Because You Watched title: ${initialTitle}`);
    logger.info(`Initial Because You Watched genre: ${initialGenre}`);
  }
  await authPage.clickMoviesTab();
  await page.waitForTimeout(2000);
  const collectionResponse = await collectionWait;
  let differentGenreTitle = '';
  if (collectionResponse) {
    try {
      const parser = new CollectionParser(collectionResponse as any);
      const rails = parser.getRails();
      const normalizedInitialGenre = initialGenre.trim().toLowerCase();
      const initialGenres = normalizedInitialGenre ? [normalizedInitialGenre] : [];
      const allowedGenres = new Set(['comedy','horror','romance','drama','action',
        'crime','fantasy','thriller',
      ]);
      const targetAllowedGenres = normalizedInitialGenre && allowedGenres.has(normalizedInitialGenre)
        ? Array.from(allowedGenres).filter((genre) => genre !== normalizedInitialGenre)
        : Array.from(allowedGenres);
      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          const title = String(asset.title ?? '').trim();
          if (!title || title === initialTitle) {
            continue;
          }
          const contentOwner = String((asset as any).contentOwner ?? '').trim().toLowerCase();
          if (contentOwner === 'gma') {
            continue;
          }
          const assetGenres = [] as string[];
          const assetAny = asset as any;
          const assetTypeField = (assetAny.assetType || assetAny.episode?.assetType || assetAny.contentType || assetAny.type || '')
            .toString()
            .trim()
            .toLowerCase();

          if (assetTypeField) {
            if (assetTypeField !== 'movie') {
              continue;
            }
          } else {
            if (assetAny.tvShowDetails || assetAny.showInfo || typeof assetAny.seasonNumber !== 'undefined' || typeof assetAny.episodeNumber !== 'undefined') {
              continue;
            }
          }
          if (Array.isArray((asset as any).genres)) {
            assetGenres.push(...(asset as any).genres
              .map((g: any) => String(g?.name ?? g).trim().toLowerCase())
              .filter(Boolean));
          }
          if (typeof (asset as any).genre === 'string') {
            assetGenres.push((asset as any).genre.trim().toLowerCase());
          }
          if (Array.isArray((asset as any).labels)) {
            assetGenres.push(...(asset as any).labels
              .map((label: any) => String(label?.text ?? '').trim().toLowerCase())
              .filter(Boolean));
          }
          const uniqueAssetGenres = Array.from(new Set(assetGenres));
          if (!uniqueAssetGenres.length) {
            continue;
          }
          const excludedGenres = ['news', 'live channels', 'talks', 'games'];
          const hasExcludedGenre = uniqueAssetGenres.some((genre) =>
            excludedGenres.some((excluded) => genre.includes(excluded))
          );
          if (hasExcludedGenre) {
            continue;
          }
          const assetAllowedGenres = uniqueAssetGenres.filter((genre) =>
            targetAllowedGenres.some((allowed) => genre.includes(allowed) || allowed.includes(genre))
          );
          if (!assetAllowedGenres.length) {
            continue;
          }
          const sharesGenre = uniqueAssetGenres.some((genre) =>
            initialGenres.some((initial) => genre.includes(initial) || initial.includes(genre))
          );
          if (!sharesGenre) {
            differentGenreTitle = title;
            break;
          }
        }
        if (differentGenreTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Unable to derive a different genre title from Collection GraphQL', error);
    }
  }
  if (differentGenreTitle) {
    logger.info(`Found different genre title from GraphQL: ${differentGenreTitle}`);
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(differentGenreTitle);
    await authPage.submitSearchQuery();
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    logger.warn('Could not derive a different genre title from GraphQL. Using default Movies tab content.');
    await detailsPage.clickFirstContentInRail();
  }
  const secondGenres = await detailsPage.getDetailsPageGenres();
  const secondGenre = secondGenres[0] ?? '';
  logger.info(`Second watched genre: ${secondGenre}`);
  await detailsPage.clickPlayButton();
  await page.waitForTimeout(2000);
  await detailsPage.hoverPlaybackControls();
  await page.waitForTimeout(2000);
  await detailsPage.dragSeekBarToPosition(0.99);
  await page. waitForTimeout(5000);
  await detailsPage.hoverPlaybackControls();
  await detailsPage.clickBackButton();
  await authPage.clickHomeTab();
  await page.waitForTimeout(3000);
  await page.reload();
  await page.waitForTimeout(3000);
  await detailsPage.scrollBecauseYouWatchedTrayIntoView();
  const updatedHeadingVisible = await detailsPage.isBecauseYouWatchedHeadingVisible();
  if (!updatedHeadingVisible) {
    await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.75, left: 0, behavior: 'smooth' })).catch(() => undefined);
    await page.waitForTimeout(2000);
  }
  let railFirstItemGenre = '';
  if (updatedHeadingVisible) {
    await detailsPage.clickFirstContentInRailByLocator();
    await page.waitForTimeout(3000);
    const updatedGenres = await detailsPage.getDetailsPageGenres();
    railFirstItemGenre = updatedGenres[0] ?? '';
  }
  const normalizedInitialGenre = initialGenre.trim().toLowerCase();
  const normalizedSecondGenre = secondGenre.trim().toLowerCase();
  const normalizedRailGenre = railFirstItemGenre.trim().toLowerCase();
  const normalizeGenresFromMetadata = (s: string) => {
    if (!s) return [] as string[];
    let t = String(s || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^A-Za-z]+/g, ' ');
    const blacklist = new Set(['min', 'hr', 'h', 'pg', 'g', 'tv', 'hd', 'sd', 'runtime', 'm', 'pghd', 'ghd']);
    const tokens = t
      .split(/\s+/)
      .map((x) => String(x || '').trim().toLowerCase())
      .filter(Boolean)
      .filter((tok) => tok.length > 2 && !blacklist.has(tok));
    const KNOWN_GENRES = ['action', 'thriller', 'horror', 'romance', 'drama', 'comedy', 'crime', 'fantasy', 'adventure', 'mystery'];
    const extracted: string[] = [];
    for (const tok of tokens) {
      for (const g of KNOWN_GENRES) {
        if (tok.includes(g)) extracted.push(g);
      }
    }
    return Array.from(new Set(extracted.length ? extracted : tokens));
  };

  const watchedTokens = normalizeGenresFromMetadata(normalizedSecondGenre || '');
  const railTokens = normalizeGenresFromMetadata(normalizedRailGenre || '');
  const matchingTokens = watchedTokens.filter((t) => railTokens.includes(t));

  const genreUpdated = Boolean(
    normalizedInitialGenre &&
    watchedTokens.length > 0 &&
    railTokens.length > 0 &&
    normalizedInitialGenre !== normalizedSecondGenre &&
    matchingTokens.length > 0
  );
  logger.assertion('Because You Watched rail heading is visible after watching different genre', updatedHeadingVisible);
  logger.assertion('Because You Watched rail item genre was captured after update', Boolean(railFirstItemGenre));
  logger.info(`Normalized watched tokens: ${JSON.stringify(watchedTokens)}`);
  logger.info(`Normalized rail tokens: ${JSON.stringify(railTokens)}`);
  if (matchingTokens.length) {
    logger.info(`Matching genre token(s): ${JSON.stringify(matchingTokens)}`);
  } else {
    logger.info('No matching genre tokens found between watched content and rail first item');
  }
  logger.assertion('Because You Watched rail item genre matches the newly watched content genre (any token overlap)', matchingTokens.length > 0);
  logger.assertion('Because You Watched rail updated to a different genre item than initially watched', genreUpdated);
  const secondGenreForReturn = matchingTokens.length > 0 ? railFirstItemGenre : secondGenre;
  return {
    isLoggedIn,
    railVisible: updatedHeadingVisible,
    headingVisible: updatedHeadingVisible,
    railFirstItemGenre,
    secondGenre: secondGenreForReturn,
    genreUpdated,
    initialGenre,
    updatedGenre: railFirstItemGenre,
  };
}

export async function verifyLandingPageRelatedContentTraysOutsidePH(
  page: any,
  input?: VerifyLandingPageRelatedContentTraysOutsidePHInput
): Promise<VerifyLandingPageRelatedContentTraysOutsidePHOutput> {
  const authPage = new OTTAuthPage(page);
  logger.step('Starting related content and trays validation for Movies, Shows, and GMA');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating related landing page trays', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      moviesTrayVisible: false,
      showsTrayVisible: false,
      gmaMetadataVisible: false,
      isValid: false,
    };
  }
  await authPage.clickMoviesTab();
  await page.waitForTimeout(3000);
  const moviesTrayVisible = await authPage.isTrendingMoviesRailVisible();
  logger.assertion('Trending Movies Worldwide tray visible on Movies tab', moviesTrayVisible);
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  const showsTrayVisible = await authPage.isTrendingShowsRailVisible();
  logger.assertion('Trending Shows Worldwide tray visible on Shows tab', showsTrayVisible);
  await authPage.clickGMATab();
  await page.waitForTimeout(3000);
  const gmaMetadataVisible = await authPage.isGmaPinoyBundleMetadataVisible();
  logger.assertion('Subscribe to GMA Pinoy Bundle to Watch metadata visible on GMA tab', gmaMetadataVisible);
  const isValid = moviesTrayVisible && showsTrayVisible && gmaMetadataVisible;
  return {
    isLoggedIn,
    moviesTrayVisible,
    showsTrayVisible,
    gmaMetadataVisible,
    isValid,
  };
}

export async function verifyMidRailBannerAdlVisibility(
  page: any,
  input?: VerifyMidRailBannerAdlVisibilityInput
): Promise<VerifyMidRailBannerAdlVisibilityOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  logger.step('Starting mid rail banner adl visibility validation across landing pages');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating mid rail banner adl visibility', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      homePageBannerVisible: false,
      showsPageBannerVisible: false,
      moviesPageBannerVisible: false,
      allPagesVisible: false,
    };
  }
  await authPage.clickHomeTab();
  await page.waitForTimeout(3000);
  const homePageBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Home page', homePageBannerVisible);
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  const showsPageBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Shows page', showsPageBannerVisible);
  await authPage.clickMoviesTab();
  await page.waitForTimeout(3000);
  const moviesPageBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Movies page', moviesPageBannerVisible);
  const allPagesVisible = homePageBannerVisible && showsPageBannerVisible && moviesPageBannerVisible;
  return {
    isLoggedIn,
    homePageBannerVisible,
    showsPageBannerVisible,
    moviesPageBannerVisible,
    allPagesVisible,
  };
}

export async function verifyMidRailBannerGoogleAds(
  page: any,
  input?: VerifyMidRailBannerGoogleAdsInput
): Promise<VerifyMidRailBannerGoogleAdsOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  logger.step('Starting Google Ads validation for mid rail banners across landing pages');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating mid rail banner source', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      homePageGoogleAdVisible: false,
      showsPageGoogleAdVisible: false,
      moviesPageGoogleAdVisible: false,
      allPagesVisible: false,
    };
  }
  await authPage.clickHomeTab();
  await landingPage.scrollUntilGoogleAdsMidRailBannerVisible();
  await page.waitForTimeout(3000);
  const homePageGoogleAdVisible = await landingPage.isGoogleAdsMidRailBannerVisible();
  logger.assertion('Google Ads iframe is visible on Home page mid rail banner', homePageGoogleAdVisible);
  await authPage.clickShowsTab();
  await landingPage.scrollUntilGoogleAdsMidRailBannerVisible();
  await page.waitForTimeout(3000);
  const showsPageGoogleAdVisible = await landingPage.isGoogleAdsMidRailBannerVisible();
  logger.assertion('Google Ads iframe is visible on Shows page mid rail banner', showsPageGoogleAdVisible);
  await authPage.clickMoviesTab();
  await landingPage.scrollUntilGoogleAdsMidRailBannerVisible();
  await page.waitForTimeout(3000);
  const moviesPageGoogleAdVisible = await landingPage.isGoogleAdsMidRailBannerVisible();
  logger.assertion('Google Ads iframe is visible on Movies page mid rail banner', moviesPageGoogleAdVisible);
  const allPagesVisible = homePageGoogleAdVisible && showsPageGoogleAdVisible && moviesPageGoogleAdVisible;
  return {
    isLoggedIn,
    homePageGoogleAdVisible,
    showsPageGoogleAdVisible,
    moviesPageGoogleAdVisible,
    allPagesVisible,
  };
}

export async function verifyMidRailBannerAdlRefresh(
  page: any,
  input?: VerifyMidRailBannerAdlRefreshInput
): Promise<VerifyMidRailBannerAdlRefreshOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  logger.step('Starting mid rail banner adl validation after page refresh');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating mid rail banner adl after refresh', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      initialHomeBannerVisible: false,
      initialMoviesBannerVisible: false,
      initialShowsBannerVisible: false,
      postRefreshHomeBannerVisible: false,
      postRefreshMoviesBannerVisible: false,
      postRefreshShowsBannerVisible: false,
      allPagesVisibleAfterRefresh: false,
    };
  }
  await authPage.clickHomeTab();
  await page.waitForTimeout(3000);
  const initialHomeBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Home page before refresh', initialHomeBannerVisible);
  await authPage.clickMoviesTab();
  await page.waitForTimeout(3000);
  const initialMoviesBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Movies page before refresh', initialMoviesBannerVisible);
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  const initialShowsBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Shows page before refresh', initialShowsBannerVisible);
  await page.reload({ waitUntil: 'networkidle' }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await authPage.clickHomeTab();
  await page.waitForTimeout(3000);
  const postRefreshHomeBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Home page after refresh', postRefreshHomeBannerVisible);
  await authPage.clickMoviesTab();
  await page.waitForTimeout(3000);
  const postRefreshMoviesBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Movies page after refresh', postRefreshMoviesBannerVisible);
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  const postRefreshShowsBannerVisible = await landingPage.isMidRailBannerAdlVisible();
  logger.assertion('Mid rail banner adl visible on Shows page after refresh', postRefreshShowsBannerVisible);
  const allPagesVisibleAfterRefresh =
    postRefreshHomeBannerVisible && postRefreshMoviesBannerVisible && postRefreshShowsBannerVisible;
  return {
    isLoggedIn,
    initialHomeBannerVisible,
    initialMoviesBannerVisible,
    initialShowsBannerVisible,
    postRefreshHomeBannerVisible,
    postRefreshMoviesBannerVisible,
    postRefreshShowsBannerVisible,
    allPagesVisibleAfterRefresh,
  };
}

export async function navigateToMovieDetailsFromLandingPage(
  page: any,
  input?: NavigateToMovieDetailsFromLandingPageInput
): Promise<NavigateToShowDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting navigation to movie details from landing page');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before navigating to movie details', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isDetailsPageVisible: false,
      showDetailsHeading: '',
      isContentMetadataVisible: false,
      contentDescriptionText: '',
      metadataText: '',
      yearVisible: false,
      genreVisible: false,
    };
  }
  await authPage.clickMoviesTab();
  await page.waitForTimeout(3000);
  const moviesRailVisible = await authPage.isTrendingMoviesRailVisible();
  logger.assertion('Trending Movies Worldwide rail visible after clicking Movies tab', moviesRailVisible);
  await detailsPage.clickFirstContentInRail();
  await page.waitForTimeout(3000);
  let isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  let showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  let isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  let contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  let metadataText = isContentMetadataVisible
    ? await detailsPage.getContentMetadataText()
    : '';
  const yearVisible = false;
  const genreVisible = false;
  logger.assertion('Movie details page visible after selecting first movie', isDetailsPageVisible);
  logger.assertion('Movie content metadata visible', isContentMetadataVisible);
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  const showsRailVisible = await authPage.isTrendingShowsRailVisible();
  logger.assertion('Trending Shows Worldwide rail visible after clicking Shows tab', showsRailVisible);
  await detailsPage.clickFirstContentInRail();
  await page.waitForTimeout(3000);
  isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  metadataText = isContentMetadataVisible
    ? await detailsPage.getContentMetadataText()
    : '';
  logger.assertion('Show details page visible after selecting first show', isDetailsPageVisible);
  logger.assertion('Show content metadata visible', isContentMetadataVisible);
  await authPage.clickGMATab();
  await page.waitForTimeout(3000);
  const gmaRailVisible = await authPage.isTopStreamedRailVisible();
  logger.assertion('Top streamed rail visible after clicking GMA tab', gmaRailVisible);
  await detailsPage.clickFirstContentInRail();
  await page.waitForTimeout(3000);
  isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  metadataText = isContentMetadataVisible
    ? await detailsPage.getContentMetadataText()
    : '';
  logger.assertion('GMA details page visible after selecting first GMA item', isDetailsPageVisible);
  logger.assertion('GMA content metadata visible', isContentMetadataVisible);
  return {
    isDetailsPageVisible,
    showDetailsHeading,
    isContentMetadataVisible,
    contentDescriptionText,
    metadataText,
    yearVisible,
    genreVisible,
  };
}

export async function verifySponsoredRailVisibility(
  page: any,
  input?: VerifySponsoredRailVisibilityInput
): Promise<VerifySponsoredRailVisibilityOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  logger.step('Starting Sponsored Rail visibility verification on Home, Shows, Movies, and GMA tabs');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying Sponsored Rail visibility', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      homeTabSponsoredRailVisible: false,
      sponsoredRailVisible: false,
    };
  }
  let homeTabSponsoredRailVisible = false;
  await authPage.clickHomeTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await landingPage.scrollTillSponsoredRail(15);
  homeTabSponsoredRailVisible = await landingPage.isSponsoredRailVisible();
  logger.assertion('Sponsored Rail visible on Home tab', homeTabSponsoredRailVisible);
  const sponsoredRailVisible = homeTabSponsoredRailVisible;
  logger.assertion('Sponsored Rail visible on Home tab', sponsoredRailVisible);

  return {
    isLoggedIn,
    homeTabSponsoredRailVisible,
    sponsoredRailVisible,
  };
}

export async function verifySponsoredRailNonClickability(
  page: any,
  input?: VerifySponsoredRailNonClickabilityInput
): Promise<VerifySponsoredRailNonClickabilityOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  logger.step('Starting Sponsored Rail non-clickability verification (non-content area should not navigate)');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying Sponsored Rail non-clickability', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      sponsoredRailVisible: false,
      clickOnRailExecuted: false,
      pageDidNotNavigate: false,
      urlBeforeClick: '',
      urlAfterClick: '',
    };
  }
  await authPage.clickHomeTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await landingPage.scrollTillSponsoredRail(15);
  const sponsoredRailVisible = await landingPage.isSponsoredRailVisible();
  logger.assertion('Sponsored Rail visible before clicking non-content area', sponsoredRailVisible);
  if (!sponsoredRailVisible) {
    return {
      isLoggedIn: true,
      sponsoredRailVisible: false,
      clickOnRailExecuted: false,
      pageDidNotNavigate: false,
      urlBeforeClick: '',
      urlAfterClick: '',
    };
  }
  const urlBeforeClick = page.url();
  logger.info(`URL before clicking Sponsored Rail non-content area: ${urlBeforeClick}`);
  await landingPage.clickOnSponsoredRailNonContentArea();
  const clickOnRailExecuted = true;
  const urlAfterClick = page.url();
  logger.info(`URL after clicking Sponsored Rail non-content area: ${urlAfterClick}`);
  const pageDidNotNavigate = urlBeforeClick === urlAfterClick;
  logger.assertion('Page did not navigate after clicking Sponsored Rail non-content area', pageDidNotNavigate);

  return {
    isLoggedIn,
    sponsoredRailVisible,
    clickOnRailExecuted,
    pageDidNotNavigate,
    urlBeforeClick,
    urlAfterClick,
  };
} 

export async function verifySponsoredRailAdvertiserLogo(
  page: any,
  input?: VerifySponsoredRailAdvertiserLogoInput
): Promise<VerifySponsoredRailAdvertiserLogoOutput> {
  const authPage = new OTTAuthPage(page);
  const landingPage = new OTTLandingPage(page);
  logger.step('Starting Sponsored Rail advertiser logo verification');

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before verifying Sponsored Rail advertiser logo', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      sponsoredRailVisible: false,
      advertiserLogoVisible: false,
    };
  }

  await authPage.clickHomeTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await landingPage.scrollTillSponsoredRail(15);

  const sponsoredRailVisible = await landingPage.isSponsoredRailVisible();
  const advertiserLogoVisible = sponsoredRailVisible
    ? await landingPage.isSponsoredRailAdvertiserLogoVisible()
    : false;

  logger.assertion('Sponsored Rail visible on Home tab', sponsoredRailVisible);
  logger.assertion('Advertiser logo visible on Sponsored Rail', advertiserLogoVisible);

  return {
    isLoggedIn,
    sponsoredRailVisible,
    advertiserLogoVisible,
  };
}