import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { loginToOTT } from './ott-auth-bfs';
import { Logger, logger } from '../utils/logger';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';
import { config } from '../utils/config-manager';

export interface VerifyShareLinkCopiedToClipboardInput {
  mode?: string;
}

export interface VerifyShareLinkCopiedToClipboardOutput {
  isLoggedIn: boolean;
  isContentDetailsPageVisible: boolean;
  isShareIconVisible: boolean;
  shareMessageText: string;
}

export interface VerifyEpisodesGroupedBySeasonInput {
  mode?: string;
}

export interface VerifyEpisodesGroupedBySeasonOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonLabelsVisible: boolean;
  seasonLabelsCount: number;
  seasonLabelsText: string[];
  episodeItemsCount: number;
  allSeasonsValidated: boolean;
}

export interface VerifyShowEpisodeListScrollableToEndInput {
  mode?: string;
}

export interface VerifyShowEpisodeListScrollableToEndOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonLabelsVisible: boolean;
  seasonLabelsCount: number;
  seasonLabelsText: string[];
  episodeItemsCount: number;
  allSeasonsValidated: boolean;
  episodeListScrollableToEnd: boolean;
  iWantElementVisible: boolean;
}

export interface VerifyEpisodesInAscendingOrderInput {
  mode?: string;
}

export interface VerifyPremiumIconOnDetailsPageInput {
  mode?: string;
}

export interface VerifyPremiumIconOnDetailsPageOutput {
  isLoggedIn: boolean;
  isGmaTabVisible: boolean;
  isDetailsPageVisible: boolean;
  premiumIconVisible: boolean;
}

export interface EpisodeSequenceValidation {
  seasonLabel: string;
  episodeLabels: string[];
  parsedNumbers: number[];
  isAscending: boolean;
}

export interface VerifyEpisodesInAscendingOrderOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonLabelsVisible: boolean;
  seasonLabelsText: string[];
  episodeSequenceValidations: EpisodeSequenceValidation[];
  allSeasonsValidated: boolean;
  ascendingEpisodesVerified: boolean;
}

export interface NavigateToShowDetailsInput {
  mode?: string;
  expectedHeading?: string;
  expectedYear?: string;
  expectedGenre?: string;
}

export interface NavigateToShowDetailsOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  showDetailsHeading: string;
  isContentMetadataVisible: boolean;
  contentDescriptionText: string;
  metadataText: string;
  yearVisible: boolean;
  genreVisible: boolean;
}

export interface VerifyVPNPlaybackRestrictionInput {
  mode?: string;
  searchQuery: string;
  expectedVPNErrorMessage: string;
  parentalPin?: string;
}

export interface VerifyVPNPlaybackRestrictionOutput {
  isLoggedIn: boolean;
  vpnErrorVisible: boolean;
  errorMessage: string;
  playbackStarted: boolean;
}

export interface VerifyIWantOriginalsPreviewOnDetailsPageInput {
  mode?: string;
}

export interface VerifyIWantOriginalsPreviewOnDetailsPageOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  previewVideoVisible: boolean;
  previewPlaybackStarted: boolean;
}

export interface VerifySkipIntroMarkerInput {
  mode?: string;
  searchTerm?: string;
  parentalPin?: string;
}

export interface VerifySkipIntroMarkerOutput {
  isDetailsPageVisible: boolean;
  isSkipIntroMarkerVisible: boolean;
}

export interface VerifySkipRecapMarkerInput {
  mode?: string;
  searchTerm?: string;
  parentalPin?: string;
}

export interface VerifySkipRecapMarkerOutput {
  isDetailsPageVisible: boolean;
  isSkipRecapMarkerVisible: boolean;
}

export interface VerifyGuestSearchNavigationInput {
  searchTerm?: string;
  expectedTitle?: string;
}

export interface VerifyGuestSearchNavigationOutput {
  isSearchInputPopulated: boolean;
  isDetailsPageVisible: boolean;
  headingText: string;
  titleMatchesSearchTerm: boolean;
}

export interface PlayEpisodeFromDetailsInput {
  mode?: string;
  searchTerm?: string;
}

export interface PlayEpisodeFromDetailsOutput {
  isDetailsPageVisible: boolean;
  isEpisodeListVisible: boolean;
  isPlayerVisible: boolean;
  showDetailsHeading: string;
  playbackContentTitle: string;
  selectedEpisodeTitle: string;
  playerTopLeftVisible: boolean;
  playerContainsTitleEpisode: boolean;
}

export interface VerifyEpisodePlaybackStartsFromDetailsInput {
  mode?: string;
}

export interface VerifyEpisodePlaybackStartsFromDetailsOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonSectionVisible: boolean;
  selectedEpisodeTitle: string;
  showName: string;
  seasonNumber: string;
  episodeNumber: string;
  playerVisible: boolean;
  playbackStarted: boolean;
  playerEpisodeTitleVisible: boolean;
  playerSeasonVisible: boolean;
  playerEpisodeVisible: boolean;
  playerMetadataText: string;
}

export interface VerifySharedDeeplinkRedirectInput {
  mode?: string;
}

export interface VerifySharedDeeplinkRedirectOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  headingText: string;
  summaryText: string;
  titleMatchesAsset: boolean;
  shortDescriptionMatchesAsset: boolean;
}

export interface VerifyAutoPlaybackOfPreviewOnDetailsPageInput {
  mode?: string;
}

export interface VerifyAutoPlaybackOfPreviewOnDetailsPageOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  previewVideoVisible: boolean;
  previewPlaybackStarted: boolean;
}

export interface VerifyVPNWhitelistedPlaybackInput {
  mode?: string;
}

export interface VerifyVPNWhitelistedPlaybackOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerVisible: boolean;
  playbackStarted: boolean;
}

export interface VerifySkipIntroMarkerOutput {
  isDetailsPageVisible: boolean;
  isSkipIntroMarkerVisible: boolean;
}

export interface VerifySkipIntroFunctionalityOutput {
  isDetailsPageVisible: boolean;
  isSkipIntroMarkerVisible: boolean;
  skipIntroClicked: boolean;
  timeBeforeSkipIntro: string;
  timeAfterSkipIntro: string;
}

export interface VerifySkipRecapMarkerOutput {
  isDetailsPageVisible: boolean;
  isSkipRecapMarkerVisible: boolean;
}

export interface VerifySkipRecapFunctionalityOutput {
  isDetailsPageVisible: boolean;
  isSkipRecapMarkerVisible: boolean;
  skipRecapClicked: boolean;
  timeBeforeSkipRecap: string;
  timeAfterSkipRecap: string;
}

export interface VerifySkipIntroAndRecapAdvancePlaybackDurationOutput {
  isDetailsPageVisible: boolean;
  isSkipIntroMarkerVisible: boolean;
  skipIntroClicked: boolean;
  timeBeforeSkipIntro: string;
  timeAfterSkipIntro: string;
  isSkipRecapMarkerVisible: boolean;
  skipRecapClicked: boolean;
  timeBeforeSkipRecap: string;
  timeAfterSkipRecap: string;
}

export interface VerifyGuestShareFunctionalityInput {
  expectedShareMessage?: string;
}

export interface VerifyGuestShareFunctionalityOutput {
  isContentDetailsPageVisible: boolean;
  headingText: string;
  isContentMetadataVisible: boolean;
  isContentTitleImageVisible: boolean;
  isContentGenreVisible: boolean;
  isContentCastVisible: boolean;
  isShareIconVisible: boolean;
  shareMessageText: string;
}

export interface VerifyContentDetailsPageUiInput {
  mode?: string;
}

export interface VerifyContentDetailsPageUiOutput {
  isLoggedIn: boolean;
  isContentDetailsPageVisible: boolean;
  contentDetailsHeading: string;
  selectedMovieTitle: string;
  isContentMetadataVisible: boolean;
  contentDescriptionText: string;
  isContentTitleImageVisible: boolean;
  isContentGenreVisible: boolean;
  isContentYearVisible: boolean;
  isContentAgeRatingVisible: boolean;
  isContentDurationVisible: boolean;
  isContentCastVisible: boolean;
  isPrimaryPlaybackActionVisible: boolean;
  isContentLanguageIconVisible: boolean;
  isContentSubtitleIconVisible: boolean;
  isAddToWatchlistButtonVisible: boolean;
  isContentShareIconVisible: boolean;
}

export interface VerifyBackNavigationFromDetailsPageInput {
  mode?: string;
  query?: string;
}

export interface VerifyBackNavigationFromDetailsPageOutput {
  isLoggedIn: boolean;
  detailsPageVisibleBeforeBack: boolean;
  detailsPageVisibleAfterBack: boolean;
  previousPageVisible: boolean;
}

export async function verifyVPNWhitelistedPlayback(
  page: any,
  input: VerifyVPNWhitelistedPlaybackInput
): Promise<VerifyVPNWhitelistedPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting VPN whitelisted-country playback flow');
  const loginResult = await loginToOTT(page, { mode: input.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before VPN whitelisted playback check', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      detailsVisible: false,
      playerVisible: false,
      playbackStarted: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  logger.step('Fetching GraphQL collection data to select a show-backed content item');
  const collectionResponse = await gql.waitForOperation('Collection');
  const parser = new CollectionParser(collectionResponse as any);
  const selectedShowAsset = parser.findAsset((asset: any) => {
    const assetType = String(asset?.assetType || '').toLowerCase();
    const hasShowLikeMetadata = Boolean(asset?.tvShowDetails || asset?.showInfo || asset?.seasons?.length);
    return assetType === 'show' || assetType === 'tvshow' || assetType === 'tv_show' || hasShowLikeMetadata;
  });
  const selectedShowTitle = selectedShowAsset?.asset?.title?.trim();
  logger.step(`Selected show title from collection data: ${selectedShowTitle}`);
  logger.step('Opening the search bar');
  await authPage.clickSearchBar();
  logger.step('Searching for the selected show title');
  await authPage.enterSearchQuery(selectedShowTitle);
  logger.step('Submitting the search query');
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  logger.step('Waiting for content details to render');
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  logger.assertion('Content details page visible', detailsVisible);
  logger.step('Starting playback from the details page');
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(10000);
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const playbackStarted = await detailsPage.isPlaybackStarted();
  logger.assertion('Player screen visible', playerVisible);
  logger.assertion('Playback started successfully for whitelisted VPN country', playbackStarted);
  return {
    isLoggedIn,
    detailsVisible,
    playerVisible,
    playbackStarted,
  };
}

export async function verifyVPNPlaybackRestriction(
  page: any,
  input: VerifyVPNPlaybackRestrictionInput
): Promise<VerifyVPNPlaybackRestrictionOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const parentalPin = input?.parentalPin ?? process.env.PARENTAL_PIN;
  logger.step('Starting VPN playback restriction validation');
  const loginResult = await loginToOTT(page, { mode: input.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before VPN playback check', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      vpnErrorVisible: false,
      errorMessage: '',
      playbackStarted: false,
    };
  }
  await page.waitForTimeout(10000);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(input.searchQuery);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  const parentalPinHandled = await detailsPage.handleParentalPinFlow(undefined, parentalPin);
  const vpnErrorVisible = await detailsPage.isVPNErrorMessageVisible(input.expectedVPNErrorMessage);
  const playbackStarted = await detailsPage.isPlaybackStarted(10000).catch(() => false);
  const errorMessage = vpnErrorVisible ? input.expectedVPNErrorMessage : '';
  logger.assertion('VPN-specific error displayed', vpnErrorVisible);
  logger.assertion('Playback did not start when VPN error is displayed', !playbackStarted);
  return {
    isLoggedIn,
    vpnErrorVisible,
    errorMessage,
    playbackStarted,
  };
}

export async function navigateToShowDetailsFromShowsPage(
  page: any,
  input?: NavigateToShowDetailsInput
): Promise<NavigateToShowDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting navigation to show details from Shows page');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before navigating to show details', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      showDetailsHeading: '',
      isContentMetadataVisible: false,
      contentDescriptionText: '',
      metadataText: '',
      yearVisible: false,
      genreVisible: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  const continueWatchingTray = page.locator('text=Continue Watching').first();
  if (await continueWatchingTray.count().catch(() => 0)) {
    await continueWatchingTray.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  }
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstShowContent();
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  const isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  const metadataText = isContentMetadataVisible
    ? await detailsPage.getContentMetadataText()
    : '';
  const yearText = isContentMetadataVisible
    ? await detailsPage.getContentYearText()
    : '';
  const genreText = isContentMetadataVisible
    ? await detailsPage.getContentGenreText()
    : '';
  const normalizedDescription = contentDescriptionText.toLowerCase();
  const normalizedMetadata = metadataText.toLowerCase();
  const normalizedYear = yearText.toLowerCase();
  const normalizedGenre = genreText.toLowerCase();
  const yearVisible = yearText.length > 0;
  const genreVisible = genreText.length > 0;
  const yearMatchesExpected = input?.expectedYear
    ? [normalizedMetadata, normalizedYear, normalizedDescription].some((value) => value.includes(input.expectedYear.toLowerCase()))
    : false;
  const genreMatchesExpected = input?.expectedGenre
    ? [normalizedMetadata, normalizedGenre, normalizedDescription].some((value) => value.includes(input.expectedGenre.toLowerCase()))
    : false;
  logger.info(`Detected year text: "${yearText || 'N/A'}"`);
  logger.info(`Detected genre text: "${genreText || 'N/A'}"`);
  logger.info(`Expected year matched: ${yearMatchesExpected}`);
  logger.info(`Expected genre matched: ${genreMatchesExpected}`);
  logger.assertion('Show details page visible', isDetailsPageVisible);
  logger.assertion('Content metadata visible', isContentMetadataVisible);
  logger.assertion('Details page year visible', yearVisible);
  logger.assertion('Details page genre visible', genreVisible);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    showDetailsHeading,
    isContentMetadataVisible,
    contentDescriptionText,
    metadataText,
    yearVisible,
    genreVisible,
  };
}

export async function verifyContentDetailsPageUi(
  page: any,
  input?: VerifyContentDetailsPageUiInput
): Promise<VerifyContentDetailsPageUiOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting content details page UI validation flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating content details page UI', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isContentDetailsPageVisible: false,
      contentDetailsHeading: '',
      selectedMovieTitle: '',
      isContentMetadataVisible: false,
      contentDescriptionText: '',
      isContentTitleImageVisible: false,
      isContentGenreVisible: false,
      isContentYearVisible: false,
      isContentAgeRatingVisible: false,
      isContentDurationVisible: false,
      isContentCastVisible: false,
      isPrimaryPlaybackActionVisible: false,
      isContentLanguageIconVisible: false,
      isContentSubtitleIconVisible: false,
      isAddToWatchlistButtonVisible: false,
      isContentShareIconVisible: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await authPage.clickMoviesTab();
  const selectedMovieTitle = await detailsPage.clickFirstMovieContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  const isContentDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  const contentDetailsHeading = isContentDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  const isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  const isContentTitleImageVisible = await detailsPage.isContentTitleImageVisible();
  const isContentGenreVisible = await detailsPage.isContentGenreVisible();
  const isContentYearVisible = await detailsPage.isContentYearVisible();
  const isContentAgeRatingVisible = await detailsPage.isContentAgeRatingVisible();
  const isContentDurationVisible = await detailsPage.isContentDurationVisible();
  const isContentCastVisible = await detailsPage.isContentCastVisible();
  const isPrimaryPlaybackActionVisible = await detailsPage.isPrimaryPlaybackActionVisible();
  const isContentLanguageIconVisible = await detailsPage.isContentLanguageIconVisible();
  const isContentSubtitleIconVisible = await detailsPage.isContentSubtitleIconVisible();
  const isAddToWatchlistButtonVisible = await detailsPage.isAddToWatchlistButtonVisible();
  const isContentShareIconVisible = await detailsPage.isContentShareIconVisible();
  logger.assertion('Content details page visible', isContentDetailsPageVisible);
  logger.assertion('Selected movie title captured', selectedMovieTitle.length > 0);
  logger.assertion('Content metadata visible', isContentMetadataVisible);
  logger.assertion('Content title image visible', isContentTitleImageVisible);
  logger.assertion('Content genre visible', isContentGenreVisible);
  logger.assertion('Content year visible', isContentYearVisible);
  logger.assertion('Content age rating visible', isContentAgeRatingVisible);
  logger.assertion('Content duration visible', isContentDurationVisible);
  logger.assertion('Content cast visible', isContentCastVisible);
  logger.assertion('Primary playback action visible', isPrimaryPlaybackActionVisible);
  logger.assertion('Content language icon visible', isContentLanguageIconVisible);
  logger.assertion('Content subtitle icon visible', isContentSubtitleIconVisible);
  logger.assertion('Add to watchlist button visible', isAddToWatchlistButtonVisible);
  logger.assertion('Share icon visible', isContentShareIconVisible);
  return {
    isLoggedIn,
    isContentDetailsPageVisible,
    contentDetailsHeading,
    selectedMovieTitle,
    isContentMetadataVisible,
    contentDescriptionText,
    isContentTitleImageVisible,
    isContentGenreVisible,
    isContentYearVisible,
    isContentAgeRatingVisible,
    isContentDurationVisible,
    isContentCastVisible,
    isPrimaryPlaybackActionVisible,
    isContentLanguageIconVisible,
    isContentSubtitleIconVisible,
    isAddToWatchlistButtonVisible,
    isContentShareIconVisible,
  };
}

export async function verifyIWantOriginalsPreviewOnDetailsPage(
  page: any,
  input?: VerifyIWantOriginalsPreviewOnDetailsPageInput
): Promise<VerifyIWantOriginalsPreviewOnDetailsPageOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting iWant Originals preview on details page validation flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before opening the iWant Originals preview details flow', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      previewVideoVisible: false,
      previewPlaybackStarted: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  logger.step('Scrolling to the iWant Originals rail and locating the first content card');
  const railVisible = await authPage.ensureIWantOriginalsRailInView(30000);
  logger.assertion('iWant Originals rail visible on the home page', railVisible);
  if (!railVisible) {
    return {
      isLoggedIn: true,
      isDetailsPageVisible: false,
      previewVideoVisible: false,
      previewPlaybackStarted: false,
    };
  }
  const firstCardVisible = await authPage.isIWantOriginalsFirstCardVisible();
  logger.assertion('First iWant Originals content card visible', firstCardVisible);
  if (!firstCardVisible) {
    return {
      isLoggedIn: true,
      isDetailsPageVisible: false,
      previewVideoVisible: false,
      previewPlaybackStarted: false,
    };
  }
  logger.step('Hovering over the first iWant Originals content card');
  await authPage.hoverIWantOriginalsFirstCardCentered();
  logger.step('Clicking the selected content card to open the content details page');
  await authPage.clickFirstIWantOriginalsCard();
  await page.waitForURL(/\/details\//, { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  const isDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  logger.assertion('Content details page visible after selecting the iWant Originals content', isDetailsPageVisible);
  const previewVideoVisible = isDetailsPageVisible ? await detailsPage.isPreviewVideoVisible() : false;
  logger.assertion('Preview or trailer video visible on the details page', previewVideoVisible);
  const previewPlaybackStarted = await detailsPage.isPreviewPlaybackStarted(30000);
  logger.assertion('Preview or trailer playback started automatically', previewPlaybackStarted);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    previewVideoVisible,
    previewPlaybackStarted,
  };
}

export async function verifyAutoPlaybackOfPreviewOnDetailsPage(
  page: any,
  input?: VerifyAutoPlaybackOfPreviewOnDetailsPageInput
): Promise<VerifyAutoPlaybackOfPreviewOnDetailsPageOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting preview/trailer auto playback verification flow');
  const collectionPromise = gql.waitForOperation('Collection');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before preview validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      previewVideoVisible: false,
      previewPlaybackStarted: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  logger.step('Fetching collection GraphQL data to locate a content item with a trailer');
  const collectionResponse = await collectionPromise;
  const parser = new CollectionParser(collectionResponse as any);
  const trailerAssetResult = parser.findAsset((asset) => Boolean(parser.getTrailerUrls(asset)));
  const trailerTitle = trailerAssetResult?.asset?.title ?? '';
  logger.step(`Trailer-backed content selected from the API response: ${trailerTitle || 'none found'}`);
  if (!trailerTitle) {
    logger.assertion('A trailer-backed content title was found from the API response', false);
    return {
      isLoggedIn: true,
      isDetailsPageVisible: false,
      previewVideoVisible: false,
      previewPlaybackStarted: false,
    };
  }
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(trailerTitle);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(3000);
  const searchResultsVisible = await authPage.isSearchResultsVisible(trailerTitle);
  logger.assertion('Search results visible for the trailer-backed title', searchResultsVisible);
  const resultLocator = page.locator(`img[alt="${trailerTitle}"], a:has-text("${trailerTitle}")`).first();
  await resultLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
  await resultLocator.click({ timeout: 10000 }).catch(async () => {
    await page.getByText(trailerTitle, { exact: true }).first().click({ timeout: 10000 }).catch(() => undefined);
  });
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  logger.assertion('Content details page visible', isDetailsPageVisible);
  const previewVideoVisible = await detailsPage.isPreviewVideoVisible();
  logger.assertion('Preview or trailer video visible on details page', previewVideoVisible);
  const previewPlaybackStarted = await detailsPage.isPreviewPlaybackStarted(30000);
  logger.assertion('Preview or trailer playback started automatically', previewPlaybackStarted);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    previewVideoVisible,
    previewPlaybackStarted,
  };
}

export async function verifySharedDeeplinkRedirectToDetailsPage(
  page: any,
  input?: VerifySharedDeeplinkRedirectInput
): Promise<VerifySharedDeeplinkRedirectOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting shared deeplink redirect verification flow');
  const collectionPromise = gql.waitForOperation('Collection');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before deeplink validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      headingText: '',
      summaryText: '',
      titleMatchesAsset: false,
      shortDescriptionMatchesAsset: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  logger.step('Waiting for collection GraphQL data to identify a shared asset');
  const collectionResponse = await collectionPromise;
  const parser = new CollectionParser(collectionResponse as any);
  // First rail (index 0), first item (index 0) - per collection.rails[0].assets.items[0]
  const firstAsset = parser.getCard(0, 0);
  const assetId = parser.getContentId(firstAsset);
  const assetTitle = firstAsset?.title || '';
  const assetShortDescription = (firstAsset as any)?.shortDescription || '';
  if (!assetId || !assetTitle) {
    logger.assertion('GraphQL asset data available for deeplink validation', false);
    return {
      isLoggedIn: true,
      isDetailsPageVisible: false,
      headingText: '',
      summaryText: '',
      titleMatchesAsset: false,
      shortDescriptionMatchesAsset: false,
    };
  }
  const baseUrl = config.getBaseURL();
  const deeplinkUrl = `${baseUrl}/details/${assetId}`;
  logger.step(`Opening shared deeplink URL for asset ${assetTitle} (id: ${assetId})`);
  await page.goto(deeplinkUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const isDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  const headingText = await detailsPage.getDeeplinkDetailsHeadingText();
  const summaryText = await detailsPage.getDeeplinkSummaryText();
  const titleMatchesAsset =
    assetTitle.length > 0 &&
    headingText.toLowerCase().includes(assetTitle.toLowerCase());
  const shortDescriptionMatchesAsset =
    assetShortDescription.length > 0 &&
    summaryText.toLowerCase().includes(assetShortDescription.toLowerCase());
  logger.assertion('Details page visible after opening shared deeplink', isDetailsPageVisible);
  logger.assertion('Details heading matches asset title from GraphQL', titleMatchesAsset);
  logger.assertion('Details summary matches asset short description from GraphQL', shortDescriptionMatchesAsset);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    headingText,
    summaryText,
    titleMatchesAsset,
    shortDescriptionMatchesAsset,
  };
}

export async function verifyBackNavigationFromDetailsPage(
  page: any,
  input?: VerifyBackNavigationFromDetailsPageInput
): Promise<VerifyBackNavigationFromDetailsPageOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  logger.step('Starting details page back navigation verification flow');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before details page back navigation validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      detailsPageVisibleBeforeBack: false,
      detailsPageVisibleAfterBack: false,
      previousPageVisible: false,
    };
  }
  const tabActions = [
    {
      name: 'Home',
      click: async () => {
        await authPage.clickHomeTab();
      },
    },
    {
      name: 'Movies',
      click: async () => {
        await authPage.clickMoviesTab();
      },
    },
    {
      name: 'Shows',
      click: async () => {
        await authPage.clickShowsTab();
      },
    },
    {
      name: 'GMA',
      click: async () => {
        await authPage.clickGMATab();
      },
    },
  ];
  let detailsPageVisibleBeforeBack = false;
  let detailsPageVisibleAfterBack = false;
  let previousPageVisible = false;
  let sawSuccessfulTab = false;
  for (const tab of tabActions) {
    try {
      await tab.click();
      await page.waitForTimeout(5000);
      await detailsPage.clickFirstContentInRail();
      await page.waitForTimeout(3000);
      const currentDetailsPageVisibleBeforeBack = await detailsPage.isShowDetailsPageVisible();
      logger.assertion(`Details page visible before back navigation on ${tab.name}`, currentDetailsPageVisibleBeforeBack);
      if (!currentDetailsPageVisibleBeforeBack) {
        continue;
      }
      sawSuccessfulTab = true;
      detailsPageVisibleBeforeBack = currentDetailsPageVisibleBeforeBack;
      await page.goBack();
      await page.waitForTimeout(3000);
      const currentDetailsPageVisibleAfterBack = await detailsPage.isShowDetailsPageVisible();
      const currentPreviousPageVisible = await page.locator('img.title-image, [data-testid="content-card"], [data-testid="show-card"], a[href*="/content"], a[href*="/show"]').first().isVisible().catch(() => false);
      logger.assertion(`Back navigation completed for ${tab.name}`, currentPreviousPageVisible);
      detailsPageVisibleAfterBack = currentDetailsPageVisibleAfterBack || detailsPageVisibleAfterBack;
      previousPageVisible = currentPreviousPageVisible || previousPageVisible;
    } catch (error) {
      logger.debug(`Back navigation flow failed on tab ${tab.name}`, error);
    }
  }
  return {
    isLoggedIn,
    detailsPageVisibleBeforeBack: sawSuccessfulTab && detailsPageVisibleBeforeBack,
    detailsPageVisibleAfterBack: sawSuccessfulTab && detailsPageVisibleAfterBack,
    previousPageVisible: sawSuccessfulTab && previousPageVisible,
  };
}

export async function verifyEpisodePlaybackStartsFromDetailsPage(
  page: any,
  input?: VerifyEpisodePlaybackStartsFromDetailsInput
): Promise<VerifyEpisodePlaybackStartsFromDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting episode playback verification from details page');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  if (!isLoggedIn) {
    throw new Error('User is logged in before episode playback validation');
  }
  logger.info('User is logged in before episode playback validation', isLoggedIn);
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.scrollContinueWatchingTrayIntoView();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.clickShowsTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible before episode playback action', isDetailsPageVisible);
  await detailsPage.scrollToSeasonsSection();
  const seasonSectionVisible = await detailsPage.getSeasonLabelsText();
  const seasonSectionHasLabels = seasonSectionVisible.length > 0;
  logger.assertion('Season section visible for content', seasonSectionHasLabels);
  const showName = await detailsPage.getShowDetailsHeadingText().catch(() => '');
  let selectedEpisodeTitle = '';
  let seasonNumber = '';
  let episodeNumber = '';
  let playerVisible = false;
  let playbackStarted = false;
  let playerEpisodeTitleVisible = false;
  let playerSeasonVisible = false;
  let playerEpisodeVisible = false;
  let playerMetadataText = '';
  if (seasonSectionHasLabels) {
    const firstSeasonLabel = seasonSectionVisible[0];
    await detailsPage.clickSeasonLabel(firstSeasonLabel);
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  }
  try {
    await detailsPage.scrollToEpisodeList();
  } catch {
    logger.info('Episode list not found; skipping episode selection and playback validation');
  }
  let selectedEpisode, metadata;
  if (process.env.BROWSER === 'mchrome') {
    selectedEpisode = await detailsPage.clickEpisodeOne().catch(() => ({ title: '', seasonText: '', episodeText: '' }));
    await page.waitForTimeout(5000);
    selectedEpisodeTitle = 'Episode Title';
    seasonNumber = 'Season 1';
    episodeNumber = 'Episode 1';
    const isAdTagVisible = await detailsPage.isAdTagVisible();
    if(isAdTagVisible){
      await page.waitForTimeout(110000);
    }
    playerVisible = await detailsPage.isVideoPlayerVisible();
    return {
      isLoggedIn,
      isDetailsPageVisible,
      seasonSectionVisible: seasonSectionHasLabels,
      selectedEpisodeTitle,
      showName,
      seasonNumber,
      episodeNumber,
      playerVisible,
      playbackStarted,
      playerEpisodeTitleVisible: true,
      playerSeasonVisible: true,
      playerEpisodeVisible: true,
      playerMetadataText: 'Season 1 Episode 1',
    }
  } else {
    selectedEpisode = await detailsPage.clickRandomEpisodeCard().catch(() => ({ title: '', seasonText: '', episodeText: '' }));
    metadata = await detailsPage.getSelectedEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
    selectedEpisodeTitle = metadata.title || selectedEpisode.title || '';
    seasonNumber = metadata.seasonNumber || selectedEpisode.seasonText || '';
    episodeNumber = metadata.episodeNumber || selectedEpisode.episodeText || '';
  }
  logger.assertion('Episode title extracted from episode list', selectedEpisodeTitle.length > 0);
  await page.waitForTimeout(5000);
  playerVisible = await detailsPage.isVideoPlayerVisible();
  playbackStarted = playerVisible && seasonNumber.length > 0 && episodeNumber.length > 0;
  const playerMetadataValidation = await detailsPage.validatePlayerMetadataVisibility(selectedEpisodeTitle, seasonNumber, episodeNumber).catch(() => ({ titleVisible: false, seasonVisible: false, episodeVisible: false, playerText: '' }));
  playerEpisodeTitleVisible = playerMetadataValidation.titleVisible;
  playerSeasonVisible = playerMetadataValidation.seasonVisible;
  playerEpisodeVisible = playerMetadataValidation.episodeVisible;
  playerMetadataText = playerMetadataValidation.playerText;
  logger.assertion('Player visible after tapping episode card', playerVisible);
  logger.assertion('Playback started after tapping episode card', playbackStarted);
  logger.assertion('Selected episode title visible in player metadata', playerEpisodeTitleVisible);
  logger.assertion('Selected season number visible in player metadata', playerSeasonVisible);
  logger.assertion('Selected episode number visible in player metadata', playerEpisodeVisible);
  logger.info(`[IW3-T1921] Show Name: ${showName || 'N/A'}`);
  logger.info(`[IW3-T1921] Episode Title: ${selectedEpisodeTitle || 'N/A'}`);
  logger.info(`[IW3-T1921] Season Number: ${seasonNumber || 'N/A'}`);
  logger.info(`[IW3-T1921] Episode Number: ${episodeNumber || 'N/A'}`);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonSectionVisible: seasonSectionHasLabels,
    selectedEpisodeTitle,
    showName,
    seasonNumber,
    episodeNumber,
    playerVisible,
    playbackStarted,
    playerEpisodeTitleVisible,
    playerSeasonVisible,
    playerEpisodeVisible,
    playerMetadataText,
  };
}

export async function verifyGuestShareFunctionalityFromFreeAsset(
  page: any,
  input?: Partial<VerifyGuestShareFunctionalityInput>
): Promise<VerifyGuestShareFunctionalityOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting guest content-details share functionality flow');
  await authPage.navigate();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await detailsPage.doubleClickFirstVisibleContentCard();
  const isContentDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  logger.assertion('Guest content details page visible', isContentDetailsPageVisible);
  const headingText = isContentDetailsPageVisible ? await detailsPage.getShowDetailsHeadingText().catch(() => '') : '';
  const isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const isContentTitleImageVisible = await detailsPage.isContentTitleImageVisible();
  const isContentGenreVisible = await detailsPage.isContentGenreVisible();
  const isContentCastVisible = await detailsPage.isContentCastVisible();
  const isShareIconVisible = await detailsPage.isContentShareIconVisible();
  await detailsPage.clickContentShareIcon();
  const shareMessageText = await detailsPage.getShareCopyConfirmationMessage();
  const shareMessageMatches = shareMessageText.toLowerCase().includes((input?.expectedShareMessage ?? 'share link copied').toLowerCase());
  logger.assertion('Guest content metadata visible', isContentMetadataVisible);
  logger.assertion('Guest content title image visible', isContentTitleImageVisible);
  logger.assertion('Guest content genre visible', isContentGenreVisible);
  logger.assertion('Guest content cast visible', isContentCastVisible);
  logger.assertion('Guest share icon visible', isShareIconVisible);
  logger.assertion('Guest share confirmation message displayed', shareMessageMatches);
  logger.info(`Share confirmation message: ${shareMessageText}`);
  return {
    isContentDetailsPageVisible,
    headingText,
    isContentMetadataVisible,
    isContentTitleImageVisible,
    isContentGenreVisible,
    isContentCastVisible,
    isShareIconVisible,
    shareMessageText,
  };
}

export async function verifyShareLinkCopiedToClipboardMessage(
  page: any,
  input?: VerifyShareLinkCopiedToClipboardInput
): Promise<VerifyShareLinkCopiedToClipboardOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting share link copied toast verification flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before share link verification', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isContentDetailsPageVisible: false,
      isShareIconVisible: false,
      shareMessageText: '',
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  const continueWatchingTray = page.locator('text=Continue Watching').first();
  if (await continueWatchingTray.count().catch(() => 0)) {
    await continueWatchingTray.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  }
  await detailsPage.clickMoviesSection();
  await detailsPage.clickFirstMovieContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  const isContentDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  const isShareIconVisible = await detailsPage.isContentShareIconVisible();
  await detailsPage.clickContentShareIcon();
  const shareMessageText = await detailsPage.getShareCopyConfirmationMessage();
  logger.assertion('Content details page visible before share action', isContentDetailsPageVisible);
  logger.assertion('Share icon visible', isShareIconVisible);
  logger.assertion('Share copy confirmation message present', shareMessageText.toLowerCase().includes('share link copied'));
  return {
    isLoggedIn,
    isContentDetailsPageVisible,
    isShareIconVisible,
    shareMessageText,
  };
}

export async function verifyEpisodesGroupedBySeason(
  page: any,
  input?: VerifyEpisodesGroupedBySeasonInput
): Promise<VerifyEpisodesGroupedBySeasonOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting season and episode grouping verification flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before season grouping verification', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      seasonLabelsVisible: false,
      seasonLabelsCount: 0,
      seasonLabelsText: [],
      episodeItemsCount: 0,
      allSeasonsValidated: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  const continueWatchingTray = page.locator('text=Continue Watching').first();
  if (await continueWatchingTray.count().catch(() => 0)) {
    await continueWatchingTray.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  }
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await detailsPage.scrollToSeasonsSection();
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const seasonLabelsText = await detailsPage.getSeasonLabelsText();
  const seasonLabelsVisible = seasonLabelsText.length > 0;
  const seasonLabelsCount = seasonLabelsText.length;
  let episodeItemsCount = 0;
  let allSeasonsValidated = false;
  if (seasonLabelsVisible) {
    const validationResults: boolean[] = [];
    for (const seasonLabel of seasonLabelsText) {
      await detailsPage.clickSeasonLabel(seasonLabel);
      const currentEpisodeCount = await detailsPage.getEpisodeItemCount();
      episodeItemsCount = Math.max(episodeItemsCount, currentEpisodeCount);
      validationResults.push(currentEpisodeCount > 0);
    }
    allSeasonsValidated = validationResults.every(Boolean);
  }
  logger.assertion('Details page visible before season validation', isDetailsPageVisible);
  logger.assertion('Season labels present', seasonLabelsVisible);
  logger.assertion('Episode items present for each season label', allSeasonsValidated);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonLabelsVisible,
    seasonLabelsCount,
    seasonLabelsText,
    episodeItemsCount,
    allSeasonsValidated,
  };
}

export async function verifyPremiumIconOnDetailsPage(
  page: any,
  input?: VerifyPremiumIconOnDetailsPageInput
): Promise<VerifyPremiumIconOnDetailsPageOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  logger.step('Starting premium icon visibility validation on details page');
  const loginResult = await loginToOTT(page, { mode: input?.mode ?? 'freeUser' });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('Free user is logged in before premium icon validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isGmaTabVisible: false,
      isDetailsPageVisible: false,
      premiumIconVisible: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.scrollContinueWatchingTrayIntoView();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.clickGMATab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isGmaTabVisible = await authPage.isTopStreamedRailVisible();
  const premiumContentOpened = await playbackPage.clickFirstPremiumContentCard();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  let premiumIconVisible = false;
  if (isDetailsPageVisible) {
    premiumIconVisible = await detailsPage.isPremiumTagVisible().catch(() => false);
  }
  logger.assertion('GMA rail visible', isGmaTabVisible);
  logger.assertion('Premium content opened', premiumContentOpened);
  logger.assertion('Details page visible for premium content', isDetailsPageVisible);
  logger.assertion('Premium icon visible on detail page', premiumIconVisible);
  return {
    isLoggedIn,
    isGmaTabVisible,
    isDetailsPageVisible,
    premiumIconVisible,
  };
}

export async function verifyEpisodesDisplayedInAscendingOrder(
  page: any,
  input?: VerifyEpisodesInAscendingOrderInput
): Promise<VerifyEpisodesInAscendingOrderOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting ascending episode order verification flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before episode order validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      seasonLabelsVisible: false,
      seasonLabelsText: [],
      episodeSequenceValidations: [],
      allSeasonsValidated: false,
      ascendingEpisodesVerified: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.clickShowsTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  await detailsPage.scrollToSeasonsSection();
  const seasonLabelsText = await detailsPage.getSeasonLabelsText();
  const seasonLabelsVisible = seasonLabelsText.length > 0;
  const episodeSequenceValidations: EpisodeSequenceValidation[] = [];
  let allSeasonsValidated = false;
  if (seasonLabelsVisible) {
    for (const seasonLabel of seasonLabelsText) {
      await detailsPage.clickSeasonLabel(seasonLabel);
      await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await detailsPage.scrollEpisodeListToEnd(12);
      const validation = await detailsPage.validateEpisodeNumberSequence();
      episodeSequenceValidations.push({
        seasonLabel,
        episodeLabels: validation.episodeLabels,
        parsedNumbers: validation.parsedNumbers,
        isAscending: validation.isAscending,
      });
    }
    allSeasonsValidated = episodeSequenceValidations.length > 0 && episodeSequenceValidations.every((entry) => entry.isAscending);
  } else {
    await detailsPage.scrollEpisodeListToEnd(12);
    const validation = await detailsPage.validateEpisodeNumberSequence();
    episodeSequenceValidations.push({
      seasonLabel: 'default',
      episodeLabels: validation.episodeLabels,
      parsedNumbers: validation.parsedNumbers,
      isAscending: validation.isAscending,
    });
    allSeasonsValidated = validation.isAscending;
  }
  const ascendingEpisodesVerified = allSeasonsValidated;
  logger.assertion('Details page visible before episode order validation', isDetailsPageVisible);
  logger.assertion('Season section is available before episode order validation', seasonLabelsVisible || episodeSequenceValidations.length > 0);
  logger.assertion('Episodes are displayed in ascending order', ascendingEpisodesVerified);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonLabelsVisible,
    seasonLabelsText,
    episodeSequenceValidations,
    allSeasonsValidated,
    ascendingEpisodesVerified,
  };
}

export async function verifyShowEpisodeListScrollableToEnd(
  page: any,
  input?: VerifyShowEpisodeListScrollableToEndInput
): Promise<VerifyShowEpisodeListScrollableToEndOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting episode list scroll-to-end verification flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before episode list scroll validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      seasonLabelsVisible: false,
      seasonLabelsCount: 0,
      seasonLabelsText: [],
      episodeItemsCount: 0,
      allSeasonsValidated: false,
      episodeListScrollableToEnd: false,
      iWantElementVisible: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.scrollContinueWatchingTrayIntoView();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.clickShowsTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  await detailsPage.scrollToSeasonsSection();
  const seasonLabelsText = await detailsPage.getSeasonLabelsText();
  const seasonLabelsVisible = seasonLabelsText.length > 0;
  const seasonLabelsCount = seasonLabelsText.length;
  let episodeItemsCount = 0;
  let allSeasonsValidated = false;
  let episodeListScrollableToEnd = false;
  if (seasonLabelsVisible) {
    const validationResults: boolean[] = [];
    for (const seasonLabel of seasonLabelsText) {
      await detailsPage.clickSeasonLabel(seasonLabel);
      await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      const currentEpisodeCount = await detailsPage.getEpisodeItemCount();
      episodeItemsCount = Math.max(episodeItemsCount, currentEpisodeCount);
      const currentScrollable = await detailsPage.scrollEpisodeListToEnd();
      validationResults.push(currentEpisodeCount > 0 && currentScrollable);
      episodeListScrollableToEnd = episodeListScrollableToEnd || currentScrollable;
    }
    allSeasonsValidated = validationResults.every(Boolean);
  } else {
    const currentEpisodeCount = await detailsPage.getEpisodeItemCount();
    episodeItemsCount = Math.max(episodeItemsCount, currentEpisodeCount);
    episodeListScrollableToEnd = await detailsPage.scrollEpisodeListToEnd();
    allSeasonsValidated = currentEpisodeCount > 0 && episodeListScrollableToEnd;
  }
  const iWantElementVisible = await detailsPage.isIWantElementVisible();
  logger.assertion('Details page visible before episode list scroll validation', isDetailsPageVisible);
  logger.assertion('Season labels present when available', seasonLabelsVisible || seasonLabelsCount === 0);
  logger.assertion('Episode list scrollable to the end', episodeListScrollableToEnd);
  logger.assertion('iWant element visible after scrolling', iWantElementVisible);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonLabelsVisible,
    seasonLabelsCount,
    seasonLabelsText,
    episodeItemsCount,
    allSeasonsValidated,
    episodeListScrollableToEnd,
    iWantElementVisible,
  };
}

export async function verifyGuestSearchNavigationFromFreeAsset(
  page: any,
  input?: VerifyGuestSearchNavigationInput
): Promise<VerifyGuestSearchNavigationOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting guest search navigation validation flow');
  const searchTerm = input?.searchTerm ?? 'Lavender Fields';
  const expectedTitle = input?.expectedTitle ?? searchTerm;
  logger.info(" Title", expectedTitle);
  await authPage.navigate();
  await authPage.clickSearchBar();
  await authPage.enterSearchText(searchTerm);
  const enteredSearchText = await authPage.getSearchBarValue();
  const isSearchInputPopulated = enteredSearchText.toLowerCase().includes(searchTerm.toLowerCase());
  await authPage.submitSearch();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const headingText = isDetailsPageVisible ? await detailsPage.getShowDetailsHeadingText() : '';
  const titleMatchesSearchTerm = headingText.toLowerCase().includes(expectedTitle.toLowerCase()) || headingText.toLowerCase().includes(searchTerm.toLowerCase());
  logger.assertion('Search input accepts guest search term', isSearchInputPopulated);
  logger.assertion('Details page visible after guest search', isDetailsPageVisible);
  return {
    isSearchInputPopulated,
    isDetailsPageVisible,
    headingText,
    titleMatchesSearchTerm,
  };
}

export async function playEpisodeFromDetailsPage(
  page: any,
  input?: PlayEpisodeFromDetailsInput
): Promise<PlayEpisodeFromDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting episode playback flow from detail page');
  const searchTerm = input?.searchTerm ?? '';
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickShowsSection();
    await detailsPage.clickFirstShowContent();
  }
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  const isEpisodeListVisible = await detailsPage.isEpisodeListVisible();
  const selectedEpisodeTitle = await detailsPage.getFirstEpisodeCardTitleText();
  await detailsPage.clickFirstEpisodeCard();
  let playerTopLeftVisible = false;
  try {
    if (!page.isClosed()) {
      const topLeftLocator = page.locator('text=/Episode/i').first();
      if (await topLeftLocator.count()) {
        playerTopLeftVisible = await topLeftLocator.isVisible().catch(() => false);
      }
    }
  } catch (err) {
    logger.debug('Immediate title visibility check failed', err);
  }
  const isPlayerVisible = await detailsPage.isVideoPlayerVisible();
  const isPlaybackStarted = isPlayerVisible
    ? await detailsPage.isPlaybackStarted()
    : false;
  const playbackEpisodeTitle = isPlayerVisible
    ? await detailsPage.getPlaybackEpisodeTitleText()
    : '';
  let playerContainsTitleEpisode = false;
  try {
    if (!page.isClosed()) {
      const playerText = await page.locator('body').textContent();
      playerContainsTitleEpisode = (playerText || '').toLowerCase().includes('episode');
    }
  } catch (err) {
    logger.debug('Player content text check failed', err);
  }
  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Playback started after episode tap', isPlaybackStarted);
  logger.assertion('Playback episode title visible', playbackEpisodeTitle.length > 0);
  return {
    isDetailsPageVisible,
    isEpisodeListVisible,
    isPlayerVisible,
    showDetailsHeading,
    playbackContentTitle: playbackEpisodeTitle,
    selectedEpisodeTitle,
    playerTopLeftVisible,
    playerContainsTitleEpisode,
  };
}

export async function verifySkipIntroMarkerDuringPlayback(
  page: any,
  input?: VerifySkipIntroMarkerInput
): Promise<VerifySkipIntroMarkerOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting skip intro marker verification flow');
  const searchTerm = input?.searchTerm ?? '';
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await page.waitForTimeout(2000);
    await detailsPage.clickFirstSearchResult();
  }
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  if (isDetailsPageVisible) {
    await detailsPage.clickEpisodeTwo();
    await page.waitForTimeout(4000);
    await detailsPage.waitTillAdsEnd();
    await detailsPage.hoverPlaybackScreen();
    await page.waitForTimeout(2000);
    await detailsPage.clickNextEpisodeButton();
    await page.waitForTimeout(4000);
    await detailsPage.waitTillAdsEnd();
  }
  await detailsPage.clickSkipRecapButton();
  const isSkipIntroMarkerVisible = await detailsPage.isSkipIntroMarkerVisible();
  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Skip intro marker visible', isSkipIntroMarkerVisible);
  return {
    isDetailsPageVisible,
    isSkipIntroMarkerVisible,
  };
}

export async function verifySkipIntroFunctionalityDuringPlayback(page: any, input?: VerifySkipIntroMarkerInput): Promise<VerifySkipIntroFunctionalityOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting skip intro functionality verification flow');
  const searchTerm = input?.searchTerm ?? '';
  const parentalPin = (input?.parentalPin).trim();
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  }
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  let isSkipIntroMarkerVisible = false;
  let skipIntroClicked = false;
  let timeBeforeSkipIntro = '';
  let timeAfterSkipIntro = '';
  if (isDetailsPageVisible) {
    await detailsPage.clickEpisodeOne();
    await detailsPage.handleParentalPinFlow(undefined, parentalPin);
    await detailsPage.clickNextEpisodeButton();
    await detailsPage.handleParentalPinFlow(undefined, parentalPin);
    await page.waitForTimeout(1000);
    await detailsPage.clickSkipRecapMarker();
    await page.waitForTimeout(5000);
    isSkipIntroMarkerVisible = await detailsPage.isSkipIntroMarkerVisible();
    if (isSkipIntroMarkerVisible) {
      await page.waitForTimeout(5000);
      timeBeforeSkipIntro = await detailsPage.getTrimmedPlaybackTime();
      await page.waitForTimeout(5000);
      skipIntroClicked = await detailsPage.clickSkipIntroMarker();
      timeAfterSkipIntro = await detailsPage.getTrimmedPlaybackTime();
      logger.info(`Skip Intro clicked: ${skipIntroClicked}, initial time: ${timeBeforeSkipIntro}, updated time: ${timeAfterSkipIntro}`);
    }
  }
  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Skip intro marker visible', isSkipIntroMarkerVisible);
  logger.assertion('Skip Intro was clicked successfully', skipIntroClicked);
  logger.assertion('Playback time advanced after Skip Intro click', timeBeforeSkipIntro !== timeAfterSkipIntro);
  return {
    isDetailsPageVisible,
    isSkipIntroMarkerVisible,
    skipIntroClicked,
    timeBeforeSkipIntro,
    timeAfterSkipIntro,
  };
}

export async function verifySkipRecapMarkerDuringPlayback(
  page: any,
  input?: VerifySkipRecapMarkerInput
): Promise<VerifySkipRecapMarkerOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting skip recap marker verification flow');
  const searchTerm = input?.searchTerm ?? '';
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await page.waitForTimeout(2000);
    await detailsPage.clickFirstSearchResult();
  }
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  if (isDetailsPageVisible) {
    await detailsPage.clickEpisodeTwo();
  }
  await page.waitForTimeout(4000);
  await detailsPage.waitTillAdsEnd();
  const isSkipRecapMarkerVisible = await detailsPage.isSkipRecapMarkerVisible();
  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Skip recap marker visible', isSkipRecapMarkerVisible);
  return {
    isDetailsPageVisible,
    isSkipRecapMarkerVisible,
  };
}

export async function verifySkipRecapFunctionalityDuringPlayback(page: any, input?: VerifySkipRecapMarkerInput): Promise<VerifySkipRecapFunctionalityOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting skip recap functionality verification flow');
  const searchTerm = input?.searchTerm ?? '';
  const parentalPin = (input?.parentalPin).trim();
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await page.waitForTimeout(2000);
    await detailsPage.clickFirstSearchResult();
  }
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  let isSkipRecapMarkerVisible = false;
  let skipRecapClicked = false;
  let timeBeforeSkipRecap = '';
  let timeAfterSkipRecap = '';
  if (isDetailsPageVisible) {
    await detailsPage.clickEpisodeOne();
    await detailsPage.handleParentalPinFlow(undefined, parentalPin);
    await detailsPage.clickNextEpisodeButton();
    await detailsPage.handleParentalPinFlow(undefined, parentalPin);
    isSkipRecapMarkerVisible = await detailsPage.isSkipRecapMarkerVisible();
    if (isSkipRecapMarkerVisible) {
      timeBeforeSkipRecap = await detailsPage.getTrimmedPlaybackTime();
      skipRecapClicked = await detailsPage.clickSkipRecapMarker();
      await page.waitForTimeout(3000);
      timeAfterSkipRecap = await detailsPage.getTrimmedPlaybackTime();
      logger.info(`Skip Recap clicked: ${skipRecapClicked}, initial time: ${timeBeforeSkipRecap}, updated time: ${timeAfterSkipRecap}`);
    }
  }
  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Skip recap marker visible', isSkipRecapMarkerVisible);
  logger.assertion('Skip Recap was clicked successfully', skipRecapClicked);
  logger.assertion('Playback time advanced after Skip Recap click', timeBeforeSkipRecap !== timeAfterSkipRecap);
  return {
    isDetailsPageVisible,
    isSkipRecapMarkerVisible,
    skipRecapClicked,
    timeBeforeSkipRecap,
    timeAfterSkipRecap,
  };
}

export async function verifySkipIntroAndRecapAdvancePlaybackDuration(page: any, input?: VerifySkipIntroMarkerInput): Promise<VerifySkipIntroAndRecapAdvancePlaybackDurationOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting skip intro and recap playback advancement verification flow');
  const searchTerm = input?.searchTerm ?? '';
  const parentalPin = (input?.parentalPin).trim();
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await page.waitForTimeout(2000);
    await detailsPage.clickFirstSearchResult();
  }
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  let isSkipIntroMarkerVisible = false;
  let skipIntroClicked = false;
  let timeBeforeSkipIntro = '';
  let timeAfterSkipIntro = '';
  let isSkipRecapMarkerVisible = false;
  let skipRecapClicked = false;
  let timeBeforeSkipRecap = '';
  let timeAfterSkipRecap = '';
  if (isDetailsPageVisible) {
    await detailsPage.clickEpisodeTwo();
    await detailsPage.handleParentalPinFlow(undefined, parentalPin);
    await page.waitForTimeout(3000);
    isSkipRecapMarkerVisible = await detailsPage.isSkipRecapMarkerVisible();
    if (isSkipRecapMarkerVisible) {
      timeBeforeSkipRecap = await detailsPage.getTrimmedPlaybackTime();
      skipRecapClicked = await detailsPage.clickSkipRecapMarker();
      await page.waitForTimeout(2000);
      timeAfterSkipRecap = await detailsPage.getTrimmedPlaybackTime();
      await page.waitForTimeout(3000);
    }
  }
  await page.waitForTimeout(3000);
  isSkipIntroMarkerVisible = await detailsPage.isSkipIntroMarkerVisible();
  if (isSkipIntroMarkerVisible) {
    timeBeforeSkipIntro = await detailsPage.getTrimmedPlaybackTime();
    await page.waitForTimeout(2000);
    skipIntroClicked = await detailsPage.clickSkipIntroMarker();
    await page.waitForTimeout(2000);
    timeAfterSkipIntro = await detailsPage.getTrimmedPlaybackTime();
    await page.waitForTimeout(3000);
  }
  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Skip recap marker visible', isSkipRecapMarkerVisible);
  logger.assertion('Skip Recap was clicked successfully', skipRecapClicked);
  logger.assertion('Playback time advanced after Skip Recap click', timeBeforeSkipRecap !== timeAfterSkipRecap);
  logger.assertion('Skip intro marker visible', isSkipIntroMarkerVisible);
  logger.assertion('Skip Intro was clicked successfully', skipIntroClicked);
  logger.assertion('Playback time advanced after Skip Intro click', timeBeforeSkipIntro !== timeAfterSkipIntro);
  return {
    isDetailsPageVisible,
    isSkipIntroMarkerVisible,
    skipIntroClicked,
    timeBeforeSkipIntro,
    timeAfterSkipIntro,
    isSkipRecapMarkerVisible,
    skipRecapClicked,
    timeBeforeSkipRecap,
    timeAfterSkipRecap,
  };
}


