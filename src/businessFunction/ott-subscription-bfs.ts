import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { logger } from '../utils/logger';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';
import { loginToOTT } from './ott-auth-bfs';
import { config } from '../utils/config-manager';
import { TVShowEpisodesParser } from '../utils/graphql/parsers/tv-show-episodes-parser';

export interface VerifySubscribeToWatchInput {
  mode?: string;
  graphqlQueryName?: string;
  searchTerm?: string;
}

export interface VerifyPremiumCrownIconOnSearchResultsInput {
  mode?: string;
  graphqlQueryName?: string;
  expectedMonetizationType?: string;
}

export interface VerifyPremiumCrownIconOnSearchResultsOutput {
  searchResultsVisible: boolean;
  premiumCrownIconVisible: boolean;
  firstSearchResultMonetizationType: string;
  premiumAssetTitle: string;
}

export interface VerifySubscribeToWatchOutput {
  isDetailsPageVisible: boolean;
  isSubscribeToWatchCtaVisible: boolean;
}

export interface VerifySubscribeToWatchRedirectToAccountOutput {
  isDetailsPageVisible: boolean;
  playerSubscribeCtaClicked: boolean;
  accountScreenVisible: boolean;
  iWantIconVisible: boolean;
  urlContainsAccount: boolean;
}

export interface UpgradePlanNavigationInput {
  mode?: string;
}

export interface UpgradePlanNavigationOutput {
  isGmaTabVisible: boolean;
  isUpgradePlanVisible: boolean;
  isPlansPageVisible: boolean;
}

export interface VerifyGuestSubscribeNavigationInput {
  expectedHeading?: string;
}

export interface VerifyGuestSubscribeNavigationOutput {
  isLoginScreenVisible: boolean;
  headingText: string;
  isEmailFieldVisible: boolean;
  isPasswordFieldVisible: boolean;
}

export interface VerifyGuestSubscribeCarouselNavigationInput {
  expectedHeading?: string;
  query?: string;
  graphqlQueryName?: string;
}

export interface VerifyGuestSubscribeCarouselNavigationOutput {
  resultsVisible: boolean;
  isDetailsPageVisible: boolean;
  isLoginScreenVisible: boolean;
  headingText: string;
  isEmailFieldVisible: boolean;
  isPasswordFieldVisible: boolean;
}

export interface VerifyGmaSubscriptionInstructionInput {
  mode?: string;
}

export interface VerifyGmaSubscriptionInstructionOutput {
  isLoggedIn: boolean;
  isGmaTabVisible: boolean;
  isPremiumContentOpened: boolean;
  isSubscriptionInstructionVisible: boolean;
  subscriptionInstructionText: string;
}

export interface VerifySubscribeCtaOnGmaDetailsPageInput {
  mode?: string;
}

export interface VerifySubscribeCtaOnGmaDetailsPageOutput {
  isLoggedIn: boolean;
  isGmaTabVisible: boolean;
  isDetailsPageVisible: boolean;
  isSubscribeToWatchCtaVisible: boolean;
}

export interface VerifyPremiumContentDeepLinkSubscriptionBlockerInput {
  mode?: string;
}

export interface VerifyPremiumContentDeepLinkSubscriptionBlockerOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  isSubscribeToWatchCtaVisible: boolean;
  isPlaybackBlocked: boolean;
  detailHeadingText: string;
}

export async function verifySubscribeCtaOnGmaDetailsPage(
  page: any,
  input?: VerifySubscribeCtaOnGmaDetailsPageInput
): Promise<VerifySubscribeCtaOnGmaDetailsPageOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  logger.step('Starting GMA details-page subscribe CTA validation flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('Free user is logged in before GMA details CTA validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isGmaTabVisible: false,
      isDetailsPageVisible: false,
      isSubscribeToWatchCtaVisible: false,
    };
  }
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
  let isSubscribeToWatchCtaVisible = false;
  if (isDetailsPageVisible) {
    isSubscribeToWatchCtaVisible = await detailsPage.isSubscribeToWatchCtaVisible().catch(() => false);
  }
  logger.assertion('GMA tab rail visible', isGmaTabVisible);
  logger.assertion('Premium content opened', premiumContentOpened);
  logger.assertion('Details page visible for premium content', isDetailsPageVisible);
  logger.assertion('Subscribe to watch CTA visible', isSubscribeToWatchCtaVisible);
  return {
    isLoggedIn,
    isGmaTabVisible,
    isDetailsPageVisible,
    isSubscribeToWatchCtaVisible,
  };
}

export async function verifySubscribeToWatchCTA(
  page: any,
  input?: VerifySubscribeToWatchInput
): Promise<VerifySubscribeToWatchOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting subscribe-to-watch CTA verification flow');
  const searchTerm = input?.searchTerm ?? '';
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  }
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  if (isDetailsPageVisible) {
    await detailsPage.clickPremiumTagIcon();
  }
  const isSubscribeToWatchCtaVisible = isDetailsPageVisible
    ? await detailsPage.isSubscribeToWatchCtaVisible()
    : false;
  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Subscribe to watch CTA visible', isSubscribeToWatchCtaVisible);
  return {
    isDetailsPageVisible,
    isSubscribeToWatchCtaVisible,
  };
}

export async function verifyPremiumCrownIconOnSearchResults(
  page: any,
  input?: VerifyPremiumCrownIconOnSearchResultsInput
): Promise<VerifyPremiumCrownIconOnSearchResultsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  logger.step('Starting premium crown icon validation flow on search results');
  await authPage.navigate();
  logger.info('NAVIGATED TO OTT HOME PAGE');
  const collectionResponse = await gql.waitForOperation(input?.graphqlQueryName ?? 'Collection');
  const parser = new CollectionParser(collectionResponse as any);
  const premiumAsset = parser.findAsset((asset: any) => {
    const monetType = asset.monetization?.type
      ?? asset.monetizationType
      ?? asset.pricing?.type
      ?? asset.pricing?.pricingType
      ?? '';
    return /premium|paid|subscription|paywall|purchase/i.test(String(monetType));
  });
  const premiumAssetTitle = premiumAsset?.asset?.title ?? '';
  const firstSearchResultMonetizationType = premiumAssetTitle
    ? String(premiumAsset?.asset?.monetization?.type
      ?? premiumAsset?.asset?.monetizationType
      ?? premiumAsset?.asset?.pricing?.type
      ?? premiumAsset?.asset?.pricing?.pricingType
      ?? '')
    : '';
  if (!premiumAssetTitle) {
    logger.assertion('Premium asset title found in Collection GraphQL', false);
    return {
      searchResultsVisible: false,
      premiumCrownIconVisible: false,
      firstSearchResultMonetizationType,
      premiumAssetTitle: '',
    };
  }
  await authPage.clickSearchBar();
  await authPage.enterSearchText(premiumAssetTitle);
  await authPage.submitSearch();
  const searchResultsVisible = await authPage.isSearchResultsVisible(premiumAssetTitle);
  const searchResultMonetizationType = await detailsPage.getFirstSearchResultMonetizationType().catch(() => '');
  const premiumCrownIconVisible = await detailsPage.isPremiumCrownIconVisibleOnFirstSearchResult().catch(() => false);
  logger.assertion('Search results visible for premium content query', searchResultsVisible);
  logger.assertion(
    `Search result monetization type is premium: ${searchResultMonetizationType}`,
    /premium|paid|subscription|paywall|purchase/i.test(searchResultMonetizationType)
  );
  logger.assertion('Premium crown icon visible on first search result thumbnail', premiumCrownIconVisible);
  return {
    searchResultsVisible,
    premiumCrownIconVisible,
    firstSearchResultMonetizationType: searchResultMonetizationType,
    premiumAssetTitle,
  };
}

export async function verifySubscribeToWatchRedirectsToAccountScreen(
  page: any,
  input?: VerifySubscribeToWatchInput
): Promise<VerifySubscribeToWatchRedirectToAccountOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  logger.step('Starting subscribe-to-watch redirect to account screen verification flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode ?? 'freeUser' });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('Free user is logged in before subscribe CTA redirect validation', isLoggedIn);
  const collectionResponse = await gql.waitForOperation(input?.graphqlQueryName ?? 'Collection');
  const parser = new CollectionParser(collectionResponse as any);
  const premiumAsset = parser.findAsset((asset: any) => {
    const monetType = String(
      asset.monetType ??
      asset.monetization?.type ??
      asset.monetizationType ??
      asset.pricing?.type ??
      asset.pricing?.pricingType ??
      ''
    ).toLowerCase();
    const contentOwner = String(
      asset.contentOwner ??
      asset.owner ??
      asset.provider ??
      asset.network ??
      ''
    ).toLowerCase();
    return monetType === 'paid' && contentOwner === 'gma';
  });
  const premiumAssetTitle = premiumAsset?.asset?.title ?? '';
  const firstSearchResultMonetizationType = premiumAssetTitle
    ? String(
      premiumAsset?.asset?.monetization?.type ??
      premiumAsset?.asset?.monetizationType ??
      premiumAsset?.asset?.pricing?.type ??
      premiumAsset?.asset?.pricing?.pricingType ??
      ''
    )
    : '';
  if (!premiumAssetTitle) {
    logger.assertion('Premium asset title found in Collection GraphQL', false);
  }
  await authPage.clickSearchBar();
  await authPage.enterSearchText(premiumAssetTitle);
  await authPage.submitSearch();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible().catch(() => false);
  let subscribeCtaClicked = false;
  let playerSubscribeCtaClicked = false;
  logger.assertion('Details page visible after opening search result', isDetailsPageVisible);
  await detailsPage.clickSubscribeToWatchCta();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.clickSubscribeToWatchCtaBlocker();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const redirectVerification = await detailsPage.getAccountRedirectVerification();
  const accountScreenVisible = redirectVerification.accountScreenVisible;
  const iWantIconVisible = redirectVerification.iWantIconVisible;
  const urlContainsAccount = redirectVerification.urlContainsAccount;
  logger.assertion('Account screen visible after subscribe CTA redirect', accountScreenVisible);
  logger.assertion('iWant icon visible on redirected account screen', iWantIconVisible);
  logger.assertion('Page URL contains account or profile keywords', urlContainsAccount);
  return {
    isDetailsPageVisible,
    playerSubscribeCtaClicked,
    accountScreenVisible,
    iWantIconVisible,
    urlContainsAccount,
  }
}

export async function verifyPremiumContentDeepLinkSubscriptionBlocker(
  page: any,
  input?: VerifyPremiumContentDeepLinkSubscriptionBlockerInput
): Promise<VerifyPremiumContentDeepLinkSubscriptionBlockerOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting premium deep-link subscription blocker validation flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode ?? 'valid' });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before premium deep-link validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      isSubscribeToWatchCtaVisible: false,
      isPlaybackBlocked: false,
      detailHeadingText: '',
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  logger.step('Waiting for collection GraphQL data to identify premium content');
  const collectionResponse = await gql.waitForOperation('Collection');
  const collectionParser = new CollectionParser(collectionResponse as any);
  let premiumAsset: any | null = null;
  for (let railIndex = 0; railIndex < collectionParser.getRails().length; railIndex += 1) {
    const cards = collectionParser.getCards(railIndex);
    premiumAsset = cards.find((card: any) => card?.monetization?.type === 'paid') || null;
    if (premiumAsset) {
      break;
    }
  }
  const premiumContentId = premiumAsset ? collectionParser.getContentId(premiumAsset) : undefined;
  logger.assertion('Premium content ID was resolved from collection GraphQL data', !!premiumContentId);
  if (!premiumContentId) {
    return {
      isLoggedIn: true,
      isDetailsPageVisible: false,
      isSubscribeToWatchCtaVisible: false,
      isPlaybackBlocked: false,
      detailHeadingText: '',
    };
  }
  const baseUrl = config.getBaseURL();
  const detailsUrl = `${baseUrl}/details/${premiumContentId}`;
  logger.step('Opening premium content details deep link');
  await page.goto(detailsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  logger.step('Waiting for TV show episode GraphQL data for the premium content');
  const episodeResponse = await gql.waitForOperationMatching(
    ({ response }: any) => {
      const episodeItems = response?.data?.tvShowEpisodes?.items || response?.data?.tvShow?.episodes || [];
      return Array.isArray(episodeItems) && episodeItems.some((episode: any) => episode?.monetization?.type === 'paid');
    },
    60000
  );
  const episodeParser = new TVShowEpisodesParser(episodeResponse as any);
  const paidEpisode = episodeParser.findEpisode((episode) => episode.monetization?.type === 'paid');
  const paidEpisodeId = episodeParser.getContentId(paidEpisode);
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Premium episode ID was resolved from TV show episodes GraphQL data', !!paidEpisodeId);
  if (!paidEpisodeId) {
    return {
      isLoggedIn: true,
      isDetailsPageVisible: false,
      isSubscribeToWatchCtaVisible: false,
      isPlaybackBlocked: false,
      detailHeadingText: '',
    };
  }
  const playerUrl = `${baseUrl}/player/${paidEpisodeId}`;
  logger.step('Opening premium episode player deep link');
  await page.goto(playerUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await detailsPage.clickPlayVideoOverlayButton();
  await page.waitForTimeout(3000);
  const isSubscribeToWatchCtaVisible = await detailsPage.isSubscribeToWatchCtaVisible().catch(() => false);
  const premiumGateVisible = await playbackPage.isPremiumContentGateVisible().catch(() => false);
  const maybeLaterVisible = await playbackPage.isMaybeLaterVisible().catch(() => false);
  const subscribeToWatchVisible = await playbackPage.isSubscribeToWatchVisible().catch(() => false);
  const blockerVisible = isSubscribeToWatchCtaVisible || premiumGateVisible || maybeLaterVisible || subscribeToWatchVisible;
  const isPlaybackBlocked = blockerVisible;
  const detailHeadingText = isDetailsPageVisible || blockerVisible
    ? await detailsPage.getShowDetailsHeadingText().catch(() => '')
    : '';
  logger.assertion('Details page is visible after premium deep-link navigation', isDetailsPageVisible);
  logger.assertion('Subscribe to watch CTA is visible for premium deep-link content', isSubscribeToWatchCtaVisible);
  logger.assertion('Premium deep-link access is blocked for a non-subscriber', isPlaybackBlocked);
  return {
    isLoggedIn,
    isDetailsPageVisible,
    isSubscribeToWatchCtaVisible,
    isPlaybackBlocked,
    detailHeadingText,
  };
}

export async function verifyGuestSubscribeNavigationFromFreeAsset(
  page: any,
  input?: Partial<VerifyGuestSubscribeNavigationInput>
): Promise<VerifyGuestSubscribeNavigationOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting guest subscribe CTA navigation validation flow');
  await authPage.navigate();
  await detailsPage.clickCinemaOnePhSection();
  await detailsPage.clickLoginCta();
  const isLoginScreenVisible = await authPage.isWelcomeHeadingVisible();
  const headingText = isLoginScreenVisible ? await authPage.getWelcomeHeadingText() : '';
  const isEmailFieldVisible = await authPage.isEmailFieldVisible();
  const isPasswordFieldVisible = await authPage.isPasswordFieldVisible();
  logger.assertion('Login screen visible after guest subscribe CTA click', isLoginScreenVisible);
  return {
    isLoginScreenVisible,
    headingText,
    isEmailFieldVisible,
    isPasswordFieldVisible,
  };
}

export async function verifySubscriptionInstructionPopupOnGmaContent(
  page: any,
  input?: VerifyGmaSubscriptionInstructionInput
): Promise<VerifyGmaSubscriptionInstructionOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  logger.step('Starting GMA subscription instruction popup validation flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode ?? 'freeUser' });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('Free user logged in before GMA subscription prompt validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isGmaTabVisible: false,
      isPremiumContentOpened: false,
      isSubscriptionInstructionVisible: false,
      subscriptionInstructionText: '',
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await detailsPage.scrollContinueWatchingTrayIntoView();
  await authPage.clickGMATab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const isGmaTabVisible = await authPage.isTopStreamedRailVisible();
  const isPremiumContentOpened = await playbackPage.clickFirstPremiumContentCard();
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await page.waitForTimeout(2000);
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible().catch(() => false);
  if (isDetailsPageVisible) {
    await detailsPage.clickSubscribeCTA();
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  }
  const isSubscriptionInstructionVisible = await detailsPage.isSubscriptionInstructionPromptVisible();
  const subscriptionInstructionText = isSubscriptionInstructionVisible
    ? await detailsPage.getSubscriptionInstructionPromptText()
    : '';
  logger.assertion('GMA tab rail visible', isGmaTabVisible);
  logger.assertion('Premium content opened within GMA tab', isPremiumContentOpened);
  logger.assertion('Subscription instruction prompt visible', isSubscriptionInstructionVisible);
  return {
    isLoggedIn,
    isGmaTabVisible,
    isPremiumContentOpened,
    isSubscriptionInstructionVisible,
    subscriptionInstructionText,
  };
}

export async function navigateToUpgradePlanFromSubscriptionBlocker(
  page: any,
  input?: UpgradePlanNavigationInput
): Promise<UpgradePlanNavigationOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting upgrade plan navigation flow');
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('Free user logged in before upgrade-plan navigation validation', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isGmaTabVisible: false,
      isUpgradePlanVisible: false,
      isPlansPageVisible: false,
    };
  }
  await authPage.clickGMATab();
  const isGmaTabVisible = await authPage.isTopStreamedRailVisible();
  await detailsPage.clickSubscribeToWatchCta();
  await detailsPage.clickSubscribeToWatchCtaBlocker();
  const isUpgradePlanVisible = await detailsPage.isUpgradePlanButtonVisible();
  if (isUpgradePlanVisible) {
    await detailsPage.clickUpgradePlanButton();
  }
  const isPlansPageVisible = await detailsPage.isPlansPageVisible();
  logger.assertion('GMA tab rail visible', isGmaTabVisible);
  logger.assertion('Upgrade Plan CTA visible', isUpgradePlanVisible);
  logger.assertion('Plans & Payment page visible', isPlansPageVisible);
  return {
    isGmaTabVisible,
    isUpgradePlanVisible,
    isPlansPageVisible,
  };
}
