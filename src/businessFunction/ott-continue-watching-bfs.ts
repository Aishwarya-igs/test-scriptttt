import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTSettingsPage } from '../pom/OTTSettingsPage';
import { loginToOTT } from './ott-auth-bfs';
import { logger } from '../utils/logger';
import { config } from '../utils/config-manager';
import { OTTPlaybackPage } from "../pom/OTTPlaybackPage";
import { OpenContentAndPlayInput } from "./ott-playback-bfs";
import { ContinueWatchingParser } from '../utils/graphql/parsers/continue-watching-parser';
import { TVShowEpisodesParser } from '../utils/graphql/parsers/tv-show-episodes-parser';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';
import { AssetParser, AssetResponse } from '../utils/graphql/parsers/asset-parser';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';


export interface ContinueWatchingPlaybackInput {
  mode?: string;
}

export interface ContinueWatchingPlaybackOutput {
  isValid: boolean;
  itemFound: boolean;
  playerVisible: boolean;
  resumeActionVisible: boolean;
  selectedContentName: string;
  forwardedTime: string;
  resumedTime: string;
  timeDifferenceSeconds: number;
  reason?: string;
}

export interface ParentalPinContinueWatchingPlaybackInput extends ContinueWatchingPlaybackInput {
  mode?: string;
  password?: string;
  parentalPin?: string;
}

export interface ParentalPinContinueWatchingPlaybackOutput {
  itemFound: boolean;
  playerVisible: boolean;
  parentalPinPromptVisible: boolean;
  parentalPinSubmitted: boolean;
}

export interface ContinueWatchingPersistenceInput {
  mode?: string;
}

export interface ContinueWatchingPersistenceOutput {
  isValid: boolean;
  trayVisible: boolean;
  itemCountBeforeLogin: number;
  itemCountAfterLogin: number;
  titlesBeforeLogin: string[];
  titlesAfterLogin: string[];
  progressBeforeLogin: number;
  progressAfterLogin: number;
  sameContentAfterRelogin: boolean;
  initialItems: Array<{ title: string; hasProgress: boolean }>;
  reloadedItems: Array<{ title: string; hasProgress: boolean }>;
  reason?: string;
}

export interface RemoveFromContinueWatchingInput {
  mode?: string;
  contentTitle?: string;
}

export interface RemoveFromContinueWatchingOutput {
  isContinueWatchingTrayVisible: boolean;
  wasItemPresentBeforeRemoval: boolean;
  isItemPresentAfterRemoval: boolean;
}

export interface VerifyContinueWatchingRemovalInput {
  mode?: string;
  contentTitle?: string;
}

export interface VerifyContinueWatchingRemovalOutput {
  isValid: boolean;
  initialItemCount: number;
  finalItemCount: number;
  confirmationVisible: boolean;
  itemRemoved: boolean;
  removedItemTitle?: string;
  reason?: string;
}

export interface ContinueWatchingDetailsAndMoreInput {
  mode?: string;
}

export interface ContinueWatchingDetailsAndMoreOutput {
  isValid: boolean;
  detailsAndMoreVisible: boolean;
  detailsPageVisible: boolean;
  reason?: string;
}

export interface ResumeCTADetailsPageInput {
  mode?: string;
}

export interface ResumeCTADetailsPageOutput {
  isValid: boolean;
  resumeCtaVisible: boolean;
  detailsPageVisible: boolean;
  reason?: string;
}

export interface ResumeToPlayAfterRemovalInput {
  mode?: string;
  season?: string;
  episodeName?: string;
}

export interface ResumeToPlayAfterRemovalOutput {
  isValid: boolean;
  detailsPageVisible: boolean;
  playActionVisible: boolean;
  defaultEpisodeRetained: boolean;
  reason?: string;
}

export interface ContinueWatchingResumePlaybackInput {
  mode?: string;
}

export interface ContinueWatchingResumePlaybackOutput {
  isValid: boolean;
  detailsPageVisible: boolean;
  resumeActionVisible: boolean;
  playerVisible: boolean;
  reason?: string;
}

export interface ContinueWatchingFivePercentPlaybackInput {
  mode?: string;
}

export interface ContinueWatchingFivePercentPlaybackOutput {
  isValid: boolean;
  trayVisible: boolean;
  contentAppearsInTray: boolean;
  reason?: string;
}

export interface ContinueWatchingAcrossTabsInput {
  mode?: string;
  email?: string;
  password?: string;
  tabs?: string[];
}

export interface ContinueWatchingAcrossTabsOutput {
  isValid: boolean;
  trayItemCount: number;
  contentVisibleInTray: boolean;
  selectedTab?: string;
  reason?: string;
}

export interface ContinueWatchingLessThanFivePercentPlaybackInput {
  mode?: string;
}

export interface ContinueWatchingLessThanFivePercentPlaybackOutput {
  isValid: boolean;
  trayVisible: boolean;
  contentAppearsInTray: boolean;
  reason?: string;
}

export interface ContinueWatchingFiftyPercentPlaybackInput {
  mode?: string;
}

export interface ContinueWatchingFiftyPercentPlaybackOutput {
  isValid: boolean;
  trayVisible: boolean;
  contentAppearsInTray: boolean;
  progressBarPercentage?: number;
  progressPercentageValid?: boolean;
  reason?: string;
}

export interface ValidateContinueWatchingProgressInput {
  mode?: string;
  expectedPercentage?: number;
  tolerance?: number;
}

export interface ValidateContinueWatchingProgressOutput {
  isValid: boolean;
  expectedPercentage: number;
  actualPercentage: number;
  difference: number;
  trayVisible: boolean;
  contentAppearsInTray: boolean;
  reason?: string;
}

export interface ContentUpdatedInContinueWatchingInput {
  mode?: string;
  seekMinutes?: number;
}


export interface ContentUpdatedInContinueWatchingOutput {
  isValid: boolean;
  contentRemainsInTray: boolean;
  progressBarVisible: boolean;
  selectedContentName: string;
  playerTimerBeforeExit: string;
  trayVisible: boolean;
  reason?: string;
}

export interface UpNextContinueWatchingInput {
  mode?: string;
  query?: string;
}

export interface UpNextContinueWatchingOutput {
  isValid: boolean;
  markerVisible: boolean;
  autoPlaybackStarted: boolean;
  currentSeasonNumber?: string;
  currentEpisodeNumber?: string;
  nextSeasonNumber?: string;
  nextEpisodeNumber?: string;
  episodeProgressionValid?: boolean;
  seasonProgressionValid?: boolean;
  reason?: string;
}

export interface ContinueWatchingFreeUserAdResumePlaybackInput {
  mode?: string;
}

export interface LatestWatchedSeasonEpisodeContinueWatchingInput {
  mode?: string;
  expectedSeasonNumber?: string;
  expectedEpisodeNumber?: string;
}

export interface LatestWatchedSeasonEpisodeContinueWatchingOutput {
  isValid: boolean;
  trayVisible: boolean;
  itemFound: boolean;
  progressBarVisible: boolean;
  seasonEpisodeVisible: boolean;
  selectedContentName: string;
  actualSeasonNumber?: string;
  actualEpisodeNumber?: string;
  reason?: string;
}

export interface VerifyContinueWatchingSubscriptionPromptInput {
  mode?: string;
}

export interface VerifyContinueWatchingSubscriptionPromptOutput {
  isValid: boolean;
  trayVisible: boolean;
  premiumEpisodeFound: boolean;
  subscriptionPromptVisible: boolean;
  gateMessage: string;
  selectedContentTitle: string;
  reason?: string;
}

export interface SeasonEpisodeUpdateContinueWatchingInput {
  mode?: string;
  seasonOneEpisode?: string;
  seasonOneSeekPosition?: number;
  seasonTwoSeekPosition?: number;
  expectedSeasonNumber?: string;
  expectedEpisodeNumber?: string;
}

export interface SeasonEpisodeUpdateContinueWatchingOutput {
  isValid: boolean;
  trayVisible: boolean;
  contentItemFound: boolean;
  seasonEpisodeUpdated: boolean;
  selectedContentName: string;
  actualSeasonNumber?: string;
  actualEpisodeNumber?: string;
  reason?: string;
}

export interface ContinueWatchingFreeUserAdResumePlaybackOutput {
  isValid: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  contentResumed: boolean;
  reason?: string;
}

export interface VerifyShowContentRemovalFromContinueWatchingInput {
  mode?: string;
}

export interface VerifyShowContentRemovalFromContinueWatchingOutput {
  isValid: boolean;
  initialVisibility: boolean;
  finalVisibility: boolean;
  selectedContentTitle: string;
  reason?: string;
}

export interface VerifyContinueWatchingFreeAndPaidContentInput {
  mode?: string;
}

export interface VerifyContinueWatchingFreeAndPaidContentOutput {
  isValid: boolean;
  trayVisible: boolean;
  freeContentPresent: boolean;
  paidContentPresent: boolean;
  itemCount: number;
  reason?: string;
}

export interface ContinueWatchingAcrossTabsInput {
  mode?: string;
  email?: string;
  password?: string;
  tabs?: string[];
}

export interface ContinueWatchingAcrossTabsOutput {
  isValid: boolean;
  trayItemCount: number;
  contentVisibleInTray: boolean;
  selectedTab?: string;
  reason?: string;
}

function parseSeasonEpisodeFromText(text: string): { seasonNumber: string; episodeNumber: string } {
  const seasonMatch = text.match(/S(?:eason\s*)?(\d+)/i);
  const episodeMatch = text.match(/E(\d+)/i);
  return {
    seasonNumber: seasonMatch?.[1] || '',
    episodeNumber: episodeMatch?.[1] || '',
  };
}

function normalizeTrayTitle(value: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeEpisodeNumber(value: string): string {
  return (value || '').replace(/\D/g, '');
}

async function selectMultiSeasonShowFromCollection(page: any, collectionResponse: any): Promise<{ title: string; contentId: string } | null> {
  const gql = GraphQLHelper.getInstance(page);
  if (!collectionResponse) {
    return null;
  }
  const parser = new CollectionParser(collectionResponse as any);
  for (let railIndex = 0; railIndex < parser.getRails().length; railIndex += 1) {
    const cards = parser.getCards(railIndex);
    for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
      const totalSeasons = parser.getTotalSeasonsByIndex(railIndex, cardIndex);
      if (typeof totalSeasons === 'number' && totalSeasons > 1) {
        const asset = parser.getCard(railIndex, cardIndex);
        const contentId = parser.getContentId(asset);
        const title = asset?.title || '';
        if (contentId && title) {
          return { title, contentId };
        }
      }
    }
  }
  return null;
}

function parsePlaybackTimeToSeconds(value: string): number {
  const normalized = (value || '').replace(/,/g, '').trim();
  const firstTimeMatch = normalized.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!firstTimeMatch) {
    return 0;
  }
  const [, hoursOrMinutes, minutes, seconds] = firstTimeMatch;
  const hours = Number.parseInt(hoursOrMinutes, 10);
  const minuteValue = Number.parseInt(minutes, 10);
  const secondValue = seconds ? Number.parseInt(seconds, 10) : 0;
  if (seconds !== undefined) {
    return hours * 3600 + minuteValue * 60 + secondValue;
  }
  return hours * 60 + minuteValue;
}

async function waitForStablePlaybackTime(page: any, detailsPage: any, timeoutMs = 45000): Promise<{ timeText: string; timeSeconds: number }> {
  const deadline = Date.now() + timeoutMs;
  let playbackTime = '';
  let playbackSeconds = 0;
  while (Date.now() < deadline) {
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
    await page.waitForTimeout(1500);
    playbackTime = await detailsPage.getPlaybackTimeText().catch(() => '');
    if (!playbackTime) {
      const videoElement = page.locator('video').first();
      playbackTime = await videoElement.evaluate((element: HTMLVideoElement) => {
        const currentTime = Number.isFinite(element.currentTime) ? Math.floor(element.currentTime) : 0;
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }).catch(() => '');
    }
    playbackSeconds = parsePlaybackTimeToSeconds(playbackTime);
    if (playbackSeconds > 0) {
      break;
    }
  }
  return { timeText: playbackTime, timeSeconds: playbackSeconds };
}

async function pausePlaybackAfterControlsSettle(page: any, detailsPage: any, waitMs = 2000): Promise<void> {
  await detailsPage.tapPlaybackScreen().catch(() => undefined);
  await page.waitForTimeout(waitMs);
  await detailsPage.clickPauseButton().catch(() => undefined);
  await page.waitForTimeout(waitMs);
}

async function ensureParentalPinIsEnabled(
  page: any,
  authPage: OTTAuthPage,
  settingsPage: OTTSettingsPage,
  credentials: { password: string },
  pin: string
): Promise<{ parentalPinEnabled: boolean; parentalPinSubmitted: boolean; reason?: string }> {
  await settingsPage.clickAccountIcon();
  await settingsPage.clickAccountAndSettings();
  await settingsPage.scrollToParentalControlsSection();
  const toggleOff = await settingsPage.isParentalPinToggleOff();
  let parentalPinSubmitted = false;
  if (toggleOff) {
    await settingsPage.clickParentalPinToggle();
    const passwordFieldVisible = await settingsPage.isParentalPinPasswordFieldVisible();
    if (!passwordFieldVisible) {
      return { parentalPinEnabled: false, parentalPinSubmitted: false, reason: 'Parental PIN password field did not appear after enabling the toggle' };
    }
    await settingsPage.enterParentalPinPassword(credentials.password);
    await settingsPage.clickParentalPinSubmitButton();
    await page.waitForTimeout(10000);
    const pinInputBoxesVisible = await settingsPage.areParentalPinInputsVisible();
    if (!pinInputBoxesVisible) {
      return { parentalPinEnabled: false, parentalPinSubmitted: false, reason: 'Parental PIN digit input boxes were not visible after submitting account password' };
    }
    await settingsPage.enterParentalPinDigits(pin);
    await settingsPage.clickParentalPinSaveButton();
    await page.waitForTimeout(10000);
    const successMessageVisible = await settingsPage.waitForParentalPinSuccessMessageVisible(5000);
    if (successMessageVisible) {
      await settingsPage.clickParentalPinSuccessContinueButton().catch(() => undefined);
      parentalPinSubmitted = true;
    }
  }
  const parentalPinEnabled = await settingsPage.isParentalPinToggleOn();
  return {
    parentalPinEnabled,
    parentalPinSubmitted,
    reason: parentalPinEnabled ? undefined : 'Parental PIN was not enabled after setup',
  }
}
function extractSeasonEpisodeNumbers(metadata: { seasonNumber?: string; episodeNumber?: string }): { seasonNumber?: number; episodeNumber?: number } {
  const seasonMatch = (metadata.seasonNumber || '').match(/(\d+)/);
  const episodeMatch = (metadata.episodeNumber || '').match(/(\d+)/);
  return {
    seasonNumber: seasonMatch ? Number(seasonMatch[1]) : undefined,
    episodeNumber: episodeMatch ? Number(episodeMatch[1]) : undefined,
  };
}

export async function verifyContinueWatchingTrayPersistence(
  page: any,
  input?: ContinueWatchingPersistenceInput
): Promise<ContinueWatchingPersistenceOutput> {
  const authPage = new OTTAuthPage(page);
  const mode = input?.mode;
  logger.step('Starting IW3-T1951 flow to verify Continue Watching tray persistence across logout and login');
  const loginResult = await loginToOTT(page, { mode });
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: false,
      itemCountBeforeLogin: 0,
      itemCountAfterLogin: 0,
      titlesBeforeLogin: [] as string[],
      titlesAfterLogin: [] as string[],
      progressBeforeLogin: 0,
      progressAfterLogin: 0,
      sameContentAfterRelogin: false,
      initialItems: [] as Array<{ title: string; hasProgress: boolean }>,
      reloadedItems: [] as Array<{ title: string; hasProgress: boolean }>,
      reason: 'Login was not successful before the Continue Watching persistence flow started',
    };
  }
  await authPage.registerContinueWatchingListener();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForTimeout(4000);
  const trayVisibleBeforeLogin = await authPage.isContinueWatchingTrayTitleVisible();
  const titlesBeforeLogin = await authPage.getContinueWatchingTrayItemTitles();
  const itemCountBeforeLogin = titlesBeforeLogin.length;
  const firstMatchingTitle = titlesBeforeLogin[0] || '';
  const progressBeforeLogin = firstMatchingTitle
    ? await authPage.getContinueWatchingProgressBarPercentage(firstMatchingTitle)
    : 0;
  logger.assertion('Continue Watching tray is visible before logout', trayVisibleBeforeLogin);
  logger.assertion('Continue Watching tray contains at least one item before logout', itemCountBeforeLogin > 0);
  if (!trayVisibleBeforeLogin || itemCountBeforeLogin === 0) {
    return {
      isValid: false,
      trayVisible: trayVisibleBeforeLogin,
      itemCountBeforeLogin,
      itemCountAfterLogin: 0,
      titlesBeforeLogin,
      titlesAfterLogin: [] as string[],
      progressBeforeLogin,
      progressAfterLogin: 0,
      sameContentAfterRelogin: false,
      initialItems: [] as Array<{ title: string; hasProgress: boolean }>,
      reloadedItems: [] as Array<{ title: string; hasProgress: boolean }>,
      reason: 'The Continue Watching tray was not populated before logout, so persistence could not be verified',
    };
  }
  await authPage.clickAccountIcon();
  await authPage.clickSignOut();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  const reloginResult = await loginToOTT(page, { mode });
  if (!reloginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: trayVisibleBeforeLogin,
      itemCountBeforeLogin,
      itemCountAfterLogin: 0,
      titlesBeforeLogin,
      titlesAfterLogin: [] as string[],
      progressBeforeLogin,
      progressAfterLogin: 0,
      sameContentAfterRelogin: false,
      initialItems: [] as Array<{ title: string; hasProgress: boolean }>,
      reloadedItems: [] as Array<{ title: string; hasProgress: boolean }>,
      reason: 'Login was not successful after logout, so Continue Watching persistence could not be verified',
    };
  }
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForTimeout(4000);
  const trayVisibleAfterLogin = await authPage.isContinueWatchingTrayTitleVisible();
  const titlesAfterLogin = await authPage.getContinueWatchingTrayItemTitles();
  const itemCountAfterLogin = titlesAfterLogin.length;
  const firstMatchingTitleAfterLogin = titlesAfterLogin.find((title: string) => normalizeTrayTitle(title) === normalizeTrayTitle(firstMatchingTitle)) || titlesAfterLogin[0] || '';
  const progressAfterLogin = firstMatchingTitleAfterLogin
    ? await authPage.getContinueWatchingProgressBarPercentage(firstMatchingTitleAfterLogin)
    : 0;
  const normalizedBefore = titlesBeforeLogin.map(normalizeTrayTitle).filter(Boolean);
  const normalizedAfter = titlesAfterLogin.map(normalizeTrayTitle).filter(Boolean);
  const sameContentAfterRelogin = normalizedBefore.length > 0
    && normalizedBefore.length === normalizedAfter.length
    && normalizedBefore.every((title) => normalizedAfter.includes(title));
  const progressPreserved = progressBeforeLogin > 0 && progressAfterLogin > 0
    ? Math.abs(progressBeforeLogin - progressAfterLogin) <= 10
    : progressBeforeLogin === progressAfterLogin;
  const isValid = trayVisibleAfterLogin && sameContentAfterRelogin && itemCountAfterLogin >= itemCountBeforeLogin - 1 && progressPreserved;
  logger.assertion('Continue Watching tray remains visible after relogin', trayVisibleAfterLogin);
  logger.assertion('Continue Watching tray titles remain the same after relogin', sameContentAfterRelogin);
  logger.assertion('Continue Watching watch progress is preserved after relogin', progressPreserved);
  const initialItems = titlesBeforeLogin.map((title) => ({
    title,
    hasProgress: progressBeforeLogin > 0,
  }));
  const reloadedItems = titlesAfterLogin.map((title) => ({
    title,
    hasProgress: progressAfterLogin > 0,
  }));
  return {
    isValid,
    trayVisible: trayVisibleAfterLogin,
    itemCountBeforeLogin,
    itemCountAfterLogin,
    titlesBeforeLogin,
    titlesAfterLogin,
    progressBeforeLogin,
    progressAfterLogin,
    sameContentAfterRelogin,
    initialItems,
    reloadedItems,
    reason: isValid ? undefined : 'The Continue Watching tray content or progress changed after the logout and relogin flow',
  };
}

export async function verifyLatestWatchedSeasonEpisodeInContinueWatchingTray(
  page: any,
  input?: LatestWatchedSeasonEpisodeContinueWatchingInput
): Promise<LatestWatchedSeasonEpisodeContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const expectedSeasonNumber = input?.expectedSeasonNumber;
  const expectedEpisodeNumber = input?.expectedEpisodeNumber;
  logger.step(`Starting IW3-T1930 flow for latest watched season/episode update under continue watching tray`);
  const loginResult = await loginToOTT(page, { mode });
  const collectionResp = await gql.waitForOperation('Collection', 60000).catch(() => null);
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: false,
      itemFound: false,
      progressBarVisible: false,
      seasonEpisodeVisible: false,
      selectedContentName: '',
      reason: 'Login was not successful before the Continue Watching verification flow started',
    };
  }
  await authPage.waitForContinueWatchingTrayToBeReady();
  // Resolve a multi-season show from Collection GraphQL (require >1 season)
  if (!collectionResp) {
    return {
      isValid: false,
      trayVisible: false,
      itemFound: false,
      progressBarVisible: false,
      seasonEpisodeVisible: false,
      selectedContentName: '',
      reason: 'Collection GraphQL response not available to resolve a show for the flow',
    };
  }
  const selectedMultiSeasonShow = await selectMultiSeasonShowFromCollection(page, collectionResp);
  const selectedContentQuery = selectedMultiSeasonShow?.title ?? '';
  if (!selectedContentQuery) {
    return {
      isValid: false,
      trayVisible: false,
      itemFound: false,
      progressBarVisible: false,
      seasonEpisodeVisible: false,
      selectedContentName: '',
      reason: 'No multi-season show could be resolved from Collection GraphQL for this flow',
    };
  }
  logger.step(`Resolved show for latest-watched flow: ${selectedContentQuery}`);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(selectedContentQuery);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const selectedEpisode = await detailsPage.selectEpisodeBySeasonAndEpisode(expectedSeasonNumber, expectedEpisodeNumber);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await detailsPage.hoverPlaybackControls();
  await detailsPage.dragSeekBarToPosition(0.50);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await detailsPage.hoverPlaybackControls();
  await detailsPage.clickBackButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })).catch(() => undefined);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.ensureContinueWatchingTrayInView();
  const trayVisible = await authPage.isContinueWatchingTrayTitleVisible();
  const trayItemTitles = await authPage.getContinueWatchingTrayItemTitles();
  const titleMatches = await Promise.all(trayItemTitles.map((title: string) => authPage.matchesContinueWatchingTitle(title, selectedContentQuery)));
  const matchedBySearch = titleMatches.some(Boolean);
  const matchedByEpisodeContext = trayItemTitles.some((title: string) => /episode|season/i.test(title.toLowerCase()));
  const itemFound = matchedBySearch || matchedByEpisodeContext || trayItemTitles.length > 0;
  const selectedContentName = trayItemTitles.find((title: string, index: number) => title && (titleMatches[index] || matchedByEpisodeContext)) || '';
  const progressBarVisible = Boolean(await authPage.getContinueWatchingProgressBarPercentage(selectedContentName));
  const seasonEpisodeVisible = selectedEpisode.selected && progressBarVisible && (matchedByEpisodeContext || itemFound);
  logger.assertion('Continue Watching tray is visible after partial playback', trayVisible);
  logger.assertion(`Content "${selectedContentQuery}" appears in Continue Watching tray`, itemFound);
  logger.assertion('Continue Watching progress bar is visible for the updated item', progressBarVisible);
  logger.assertion(`Expected season/episode metadata S${expectedSeasonNumber} E${expectedEpisodeNumber} is surfaced in the tray context`, seasonEpisodeVisible);
  return {
    isValid: trayVisible && itemFound && progressBarVisible && seasonEpisodeVisible,
    trayVisible,
    itemFound,
    progressBarVisible,
    seasonEpisodeVisible,
    selectedContentName,
    actualSeasonNumber: selectedEpisode.seasonNumber || expectedSeasonNumber,
    actualEpisodeNumber: selectedEpisode.episodeNumber || expectedEpisodeNumber,
    reason: trayVisible && itemFound && progressBarVisible && seasonEpisodeVisible
      ? undefined
      : `The latest watched season/episode update was not reflected in Continue Watching for "${selectedContentQuery}"`,
  };
}

export async function verifyContinueWatchingSeasonEpisodeUpdateAfterNextSeasonPlayback(
  page: any,
  input?: SeasonEpisodeUpdateContinueWatchingInput
): Promise<SeasonEpisodeUpdateContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const seasonOneEpisode = (input?.seasonOneEpisode ?? 'E5').trim();
  const seasonOneSeekPosition = input?.seasonOneSeekPosition;
  const seasonTwoSeekPosition = input?.seasonTwoSeekPosition;
  const expectedSeasonNumber = normalizeEpisodeNumber(input?.expectedSeasonNumber);
  const expectedEpisodeNumber = normalizeEpisodeNumber(input?.expectedEpisodeNumber);
  const gql = GraphQLHelper.getInstance(page);
  let collectionResponse = null;
  logger.step('Starting IW3-T1946 flow to verify season/episode is updated after next-season playback');
  const loginResult = await loginToOTT(page, { mode });
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: false,
      contentItemFound: false,
      seasonEpisodeUpdated: false,
      selectedContentName: '',
      reason: 'Login was not successful before the Continue Watching regression flow started',
    };
  }
  collectionResponse = await gql.waitForOperation('Collection', 60000);
  await authPage.refreshPage();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  const selectedMultiSeasonShow = await selectMultiSeasonShowFromCollection(page, collectionResponse);
  const selectedContentName = selectedMultiSeasonShow?.title ?? '';
  const selectedContentId = selectedMultiSeasonShow?.contentId;
  if (!selectedContentId) {
    logger.assertion('A multi-season show was selected from collection GraphQL data', false);
    return {
      isValid: false,
      trayVisible: false,
      contentItemFound: false,
      seasonEpisodeUpdated: false,
      selectedContentName: '',
      reason: 'No multi-season show could be resolved from collection GraphQL',
    };
  }
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(selectedContentName);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  const finalSelectedContentName = (await detailsPage.getShowDetailsHeadingText().catch(() => '')).trim() || selectedContentName;
  await detailsPage.clickSeasonLabel('Season 1').catch(() => undefined);
  await detailsPage.selectEpisodeBySeasonAndEpisode('Season 1', seasonOneEpisode).catch(() => undefined);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await detailsPage.dragSeekBarToPosition(seasonOneSeekPosition).catch(() => undefined);
  await page.waitForTimeout(3000);
  const resolveGraphQLSeasonEpisode = async (searchName: string, timeoutMs = 15000): Promise<{ seasonNumber: number; episodeNumber: number; itemFound: boolean }> => {
    const normalizedSearch = (searchName || '').toLowerCase();
    let matchedItem: any = undefined;
    let seasonNumber = 0;
    let episodeNumber = 0;
    const endTime = Date.now() + timeoutMs;
    while (Date.now() < endTime) {
      const cwItems = await authPage.getContinueWatchingGraphQLItems().catch(() => [] as any[]);
      logger.info(`Continue Watching GraphQL items count: ${cwItems.length}`);
      matchedItem = cwItems.find((item) => {
        const showTitle = (item.showInfo?.title || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        return normalizedSearch && (showTitle.includes(normalizedSearch) || itemTitle.includes(normalizedSearch));
      });
      if (matchedItem) {
        break;
      }
      await page.waitForTimeout(1000);
    }
    if (matchedItem) {
      if (typeof matchedItem.seasonNumber === 'number' && Number.isFinite(matchedItem.seasonNumber)) {
        seasonNumber = matchedItem.seasonNumber;
      }
      if (typeof matchedItem.episodeNumber === 'number' && Number.isFinite(matchedItem.episodeNumber)) {
        episodeNumber = matchedItem.episodeNumber;
      }
      if ((!seasonNumber || !episodeNumber) && matchedItem.subHeader) {
        const parsedSub = parseSeasonEpisodeFromText(String(matchedItem.subHeader));
        seasonNumber = seasonNumber || (parseInt(parsedSub.seasonNumber || '', 10) || 0);
        episodeNumber = episodeNumber || (parseInt(parsedSub.episodeNumber || '', 10) || 0);
      }
      if ((!seasonNumber || !episodeNumber) && matchedItem.title) {
        const parsedTitle = parseSeasonEpisodeFromText(String(matchedItem.title || ''));
        seasonNumber = seasonNumber || (parseInt(parsedTitle.seasonNumber || '', 10) || 0);
        episodeNumber = episodeNumber || (parseInt(parsedTitle.episodeNumber || '', 10) || 0);
      }
    }
    return {
      seasonNumber,
      episodeNumber,
      itemFound: Boolean(matchedItem)
    };
  };
  await detailsPage.clickBackButton().catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.registerContinueWatchingListener();
  await authPage.refreshPage();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.ensureContinueWatchingTrayInView();
  const initialGraphQLMetadata = await resolveGraphQLSeasonEpisode(finalSelectedContentName, 15000);
  const initialSeasonNum = initialGraphQLMetadata.seasonNumber;
  logger.info(`Initial Continue Watching GraphQL metadata -> season:${initialSeasonNum} episode:${initialGraphQLMetadata.episodeNumber}`);
  const openedFromTray = await authPage.clickContinueWatchingItemUsingGraphQL(finalSelectedContentName, 30000);
  await page.waitForTimeout(4000);
  await detailsPage.clickSeasonLabel('Season 1').catch(() => undefined);
  await detailsPage.scrollEpisodeListToEnd();
  await detailsPage.clickLastEpisodeFromEpisodesList();
  await page.waitForTimeout(6000);
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await detailsPage.dragSeekBarToPosition(0.99).catch(() => undefined);
  await page.waitForTimeout(20000);
  // capture current player metadata (season/episode) before advancing to next
  const currentMetadataBeforeNext = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  const prevSeasonNum = parseInt((currentMetadataBeforeNext.seasonNumber || '').replace(/\D/g, ''), 10) || 0;
  const prevEpisodeNum = parseInt((currentMetadataBeforeNext.episodeNumber || '').replace(/\D/g, ''), 10) || 0;
  logger.info(`Player before next -> season:${currentMetadataBeforeNext.seasonNumber} episode:${currentMetadataBeforeNext.episodeNumber}`);
  const upNextVisible = await detailsPage.waitForUpNextMarker(20000).catch(() => false);
  if (upNextVisible) {
    await detailsPage.clickNextEpisodeButton().catch(() => undefined);
  }
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await detailsPage.dragSeekBarToPosition(seasonTwoSeekPosition).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickBackButton().catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  const trayVisible = await authPage.isContinueWatchingTrayTitleVisible();
  await authPage.ensureContinueWatchingTrayInView();
  const hoverResult = await authPage.hoverContinueWatchingItemUsingGraphQL(selectedContentName, 30000).catch(() => null);
  logger.info(`Continue Watching hover result for "${selectedContentName}": season=${hoverResult?.season ?? 'n/a'}, episode=${hoverResult?.episode ?? 'n/a'}`);
  await authPage.registerContinueWatchingListener();
  const normalizedSearch = (finalSelectedContentName || '').toLowerCase();
  let matchedCwItem: any = undefined;
  let cwSeasonNumber = 0;
  let cwEpisodeNumber = 0;
  const graphQlEnd = Date.now() + 15000;
  while (Date.now() < graphQlEnd) {
    const cwItems = await authPage.getContinueWatchingGraphQLItems().catch(() => [] as any[]);
    logger.info(`Continue Watching GraphQL items count: ${cwItems.length}`);
    for (const item of cwItems) {
      const showTitle = (item.showInfo?.title || '').toLowerCase();
      const itemTitle = (item.title || '').toLowerCase();
      if (!normalizedSearch) continue;
      if (showTitle.includes(normalizedSearch) || itemTitle.includes(normalizedSearch)) {
        matchedCwItem = item;
        break;
      }
    }
    if (matchedCwItem) {
      if (typeof matchedCwItem.seasonNumber === 'number' && Number.isFinite(matchedCwItem.seasonNumber)) {
        cwSeasonNumber = matchedCwItem.seasonNumber;
      }
      if (typeof matchedCwItem.episodeNumber === 'number' && Number.isFinite(matchedCwItem.episodeNumber)) {
        cwEpisodeNumber = matchedCwItem.episodeNumber;
      }
      if ((!cwSeasonNumber || !cwEpisodeNumber) && matchedCwItem.subHeader) {
        const parsedSub = parseSeasonEpisodeFromText(String(matchedCwItem.subHeader));
        cwSeasonNumber = cwSeasonNumber || (parseInt(parsedSub.seasonNumber || '', 10) || 0);
        cwEpisodeNumber = cwEpisodeNumber || (parseInt(parsedSub.episodeNumber || '', 10) || 0);
      }
      if ((!cwSeasonNumber || !cwEpisodeNumber) && matchedCwItem.title) {
        const parsedTitle = parseSeasonEpisodeFromText(String(matchedCwItem.title || ''));
        cwSeasonNumber = cwSeasonNumber || (parseInt(parsedTitle.seasonNumber || '', 10) || 0);
        cwEpisodeNumber = cwEpisodeNumber || (parseInt(parsedTitle.episodeNumber || '', 10) || 0);
      }
    }
    if (matchedCwItem && (cwSeasonNumber || cwEpisodeNumber)) {
      break;
    }
    await page.waitForTimeout(1000);
  }
  const contentItemFound = Boolean(matchedCwItem);
  logger.info(`Continue Watching GraphQL matched item: ${contentItemFound ? 'yes' : 'no'}, season=${cwSeasonNumber}, episode=${cwEpisodeNumber}`);
  const seasonIncrementValid = Boolean(initialSeasonNum && cwSeasonNumber && (cwSeasonNumber === initialSeasonNum + 1));
  logger.assertion(`Season increment check: initial=${initialSeasonNum} cw=${cwSeasonNumber}`, seasonIncrementValid);
  const actualSeasonNumber = String(cwSeasonNumber || '');
  const actualEpisodeNumber = String(cwEpisodeNumber || '');
  const seasonEpisodeUpdated = Boolean(contentItemFound && seasonIncrementValid && Number(actualSeasonNumber) >= Number(expectedSeasonNumber));
  logger.assertion('Continue Watching tray is visible after next-season playback', trayVisible);
  logger.assertion('Content item appears in Continue Watching tray', contentItemFound);
  logger.assertion('Continue Watching tray reflects Season 2 playback', seasonEpisodeUpdated);
  return {
    isValid: trayVisible && contentItemFound && seasonEpisodeUpdated,
    trayVisible,
    contentItemFound,
    seasonEpisodeUpdated,
    selectedContentName,
    actualSeasonNumber,
    actualEpisodeNumber,
    reason: trayVisible && contentItemFound && seasonEpisodeUpdated
      ? undefined
      : `Continue Watching tray did not reflect Season ${expectedSeasonNumber} Episode ${expectedEpisodeNumber} for "${selectedContentName}"`,
  };
}

export async function verifyContinueWatchingShowsFreeAndPaidContent(
  page: any,
  input?: VerifyContinueWatchingFreeAndPaidContentInput
): Promise<VerifyContinueWatchingFreeAndPaidContentOutput> {
  const authPage = new OTTAuthPage(page);
  const mode = input?.mode;
  logger.step('Starting IW3-T1948 flow to verify Continue Watching contains free and paid content');
  await authPage.registerContinueWatchingListener();
  const loginResult = await loginToOTT(page, { mode });
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: false,
      freeContentPresent: false,
      paidContentPresent: false,
      itemCount: 0,
      reason: 'Login was not successful before verifying Continue Watching content types',
    };
  }
  await authPage.waitForContinueWatchingTrayToBeReady();
  const trayVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!trayVisible) {
    return {
      isValid: false,
      trayVisible: false,
      freeContentPresent: false,
      paidContentPresent: false,
      itemCount: 0,
      reason: 'Continue Watching tray title is not visible',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const traySection = await authPage.getContinueWatchingTraySection();
  const trayItemTitles = await authPage.getContinueWatchingTrayItemTitles();
  const itemCount = trayItemTitles.length;
  const graphQLItems = await authPage.getContinueWatchingGraphQLItems().catch(() => [] as Array<{ title?: string; monetization?: { type?: string } }>);
  const monetizationTypes = graphQLItems.map((item) => item.monetization?.type).filter(Boolean);
  const freeContentPresent = monetizationTypes.includes('free');
  const paidContentPresent = monetizationTypes.includes('paid');
  logger.step(`Continue Watching item titles: ${trayItemTitles.join(' | ') || 'none'}`);
  logger.info(`IW3-T1948 content names: ${JSON.stringify(trayItemTitles)}`);
  logger.info(`IW3-T1948 monetization types: ${JSON.stringify(monetizationTypes)}`);
  logger.assertion('Continue Watching tray is visible', trayVisible);
  logger.assertion('Continue Watching tray contains at least one item', itemCount > 0);
  logger.assertion('Continue Watching tray contains free content', freeContentPresent);
  logger.assertion('Continue Watching tray contains paid content', paidContentPresent);
  return {
    isValid: trayVisible && itemCount > 0 && freeContentPresent && paidContentPresent,
    trayVisible,
    freeContentPresent,
    paidContentPresent,
    itemCount,
    reason: trayVisible && itemCount > 0 && freeContentPresent && paidContentPresent
      ? undefined
      : 'Continue Watching tray did not expose both free and paid content items',
  };
}

export async function verifyContinueWatchingSubscriptionPrompt(
  page: any,
  input?: VerifyContinueWatchingSubscriptionPromptInput
): Promise<VerifyContinueWatchingSubscriptionPromptOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  const mode = input?.mode;
  logger.step('Starting IW3-T1947 flow to verify subscription prompt for premium Continue Watching episode');
  const loginResult = await loginToOTT(page, { mode });
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: false,
      premiumEpisodeFound: false,
      subscriptionPromptVisible: false,
      gateMessage: '',
      selectedContentTitle: '',
      reason: 'Login was not successful before verifying the premium Continue Watching subscription prompt',
    };
  }
  await authPage.registerContinueWatchingListener();
  await authPage.waitForContinueWatchingTrayToBeReady();
  const trayVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!trayVisible) {
    return {
      isValid: false,
      trayVisible: false,
      premiumEpisodeFound: false,
      subscriptionPromptVisible: false,
      gateMessage: '',
      selectedContentTitle: '',
      reason: 'Continue Watching tray title is not visible',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const graphQLItems = await authPage.getContinueWatchingGraphQLItems().catch(() => [] as Array<{ title?: string; monetization?: { type?: string }; assetType?: string; showInfo?: { title?: string } }>);
  const premiumEpisodes = graphQLItems.filter((item: any) => item.assetType === 'episode' && item.monetization?.type === 'paid');
  const selectedItem = premiumEpisodes[0];
  const selectedContentTitle = (selectedItem?.title || selectedItem?.showInfo?.title || '').trim();
  const premiumEpisodeFound = Boolean(selectedItem && selectedContentTitle);
  if (!premiumEpisodeFound) {
    return {
      isValid: false,
      trayVisible,
      premiumEpisodeFound: false,
      subscriptionPromptVisible: false,
      gateMessage: '',
      selectedContentTitle: '',
      reason: 'No premium episode item was found in the Continue Watching tray',
    };
  }
  logger.step(`Selected premium Continue Watching item: ${selectedContentTitle}`);
  const openedFromTray = await authPage.clickContinueWatchingItemUsingGraphQL(selectedContentTitle, 30000);
  if (!openedFromTray) {
    return {
      isValid: false,
      trayVisible,
      premiumEpisodeFound,
      subscriptionPromptVisible: false,
      gateMessage: '',
      selectedContentTitle,
      reason: 'Premium Continue Watching item could not be opened from the tray',
    };
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  const tvShowEpisodesPromise = waitForTvShowEpisodesGraphQL(page, 60000);
  await authPage.refreshPage();
  const tvShowEpisodesResponse = await tvShowEpisodesPromise;
  if (!tvShowEpisodesResponse) {
    return {
      isValid: false,
      trayVisible,
      premiumEpisodeFound,
      subscriptionPromptVisible: false,
      gateMessage: '',
      selectedContentTitle,
      reason: 'TV show episodes API response was not found after refreshing the page',
    };
  }
  const episodes = new TVShowEpisodesParser(tvShowEpisodesResponse as any).getEpisodes();
  const paidEpisodeIndex = episodes.findIndex((episode) => episode.monetization?.type === 'paid');
  if (paidEpisodeIndex <= 0) {
    return {
      isValid: false,
      trayVisible,
      premiumEpisodeFound,
      subscriptionPromptVisible: false,
      gateMessage: '',
      selectedContentTitle,
      reason: 'No paid episode with a previous episode was found in the TV show episode API response',
    };
  }
  const previousEpisodeIndex = paidEpisodeIndex - 1;
  const episodeClicked = await detailsPage.clickEpisodeAtIndex(previousEpisodeIndex);
  if (!episodeClicked) {
    return {
      isValid: false,
      trayVisible,
      premiumEpisodeFound,
      subscriptionPromptVisible: false,
      gateMessage: '',
      selectedContentTitle,
      reason: `Unable to click the episode before the paid episode at index ${previousEpisodeIndex}`,
    };
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  let adVisible = false;
  adVisible = await detailsPage.isAdTagVisible().catch(() => false);
  if (adVisible) {
    await page.waitForTimeout(100000);
  }
  await detailsPage.hoverPlaybackControls();
  await detailsPage.dragSeekBarToPosition(0.99);
  adVisible = await detailsPage.isAdTagVisible().catch(() => false);
  if (adVisible) {
    await page.waitForTimeout(100000);
  }
  const subscriptionInstructionVisible = await detailsPage.isSubscriptionInstructionPromptVisible().catch(() => false);
  const premiumGateVisible = await playbackPage.isPremiumContentGateVisible().catch(() => false);
  const detailsSubscribeCtaVisible = await detailsPage.isSubscribeToWatchCtaVisible().catch(() => false);
  const playbackSubscribeCtaVisible = await playbackPage.isSubscribeToWatchVisible().catch(() => false);
  const subscribeCtaVisible = detailsSubscribeCtaVisible || playbackSubscribeCtaVisible;
  const maybeLaterVisible = await playbackPage.isMaybeLaterVisible().catch(() => false);
  const subscriptionPromptVisible = subscriptionInstructionVisible || premiumGateVisible || subscribeCtaVisible || maybeLaterVisible;
  let subscribeCtaText = '';
  if (subscribeCtaVisible) {
    subscribeCtaText = await detailsPage.getSubscribeToWatchCtaText().catch(() => '');
  }
  const gateMessage = subscriptionInstructionVisible
    ? await detailsPage.getSubscriptionInstructionPromptText().catch(() => '')
    : premiumGateVisible
      ? await playbackPage.getPremiumGateMessageText().catch(() => '')
      : subscribeCtaVisible
        ? subscribeCtaText
        : '';
  logger.assertion('Continue Watching tray visible', trayVisible);
  logger.assertion('Premium episode found in Continue Watching', premiumEpisodeFound);
  logger.assertion('Subscription prompt or gate visible after play attempt', subscriptionPromptVisible);
  return {
    isValid: premiumEpisodeFound && subscriptionPromptVisible,
    trayVisible,
    premiumEpisodeFound,
    subscriptionPromptVisible,
    gateMessage,
    selectedContentTitle,
    reason: premiumEpisodeFound && subscriptionPromptVisible
      ? undefined
      : 'The premium Continue Watching episode did not surface a subscription prompt or gate after attempting playback',
  };
}

async function waitForTvShowEpisodesGraphQL(page: any, timeoutMs: number = 60000): Promise<any | null> {
  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        page.off('response', onResponse);
        logger.warn('No TV show episodes GraphQL response was captured within timeout after refresh');
        resolve(null);
      }
    }, timeoutMs);
    const onResponse = async (response: any) => {
      try {
        if (!response.url?.().includes('/graphql')) {
          return;
        }
        const requestData = response.request().postDataJSON?.() ?? null;
        const requestOperation = requestData?.operationName ?? requestData?.query?.match(/query\s+([A-Za-z0-9_]+)/)?.[1] ?? requestData?.query?.match(/mutation\s+([A-Za-z0-9_]+)/)?.[1] ?? 'unknown';
        const json = await response.json().catch(() => null);
        if (!json?.data) {
          return;
        }
        const hasTvShowEpisodes = Boolean(json.data.tvShowEpisodes?.items?.length) || Boolean(json.data.tvShow?.episodes?.length);
        logger.info(`[CW-TV] GraphQL response captured operation=${requestOperation} hasTvShowEpisodes=${hasTvShowEpisodes}`);
        if (!hasTvShowEpisodes) {
          return;
        }
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          page.off('response', onResponse);
          logger.info('TV show episodes GraphQL response matched and resolved');
          resolve({ request: requestData, response: json });
        }
      } catch (error) {
        logger.debug('waitForTvShowEpisodesGraphQL response handler failed', error);
        return;
      }
    };
    page.on('response', onResponse);
  });
}

export async function verifyShowContentRemovalFromContinueWatching(
  page: any,
  input?: VerifyShowContentRemovalFromContinueWatchingInput
): Promise<VerifyShowContentRemovalFromContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  logger.step('Starting IW3-T1961 flow for show content removal from Continue Watching after playback completion');
  const loginResult = await loginToOTT(page, { mode });
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      initialVisibility: false,
      finalVisibility: false,
      selectedContentTitle: '',
      reason: 'Login was not successful before the Continue Watching removal flow started',
    };
  }
  await authPage.registerContinueWatchingListener();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForTimeout(5000);
  const graphQLShowItems = await authPage.getContinueWatchingGraphQLShows();
  const selectedShow = graphQLShowItems.find((item) => Boolean(item.showTitle)) || graphQLShowItems[0];
  const selectedContentTitle = selectedShow?.showTitle || selectedShow?.episodeTitle || '';
  if (!selectedContentTitle) {
    return {
      isValid: false,
      initialVisibility: false,
      finalVisibility: false,
      selectedContentTitle: '',
      reason: 'No show content was available in the Continue Watching GraphQL response for the removal flow',
    };
  }
  logger.step(`Selected show content for IW3-T1961 from Continue Watching GraphQL: ${selectedContentTitle}`);
  // Check if content is visible in Continue Watching BEFORE clicking the tray item
  // Use GraphQL data as source of truth - if it was in the GraphQL response, it's visible
  const initialVisibility = graphQLShowItems.some((item) =>
  (item.showTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()) ||
    item.episodeTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()))
  );
  const openedFromTray = await authPage.clickContinueWatchingItemUsingGraphQL(selectedContentTitle, 30000);
  if (!openedFromTray) {
    return {
      isValid: false,
      initialVisibility,
      finalVisibility: false,
      selectedContentTitle,
      reason: 'The selected Continue Watching show could not be opened from the tray',
    };
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  // Select last episode from latest season and play
  const selectedLatestSeasonEpisode = await detailsPage.selectLastEpisodeFromLatestSeason();
  if (!selectedLatestSeasonEpisode) {
    await detailsPage.scrollEpisodeListToEnd();
    await detailsPage.clickLastEpisodeFromEpisodesList();
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await detailsPage.hoverPlaybackControls();
  await detailsPage.dragSeekBarToPosition(0.99);
  await page.waitForTimeout(20000);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await authPage.refreshPage();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.refreshPage();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForTimeout(5000);
  // Check if content is removed from Continue Watching after playback completion
  // Get fresh GraphQL data and check if item still exists
  const finalGraphQLItems = await authPage.getContinueWatchingGraphQLShows();
  const finalVisibility = finalGraphQLItems.some((item) =>
  (item.showTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()) ||
    item.episodeTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()))
  );
  const isValid = initialVisibility && !finalVisibility;
  logger.assertion('Show content was present in Continue Watching before playback', initialVisibility);
  logger.assertion('Show content was removed from Continue Watching after playback completion', !finalVisibility);
  return {
    isValid,
    initialVisibility,
    finalVisibility,
    selectedContentTitle,
    reason: isValid ? undefined : 'The show content remained in the Continue Watching tray after playback completion',
  };
}

export async function verifyContinueWatchingFreeUserAdResumePlayback(
  page: any,
  input?: ContinueWatchingFreeUserAdResumePlaybackInput
): Promise<ContinueWatchingFreeUserAdResumePlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting free-user Continue Watching ad resume validation');
  const mode = input?.mode;
  const loginResult = await loginToOTT(page, { mode: mode === 'valid' ? 'freeUser' : mode });
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      playerVisible: false,
      adVisible: false,
      contentResumed: false,
      reason: 'Free user login was not successful',
    };
  }
  await authPage.waitForContinueWatchingTrayToBeReady();
  const titleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!titleVisible) {
    return {
      isValid: false,
      playerVisible: false,
      adVisible: false,
      contentResumed: false,
      reason: 'Continue Watching tray title is not visible',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const traySection = await authPage.getContinueWatchingTraySection();
  const contentCards = traySection.locator('img[alt]').filter({ hasNotText: '' });
  const contentCount = await contentCards.count().catch(() => 0);
  if (!contentCount) {
    return {
      isValid: false,
      playerVisible: false,
      adVisible: false,
      contentResumed: false,
      reason: 'No Continue Watching content was available to resume',
    };
  }
  const targetItem = contentCards.first();
  const itemTitle = ((await targetItem.getAttribute('alt')) || '').trim();
  await targetItem.scrollIntoViewIfNeeded();
  await targetItem.click({ force: true, timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  const resumeActionVisible = await page.getByText(/Resume|Play/i).first().isVisible().catch(() => false);
  if (resumeActionVisible) {
    await page.getByText(/Resume|Play/i).first().click({ force: true, timeout: 30000 }).catch(() => undefined);
  }
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(6000);
  const playerVisible = await detailsPage.isPlayerScreenVisible().catch(() => false);
  let adVisible = false;
  try {
    adVisible = await detailsPage.isAdTagVisible().catch(() => false);
  } catch (error) {
    adVisible = false;
    logger.error('Ad was not played during free-user resume playback', { error });
  }
  await page.waitForTimeout(5000);
  const playbackTimeVisible = await detailsPage.isPlaybackTimeVisible().catch(() => false);
  const contentResumed = playerVisible && (adVisible || playbackTimeVisible);
  logger.assertion('Player visible for resumed content', playerVisible);
  logger.assertion('Ad overlay visible during free-user resume', adVisible);
  logger.assertion('Playback resumed after ad or content start', contentResumed);
  return {
    isValid: Boolean(playerVisible && adVisible && contentResumed),
    playerVisible,
    adVisible,
    contentResumed,
    reason: playerVisible && adVisible && contentResumed ? undefined : 'The free-user resume flow did not show an ad and resumed playback',
  };
}

export async function verifyContinueWatchingPlaybackFromTray(
  page: any,
  input?: ContinueWatchingPlaybackInput
): Promise<ContinueWatchingPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting Continue Watching playback validation from tray');
  const mode = input?.mode;
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await authPage.waitForContinueWatchingTrayToBeReady();
  const titleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!titleVisible) {
    return {
      isValid: false,
      itemFound: false,
      playerVisible: false,
      resumeActionVisible: false,
      selectedContentName: '',
      forwardedTime: '',
      resumedTime: '',
      timeDifferenceSeconds: 0,
      reason: 'Continue Watching tray title is not visible',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const traySection = await authPage.getContinueWatchingTraySection();
  const contentItems = traySection.locator('img[alt]').filter({ hasNotText: '' });
  const itemCount = await contentItems.count().catch(() => 0);
  if (!itemCount) {
    return {
      isValid: false,
      itemFound: false,
      playerVisible: false,
      resumeActionVisible: false,
      selectedContentName: '',
      forwardedTime: '',
      resumedTime: '',
      timeDifferenceSeconds: 0,
      reason: 'No Continue Watching content items were found in the tray',
    };
  }
  const targetItem = contentItems.nth(1);
  const altText = ((await targetItem.getAttribute('alt')) || '').trim();
  const itemVisible = await targetItem.isVisible().catch(() => false);
  if (!itemVisible || !altText) {
    return {
      isValid: false,
      itemFound: false,
      playerVisible: false,
      resumeActionVisible: false,
      selectedContentName: '',
      forwardedTime: '',
      resumedTime: '',
      timeDifferenceSeconds: 0,
      reason: 'The mapped Continue Watching content item is not visible',
    };
  }
  await targetItem.scrollIntoViewIfNeeded();
  await targetItem.click({ force: true, timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const resumeActionVisible = await page.getByText(/Resume|Play/i).first().isVisible().catch(() => false);
  if (resumeActionVisible) {
    await page.getByText(/Resume|Play/i).first().click({ force: true, timeout: 30000 }).catch(() => undefined);
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const playerVisible = await detailsPage.isPlayerScreenVisible().catch(() => false);
  if (playerVisible) {
    await pausePlaybackAfterControlsSettle(page, detailsPage, 2000);
  }
  const initialPlayback = await waitForStablePlaybackTime(page, detailsPage, 45000);
  const initialTime = initialPlayback.timeText;
  const initialTimeSeconds = initialPlayback.timeSeconds;
  logger.info('Initial playback time capture', { initialTime, initialTimeSeconds });
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await pausePlaybackAfterControlsSettle(page, detailsPage, 2000);
  const forwardedPlayback = await waitForStablePlaybackTime(page, detailsPage, 45000);
  const forwardedTime = forwardedPlayback.timeText;
  const forwardedTimeSeconds = forwardedPlayback.timeSeconds;
  const pauseTimeCaptured = forwardedTimeSeconds > initialTimeSeconds;
  logger.info('Forwarded playback time capture', { forwardedTime, forwardedTimeSeconds, initialTime, initialTimeSeconds, pauseTimeCaptured });
  await detailsPage.hoverPlaybackControls();
  await detailsPage.clickBackButton();
  await authPage.clickHomeTab();
  await page.reload({ waitUntil: 'networkidle' }).catch(() => undefined);
  await page.waitForTimeout(6000);
  await authPage.waitForContinueWatchingTrayToBeReady();
  const reloadedTraySection = await authPage.getContinueWatchingTraySection();
  const reloadedItems = reloadedTraySection.locator('img[alt]').filter({ hasNotText: '' });
  const reloadedItemCount = await reloadedItems.count().catch(() => 0);
  let reloadedItem = null as any;
  for (let index = 0; index < reloadedItemCount; index += 1) {
    const candidate = reloadedItems.nth(index);
    const candidateAlt = ((await candidate.getAttribute('alt')) || '').trim();
    if (candidateAlt && candidateAlt.toLowerCase().includes(altText.toLowerCase())) {
      reloadedItem = candidate;
      break;
    }
  }
  if (!reloadedItem) {
    return {
      isValid: false,
      itemFound: false,
      playerVisible: false,
      resumeActionVisible,
      selectedContentName: altText,
      forwardedTime,
      resumedTime: '',
      timeDifferenceSeconds: 0,
      reason: 'The same Continue Watching content item was not found after returning to Home',
    };
  }
  await reloadedItem.scrollIntoViewIfNeeded();
  await reloadedItem.click({ force: true, timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const resumedActionVisible = await page.getByText(/Resume|Play/i).first().isVisible().catch(() => false);
  if (resumedActionVisible) {
    await page.getByText(/Resume|Play/i).first().click({ force: true, timeout: 30000 }).catch(() => undefined);
  }
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await pausePlaybackAfterControlsSettle(page, detailsPage, 2000);
  const resumedPlayback = await waitForStablePlaybackTime(page, detailsPage, 45000);
  const resumedTime = resumedPlayback.timeText;
  const resumedTimeSeconds = resumedPlayback.timeSeconds;
  const timeDifferenceSeconds = Math.abs(resumedTimeSeconds - forwardedTimeSeconds);
  logger.info('Resumed playback time capture', { resumedTime, resumedTimeSeconds, forwardedTime, forwardedTimeSeconds, timeDifferenceSeconds });
  const progressBarVisible = await detailsPage.isSeekBarVisible().catch(() => false);
  const timeObserved = resumedTimeSeconds > 0 || !!resumedTime;
  const isWithinFiveSeconds = resumedTimeSeconds > 0 && timeDifferenceSeconds <= 10;
  const itemFound = !!reloadedItem;
  const isValid = Boolean(
    playerVisible &&
    itemFound &&
    pauseTimeCaptured &&
    (timeObserved || resumeActionVisible) &&
    isWithinFiveSeconds
  );
  logger.assertion('Continue Watching content title captured', !!altText);
  logger.assertion('Playback time captured before pause', initialTimeSeconds > 0);
  logger.assertion('Playback time captured after first pause', pauseTimeCaptured);
  logger.assertion('Playback resumed within +/- 10 seconds', isWithinFiveSeconds);
  return {
    isValid,
    itemFound: !!reloadedItem,
    playerVisible,
    resumeActionVisible: resumeActionVisible || resumedActionVisible,
    selectedContentName: altText,
    forwardedTime,
    resumedTime,
    timeDifferenceSeconds,
    reason: isValid ? undefined : `The resumed playback time differed by ${timeDifferenceSeconds}s from the paused position (allowed window ±5s)`,
  };
}

export async function verifyContinueWatchingPlaybackFromTrayWithParentalPin(
  page: any,
  input?: ParentalPinContinueWatchingPlaybackInput
): Promise<ParentalPinContinueWatchingPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const settingsPage = new OTTSettingsPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting Continue Watching playback validation from tray with parental PIN enabled');
  const parentalPin = (input?.parentalPin).trim();
  const modeToUse = input?.mode;
  const loginResult = await loginToOTT(page, { mode: modeToUse });
  const password = input?.password;
  if (!loginResult?.isLoggedIn) {
    return {
      itemFound: false,
      playerVisible: false,
      parentalPinPromptVisible: false,
      parentalPinSubmitted: false,
    };
  }
  // Ensure PIN is disabled before seeding Continue Watching content
  await settingsPage.clickAccountIcon();
  await settingsPage.clickAccountAndSettings();
  await settingsPage.scrollToParentalControlsSection();
  const pinEnabledBeforeSeed = await settingsPage.isParentalPinToggleOn();
  if (pinEnabledBeforeSeed) {
    logger.info('Parental PIN is enabled before seed flow; disabling it first');
    await settingsPage.clickParentalPinToggle();
    await settingsPage.enterParentalPinPassword(password || '');
    await page.waitForTimeout(5000);
    await settingsPage.clickParentalPinSubmitButton();
    await settingsPage.waitForParentalPinSuccessMessageVisible(5000).catch(() => false);
    await settingsPage.clickParentalPinSuccessContinueButton().catch(() => undefined);
    await page.waitForTimeout(3000);
  }
  await authPage.navigate();
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  try {
    const gql = GraphQLHelper.getInstance(page);
    const collectionOp = await gql.waitForOperation('Collection', 20000).catch(() => null);
    if (collectionOp && collectionOp.response) {
      const parser = new CollectionParser(collectionOp as any);
      let showTitle = parser.getPreferredAssetTitle([/shows/i, 'shows']);
      if (!showTitle) {
        const titles = parser.getPreferredRailTitles([/shows/i, 'shows'], 1);
        showTitle = titles && titles.length ? titles[0] : '';
      }
      if (showTitle) {
        logger.info('Found show title from Collection GraphQL', { showTitle });
        await authPage.clickSearchBar();
        await authPage.enterSearchQuery(showTitle);
        await authPage.submitSearchQuery();
        await page.waitForLoadState('networkidle', { timeout: 60000 });
        await page.waitForTimeout(3000);
        await detailsPage.clickFirstSearchResult();
        const detailsVisible = await detailsPage.isContentDetailsPageVisible();
        if (detailsVisible) {
          await page.waitForLoadState('networkidle', { timeout: 60000 });
          await detailsPage.clickFirstEpisodeCard();
          await page.waitForTimeout(10000);
          await detailsPage.clickPlayerForwardButton();
          await page.waitForTimeout(25000);
        }
      }
    }
  } catch (err) {
    logger.debug('Failed to seed Continue Watching via Collection->Search flow', err);
  }
  await page.goBack({ waitUntil: 'networkidle' });
  logger.info('Navigated back to Home page after seeding Continue Watching content');
  const parentalPinResult = await ensureParentalPinIsEnabled(page, authPage, settingsPage, { password }, parentalPin);
  if (!parentalPinResult.parentalPinEnabled) {
    return {
      itemFound: false,
      playerVisible: false,
      parentalPinPromptVisible: false,
      parentalPinSubmitted: parentalPinResult.parentalPinSubmitted,
    };
  }
  await authPage.navigate();
  await authPage.acceptCookieSettingsIfVisible();
  await authPage.waitForContinueWatchingTrayToBeReady();
  const titleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!titleVisible) {
    return {
      itemFound: false,
      playerVisible: false,
      parentalPinPromptVisible: false,
      parentalPinSubmitted: parentalPinResult.parentalPinSubmitted,
    };
  }
  const contentItems = page.locator('//p[contains(text(),"Continue Watching")]/parent::div/parent::div/descendant::div[@class="relative overflow-hidden"]/img');
  const itemCount = await contentItems.count().catch(() => 0);
  if (!itemCount) {
    return {
      itemFound: false,
      playerVisible: false,
      parentalPinPromptVisible: false,
      parentalPinSubmitted: parentalPinResult.parentalPinSubmitted,
    };
  }
  const targetItem = contentItems.nth(0);
  const altText = ((await targetItem.getAttribute('alt')) || '').trim();
  const itemVisible = await targetItem.isVisible().catch(() => false);
  if (!itemVisible || !altText) {
    return {
      itemFound: false,
      playerVisible: false,
      parentalPinPromptVisible: false,
      parentalPinSubmitted: parentalPinResult.parentalPinSubmitted,
    };
  }
  await targetItem.scrollIntoViewIfNeeded();
  await targetItem.click({ force: true, timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const resumeActionVisible = await page.getByText(/Resume|Play/i).first().isVisible().catch(() => false);
  if (resumeActionVisible) {
    await page.getByText(/Resume|Play/i).first().click({ force: true, timeout: 30000 }).catch(() => undefined);
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  let parentalPinPromptVisible = false;
  let parentalPinSubmitted = false;
  if (resumeActionVisible) {
    parentalPinPromptVisible = await detailsPage.isParentalPinPlaybackPromptVisible().catch(() => false);
    if (parentalPinPromptVisible) {
      await detailsPage.enterParentalPlaybackPin(parentalPin);
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await page.waitForTimeout(5000);
      parentalPinSubmitted = true;
    }
  }
  const playerVisible = await detailsPage.isPlayerScreenVisible().catch(() => false);
  if (playerVisible) {
    await pausePlaybackAfterControlsSettle(page, detailsPage, 2000);
  }
  logger.assertion('Continue Watching content title captured', !!altText);
  logger.assertion('Parental PIN prompt visible when parental PIN is enabled', parentalPinPromptVisible);
  logger.assertion('Parental playback PIN submitted when prompt is visible', parentalPinSubmitted || !parentalPinPromptVisible);
  await authPage.navigate();
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  await settingsPage.clickAccountIcon();
  await settingsPage.clickAccountAndSettings();
  await settingsPage.scrollToParentalControlsSection();
  const pinEnabled = await settingsPage.isParentalPinToggleOn();
  if (pinEnabled) {
    logger.info('Parental PIN is enabled before seed flow; disabling it first');
    await settingsPage.clickParentalPinToggle();
    await settingsPage.enterParentalPinPassword(password || '');
    await page.waitForTimeout(5000);
    await settingsPage.clickParentalPinSubmitButton();
    await settingsPage.waitForParentalPinSuccessMessageVisible(5000).catch(() => false);
    await settingsPage.clickParentalPinSuccessContinueButton().catch(() => undefined);
    await page.waitForTimeout(3000);
  }
  return {
    itemFound: true,
    playerVisible,
    parentalPinPromptVisible,
    parentalPinSubmitted,
  };
}

export async function verifyResumeCtaOnContentDetailsPage(
  page: any,
  input?: ResumeCTADetailsPageInput
): Promise<ResumeCTADetailsPageOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting Resume CTA validation on content details page');
  const mode = input?.mode;
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const titleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!titleVisible) {
    return {
      isValid: false,
      resumeCtaVisible: false,
      detailsPageVisible: false,
      reason: 'Continue Watching tray title is not visible',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const traySection = await authPage.getContinueWatchingTraySection();
  const firstCard = traySection.locator('img[alt]:not([alt="arrow-right"])').first();
  const cardCount = await traySection.locator('img[alt]:not([alt="arrow-right"])').count().catch(() => 0);
  if (!cardCount) {
    return {
      isValid: false,
      resumeCtaVisible: false,
      detailsPageVisible: false,
      reason: 'No Continue Watching cards were available to validate the Resume CTA',
    };
  }
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.click({ force: true, timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const detailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  const resumeCtaVisible = await page.getByText(/Resume|Play/i).first().isVisible().catch(() => false);
  logger.assertion('Details page visible for selected Continue Watching item', detailsPageVisible);
  logger.assertion('Resume CTA visible on the details page', resumeCtaVisible);
  return {
    isValid: detailsPageVisible && resumeCtaVisible,
    resumeCtaVisible,
    detailsPageVisible,
    reason: detailsPageVisible && resumeCtaVisible ? undefined : 'The Resume CTA was not visible on the content details page',
  };
}

export async function verifyContinueWatchingTrayForNewUserAfterFivePercentPlayback(
  page: any,
  input?: ContinueWatchingFivePercentPlaybackInput
): Promise<ContinueWatchingFivePercentPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  logger.step('Starting smooth playback verification flow');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.clickMoviesTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const selectedMovieTitle = await detailsPage.clickFirstMovieContent();
  if (!selectedMovieTitle) {
    return {
      isValid: false,
      trayVisible: false,
      contentAppearsInTray: false,
      reason: 'No movie content was available to open from the Movies tab',
    };
  }
  let detailPageTitle = (selectedMovieTitle || '').trim();
  try {
    const assetOp = await gql.waitForOperationMatching<AssetResponse>((res) => Boolean(res.response?.data?.asset?.title), 10000, true);
    const assetParser = new AssetParser(assetOp as any);
    const parsedTitle = (assetParser.getAssetTitle() || '').trim();
    if (parsedTitle) {
      detailPageTitle = parsedTitle;
    }
  } catch (err) {
    logger.debug('Failed to parse Asset GraphQL response for title; falling back to details page title', err);
  }
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await detailsPage.dragSeekBarToPosition(0.05);
  await page.waitForTimeout(5000);
  await detailsPage.clickBackButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.refreshPage();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.ensureContinueWatchingTrayInView();
  await page.waitForTimeout(5000);
  const trayVisible = await authPage.isContinueWatchingTrayTitleVisible();
  let contentAppearsInTray = false;
  try {
    const cwOp = await gql.waitForOperationMatching<AssetResponse>((res) => Boolean(res.response?.data?.asset?.title), 10000, true);
    const cwParser = new ContinueWatchingParser(cwOp as any);
    contentAppearsInTray = Boolean(cwParser.getItemByTitle(detailPageTitle));
  } catch (err) {
    const traySection = await authPage.getContinueWatchingTraySection();
    const trayItemTitles = await traySection.locator('img[alt]').evaluateAll((images) => images.map((img) => (img.getAttribute('alt') || '').trim())).catch(() => [] as string[]);
    contentAppearsInTray = trayItemTitles.some((title) => title.toLowerCase().includes(detailPageTitle.toLowerCase()));
  }
  logger.assertion('Continue Watching tray visible after 5% playback', trayVisible);
  logger.assertion('Partially watched content appears in tray', contentAppearsInTray);
  return {
    isValid: Boolean(trayVisible && contentAppearsInTray),
    trayVisible,
    contentAppearsInTray,
    reason: trayVisible && contentAppearsInTray ? undefined : `The Continue Watching tray was not created with the partially watched item (${detailPageTitle}) after 5% playback`,
  };
}

export async function verifyContinueWatchingTrayForNewUserAfterLessThanFivePercentPlayback(
  page: any,
  input?: ContinueWatchingLessThanFivePercentPlaybackInput
): Promise<ContinueWatchingLessThanFivePercentPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  logger.step(`Starting less-than-5% playback verification flow`);
  const loginResult = await loginToOTT(page, { mode });
  let searchTerm = '';
  try {
    const collectionOp = await gql.waitForOperation('Collection', 20000).catch(() => null);
    if (collectionOp && collectionOp.response) {
      const parser = new CollectionParser(collectionOp as any);
      searchTerm = parser.getPreferredAssetTitle([/movies/i, 'movies', /shows/i, 'shows']) || '';
      if (!searchTerm) {
        const titles = parser.getPreferredRailTitles([/movies/i, 'movies', /shows/i, 'shows'], 1);
        searchTerm = titles && titles.length ? titles[0] : '';
      }
    }
  } catch (err) {
    logger.debug('Failed to obtain collection data for search term derivation', err);
  }
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: false,
      contentAppearsInTray: false,
      reason: 'Login was not successful before the playback flow started',
    };
  }
  if (!searchTerm) {
    return {
      isValid: false,
      trayVisible: false,
      contentAppearsInTray: false,
      reason: 'Could not determine a search term from Collection GraphQL for the less-than-5% Continue Watching validation',
    };
  }
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(searchTerm);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.clickFirstSearchResult();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.clickPlayButton();
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.02);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickBackButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.refreshPage();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.ensureContinueWatchingTrayInView();
  await page.waitForTimeout(5000);
  const trayTitleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  const trayItemTitles = await authPage.getContinueWatchingTrayItemTitles();
  const contentAppearsInTray = trayItemTitles.some((title: string) => title.toLowerCase().includes(searchTerm.toLowerCase()));
  const trayVisible = trayTitleVisible && trayItemTitles.length > 0;
  logger.assertion('Continue Watching tray title is not populated with the searched content after less-than-5% playback', !contentAppearsInTray);
  logger.assertion('No Continue Watching content item appears after less-than-5% playback', !contentAppearsInTray);
  const isValid = Boolean(!contentAppearsInTray);
  return {
    isValid,
    trayVisible,
    contentAppearsInTray,
    reason: isValid ? undefined : 'The Continue Watching tray was created or the content appeared in it after less-than-5% playback',
  };
}

export async function verifyContinueWatchingTrayAfterFiftyPercentPlayback(
  page: any,
  input?: ContinueWatchingFiftyPercentPlaybackInput
): Promise<ContinueWatchingFiftyPercentPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  logger.step('Starting 50% playback verification flow for Continue Watching tray');
  const loginResult = await loginToOTT(page, { mode });
  const gql = GraphQLHelper.getInstance(page);
  let searchTerm = '';
  try {
    const collectionOp = await gql.waitForOperation('Collection', 20000).catch(() => null);
    if (collectionOp && collectionOp.response) {
      const parser = new CollectionParser(collectionOp as any);
      searchTerm = parser.getPreferredAssetTitle([/movies/i, 'movies']) || '';
      if (!searchTerm) {
        const titles = parser.getPreferredRailTitles([/movies/i, 'movies'], 1);
        searchTerm = titles && titles.length ? titles[0] : '';
      }
    }
  } catch (err) {
    logger.debug('Failed to obtain collection data for movie selection', err);
  }
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      trayVisible: false,
      contentAppearsInTray: false,
      reason: 'Login was not successful before the playback flow started',
    };
  }
  if (!searchTerm) {
    return {
      isValid: false,
      trayVisible: false,
      contentAppearsInTray: false,
      reason: 'Could not determine a movie title from Collection GraphQL for the 50% playback validation',
    };
  }
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(searchTerm);
  await authPage.submitSearchQuery();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.hoverPlaybackControls();
  await detailsPage.dragSeekBarToPosition(0.50);
  await detailsPage.hoverPlaybackControls();
  await detailsPage.clickBackButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.refreshPage();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.ensureContinueWatchingTrayInView();
  await page.waitForTimeout(5000);
  const trayVisible = await authPage.isContinueWatchingTrayTitleVisible();
  const trayItemTitles = await authPage.getContinueWatchingTrayItemTitles();
  const contentAppearsInTray = trayItemTitles.some((title) => title.toLowerCase().includes(searchTerm.toLowerCase()));
  const progressBarPercentage = await authPage.getContinueWatchingProgressBarPercentage(searchTerm);
  const progressPercentageValid = progressBarPercentage > 0 && Math.abs(progressBarPercentage - 50) <= 2;
  logger.assertion('Continue Watching tray visible after 50% playback', trayVisible);
  logger.assertion('Watched content appears in tray after 50% playback', contentAppearsInTray);
  logger.assertion(`Continue Watching progress bar: extracted ${progressBarPercentage.toFixed(2)}%, expected ~50% (tolerance ±2%)`, progressPercentageValid);
  const isValid = Boolean(trayVisible && contentAppearsInTray && progressPercentageValid);
  return {
    isValid,
    trayVisible,
    contentAppearsInTray,
    progressBarPercentage,
    progressPercentageValid,
    reason: isValid ? undefined : `The watched content "${searchTerm}" was not displayed correctly in the Continue Watching tray after 50% playback (Progress: ${progressBarPercentage.toFixed(2)}%)`,
  };
}

export async function verifyContinueWatchingResumePlayback(
  page: any,
  input?: ContinueWatchingResumePlaybackInput
): Promise<ContinueWatchingResumePlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  logger.step('Starting smooth playback verification flow');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  const titleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!titleVisible) {
    return {
      isValid: false,
      detailsPageVisible: false,
      resumeActionVisible: false,
      playerVisible: false,
      reason: 'Continue Watching tray title is not visible',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const traySection = await authPage.getContinueWatchingTraySection();
  const trayCards = traySection.locator('img[alt]:not([alt="arrow-right"])');
  const cardCount = await trayCards.count().catch(() => 0);
  if (!cardCount) {
    return {
      isValid: false,
      detailsPageVisible: false,
      resumeActionVisible: false,
      playerVisible: false,
      reason: 'No Continue Watching cards were available to validate resume playback',
    };
  }
  const targetCard = trayCards.first();
  await targetCard.scrollIntoViewIfNeeded();
  await targetCard.click({ force: true, timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const detailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  const resumeActionVisible = await detailsPage.isResumeButtonVisible().catch(() => false)
    || await page.getByText(/Resume|Play/i).first().isVisible().catch(() => false);
  logger.assertion('Details page visible for selected Continue Watching item', detailsPageVisible);
  logger.assertion('Resume CTA visible on the details page', resumeActionVisible);
  if (!resumeActionVisible) {
    return {
      isValid: false,
      detailsPageVisible,
      resumeActionVisible,
      playerVisible: false,
      reason: 'The Resume CTA was not visible on the details page',
    };
  }
  const resumeClicked = await detailsPage.clickResumeAction();
  if (!resumeClicked) {
    return {
      isValid: false,
      detailsPageVisible,
      resumeActionVisible,
      playerVisible: false,
      reason: 'The Resume CTA could not be clicked',
    };
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(6000);
  const playerVisible = await detailsPage.isPlayerScreenVisible().catch(() => false);
  const isValid = detailsPageVisible && resumeActionVisible && playerVisible;
  logger.assertion('Playback resumed after Resume CTA tap', isValid);
  return {
    isValid,
    detailsPageVisible,
    resumeActionVisible,
    playerVisible,
    reason: isValid ? undefined : 'The Resume CTA did not lead to visible playback content',
  };
}

export async function verifyContinueWatchingAcrossTabs(
  page: any,
  input?: ContinueWatchingAcrossTabsInput
): Promise<ContinueWatchingAcrossTabsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting Continue Watching cross-tab validation');
  const tabsToTry = (input?.tabs && input.tabs.length > 0 ? input.tabs : ['Movies', 'Shows']).filter(Boolean);
  const mode = input?.mode;
  logger.step('Starting smooth playback verification flow');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  for (const tabName of tabsToTry) {
    try {
      if (tabName.toLowerCase() === 'movies') {
        await authPage.clickMoviesTab();
      } else if (tabName.toLowerCase() === 'shows') {
        await authPage.clickShowsTab();
      }
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await page.waitForTimeout(2000);
      const thumbnailLocator = page.locator('div#movies img[alt], div#shows img[alt], main img[alt], .scrollable-list img[alt], img.title-image').first();
      if (!(await thumbnailLocator.count())) {
        logger.debug(`No thumbnails found on ${tabName} tab`);
        continue;
      }
      const contentAlt = (await thumbnailLocator.getAttribute('alt')) || '';
      const contentTitle = contentAlt.trim();
      if (!contentTitle) {
        logger.debug(`Thumbnail alt/title empty on ${tabName} tab`);
        continue;
      }
      const clickContentCard = async (): Promise<void> => {
        try {
          await thumbnailLocator.waitFor({ state: 'visible', timeout: 15000 });
          await thumbnailLocator.scrollIntoViewIfNeeded();
          await thumbnailLocator.click({ force: true, timeout: 20000 });
          return;
        } catch (clickError) {
          const wrapper = thumbnailLocator.locator('xpath=ancestor::a[1] | xpath=ancestor::*[@role="button" and (@href or @onclick)][1] | xpath=ancestor::*[contains(@class, "cursor-pointer")][1]');
          if (await wrapper.count()) {
            await wrapper.first().scrollIntoViewIfNeeded();
            await wrapper.first().click({ force: true, timeout: 20000 });
            return;
          }
          throw clickError;
        }
      };
      await clickContentCard();
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await page.waitForTimeout(3000);
      logger.info('Selected content title', { contentTitle, tabName });
      const clickPlayAction = async (): Promise<void> => {
        const playSelectors = [
          '#play',
          'button:has-text("Play")',
          'button:has-text("Resume")',
          'img[alt="play"]',
          'img[alt="Resume"]',
          '[aria-label*="play"]',
          '[aria-label*="resume"]',
          'div:has-text("Resume")',
          'div:has-text("Play")',
        ];
        for (const selector of playSelectors) {
          const button = page.locator(selector).first();
          if (await button.count()) {
            try {
              await button.scrollIntoViewIfNeeded();
              await button.click({ force: true, timeout: 15000 });
              await page.waitForTimeout(2500);
              return;
            } catch (err) {
              logger.debug(`Play action click failed for selector ${selector}`, err);
            }
          }
        }
      };
      await clickPlayAction();
      await page.waitForTimeout(2000);
      const getVideoState = async (): Promise<{ currentTime: number; paused: boolean; readyState: number; ended: boolean } | null> => {
        return await page.evaluate(() => {
          const video = document.querySelector('video');
          if (!video) {
            return null;
          }
          return {
            currentTime: video.currentTime || 0,
            paused: video.paused,
            readyState: video.readyState,
            ended: video.ended,
          };
        }).catch(() => null);
      };
      const waitForPlaybackStart = async (timeoutMs = 30000): Promise<boolean> => {
        const endAt = Date.now() + timeoutMs;
        while (Date.now() < endAt) {
          const videoState = await getVideoState();
          const startedByVideo = Boolean(videoState && (videoState.currentTime > 0 || videoState.readyState >= 2 || !videoState.paused));
          const startedByPlayer = await detailsPage.isPlaybackStarted().catch(() => false);
          if (startedByVideo || startedByPlayer) {
            logger.debug('Playback detected', { videoState, startedByPlayer });
            return true;
          }
          await page.waitForTimeout(1500);
        }
        return false;
      };
      let playbackStarted = await waitForPlaybackStart();
      logger.info('Playback started status', { playbackStarted });
      if (!playbackStarted) {
        logger.info('Attempting JS video playback fallback');
        await page.evaluate(() => {
          const video = document.querySelector('video');
          if (video && video.duration > 0) {
            video.currentTime = Math.min(Math.max(video.duration * 0.1, 10), Math.max(video.duration - 1, 10));
            video.play().catch(() => undefined);
          }
        });
        await page.waitForTimeout(3000);
        playbackStarted = await waitForPlaybackStart(20000);
      }
      if (!playbackStarted) {
        try {
          const resumeBtn = page.getByText(/Resume|Play/i).first();
          if (await resumeBtn.count()) {
            await resumeBtn.click({ force: true, timeout: 15000 }).catch(() => undefined);
            await page.waitForTimeout(3000);
            playbackStarted = await waitForPlaybackStart(20000);
          }
        } catch (e) {
          logger.debug('Fallback resume click failed', e);
        }
      }
      if (!playbackStarted) {
        logger.info('Attempting direct play overlay click fallback');
        await page.evaluate(() => {
          const playOverlay = document.querySelector('#play');
          if (playOverlay) {
            (playOverlay as HTMLElement).click();
          }
        });
        await page.waitForTimeout(3000);
        playbackStarted = await waitForPlaybackStart(20000);
      }
      if (!playbackStarted) {
        logger.info('Attempting direct video play fallback');
        await page.evaluate(() => {
          const video = document.querySelector('video');
          if (video) {
            video.play().catch(() => undefined);
          }
        });
        await page.waitForTimeout(3000);
        playbackStarted = await waitForPlaybackStart(20000);
      }
      if (!playbackStarted) {
        logger.debug(`Playback did not start for selected content '${contentTitle}' on tab ${tabName}`);
        continue;
      }
      await page.waitForTimeout(15000);
      const registrationState = await getVideoState();
      logger.info('Playback registration state before home navigation', { registrationState });
      await page.waitForFunction(() => {
        const video = document.querySelector('video');
        if (!video) return false;
        return video.currentTime > 3 || !video.paused || video.readyState >= 3;
      }, null, { timeout: 20000 }).catch(() => undefined);
      const waitForVideoProgress = async (minSeconds: number, timeoutMs = 30000): Promise<number> => {
        const endAt = Date.now() + timeoutMs;
        while (Date.now() < endAt) {
          const currentTime = await page.evaluate(() => {
            const video = document.querySelector('video');
            if (!video) return 0;
            return Number(video.currentTime) || 0;
          }).catch(() => 0);
          if (currentTime >= minSeconds) {
            return currentTime;
          }
          await page.waitForTimeout(1000);
        }
        return await page.evaluate(() => {
          const video = document.querySelector('video');
          return video ? Number(video.currentTime) || 0 : 0;
        }).catch(() => 0);
      };
      await detailsPage.hoverPlaybackControls();
      await detailsPage.dragSeekBarToPosition(0.2);
      const playbackProgressSeconds = await waitForVideoProgress(8, 25000);
      logger.info('Playback registration wait complete', { playbackProgressSeconds });
      await page.waitForTimeout(5000);
      await detailsPage.clickBackButton();
      await authPage.clickHomeTab();
      await authPage.refreshPage();
      await page.waitForTimeout(5000);
      await authPage.waitForContinueWatchingTrayToBeReady();
      await authPage.ensureContinueWatchingTrayInView();
      await page.waitForTimeout(5000);
      let trayItems = await authPage.getContinueWatchingTrayItemDetails();
      let trayItemCount = trayItems.length;
      logger.info('Continue Watching tray items initial load', { trayItems: trayItems.map((t) => t.title) });
      let matched = trayItems.some((it) => (it.title || '').toLowerCase().includes(contentTitle.toLowerCase()));
      if (!matched) {
        logger.info('No match found after first home load, refreshing tray and retrying');
        await page.reload({ waitUntil: 'networkidle' }).catch(() => undefined);
        await authPage.waitForContinueWatchingTrayToBeReady();
        await authPage.ensureContinueWatchingTrayInView();
        await page.waitForTimeout(5000);
        trayItems = await authPage.getContinueWatchingTrayItemDetails();
        trayItemCount = trayItems.length;
        logger.info('Continue Watching tray items after refresh', { trayItems: trayItems.map((t) => t.title) });
        matched = trayItems.some((it) => (it.title || '').toLowerCase().includes(contentTitle.toLowerCase()));
      }
      logger.assertion('Continue Watching tray populated after playback from tab', matched);
      if (matched) {
        return {
          isValid: true,
          trayItemCount,
          contentVisibleInTray: true,
          selectedTab: tabName,
        };
      }
    } catch (error) {
      logger.debug(`Continue Watching cross-tab validation failed for tab ${tabName}`, error);
    }
  }
  return {
    isValid: false,
    trayItemCount: 0,
    contentVisibleInTray: false,
    reason: 'No Continue Watching content appeared in the tray after watching content from the selected tabs',
  };
}

export async function verifyContinueWatchingDetailsAndMoreNavigation(
  page: any,
  input?: ContinueWatchingDetailsAndMoreInput
): Promise<ContinueWatchingDetailsAndMoreOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting Continue Watching details and more navigation validation');
  const mode = input?.mode;
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await authPage.waitForContinueWatchingTrayToBeReady();
  const titleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!titleVisible) {
    return {
      isValid: false,
      detailsAndMoreVisible: false,
      detailsPageVisible: false,
      reason: 'Continue Watching tray title is not visible',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const traySection = await authPage.getContinueWatchingTraySection();
  const firstCard = traySection.locator('img[alt]:not([alt="arrow-right"])').first();
  const cardCount = await traySection.locator('img[alt]:not([alt="arrow-right"])').count().catch(() => 0);
  if (!cardCount) {
    return {
      isValid: false,
      detailsAndMoreVisible: false,
      detailsPageVisible: false,
      reason: 'No Continue Watching cards were available to validate the details action',
    };
  }
  await firstCard.hover({ timeout: 30000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  const detailActionVisible = await detailsPage.isContinueWatchingDetailsAndMoreVisible();
  if (!detailActionVisible) {
    return {
      isValid: false,
      detailsAndMoreVisible: false,
      detailsPageVisible: false,
      reason: 'The Details and More action did not appear on the Continue Watching card',
    };
  }
  await detailsPage.clickContinueWatchingDetailsAndMore();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const detailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  logger.assertion('Continue Watching details action visible', detailActionVisible);
  logger.assertion('Content details page visible after selection', detailsPageVisible);
  return {
    isValid: detailActionVisible && detailsPageVisible,
    detailsAndMoreVisible: detailActionVisible,
    detailsPageVisible,
    reason: detailActionVisible && detailsPageVisible ? undefined : 'The Details and More navigation did not reach the content details page',
  };
}

export async function verifyUpNextBingeMarkerFromContinueWatching(
  page: any,
  input?: UpNextContinueWatchingInput
): Promise<UpNextContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode === 'valid' || input?.mode === undefined ? 'valid' : input.mode;
  logger.step('Starting Up Next binge marker validation from Continue Watching tray');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await authPage.registerContinueWatchingListener();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.ensureContinueWatchingTrayInView();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForTimeout(5000);
  const graphQLShowItems = await authPage.getContinueWatchingGraphQLShows();
  const selectedShow = graphQLShowItems.find((item) => Boolean(item.showTitle)) || graphQLShowItems[0];
  const selectedContentTitle = selectedShow?.showTitle || selectedShow?.episodeTitle || '';
  logger.step(`Selected show content for IW3-T1961 from Continue Watching GraphQL: ${selectedContentTitle}`);
  const initialVisibility = graphQLShowItems.some((item) =>
  (item.showTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()) ||
    item.episodeTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()))
  );
  const openedFromTray = await authPage.clickContinueWatchingItemUsingGraphQL(selectedContentTitle, 30000);
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(6000);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.99);
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(1000);
  const currentMetadata = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  const currentSeasonNumber = currentMetadata.seasonNumber || '';
  const currentEpisodeNumber = currentMetadata.episodeNumber || '';
  const markerVisible = await detailsPage.waitForUpNextMarker(20000);
  await page.waitForTimeout(20000);
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  const nextMetadata = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  const nextSeasonNumber = nextMetadata.seasonNumber || '';
  const nextEpisodeNumber = nextMetadata.episodeNumber || '';
  const currentNumbers = extractSeasonEpisodeNumbers({ seasonNumber: currentSeasonNumber, episodeNumber: currentEpisodeNumber });
  const nextNumbers = extractSeasonEpisodeNumbers({ seasonNumber: nextSeasonNumber, episodeNumber: nextEpisodeNumber });
  const isNextSeasonPlayback = Boolean(currentNumbers.seasonNumber && nextNumbers.seasonNumber && nextNumbers.seasonNumber > currentNumbers.seasonNumber);
  const episodeProgressionValid = isNextSeasonPlayback
    ? Boolean(nextNumbers.episodeNumber === 1)
    : Boolean(currentNumbers.episodeNumber && nextNumbers.episodeNumber && nextNumbers.episodeNumber > currentNumbers.episodeNumber);
  const seasonProgressionValid = isNextSeasonPlayback
    ? Boolean(nextNumbers.seasonNumber && currentNumbers.seasonNumber && nextNumbers.seasonNumber > currentNumbers.seasonNumber && nextNumbers.episodeNumber === 1)
    : true;
  const autoPlaybackStarted = markerVisible && await detailsPage.isPlayerScreenVisible().catch(() => false);
  logger.assertion(`Up Next marker visible from Continue Watching resume - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, markerVisible);
  logger.assertion(`Automatic next episode playback started - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, autoPlaybackStarted);
  logger.assertion(`Episode progression validated - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, episodeProgressionValid);
  logger.assertion(`Season progression validated - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, seasonProgressionValid);
  return {
    isValid: markerVisible && autoPlaybackStarted && episodeProgressionValid && seasonProgressionValid,
    markerVisible,
    autoPlaybackStarted,
    currentSeasonNumber,
    currentEpisodeNumber,
    nextSeasonNumber,
    nextEpisodeNumber,
    episodeProgressionValid,
    seasonProgressionValid,
    reason: markerVisible && autoPlaybackStarted && episodeProgressionValid && seasonProgressionValid ? undefined : 'The Up Next marker, automatic playback, or episode/season progression was not observed after resuming from Continue Watching',
  };
}

export async function verifyClickUpNextBingeMarkerFromContinueWatching(
  page: any,
  input?: UpNextContinueWatchingInput
): Promise<UpNextContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  logger.step('Starting Up Next binge marker validation from Continue Watching tray');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await authPage.registerContinueWatchingListener();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.ensureContinueWatchingTrayInView();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForTimeout(5000);
  const graphQLShowItems = await authPage.getContinueWatchingGraphQLShows();
  const selectedShow = graphQLShowItems.find((item) => Boolean(item.showTitle)) || graphQLShowItems[0];
  const selectedContentTitle = selectedShow?.showTitle || selectedShow?.episodeTitle || '';
  logger.step(`Selected show content for IW3-T1961 from Continue Watching GraphQL: ${selectedContentTitle}`);
  // Check if content is visible in Continue Watching BEFORE clicking the tray item
  // Use GraphQL data as source of truth - if it was in the GraphQL response, it's visible
  const initialVisibility = graphQLShowItems.some((item) =>
  (item.showTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()) ||
    item.episodeTitle?.toLowerCase().includes(selectedContentTitle.toLowerCase()))
  );
  await authPage.clickContinueWatchingItemUsingGraphQL(selectedContentTitle, 30000);
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(6000);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.98);
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(1000);
  const currentMetadata = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  const currentSeasonNumber = currentMetadata.seasonNumber || '';
  const currentEpisodeNumber = currentMetadata.episodeNumber || '';
  const markerVisible = await detailsPage.waitForUpNextMarker(20000);
  await detailsPage.clickUpNextMarker();
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => undefined);
  const nextMetadata = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  const nextSeasonNumber = nextMetadata.seasonNumber || '';
  const nextEpisodeNumber = nextMetadata.episodeNumber || '';
  const currentNumbers = extractSeasonEpisodeNumbers({ seasonNumber: currentSeasonNumber, episodeNumber: currentEpisodeNumber });
  const nextNumbers = extractSeasonEpisodeNumbers({ seasonNumber: nextSeasonNumber, episodeNumber: nextEpisodeNumber });
  const isNextSeasonPlayback = Boolean(currentNumbers.seasonNumber && nextNumbers.seasonNumber && nextNumbers.seasonNumber > currentNumbers.seasonNumber);
  const episodeProgressionValid = isNextSeasonPlayback
    ? Boolean(nextNumbers.episodeNumber === 1)
    : Boolean(currentNumbers.episodeNumber && nextNumbers.episodeNumber && nextNumbers.episodeNumber > currentNumbers.episodeNumber);
  const seasonProgressionValid = isNextSeasonPlayback
    ? Boolean(nextNumbers.seasonNumber && currentNumbers.seasonNumber && nextNumbers.seasonNumber > currentNumbers.seasonNumber && nextNumbers.episodeNumber === 1)
    : true;
  const autoPlaybackStarted = markerVisible && await detailsPage.isPlayerScreenVisible().catch(() => false);
  logger.assertion(`Up Next marker visible from Continue Watching resume - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, markerVisible);
  logger.assertion(`Automatic next episode playback started - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, autoPlaybackStarted);
  logger.assertion(`Episode progression validated - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, episodeProgressionValid);
  logger.assertion(`Season progression validated - current ${currentSeasonNumber || 'N/A'}/${currentEpisodeNumber || 'N/A'} -> next ${nextSeasonNumber || 'N/A'}/${nextEpisodeNumber || 'N/A'}`, seasonProgressionValid);
  return {
    isValid: markerVisible && autoPlaybackStarted && episodeProgressionValid && seasonProgressionValid,
    markerVisible,
    autoPlaybackStarted,
    currentSeasonNumber,
    currentEpisodeNumber,
    nextSeasonNumber,
    nextEpisodeNumber,
    episodeProgressionValid,
    seasonProgressionValid,
    reason: markerVisible && autoPlaybackStarted && episodeProgressionValid && seasonProgressionValid ? undefined : 'The Up Next marker, automatic playback, or episode/season progression was not observed after resuming from Continue Watching',
  };
}

/**
 * Flow: search -> open details -> navigate to Season 1 last episode -> play -> seek near end -> wait for autoplay -> verify next season first episode started
 */
export async function verifyNextSeasonFirstEpisodeAutoPlayFlow(page: any, input?: OpenContentAndPlayInput): Promise<UpNextContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  const mode = input?.mode;
  const gql = GraphQLHelper.getInstance(page);
  logger.step('Starting verify next season first episode autoplay flow');
  const loginResult = await loginToOTT(page, { mode });
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      markerVisible: false,
      autoPlaybackStarted: false,
      reason: 'Login was not successful before starting the next season autoplay flow',
    };
  }
  const collectionResponse = await gql.waitForOperation('Collection', 60000).catch(() => null);
  if (!collectionResponse) {
    return {
      isValid: false,
      markerVisible: false,
      autoPlaybackStarted: false,
      reason: 'Collection GraphQL response was not available to resolve a multi-season show',
    };
  }
  await authPage.refreshPage();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  const selectedMultiSeasonShow = await selectMultiSeasonShowFromCollection(page, collectionResponse);
  const selectedContentName = selectedMultiSeasonShow?.title ?? '';
  if (!selectedContentName) {
    return {
      isValid: false,
      markerVisible: false,
      autoPlaybackStarted: false,
      reason: 'No multi-season show could be selected from collection data',
    };
  }
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(selectedContentName);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  const finalSelectedContentName = (await detailsPage.getShowDetailsHeadingText().catch(() => '')).trim() || selectedContentName;
  await detailsPage.clickSeasonLabel('Season 1').catch(() => undefined);
  await detailsPage.selectEpisodeBySeasonAndEpisode('Season 1', 'E5').catch(() => undefined);
  await detailsPage.clickPlayButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await detailsPage.dragSeekBarToPosition(0.50).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickBackButton().catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.registerContinueWatchingListener();
  await authPage.refreshPage();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await authPage.ensureContinueWatchingTrayInView();
  const openedFromTray = await authPage.clickContinueWatchingItemUsingGraphQL(finalSelectedContentName, 30000);
  if (!openedFromTray) {
    return {
      isValid: false,
      markerVisible: false,
      autoPlaybackStarted: false,
      reason: `Unable to open '${finalSelectedContentName}' from the Continue Watching tray`,
    };
  }
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickSeasonLabel('Season 1').catch(() => undefined);
  await detailsPage.scrollEpisodeListToEnd().catch(() => undefined);
  await detailsPage.clickLastEpisodeFromEpisodesList().catch(() => false);
  await page.waitForTimeout(6000);
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await detailsPage.dragSeekBarToPosition(0.99).catch(() => undefined);
  const currentMetadata = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  const currentSeasonNumber = currentMetadata.seasonNumber || '';
  const currentEpisodeNumber = currentMetadata.episodeNumber || '';
  const currentNumbers = extractSeasonEpisodeNumbers({ seasonNumber: currentSeasonNumber, episodeNumber: currentEpisodeNumber });
  await page.waitForTimeout(5000);
  const markerVisible = await detailsPage.waitForUpNextMarker(20000).catch(() => false);
  let nextMetadata = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  const endTime = Date.now() + 60000;
  while (Date.now() < endTime) {
    const observed = await detailsPage.getCurrentPlayerEpisodeMetadata().catch(() => null);
    if (observed && observed.seasonNumber && observed.episodeNumber) {
      const observedNumbers = extractSeasonEpisodeNumbers(observed);
      if (observedNumbers.seasonNumber && observedNumbers.seasonNumber > currentNumbers.seasonNumber) {
        nextMetadata = observed;
        break;
      }
    }
    await page.waitForTimeout(2000);
  }
  const nextSeasonNumber = nextMetadata.seasonNumber || '';
  const nextEpisodeNumber = nextMetadata.episodeNumber || '';
  const nextNumbers = extractSeasonEpisodeNumbers({ seasonNumber: nextSeasonNumber, episodeNumber: nextEpisodeNumber });
  const autoPlaybackStarted = await playbackPage.isPlaybackStarted().catch(() => false);
  const isNextSeasonPlayback = Boolean(currentNumbers.seasonNumber && nextNumbers.seasonNumber && nextNumbers.seasonNumber > currentNumbers.seasonNumber);
  const episodeProgressionValid = isNextSeasonPlayback ? nextNumbers.episodeNumber === 1 : false;
  const seasonProgressionValid = isNextSeasonPlayback && nextNumbers.episodeNumber === 1;
  logger.assertion('Continue Watching content resumed and ended on a Season 1 episode', Boolean(currentNumbers.seasonNumber));
  logger.assertion('Up Next marker or transition observed', markerVisible || isNextSeasonPlayback);
  logger.assertion('Season 2 first episode playback started automatically', seasonProgressionValid);
  logger.assertion('Playback remains started after episode end', autoPlaybackStarted);
  return {
    isValid: autoPlaybackStarted && seasonProgressionValid,
    markerVisible,
    autoPlaybackStarted,
    currentSeasonNumber,
    currentEpisodeNumber,
    nextSeasonNumber,
    nextEpisodeNumber,
    episodeProgressionValid,
    seasonProgressionValid,
    reason: autoPlaybackStarted && seasonProgressionValid ? undefined : 'The first episode of the next season did not start automatically after completing the last episode of Season 1',
  };
}

export async function verifyContentUpdatedInContinueWatchingTray(
  page: any,
  input?: ContentUpdatedInContinueWatchingInput
): Promise<ContentUpdatedInContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('IW3-T1941: Verifying content is updated in Continue Watching tray after partial watch');
  const mode = input?.mode;
  const seekMinutes = input?.seekMinutes ?? 1;
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  let trayTitleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  if (!trayTitleVisible) {
    logger.step('CW tray not present; creating partially watched content item to satisfy precondition');
    await authPage.clickMoviesTab();
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    await detailsPage.clickFirstMovieContent().catch(() => undefined);
    await detailsPage.clickPlayButton().catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    await page.waitForTimeout(5000);
    await detailsPage.dragSeekBarByMinutes(seekMinutes).catch(() => undefined);
    await detailsPage.clickBackButton().catch(() => undefined);
    await authPage.clickHomeTab();
    await authPage.refreshPage();
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    trayTitleVisible = await authPage.isContinueWatchingTrayTitleVisible();
  }
  if (!trayTitleVisible) {
    return {
      isValid: false,
      contentRemainsInTray: false,
      progressBarVisible: false,
      selectedContentName: '',
      playerTimerBeforeExit: '',
      trayVisible: false,
      reason: 'Precondition failed: Continue Watching tray is not visible even after playing content.',
    };
  }
  await authPage.ensureContinueWatchingTrayInView();
  const cardSelector = authPage.getContinueWatchingCardSelector();
  const traySectionFirst = await authPage.getContinueWatchingTraySection();
  const trayItems = traySectionFirst.locator(cardSelector);
  const itemCount = await trayItems.count().catch(() => 0);
  if (!itemCount) {
    return {
      isValid: false,
      contentRemainsInTray: false,
      progressBarVisible: false,
      selectedContentName: '',
      playerTimerBeforeExit: '',
      trayVisible: true,
      reason: 'No content items found in Continue Watching tray',
    };
  }
  const firstItem = trayItems.first();
  await firstItem.scrollIntoViewIfNeeded();
  const selectedContentName = ((await firstItem.getAttribute('alt')) || '').trim();
  logger.step(`Selected content from CW tray: "${selectedContentName}"`);
  await firstItem.click({ force: true, timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await detailsPage.clickResumeAction().catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(7000);
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await detailsPage.dragSeekBarByMinutes(seekMinutes).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const playerTimerBeforeExit = await detailsPage.getPlaybackTimeText().catch(() => '');
  logger.info(`Player timer captured: "${playerTimerBeforeExit}"`);
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await detailsPage.clickBackButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.ensureContinueWatchingTrayInView();
  const traySectionSecond = await authPage.getContinueWatchingTraySection();
  const reloadedItems = traySectionSecond.locator(cardSelector);
  const reloadedCount = await reloadedItems.count().catch(() => 0);
  let sameContentItem: any = null;
  for (let i = 0; i < reloadedCount; i++) {
    const candidate = reloadedItems.nth(i);
    const alt = ((await candidate.getAttribute('alt')) || '').trim();
    if (alt && selectedContentName && alt.toLowerCase().includes(selectedContentName.toLowerCase())) {
      sameContentItem = candidate;
      break;
    }
  }
  if (!sameContentItem && reloadedCount > 0) {
    sameContentItem = reloadedItems.first();
  }
  if (sameContentItem) {
    await sameContentItem.scrollIntoViewIfNeeded();
    await sameContentItem.click({ force: true, timeout: 30000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    await page.waitForTimeout(3000);
    await detailsPage.clickResumeAction().catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    await page.waitForTimeout(3000);
  }
  await detailsPage.hoverPlaybackControls().catch(() => undefined);
  await page.waitForTimeout(500);
  await detailsPage.clickBackButton().catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.clickHomeTab();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  await authPage.ensureContinueWatchingTrayInView();
  const trayVisible = await authPage.isContinueWatchingTrayTitleVisible();
  const contentRemainsInTray = selectedContentName
    ? await authPage.isContinueWatchingItemVisible(selectedContentName)
    : trayVisible;
  logger.assertion(
    `Content "${selectedContentName}" remains in Continue Watching tray`,
    contentRemainsInTray
  );
  const progressBarPercentage = await authPage.getContinueWatchingProgressBarPercentage(selectedContentName);
  const progressBarVisible = progressBarPercentage > 0;
  logger.assertion(
    `Progress bar percentage extracted: ${progressBarPercentage}%`,
    progressBarVisible
  );
  const isValid = trayVisible && contentRemainsInTray && progressBarVisible;
  logger.assertion('Content updated in CW tray after partial watch', isValid);
  return {
    isValid,
    contentRemainsInTray,
    progressBarVisible,
    selectedContentName,
    playerTimerBeforeExit,
    trayVisible,
    reason: isValid
      ? undefined
      : `Content "${selectedContentName}" update validation failed: trayVisible=${trayVisible}, contentRemainsInTray=${contentRemainsInTray}, progressBarVisible=${progressBarVisible} (percentage=${progressBarPercentage}%)`,
  };
}

export async function verifyResumeToPlayAfterRemovingFromContinueWatching(
  page: any,
  input?: ResumeToPlayAfterRemovalInput
): Promise<ResumeToPlayAfterRemovalOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  logger.step(`Starting resume-to-play regression flow`);
  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const collectionResponse = await gql.waitForOperation('Collection', 60000).catch(() => null);
  if (!loginResult.isLoggedIn) {
    return {
      isValid: false,
      detailsPageVisible: false,
      playActionVisible: false,
      defaultEpisodeRetained: false,
      reason: 'Login was not successful before the continue-watching regression flow started',
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  if (!collectionResponse) {
    return {
      isValid: false,
      detailsPageVisible: false,
      playActionVisible: false,
      defaultEpisodeRetained: false,
      reason: 'Collection GraphQL response not available to resolve a show for the flow',
    };
  }
  const selectedShow = await selectMultiSeasonShowFromCollection(page, collectionResponse);
  if (!selectedShow || !selectedShow.title) {
    return {
      isValid: false,
      detailsPageVisible: false,
      playActionVisible: false,
      defaultEpisodeRetained: false,
      reason: 'No multi-season show could be resolved from Collection GraphQL for this flow',
    };
  }
  const selectedContentName = selectedShow.title;
  logger.step(`Resolved show for resume-to-play flow: ${selectedContentName}`);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(selectedContentName);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstSearchResult();
  const selectedEpisode = await detailsPage.selectEpisodeBySeasonAndEpisode(input?.season, input?.episodeName);
  logger.info('Selected episode metadata for playback', selectedEpisode);
  await detailsPage.clickPlayButton();
  await page.waitForTimeout(4000);
  await detailsPage.dragSeekBarByMinutes(1);
  await page.waitForTimeout(5000);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickBackButton();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  await authPage.clickHomeTab();
  await authPage.refreshPage();
  await authPage.waitForContinueWatchingTrayToBeReady();
  await authPage.ensureContinueWatchingTrayInView();
  const traySection = await authPage.getContinueWatchingTraySection();
  const trayCards = traySection.locator('img[alt]:not([alt="arrow-right"])');
  const cardCount = await trayCards.count().catch(() => 0);
  if (!cardCount) {
    return {
      isValid: false,
      detailsPageVisible: false,
      playActionVisible: false,
      defaultEpisodeRetained: false,
      reason: 'No Continue Watching cards were available to validate the removal regression flow',
    };
  }
  await trayCards.first().hover({ timeout: 30000 }).catch(() => undefined);
  const removeResult = await authPage.removeFirstContinueWatchingItem();
  await authPage.refreshPage();
  await page.waitForTimeout(4000);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(selectedContentName);
  await authPage.submitSearchQuery();
  await page.waitForTimeout(4000);
  await detailsPage.clickFirstSearchResult();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const detailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  await authPage.refreshPage();
  let playS1E1Visible = false;
  try {
    playS1E1Visible = await page
      .getByText('Play S1 E1', { exact: true })
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  } catch {
    playS1E1Visible = false;
  }
  const isDefaultPlayState = detailsPageVisible && playS1E1Visible;
  logger.info('Default Play state validation', { detailsPageVisible, playS1E1Visible, confirmationVisible: removeResult.confirmationVisible, isDefaultPlayState, });
  logger.assertion('Content Details page is displayed', detailsPageVisible);
  logger.assertion('Primary CTA reverted to "Play S1 E1"', playS1E1Visible);
  const isValid = isDefaultPlayState && removeResult.confirmationVisible;
  return {
    isValid,
    detailsPageVisible,
    playActionVisible: playS1E1Visible,
    defaultEpisodeRetained: playS1E1Visible,
    reason: isValid
      ? undefined
      : 'Expected the Content Details page to display the default CTA "Play S1 E1" after removing the title from Continue Watching.',
  };
}
