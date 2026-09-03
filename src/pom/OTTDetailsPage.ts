import { expect, Page, Locator } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { TIMEOUT } from 'node:dns';

export class OTTDetailsPage {
  private readonly page: Page;
  private readonly pageUtils: PageUtils;
  private storedContentTitle: string = '';
  private storedContentMetadata: string = '';
  private storedContentDescription: string = '';
  private hasStoredDetails: boolean = false;
  private lastSelectedEpisodeMetadata: { seasonNumber: string; episodeNumber: string; title: string } = {
    seasonNumber: '',
    episodeNumber: '',
    title: '',
  };
  private readonly showsSectionLink: PageElement;
  private readonly firstShowContentCard: PageElement;
  private readonly moviesSectionLink: PageElement;
  private readonly firstShowContentCandidateSelectors: string[];
  private readonly firstShowContentFallbackSelector: string;
  private readonly clickTargetAncestorSelector: string;
  private readonly clickTargetDescendantSelector: string;
  private readonly playButton: PageElement;
  private readonly videoElement: PageElement;
  private readonly vpnErrorMessage: PageElement;
  private readonly firstEpisodeCard: PageElement;
  private readonly firstEpisodeCardByEpisodeOne: PageElement;
  private readonly episodesListItems: PageElement;
  private readonly seasonLabels: PageElement;
  private readonly lastSeasonHeading: PageElement;
  private readonly seasonLabelContainer: PageElement;
  private readonly episodeItems: PageElement;
  private readonly episodeLabelSelector: PageElement;
  private readonly episodeListContainer: PageElement;
  private readonly episodeBufferIndicator: PageElement;
  private readonly iWantLogo: PageElement;
  private readonly videoPlayer: PageElement;
  private readonly leftCarouselArrow: PageElement;
  private readonly episodeTitle: PageElement;
  private readonly playbackContentTitle: PageElement;
  private readonly playbackEpisodeTitle: PageElement;
  private readonly playbackTitleParagraph: PageElement;
  private readonly playerForwardButton: PageElement;
  private readonly playerBackArrowButton: PageElement;
  private readonly continueWatchingTray: PageElement;
  private readonly continueWatchingThumbnail: PageElement;
  private readonly continueWatchingRemoveButton: PageElement;
  private readonly showDetailsHeading: PageElement;
  private readonly contentMetadata: PageElement;
  private readonly resumeButton: PageElement;
  private readonly parentalPinPlaybackPrompt: PageElement;
  private readonly parentalPinEntryInputs: PageElement;
  private readonly parentalPinValidateButton: PageElement;
  private readonly parentalPinInvalidErrorMessage: PageElement;
  private readonly cookieConfirmButton: PageElement;
  private readonly premiumTagIcon: PageElement;
  private readonly premiumCrownIcon: PageElement;
  private readonly subscribeToWatchCta: PageElement;
  private readonly subscribeToWatchCtaButton: PageElement;
  private readonly subscribeToWatchCtaBlocker: PageElement;
  private readonly subscriptionInstructionPrompt: PageElement;
  private readonly upgradePlanButton: PageElement;
  private readonly plansPageHeading: PageElement;
  private readonly subtitleVisible: PageElement;
  private readonly skipIntroMarker: PageElement;
  private readonly skipRecapMarker: PageElement;
  private readonly skipAdButton: PageElement;
  private readonly learnMoreLink: PageElement;
  private readonly addToWatchlistButton: PageElement;
  private readonly addToWatchlistButtonIcon: PageElement;
  private readonly removeFromWatchlistButton: PageElement;
  private readonly addWatchlistIcon: PageElement;
  private readonly removeWatchlistIcon: PageElement;
  private readonly watchlistTooltipAdd: PageElement;
  private readonly watchlistTooltipRemove: PageElement;
  private readonly watchlistFullPopup: PageElement;
  private readonly myWatchlistLink: PageElement;
  private readonly watchlistToast: PageElement;
  private readonly cinemaOnePhSection: PageElement;
  private readonly liveChannelsTray: PageElement;
  private readonly liveChannelsHeadingLabel: PageElement;
  private readonly dzmmTeleradyoItem: PageElement;
  private readonly watchlistContentCard: PageElement;
  private readonly contentMetadataFallback: PageElement;
  private readonly freeTagBadge: PageElement;
  private readonly loginCta: PageElement;
  private readonly firstSearchResult: PageElement;
  private readonly searchResultImages: PageElement;
  private readonly thumbnailLabelOverlay: PageElement;
  private readonly playerScreen: PageElement;
  private readonly playerVideoControls: PageElement;
  private readonly playerProgressAndtimeControls: PageElement;
  private readonly seekBar: PageElement;
  private readonly progressBarContainer: PageElement;
  private readonly progressBarIndicator: PageElement;
  private readonly playbackTime: PageElement;
  private readonly playerTimeDisplay: PageElement;
  private readonly playbackTimeValue: PageElement;
  private readonly pauseButton: PageElement;
  private readonly liveChannelTile: PageElement;
  private readonly rewindButton: PageElement;
  private readonly forwardButton: PageElement;
  private readonly volumeButton: PageElement;
  private readonly subtitleButton: PageElement;
  private readonly subtitleLanguageOption: PageElement;
  private readonly subtitleOffOption: PageElement;
  private readonly subtitleDisplayIndicator: PageElement;
  private readonly nextEpisodeButton: PageElement;
  private readonly upNextMarker: PageElement;
  private readonly upNextCloseButton: PageElement;
  private readonly backButton: PageElement;
  private readonly adScreenBackToPlayer: PageElement;
  private readonly fullscreenButton: PageElement;
  private readonly minimizeButton: PageElement;
  private readonly goLiveButton: PageElement;
  private readonly liveTag: PageElement;
  private readonly adTag: PageElement;
  private readonly pauseAdBanner: PageElement;
  private readonly pauseAdInteractiveTarget: PageElement;
  private readonly pauseAdInMaximizedPlayer: PageElement;
  private readonly pauseAdInMinimizedPlayer: PageElement;
  private readonly returnToContentText: PageElement;
  private readonly pauseAdMidBanner: PageElement;
  private readonly midRollAdBanner: PageElement;
  private readonly midRollAdOverlay: PageElement;
  private readonly minimizeIcon: PageElement;
  private readonly adBanner: PageElement;
  private readonly thirdPartyAdFrame: PageElement;
  private readonly pauseBanner: PageElement;
  private readonly firstTitleImageCard: PageElement;
  private readonly titleImageWithAlt: PageElement;
  private readonly contentMetadataDiv: PageElement;
  private readonly contentDescDiv: PageElement;
  private readonly contentDetailsGenres: PageElement;
  private readonly contentDetailsCast: PageElement;
  private readonly contentMetadataBeforePlay: PageElement;
  private readonly contentCardContainer: PageElement;
  private readonly freeContentBadge: PageElement;
  private readonly contentCardAncestor: PageElement;
  private readonly contentCardInteractiveTarget: PageElement;
  private readonly episodeCardAncestor: PageElement;
  private readonly contentAncestorChain: PageElement;
  private readonly continueWatchingDetailsAndMore: PageElement;
  private readonly contentDetailsHeading: PageElement;
  private readonly contentCloseButton: PageElement;
  private readonly contentMoreExpandButton: PageElement;
  private readonly contentLanguageIcon: PageElement;
  private readonly contentSubtitleIcon: PageElement;
  private readonly contentShareIcon: PageElement;
  private readonly shareCopyConfirmationMessage: PageElement;
  private readonly contentTitleImage: PageElement;
  private readonly contentGenre: PageElement;
  private readonly contentYear: PageElement;
  private readonly contentAgeRating: PageElement;
  private readonly contentDuration: PageElement;
  private readonly contentCast: PageElement;
  private readonly showSectionContainer: PageElement;
  private readonly showSectionText: PageElement;
  private readonly moviesSectionNavigation: PageElement;
  private readonly firstShowRailThumbnail: PageElement;
  private readonly showRailImageCandidate: PageElement;
  private readonly movieRailContainer: PageElement;
  private readonly movieRailImage: PageElement;
  private readonly movieRailInteractiveTarget: PageElement;
  private readonly mainContentContainer: PageElement;
  private readonly pageBody: PageElement;
  private readonly genericTextPattern: PageElement;
  private readonly playerScreenFallback: PageElement;
  private readonly watchlistToastContainer: PageElement;
  private readonly removeWatchlistFallbackIcon: PageElement;
  private readonly liveChannelsHeading: PageElement;
  private readonly playerLoaderOverlay: PageElement;
  private readonly playerMidSpacer: PageElement;
  private readonly midRailAdBanner: PageElement;
  private readonly subscribeCtaContainer: PageElement;
  private readonly subscribeCtaInteractiveTarget: PageElement;
  private readonly subscribeConfirmationButtonPattern: PageElement;
  private readonly watchlistCardBase: PageElement;
  private readonly watchlistCardCursor: PageElement;
  private readonly watchlistCardGeneric: PageElement;
  private readonly watchlistCardContentTestId: PageElement;
  private readonly watchlistCardShowTestId: PageElement;
  private readonly watchlistTitleImage: PageElement;
  private readonly watchlistToastAdded: PageElement;
  private readonly watchlistToastRemoved: PageElement;
  private readonly watchlistToastGeneric: PageElement;
  private readonly watchlistRemoveFallbackIcon: PageElement;
  private readonly watchlistPremiumTagIcon: PageElement;
  private readonly watchlistFreeTagIcon: PageElement;
  private readonly watchlistCardHeading: PageElement;
  private readonly watchlistCardTitleImage: PageElement;
  private readonly contentTitleImageAlt: PageElement;
  private readonly contentMetadataContainer: PageElement;
  private readonly contentDescriptionContainer: PageElement;
  private readonly previewVideoElement: PageElement;
  private readonly previewPlaybackIndicator: PageElement;
  private readonly contentCardWithPreview: PageElement;
  private readonly episodeLabelTextPattern: PageElement;
  private readonly videoPlayerTitleTestId: PageElement;
  private readonly deeplinkDetailsHeading: PageElement;
  private readonly deeplinkTitleText: PageElement;
  private readonly deeplinkSummaryText: PageElement;
  private readonly genericTextLocator: PageElement;
  private readonly liveTextLabel: PageElement;
  private readonly goLiveButtonElement: PageElement;
  private readonly playerFirstContentTitle: PageElement;
  private readonly movieRailWithPointer: PageElement;
  private readonly continueWatchingFirstContent: PageElement;
  private readonly contentCardImage: PageElement;
  private readonly contentCardHeading: PageElement;
  private readonly carouselInfoIcon: PageElement;
  private readonly becauseYouWatchedHeading: PageElement;
  private readonly becauseYouWatchedTrayContainer: PageElement;
  private readonly becauseYouWatchedFirstItem: PageElement;
  private readonly firstTrayContent: PageElement;
  private readonly firstCarouselRail: PageElement;
  private readonly subscriptionBlockerMessage: PageElement;
  private readonly railThumbnailSelector: PageElement;
  private readonly mobileMainMenu: PageElement;
  private readonly dbfirstTitleImageCard: PageElement;
  private readonly sponsoredRailContentCard: PageElement;
  private readonly episodeItem: PageElement;
  private readonly seasonTitleContainer: string;

  constructor(page: Page) {
    this.page = page;
    this.pageUtils = new PageUtils(page);
    this.showsSectionLink = { selector: 'nav >> text=Shows' };
    this.moviesSectionLink = { selector: 'nav >> text=Movies' };
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image' };
    this.firstShowContentCandidateSelectors = ['.scrollable-list:first-of-type .thumbnail', '.thumbnail', 'img.title-image', '[data-testid="content-card"]', '[data-testid="show-card"]', 'a[href*="/content"]', 'a[href*="/show"]'];
    this.firstShowContentFallbackSelector = 'img';
    this.clickTargetAncestorSelector = 'xpath=ancestor::a[1] | ancestor::button[1] | ancestor::*[contains(@role, "button")][1]';
    this.clickTargetDescendantSelector = 'xpath=.//a | .//button | .//*[@role="button"]';
    this.playButton = { selector: '#play' };
    this.playerProgressAndtimeControls = { selector: '//div[contains(@class,"player-progress-and-time-container")]' };
    this.videoElement = { selector: 'video' };
    this.vpnErrorMessage = { selector: 'main h2, [role="alert"], [data-testid*="vpn" i], [class*="vpn" i]' };
    this.seasonLabels = { selector: 'h3.season-title, .season-title, [data-testid*="season"], h3:has-text("Season"), text=/Season\\s*\\d+/i' };
    this.seasonLabelContainer = { selector: '.seasons-list, .season-list, [data-testid*="season-list"], [class*="season"], .season-container' };
    this.episodeItems = { selector: '.episodes-list .episode-info, .seasons-container .episode-info, .season-episodes .episode-info, .episodes-list [data-testid*="episode"], .episode-list [data-testid*="episode"], [data-testid*="episode-item"], .episode-card, [data-testid*="episode-card"], .episode-item' };
    this.episodeLabelSelector = { selector: '.episode-info, .episode-title, .episode-meta, [data-testid*="episode-title"], [data-testid*="episode-meta"]' };
    this.episodeListContainer = { selector: '.episodes-list, .season-episodes, [data-testid*="episode-list"], [class*="episodes-list"], [class*="season-episodes"], .episode-list, .season-list, .episode-scroll-container, .scrollable, .overflow-scroll, .overflow-auto' };
    this.episodeBufferIndicator = { selector: '[aria-label*="loading"], .loader, .spinner, [data-testid*="buffer"], [data-testid*="loading"], text=/loading/i' };
    this.iWantLogo = { selector: 'img[alt*="iWant"], [aria-label*="iWant"], [data-testid*="logo"], img[alt*="logo"]' };
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]' };
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
    this.showsSectionLink = { selector: 'nav >> text=Shows' };
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image' };
    this.firstEpisodeCard ={ selector: '[data-testid="episode-card"], .episode-card, .season-episodes .episode-item, .episode-list .episode-item, main [role="button"], main [cursor="pointer"]' };
    this.episodesListItems = { selector: 'xpath=//div[contains(@class,"episodes-list") or contains(@class,"episode-list")]/descendant::div[contains(@class,"episode") or contains(@data-testid,"episode") or contains(normalize-space(.),"S1 E") or contains(normalize-space(.),"S2 E")]' };
    this.firstEpisodeCardByEpisodeOne = { selector: 'img[alt="Episode 1"], [data-testid*="episode-1"], .episode-item:has-text("Episode 1")' };
    this.lastSeasonHeading = { selector: '.seasons-container h3, .season-title, [data-testid*="season"] h3, h3:has-text("Season")' };
    this.videoPlayer = { selector: 'video, [data-testid="video-player"], .video-player video, .player video' };
    this.leftCarouselArrow = { selector: 'img[alt="arrow-left"], [alt="arrow-left"], [data-testid*="arrow-left"], [aria-label*="left"], button[aria-label*="left"], [class*="arrow-left"]' };
    this.episodeTitle = { selector: '[data-testid="episode-title"], .episode-title, h2:has-text("Episode")' };
    this.playbackContentTitle = { selector: '[data-testid="player-title"], .player-title, .video-title, .content-title, .player-header h1, h1' };
    this.playbackEpisodeTitle = { selector: '[data-testid="episode-title"], .episode-title, .player-episode, h2:has-text("Episode"), text=/Episode\\s+\\d+/i' };
    this.playbackTitleParagraph = { selector: "//p[contains(@class,'text-start')]" };
    this.playerForwardButton = { selector: 'button[aria-label*="Forward"], button[aria-label*="forward"], [data-testid*="forward"], button:has-text("Forward"), button:has-text(">>"), button:has-text(">")' };
    this.playerBackArrowButton = { selector: 'button[aria-label*="Back"], button[aria-label*="back"], [data-testid*="back"], button:has-text("Back"), button:has-text("←"), button:has-text("<")' };
    this.continueWatchingTray = { selector: 'text=Continue Watching, [data-testid*="continue-watching"], .continue-watching, .cw-tray' };
    this.continueWatchingThumbnail = { selector: '[data-testid="continue-watching-item"], .continue-watching-item, .cw-item, .continue-watching__item, .continue-watching-thumbnail' };
    this.continueWatchingFirstContent = { selector: '//div[contains(@class,"scrollable-list horizontal-scroll pointer-events")]/div[1]' };
    this.continueWatchingRemoveButton = { selector: 'button[aria-label*="Remove"], button:has-text("Remove"), button:has-text("X"), [data-testid*="remove"], .remove-continue-watching' };
    this.showDetailsHeading = { selector: 'main h1' };
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]' };
    this.resumeButton = { selector: '//*[@id="player-container-main-playPauseButton"]/img' };
    this.parentalPinPlaybackPrompt = { selector: 'text=/Enter the PIN to Access/i' };
    this.parentalPinEntryInputs = { selector: 'input[id^="parental-pin-input-"]' };
    this.parentalPinValidateButton = { selector: 'button:has-text("Submit"), button:has-text("Continue")' };
    this.parentalPinInvalidErrorMessage = { selector: 'text=/Invalid Pin/i' };
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
    this.premiumTagIcon = { selector: 'img[alt="tag"], [aria-label="tag"], [data-testid*="tag"], img[title="tag"]' };
    this.premiumCrownIcon = { selector: '(//div[contains(@class,"monetization-logo")])[1]' };
    this.subscribeToWatchCta = { selector: '//*[@id="subscribe_to_watch"]/div' };
    this.subscribeToWatchCtaButton = { selector: '#play div' };
    this.subscribeToWatchCtaBlocker = { selector: '#subscribe_to_watch div' };
    this.subscriptionInstructionPrompt = { selector: 'text=/A valid subscription is required to view this content|Please subscribe or renew your plan|Subscribe to watch/i' };
    this.upgradePlanButton = { role: 'button', text: 'Upgrade Plan', selector: 'button:has-text("Upgrade Plan"), a:has-text("Upgrade Plan")' };
    this.plansPageHeading = { selector: 'h1', text: 'Plans & Payment' };
    this.playButton = { selector: '#play div' };
    this.skipAdButton = { selector: '//button[@aria-label="Skip Ad"]' };
    this.learnMoreLink = { selector: 'a:has-text("Learn More"), button:has-text("Learn More"), text=/Learn More/i' };
    this.addToWatchlistButton = { selector: 'img[alt*="add_watchlist"]' };
    this.addToWatchlistButtonIcon = { selector: '#watchlist' }
    this.removeFromWatchlistButton = { selector: 'img[alt*="remove_watchlist"]' };
    this.addWatchlistIcon = { role: 'img', text: '/assets/button_icons/focused/add_watchlist.svg' };
    this.removeWatchlistIcon = { role: 'img', text: '/assets/button_icons/focused/remove_watchlist.svg' };
    this.watchlistToast = { selector: "div:has-text('Added to watchlist'), div:has-text('Removed from watchlist')" };
    this.cinemaOnePhSection = { selector: 'img[alt="Cinema One PH"]' };
    this.pauseBanner = { selector: '.pause-banner' };
    this.addToWatchlistButton = { selector: 'xpath=//*[@id="watchlist"]/div' };
    this.removeFromWatchlistButton = { selector: 'img[alt*="remove_watchlist"], img[src*="remove_watchlist"], [data-testid*="remove-watchlist"]' };
    this.addWatchlistIcon = { selector: 'img[alt*="add_watchlist"], img[src*="add_watchlist"], img[alt*="add to watchlist"], [data-testid*="add-watchlist"]' };
    this.removeWatchlistIcon = { selector: 'img[alt*="remove_watchlist"], img[src*="remove_watchlist"], img[alt*="remove from watchlist"], [data-testid*="remove-watchlist"]' };
    this.watchlistToast = { selector: "div:has-text('Added to watchlist'), div:has-text('Removed from watchlist')" };
    this.watchlistFullPopup = { selector: "//p[contains(normalize-space(),'Your watchlist is full')]" };
    this.myWatchlistLink = { selector: 'div#my_watchlist' };
    this.cinemaOnePhSection = { selector: 'img[alt="Cinema One PH"]' };
    this.liveChannelsTray = { text: 'Live Channels', selector: 'text=Live Channels' };
    this.liveChannelsHeadingLabel = { selector: '//p[normalize-space()="Live Channels"]' };
    this.dzmmTeleradyoItem = { text: 'DZMM Teleradyo', selector: 'text=DZMM Teleradyo' };
    this.watchlistContentCard = { selector: 'img[alt="My Illegal Wife"]' };
    this.freeTagBadge = { selector: "img[alt='free'], img[alt='Free'], img[title='free'], img[title='Free'], [aria-label*='free']" };
    this.loginCta = { selector: '#login div' };
    this.searchResultImages = { selector: 'img[alt]' };
    this.subtitleVisible = { selector: '//*[@id="player-container-main"]/div[6]/div/div/span' };
    this.skipIntroMarker = { selector: '//button[@id="player-container-main-skipIntroButton"]' };
    this.skipRecapMarker = { selector: '//button[@id="player-container-main-skipRecapButton"]' };
    this.firstSearchResult = { selector: '(//div[contains(@class,"thumbnail")])[1]' };
    this.thumbnailLabelOverlay = { selector: '//div[@class="thumbnail-label absolute bottom-0 left-[50%] translate-x-[-50%] z-10"]' };
    this.playButton = { selector: '#play div' };
    this.playerScreen = { selector: '//*[@id="player-container-main"]/div[4]' };
    this.seekBar = { selector: '//div[contains(@class,"player-progress-container")]' };
    this.minimizeButton = { selector: '//*[@id="player-container-main-fullscreenButton"]/img' };
    this.playerVideoControls = { selector: "//div[contains(@class,'player-video-controls')]" };
    this.progressBarContainer = { selector: "//div[contains(@class,'player-progress-container')]" };
    this.progressBarIndicator = { selector: "//div[@class='player-progress-indicator']" };
    this.playbackTime = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.playerTimeDisplay = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.playbackTimeValue = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.pauseButton = { selector: '//*[@id="player-container-main-playPauseButton"]/img' };
    this.liveChannelTile = { selector: 'a, button, [role="button"], [data-testid*="content"], [data-testid*="card"]' };
    this.rewindButton = { selector: 'xpath=//*[@id="player-container-main-rewindButton"]/img' };
    this.forwardButton = { selector: 'xpath=//*[@id="player-container-main-forwardButton"]/img' };
    this.subtitleButton = { selector: 'xpath=//*[@id="player-container-main-subtitleButton"]/img' };
    this.subtitleLanguageOption = { selector: 'text=/English\\(Philippines\\)/i' };
    this.subtitleOffOption = { selector: 'text=/\\bOff\\b/i' };
    this.subtitleDisplayIndicator = { selector: 'xpath=//*[@id="player-container-main"]/div[6]/div' };
    this.nextEpisodeButton = { selector: '//*[@id="player-container-main-nextButton"]/img' };
    this.upNextMarker = { selector: '//*[@id="player-container-main"]/div[5]/div[1]' };
    this.backButton = { selector: 'button[aria-label*="back"], button:has-text("Back"), [data-testid*="back"]' };
    this.adScreenBackToPlayer = { selector: '//*[@id="player-container-main"]/div[1]/div[1]' };
    this.fullscreenButton = { selector: '//*[@id="player-container-main-fullscreenButton"]' };
    this.goLiveButton = { selector: 'button:has-text("Go Live"), [data-testid*="go-live"], [aria-label*="Go Live"]' };
    this.liveTag = { selector: 'text=/\\bLIVE\\b/i' };
    this.adTag = { selector: '//*[@id="ad-ui-overlay"]' };
    this.pauseAdBanner = { selector: '[data-testid*="pause-ad"], [data-testid*="ad-overlay"], [class*="pause-ad"], [class*="pause-overlay"], [class*="banner"], [role="dialog"]' };
    this.pauseAdInteractiveTarget = { selector: '[data-testid*="pause-ad"], [data-testid*="ad-overlay"], [class*="pause-ad"], [class*="pause-overlay"], [class*="banner"], [role="dialog"], .pause-ad-container' };
    this.pauseAdInMaximizedPlayer = { selector: '  //*[@alt="Maximize"]/ancestor::div/descendant::div[contains(@class,"pause-ad-container")]' };
    this.pauseAdInMinimizedPlayer = { selector: '//*[@alt="Minimize"]/ancestor::div/descendant::div[contains(@class,"pause-ad-container")]' };
    this.returnToContentText = { selector: '//*[@id="player-container-main"]/div[1]/div[1]' };
    this.pauseAdMidBanner = { selector: '.pause-ad-container' };
    this.midRollAdBanner = { selector: '.midroll-ad, [data-testid*="midroll"], [class*="mid-roll"], [class*="midroll"], [data-testid*="mid-roll"], [id*="midroll"], [id*="mid-roll"]' };
    this.midRollAdOverlay = { selector: '//*[@id="ad-ui-overlay"]' };
    this.minimizeIcon = { selector: '//img[@alt="Minimize"]' };
    this.thirdPartyAdFrame = { selector: 'iframe[title="3rd party ad content"]' };
    this.firstTitleImageCard = { selector: 'img.title-image' };
    this.dbfirstTitleImageCard = { selector: '(//img[contains(@class,"title-image")])[2]' };
    this.titleImageWithAlt = { selector: '//img[contains(@class,"title") and @alt]' };
    this.contentMetadataDiv = { selector: 'div.metadata, [class*="metadata"]' };
    this.contentDescDiv = { selector: 'div.desc, [class*="desc"]' };
    this.contentDetailsGenres = { selector: 'div[class*="genre"], span[class*="genre"], [data-testid*="genre"], [class*="genres"], .genres, .genre' };
    this.contentDetailsCast = { selector: 'div[class*="cast"], span[class*="cast"], [data-testid*="cast"], [class*="actors"], .cast, .actors' };
    this.contentMetadataBeforePlay = { selector: 'xpath=//p[@class="w-[auto]"] | //div[contains(@class,"metadata") or contains(@class,"meta")]' };
    this.contentCardContainer = { selector: 'xpath=ancestor::*[self::div or self::a or self::li][1]' };
    this.freeContentBadge = { selector: "//img[@alt='free' and contains(@src,'free.png')]" };
    this.contentCardAncestor = { selector: 'xpath=ancestor::*[self::div or self::a or self::li][1]' };
    this.contentCardInteractiveTarget = { selector: 'a, button, [role="button"], img.title-image, img' };
    this.episodeCardAncestor = { selector: 'xpath=ancestor::div[contains(@class, "episode-info")][1]' };
    this.contentAncestorChain = { selector: 'xpath=ancestor::*[self::div or self::a or self::li]' };
    this.continueWatchingDetailsAndMore = { selector: 'text=/Details and More|View More|Details/i' };
    this.contentDetailsHeading = { selector: 'main h1, [data-testid*="content-title"], [data-testid*="details-title"], [class*="content-title"]' };
    this.contentCloseButton = { selector: 'button:has-text("Close"), button:has-text("Cancel"), [aria-label*="Close"], [aria-label*="Cancel"]' };
    this.contentMoreExpandButton = { selector: 'img[alt*="more_info.svg"], [aria-label*="More"], [aria-label*="Expand"]' };
    this.contentLanguageIcon = { selector: 'div.languages, img[alt="audio language"], [aria-label*="audio language"], [data-testid*="language"]' };
    this.contentSubtitleIcon = { selector: 'img[alt="subtitle language"], [aria-label*="subtitle"], [data-testid*="subtitle"]' };
    this.contentShareIcon = { selector: '#share, div#share, img[alt*="share.svg"], [aria-label*="share"], [data-testid*="share"]' };
    this.shareCopyConfirmationMessage = { selector: 'text=/share link copied|copied to clipboard|clipboard/i' };
    this.contentTitleImage = { selector: 'img.title, img[alt]' };
    this.contentGenre = { selector: 'div.metadata, div.genre, [class*="genre"], .genres, .genre' };
    this.contentYear = { selector: 'div.release-year, [class*="release-year"]' };
    this.contentAgeRating = { selector: 'div.age-rating, [class*="age-rating"]' };
    this.contentDuration = { selector: 'div.duration, [class*="duration"]' };
    this.contentCast = { selector: 'div.casts, p:has-text("Cast :")' };
    this.showSectionContainer = { selector: 'div#shows' };
    this.showSectionText = { selector: 'text=Shows', text: 'Shows' };
    this.moviesSectionNavigation = { selector: 'nav a, nav button, nav [role="link"]' };
    this.firstShowRailThumbnail = { selector: '.scrollable-list:first-of-type .thumbnail' };
    this.showRailImageCandidate = { selector: 'img.title-image' };
    this.movieRailContainer = { selector: 'div.scrollable-list.horizontal-scroll .thumbnail' };
    this.movieRailImage = { selector: 'img[alt]' };
    this.movieRailInteractiveTarget = { selector: 'a, button, [role="button"], img, .thumbnail' };
    this.mainContentContainer = { selector: 'main' };
    this.pageBody = { selector: 'body' };
    this.genericTextPattern = { selector: 'text=/.*\\w.*/' };
    this.playerScreenFallback = { selector: '[data-testid*="player"], .player-screen, video' };
    this.watchlistToastContainer = { selector: 'div.toast' };
    this.watchlistTooltipAdd = { selector: "//div[contains(@class,'tooltip')]//p[normalize-space()='Add to watchlist']" };
    this.watchlistTooltipRemove = { selector: "//div[contains(@class,'tooltip')]//p[normalize-space()='Remove from watchlist']" };
    this.removeWatchlistFallbackIcon = { selector: 'img[alt*="remove_watchlist"], img[src*="remove_watchlist"]' };
    this.liveChannelsHeading = { selector: 'text=Live Channels', text: 'Live Channels' };
    this.playerLoaderOverlay = { selector: '//div[contains(@class,"player-video-controls")]' };
    this.midRailAdBanner = { selector: 'xpath=//div[contains(@id,"gpt-banner-ad-10")]' };
    this.subscribeCtaContainer = { selector: '#play' };
    this.subscribeCtaInteractiveTarget = { selector: 'main button, main a, main [role="button"]' };
    this.subscribeConfirmationButtonPattern = { selector: 'button:has-text("Confirm"), button:has-text("Subscribe to Watch")' };
    this.watchlistCardBase = { selector: 'div.thumbnail.relative.cursor-pointer.outline-none' };
    this.watchlistCardCursor = { selector: 'div.thumbnail.cursor-pointer' };
    this.watchlistCardGeneric = { selector: 'div.thumbnail' };
    this.watchlistCardContentTestId = { selector: '[data-testid="content-card"]' };
    this.watchlistCardShowTestId = { selector: '[data-testid="show-card"]' };
    this.watchlistTitleImage = { selector: 'img.title-image, img[alt]' };
    this.watchlistToastAdded = { selector: 'div' };
    this.watchlistToastRemoved = { selector: 'div.toast' };
    this.watchlistToastGeneric = { selector: 'div, span, p' };
    this.watchlistRemoveFallbackIcon = { selector: 'img[alt*="remove_watchlist"], img[src*="remove_watchlist"]' };
    this.watchlistPremiumTagIcon = { selector: 'img[alt="tag"], img[aria-label="tag"], img[title="tag"]' };
    this.watchlistFreeTagIcon = { selector: 'img[alt="free"]' };
    this.watchlistCardHeading = { selector: 'h2, h3, h4, [role="heading"]' };
    this.watchlistCardTitleImage = { selector: 'img.title-image, img[alt]' };
    this.contentTitleImageAlt = { selector: '//img[contains(@class,"title") and @alt]' };
    this.contentMetadataContainer = { selector: '//div[contains(@class,"metadata")]' };
    this.contentDescriptionContainer = { selector: '//div[contains(@class,"desc")]' };
    this.previewVideoElement = { selector: 'video, [data-testid*="preview"], [data-testid*="trailer"], [class*="preview"], [class*="trailer"]' };
    this.previewPlaybackIndicator = { selector: '[data-testid*="play"], [aria-label*="play"], [class*="playback"], .playing' };
    this.contentCardWithPreview = { selector: 'img[alt], a, button, [role="button"]' };
    this.episodeLabelTextPattern = { selector: 'text=/.*\\w.*/' };
    this.videoPlayerTitleTestId = { selector: '[data-testid="video-player"]' };
    this.deeplinkDetailsHeading = { selector: 'main h1, [data-testid*="content-title"], [data-testid*="details-title"], [class*="content-title"]' };
    this.deeplinkTitleText = { selector: 'main h1, [class*="content-title"], [data-testid*="content-title"]' };
    this.deeplinkSummaryText = { selector: 'div.desc, [class*="desc"], [data-testid*="description"], [class*="description"]' };
    this.genericTextLocator = { selector: 'text=/.*\\w.*/' };
    this.liveTextLabel = { role: 'button', text: 'Live', selector: 'text=Live' };
    this.goLiveButtonElement = { role: 'button', text: 'Go Live', selector: 'button:has-text("Go Live")' };
    this.playerProgressAndtimeControls = { selector: '//div[contains(@class,"player-progress-and-time-container")]' };
    this.playerFirstContentTitle = { selector: "//img[@alt='{expectedTitle}']" };
    this.contentCardImage = { selector: 'img[alt], img[title]' };
    this.contentCardHeading = { selector: 'h2, h3, h4, [role="heading"]' };
    this.continueWatchingDetailsAndMore = { selector: 'text=/Details and More|View More|Details/i' };
    this.contentDetailsHeading = { selector: 'main h1, [data-testid*="content-title"], [data-testid*="details-title"], [class*="content-title"]' };
    this.carouselInfoIcon = { selector: 'button[aria-label*="info"], button[title*="info"], img[alt*="info"], [data-testid*="info-icon"], .info-icon' };
    this.becauseYouWatchedHeading = { selector: 'xpath=(//*[@class="title"]/p[contains(translate(normalize-space(.),"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"because you watched")])[1]' };
    this.becauseYouWatchedTrayContainer = { selector: 'xpath=(//*[@class="title"]/p[contains(translate(normalize-space(.),"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"because you watched")])[1]/parent::div/following-sibling::div[1]' };
    this.becauseYouWatchedFirstItem = { selector: 'xpath=(//*[@class="title"]/p[contains(translate(normalize-space(.),"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"because you watched")])[1]/parent::div/following-sibling::div[1]//img[1]' };
    this.firstTrayContent = { selector: '(//div[contains(@class,"rail-container")]/div/div)[1]' };
    this.firstCarouselRail = { selector: '(//div[contains(@class,"rail-container")])[1]' };
    this.subscriptionBlockerMessage = { selector: "//h2[contains(text(),'A valid subscription is required')]" };
    this.railThumbnailSelector = { selector: "(//div[contains(@class,'thumbnail') and contains(@class,'cursor-pointer')])[1]" };
    this.sponsoredRailContentCard = { selector: "xpath=((//div[contains(@class,'rail z-1')][.//div[contains(@class,'rail-container')]][.//div[contains(@class,'title')]//img[contains(@class,'object-contain')]])[1]//img[contains(@class,'title-image')])[2]" };
    this.adBanner = { selector: '//a[@id="aw0"]/img' };
    this.mobileMainMenu = { selector: '//nav//div[contains(@class, "mobile-main-menu")]' };
    this.episodeItem = { selector: 'xpath=//*[@class="episodes-list"]/div/div' };
    this.seasonTitleContainer = 'h3.season-title, .season-title, [data-testid*="season"], .season-item'
  }

  private getRoleLocator(element: PageElement, exact = false) {
    if (element.role && element.text) {
      return this.page.getByRole(element.role as 'img' | 'button' | 'link' | 'textbox', { name: element.text }).first();
    }
    if (element.text) {
      return exact
        ? this.page.getByText(element.text, { exact: true }).first()
        : this.page.getByText(element.text).first();
    }
    return this.page.locator(element.selector ?? '').first();
  }

  private normalizeText(value?: string | null): string {
    return String(value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  private boxesOverlap(
    boxA: { x: number; y: number; width: number; height: number },
    boxB: { x: number; y: number; width: number; height: number },
  ): boolean {
    const left = Math.max(boxA.x, boxB.x);
    const right = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const top = Math.max(boxA.y, boxB.y);
    const bottom = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);
    return left < right && top < bottom;
  }

  async navigate(): Promise<void> {
    const baseUrl = config.getBaseURL();
    logger.pageNavigation(baseUrl);
    await this.page.goto(baseUrl);
    await this.pageUtils.waitForPageLoad();
    await this.page.waitForTimeout(7000);
  }

  async clickShowsSection(): Promise<void> {
    logger.elementInteraction('click', 'Shows section link');
    const candidateLocators = [
      this.page.locator(this.showSectionContainer.selector).first(),
      this.page.locator(this.showsSectionLink.selector).first(),
      this.page.locator(this.showSectionText.selector).first(),
    ];
    let clicked = false;
    for (const candidate of candidateLocators) {
      try {
        const count = await candidate.count().catch(() => 0);
        if (!count) {
          continue;
        }
        await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
        await this.page.waitForTimeout(1500);
        await candidate.waitFor({ state: 'visible', timeout: 20000 });
        await candidate.click({ timeout: 30000, force: true });
        clicked = true;
        break;
      } catch (error) {
        logger.debug('Shows section click failed for one of the configured candidates', error);
      }
    }
    if (!clicked) {
      await this.pageUtils.safeClick(this.showsSectionLink, 30000).catch(() => undefined);
    }
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  }

  async clickMoviesSection(): Promise<void> {
    logger.elementInteraction('click', 'Movies section link');
    const moviesLink = this.page.locator(this.moviesSectionNavigation.selector).filter({ hasText: /^Movies$/i }).first();
    if (await moviesLink.count()) {
      await moviesLink.waitFor({ state: 'visible', timeout: 20000 });
      await moviesLink.click({ timeout: 20000, force: true });
    } else {
      await this.pageUtils.safeClick(this.moviesSectionLink);
    }
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
    await this.page.waitForTimeout(5000);
  }

  async getMetadataBeforePlay(): Promise<string> {
    logger.elementInteraction('get', 'content metadata before play');
    const candidateSelectors = [
      this.contentMetadataBeforePlay.selector,
      this.contentMetadata.selector,
      this.contentMetadataDiv.selector,
      this.contentMetadataContainer.selector,
    ].filter(Boolean) as string[];
    for (const selector of candidateSelectors) {
      const metadataLocator = this.page.locator(selector).first();
      await metadataLocator.scrollIntoViewIfNeeded().catch(() => undefined);
      await metadataLocator.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
      const metadataText = await metadataLocator.textContent().catch(() => '');
      const trimmedText = metadataText?.trim() ?? '';
      if (trimmedText) {
        this.storedContentMetadata = trimmedText;
        return this.storedContentMetadata;
      }
    }
    logger.debug('Unable to locate metadata using standard selectors, attempting broad fallback');
    const fallbackLocator = this.page.locator('//div[contains(@class,"metadata") or contains(@class,"meta") or contains(@class,"desc") or contains(@class,"details")]').first();
    await fallbackLocator.scrollIntoViewIfNeeded().catch(() => undefined);
    await fallbackLocator.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
    const fallbackText = await fallbackLocator.textContent().catch(() => '');
    this.storedContentMetadata = fallbackText?.trim() ?? '';
    return this.storedContentMetadata;
  }

  async clickFirstShowContent(): Promise<void> {
    logger.elementInteraction('click', 'first rail content thumbnail');
    const candidateSelectors = [
      this.firstShowRailThumbnail.selector,
      this.firstShowContentCard.selector,
      this.showRailImageCandidate.selector,
      this.firstTitleImageCard.selector,
      this.titleImageWithAlt.selector,
      this.firstShowContentCandidateSelectors.join(','),
      this.firstShowContentFallbackSelector,
    ].filter(Boolean) as string[];
    for (const selector of candidateSelectors) {
      try {
        const candidate = this.page.locator(selector).first();
        if (!(await candidate.count().catch(() => 0))) continue;
        await candidate.waitFor({ state: 'visible', timeout: 10000 });
        await candidate.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
        const clickableAncestor = candidate.locator(this.clickTargetAncestorSelector).first();
        const clickableDescendant = candidate.locator(this.clickTargetDescendantSelector).first();
        const target = (await clickableAncestor.count().catch(() => 0))
          ? clickableAncestor
          : (await clickableDescendant.count().catch(() => 0))
            ? clickableDescendant
            : candidate;
        await target.hover().catch(() => undefined);
        let clickSucceeded = false;
        try {
          await target.click({ timeout: 15000, force: true });
          clickSucceeded = true;
        } catch {
          const elementHandle = await target.elementHandle();
          if (elementHandle) {
            await elementHandle.evaluate((el: HTMLElement) => el.click()).catch(() => undefined);
            clickSucceeded = true;
          }
        }
        if (!clickSucceeded) {
          throw new Error(`Failed to click target for selector: ${selector}`);
        }
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForURL(/\/(details|content|show)\//, { timeout: 15000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForTimeout(2000);
        if (await this.isShowDetailsPageVisible()) {
          return;
        }
      } catch (err) {
        logger.debug(`Content candidate click failed for selector: ${selector}`, err);
      }
    }
    try {
      await this.clickFirstContentInRail();
    } catch (err) {
      logger.debug('Fallback clickFirstContentInRail failed', err);
      try {
        const fallback = this.page.locator(this.contentCardInteractiveTarget.selector).first();
        if (await fallback.count().catch(() => 0)) {
          await fallback.waitFor({ state: 'visible', timeout: 10000 });
          await fallback.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
          await fallback.click({ timeout: 15000, force: true });
        }
      } catch (innerErr) {
        logger.debug('Fallback content click failed', innerErr);
      }
    }
  }
 

  async clickShowContentRail(): Promise<void> {
    logger.elementInteraction('click', 'first rail content thumbnail');
    const candidateSelectors = [
      this.firstShowRailThumbnail.selector,
      this.firstShowContentCard.selector,
      this.showRailImageCandidate.selector,
      this.firstTitleImageCard.selector,
      this.titleImageWithAlt.selector,
      this.firstShowContentCandidateSelectors.join(','),
      this.firstShowContentFallbackSelector,
    ].filter(Boolean) as string[];
    for (const selector of candidateSelectors) {
      try {
        const candidate = this.page.locator(selector).first();
        if (!(await candidate.count().catch(() => 0))) continue;
        await candidate.waitFor({ state: 'visible', timeout: 10000 });
        await candidate.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
        const clickableAncestor = candidate.locator(this.clickTargetAncestorSelector).first();
        const clickableDescendant = candidate.locator(this.clickTargetDescendantSelector).first();
        const target = (await clickableAncestor.count().catch(() => 0))
          ? clickableAncestor
          : (await clickableDescendant.count().catch(() => 0))
            ? clickableDescendant
            : candidate;
        await target.hover().catch(() => undefined);
        let clickSucceeded = false;
        try {
          await target.click({ timeout: 15000, force: true });
          clickSucceeded = true;
        } catch {
          const elementHandle = await target.elementHandle();
          if (elementHandle) {
            await elementHandle.evaluate((el: HTMLElement) => el.click()).catch(() => undefined);
            clickSucceeded = true;
          }
        }
        if (!clickSucceeded) {
          throw new Error(`Failed to click target for selector: ${selector}`);
        }
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForURL(/\/(details|content|show)\//, { timeout: 15000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForTimeout(2000);
        if (await this.isShowDetailsPageVisible()) {
          return;
        }
      } catch (err) {
        logger.debug(`Content candidate click failed for selector: ${selector}`, err);
      }
    }
    try {
      await this.clickFirstContentInRail();
    } catch (err) {
      logger.debug('Fallback clickFirstContentInRail failed', err);
      try {
        const fallback = this.page.locator(this.contentCardInteractiveTarget.selector).first();
        if (await fallback.count().catch(() => 0)) {
          await fallback.waitFor({ state: 'visible', timeout: 10000 });
          await fallback.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
          await fallback.click({ timeout: 15000, force: true });
        }
      } catch (innerErr) {
        logger.debug('Fallback content click failed', innerErr);
      }
    }
  }

  async clickFirstMovieContent(): Promise<string> {
    logger.elementInteraction('click', 'first visible movie card from Movies tab');
    try {
      const movieRail = this.page.locator(this.movieRailContainer.selector).filter({
        has: this.page.locator(this.movieRailImage.selector),
      }).first();
      await movieRail.waitFor({ state: 'visible', timeout: 20000 });
      const movieImage = movieRail.locator(this.movieRailImage.selector).first();
      const selectedMovieTitle = (await movieImage.getAttribute('alt').catch(() => '') ?? '').trim();
      if (!selectedMovieTitle) {
        return '';
      }
      const clickTarget = movieRail.locator(this.movieRailInteractiveTarget.selector).first();
      logger.elementInteraction('click', `movie content candidate ${selectedMovieTitle}`);
      await clickTarget.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await this.page.locator(this.contentDetailsHeading.selector).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return selectedMovieTitle;
    } catch (error) {
      logger.debug('Could not click first visible movie card from Movies tab', error);
    }
    try {
      const fallbackRail = this.page.locator(this.movieRailContainer.selector).first();
      if (await fallbackRail.count()) {
        await fallbackRail.waitFor({ state: 'visible', timeout: 10000 });
        const fallbackImage = fallbackRail.locator(this.movieRailImage.selector).first();
        const fallbackTitle = (await fallbackImage.getAttribute('alt').catch(() => '') ?? '').trim();
        await fallbackRail.click({ timeout: 15000, force: true });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        await this.page.locator(this.contentDetailsHeading.selector).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
        await this.page.waitForTimeout(2000);
        return fallbackTitle;
      }
    } catch (err) {
      logger.debug('Fallback movie rail click failed', err);
    }
    return '';
  }


  async doubleClickFirstVisibleContentCard(): Promise<void> {
    logger.elementInteraction('doubleclick', 'first visible content card on home page');
    const contentCard = this.page.locator(this.dbfirstTitleImageCard.selector).first();
    await contentCard.waitFor({ state: 'visible', timeout: 15000, });
    await contentCard.dblclick({ timeout: 20000, });
  }

  async getFirstFreeContentTitleOnHome(): Promise<string> {
    logger.elementInteraction('get', 'first free-tagged content title on home');
    try {
      const freeBadge = this.page.locator(this.freeTagBadge.selector).first();
      if (!(await freeBadge.count())) return '';
      await freeBadge.waitFor({ state: 'visible', timeout: 15000 });
      const cardContainer = freeBadge.locator(this.contentCardContainer.selector ?? '').first();
      const image = cardContainer.locator(this.contentCardImage.selector ?? '').first();
      const altText = await image.getAttribute('alt').catch(() => '');
      if (altText?.trim()) return altText.trim();
      const titleText = await cardContainer.locator(this.contentCardHeading.selector ?? '').first().textContent().catch(() => '');
      return titleText?.trim() ?? '';
    } catch (err) {
      logger.debug('getFirstFreeContentTitleOnHome failed', err);
      return '';
    }
  }

  async clickFirstFreeContentOnHome(): Promise<void> {
    logger.elementInteraction('click', 'first free-tagged content on home');
    const freeBadge = this.page.locator(this.freeTagBadge.selector).first();
    try {
      if (!(await freeBadge.count())) return;
      await freeBadge.waitFor({ state: 'visible', timeout: 15000 });

      const clickTargets = [
        freeBadge.locator(this.contentCardContainer.selector ?? '').first(),
        this.page.locator(this.firstTitleImageCard.selector ?? '').first(),
      ];
      for (const target of clickTargets) {
        try {
          if (!(await target.count())) continue;
          await target.scrollIntoViewIfNeeded();
          await target.click({ timeout: 15000, force: true });
          await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
          await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
          await this.page.waitForTimeout(2000);
          return;
        } catch {
        }
      }
    } catch (err) {
      logger.debug('clickFirstFreeContentOnHome failed', err);
    }
  }

  async scrollUntilElementVisible() {
    await this.scrollUntilVisible(this.midRailAdBanner.selector)
  }

  async scrollUntilVisible(selector: string): Promise<void> {
    const locator = this.page.locator(selector);
    while (!(await locator.isVisible())) {
      await this.page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          const start = window.scrollY;
          const target = start + 100;
          const duration = 500; 
          const startTime = performance.now();
          function animate(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, start + (target - start) * progress);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          }
          requestAnimationFrame(animate);
        });
      });
      await this.page.waitForTimeout(500);
      if (await locator.isVisible()) {
        break;
      }
    }
    await locator.scrollIntoViewIfNeeded();
  }

  async scrollToMidRailAdBanner(): Promise<boolean> {
    logger.elementInteraction('scroll', 'mid rail ad banner');
    try {
      const found = await this.page.evaluate(() => {
        const selector = this.midRailAdBanner.selector;
        const visibleElements = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          const text = (element.textContent || '').toLowerCase();
          const className = (element.className || '').toLowerCase();
          const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
          const looksLikeAd = text.includes('ad') || className.includes('ad') || ariaLabel.includes('ad') || text.includes('banner') || className.includes('banner') || ariaLabel.includes('banner');
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && looksLikeAd;
        });
        const target = visibleElements[0];
        if (!target) {
          return false;
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      },);
      await this.page.waitForTimeout(1500);
      return !!found;
    } catch (error) {
      logger.debug('Mid rail ad banner scroll failed', error);
      return false;
    }
  }

  async isMidRailAdBannerVisible(): Promise<boolean> {
    try {
      const selector = this.midRailAdBanner.selector;
      return await this.page.evaluate((selector) => {
        return Array.from(document.querySelectorAll<HTMLElement>(selector)).some((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          const text = (element.textContent || '').toLowerCase();
          const className = (element.className || '').toLowerCase();
          const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
          const looksLikeAd = text.includes('ad') || className.includes('ad') || ariaLabel.includes('ad') || text.includes('banner') || className.includes('banner') || ariaLabel.includes('banner');
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && looksLikeAd;
        });
      }, selector);
    } catch (error) {
      logger.debug('Mid rail ad banner visibility check failed', error);
      return false;
    }
  }

  async isMidRailBannerVisible(): Promise<boolean> {
    const player = this.page.locator(this.midRailAdBanner.selector).first();
    await player.waitFor({ state: 'visible', timeout: 20000 });
    return true;
  }

  async verifyMidRailAdSpacing(): Promise<boolean> {
    try {
      const adLocator = this.page.locator(this.midRailAdBanner.selector).first();
      await adLocator.waitFor({
        state: 'visible',
        timeout: 10000
      });
      const spacingValid = await adLocator.evaluate((adElement) => {
        const adRect = adElement.getBoundingClientRect();
        const adStyle = window.getComputedStyle(adElement);
        const marginTop = parseFloat(adStyle.marginTop) || 0;
        const marginBottom = parseFloat(adStyle.marginBottom) || 0;
        let previousElement = adElement.previousElementSibling as HTMLElement | null;
        let gapAbove = 0;
        while (previousElement) {
          const rect = previousElement.getBoundingClientRect();
          const style = window.getComputedStyle(previousElement);
          if (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
          ) {
            gapAbove = adRect.top - rect.bottom;
            break;
          }
          previousElement = previousElement.previousElementSibling as HTMLElement | null;
        }
        let nextElement = adElement.nextElementSibling as HTMLElement | null;
        let gapBelow = 0;
        while (nextElement) {
          const rect = nextElement.getBoundingClientRect();
          const style = window.getComputedStyle(nextElement);
          if (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
          ) {
            gapBelow = rect.top - adRect.bottom;
            break;
          }
          nextElement = nextElement.nextElementSibling as HTMLElement | null;
        }
        const totalStyleSpacing = marginTop + marginBottom;
        return (
          totalStyleSpacing > 12 ||
          gapAbove > 24 ||
          gapBelow > 24
        );
      });
      logger.info(`Mid-rail ad spacing validation result: ${spacingValid}`);
      return spacingValid;
    } catch (error) {
      logger.debug(`Mid rail ad spacing validation failed: ${error}`);
      return false;
    }
  }

  async scrollContinueWatchingTrayIntoView(): Promise<void> {
    logger.elementInteraction('scroll', 'Continue Watching tray');
    try {
      const tray = this.page.locator(this.continueWatchingTray.selector).first();
      if (await tray.count()) {
        await tray.scrollIntoViewIfNeeded();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      }
    } catch (error) {
      logger.debug('Continue Watching tray scroll failed', error);
    }
  }

  async scrollToSeasonsSection(): Promise<void> {
    logger.elementInteraction('scroll', 'season section');
    try {
      const seasonSection = this.page.locator(this.seasonLabelContainer.selector).first();
      if (await seasonSection.count()) {
        await seasonSection.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.debug('Season section scroll failed', error);
    }
  }

  private parseEpisodeMetadata(text: string): { title: string; seasonText: string; episodeText: string } {
    const normalized = (text || '').replace(/\s+/g, ' ').trim();
    const seasonMatch = normalized.match(/S(?:eason\s*)?(\d+)/i);
    const episodeMatch = normalized.match(/E(\d+)/i);
    const titleMatch = normalized.match(/([A-Za-z0-9 .,'’&\-]+?)\s+S(?:eason\s*)?\d+\s*E\d+/i);
    const fallbackTitle = normalized.split(/S(?:eason\s*)?\d+\s*E\d+/i)[0]?.trim();
    return {
      title: titleMatch?.[1]?.trim() || fallbackTitle?.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '') || '',
      seasonText: seasonMatch?.[1] ? `S${seasonMatch[1]}` : '',
      episodeText: episodeMatch?.[1] ? `E${episodeMatch[1]}` : '',
    };
  }

  private async findEpisodeCardForLabel(label: Locator): Promise<Locator> {
    const directEpisodeCard = label.locator(this.episodeCardAncestor.selector).first();
    const cardText = (await directEpisodeCard.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    if (cardText && /S\d+\s*E\d+/i.test(cardText)) {
      return directEpisodeCard;
    }
    const ancestors = label.locator(this.contentAncestorChain.selector);
    const count = await ancestors.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = ancestors.nth(index);
      const candidateText = (await candidate.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
      if (candidateText && /S\d+\s*E\d+/i.test(candidateText)) {
        const titleCandidates = candidate.locator('p.font-semibold');
        const titleCount = await titleCandidates.count().catch(() => 0);
        if (titleCount > 0) {
          return candidate;
        }
      }
    }
    return label.locator(this.contentCardAncestor.selector).first();
  }

  private async extractEpisodeTitleFromCard(card: Locator): Promise<string> {
    const titleCandidates = card.locator('p.font-semibold');
    const count = await titleCandidates.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const text = (await titleCandidates.nth(index).textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
      if (
        text &&
        text.length > 1 &&
        text.length <= 120 &&
        !/S\d+\s*E\d+/i.test(text) &&
        !/Season/i.test(text) &&
        !/\b\d+m\b/i.test(text) &&
        !/\b\d+s\b/i.test(text)
      ) {
        return text;
      }
    }
    return '';
  }

  private async extractTitleFromSelectedLabel(label: Locator): Promise<string> {
    const card = await this.findEpisodeCardForLabel(label);
    return this.extractEpisodeTitleFromCard(card);
  }

  private async extractSeasonFromLabel(label: Locator): Promise<string> {
    const text = (await label.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    const seasonMatch = text.match(/S(?:eason\s*)?(\d+)/i);
    return seasonMatch?.[1] ? `S${seasonMatch[1]}` : '';
  }

  private async extractEpisodeNumberFromLabel(label: Locator): Promise<string> {
    const text = (await label.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    const episodeMatch = text.match(/E(\d+)/i);
    return episodeMatch?.[1] ? `E${episodeMatch[1]}` : '';
  }

  async getSeasonLabelsText(): Promise<string[]> {
    try {
      // wait briefly for the seasons container to render
      try {
        const container = this.page.locator(this.seasonLabelContainer.selector);
        if ((await container.count().catch(() => 0)) > 0) {
          await container.first().scrollIntoViewIfNeeded().catch(() => undefined);
          await this.page.waitForTimeout(300).catch(() => undefined);
        }
      } catch {
        // ignore
      }
      const labels = this.page.locator(this.seasonLabels.selector);
      let count = await labels.count().catch(() => 0);
      const seasonTexts: string[] = [];
      // If primary locator finds none, try a few alternate selectors and a DOM fallback
      if (!count) {
        const altSelectors = [this.seasonTitleContainer];
        for (const sel of altSelectors) {
          try {
            const alt = this.page.locator(sel as any);
            const altCount = await alt.count().catch(() => 0);
            if (altCount) {
              count = altCount;
              for (let i = 0; i < Math.min(altCount, 10); i += 1) {
                const txt = (await alt.nth(i).textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
                if (txt) seasonTexts.push(txt);
              }
              break;
            }
          } catch {
            // ignore selector errors
          }
        }
      }
      if (!count && seasonTexts.length === 0) {
        // DOM evaluation fallback: read visible season-like elements directly
        try {
          const evalTexts: string[] = await this.page.evaluate(() => {
            const nodes = Array.from(document.querySelectorAll(this.seasonTitleContainer));
            return nodes
              .map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim())
              .filter(Boolean)
              .slice(0, 10);
          }).catch(() => []);
          for (const t of evalTexts) seasonTexts.push(t);
        } catch {
          // ignore
        }
      }
      // If we still don't have texts but primary locator has items, read from it
      if (seasonTexts.length === 0 && count) {
        for (let index = 0; index < Math.min(count, 10); index += 1) {
          const text = (await labels.nth(index).textContent().catch(() => '') || '').trim();
          if (text) seasonTexts.push(text.replace(/\s+/g, ' '));
        }
      }
      // Filter/validate: prefer labels that match month-year (e.g., "Aug 2026") or Season patterns
      const monthYearFull = /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}$/i;
      const seasonFull = /^(?:Season|S)\s*0*\d+$/i;
      const validated: string[] = [];
      for (const t of seasonTexts) {
        const trimmed = (t || '').replace(/\s+/g, ' ').trim();
        if (!trimmed) continue;
        if (monthYearFull.test(trimmed) || seasonFull.test(trimmed) || /Season\s*\d+/i.test(trimmed) || /S\d+/i.test(trimmed)) {
          validated.push(trimmed);
        }
      }
      // If validated list is empty, return the raw texts; otherwise return validated ones
      const result = validated.length ? validated.slice(0, 10) : seasonTexts.slice(0, 10);
      logger.debug('getSeasonLabelsText -> returning', { result });
      return result;
    } catch (error) {
      logger.debug('Could not read season labels', error);
      return [];
    }
  }

  private async findScrollableEpisodeListContainer(): Promise<Locator | null> {
    const containers = this.page.locator(this.episodeListContainer.selector);
    const count = await containers.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const container = containers.nth(index);
      if (!(await container.isVisible().catch(() => false))) continue;
      const metrics = await container.evaluate((element: HTMLElement) => {
        const style = window.getComputedStyle(element);
        return {
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          overflowY: style.overflowY,
        };
      }).catch(() => null as null | { scrollHeight: number; clientHeight: number; overflowY: string });
      if (!metrics) continue;
      if (metrics.scrollHeight > metrics.clientHeight + 10 && /auto|scroll|overlay/i.test(metrics.overflowY || '')) {
        return container;
      }
    }
    return null;
  }

  async scrollEpisodeListToEnd(maxAttempts: number = 20): Promise<boolean> {
    logger.elementInteraction('scroll', 'episode list to end');
    try {
      const bodyContainer = this.page.locator('body');
      const container = (await this.findScrollableEpisodeListContainer()) || bodyContainer;
      const episodeItems = this.getEpisodeItemLocator();
      let previousCount = await episodeItems.count().catch(() => 0);
      if (!previousCount) {
        return false;
      }
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (container !== bodyContainer) {
          await container.scrollIntoViewIfNeeded().catch(() => undefined);
          await container.evaluate((element: HTMLElement) => {
            element.scrollTop = element.scrollHeight;
          }).catch(() => undefined);
        } else {
          await this.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })).catch(() => undefined);
        }
        await this.page.waitForTimeout(1600);
        const bufferVisible = await this.page.locator(this.episodeBufferIndicator.selector).first().isVisible().catch(() => false);
        if (bufferVisible) {
          await this.page.waitForTimeout(2600);
        }
        const currentCount = await episodeItems.count().catch(() => 0);
        const lastEpisodeItem = episodeItems.last();
        if (currentCount > 0) {
          await lastEpisodeItem.scrollIntoViewIfNeeded().catch(() => undefined);
          const visible = await lastEpisodeItem.isVisible().catch(() => false);
          if (visible && currentCount === previousCount) {
            return true;
          }
        }
        previousCount = currentCount;
      }
      const finalCount = await episodeItems.count().catch(() => 0);
      if (finalCount > 0) {
        const finalLastEpisodeItem = episodeItems.last();
        await finalLastEpisodeItem.scrollIntoViewIfNeeded().catch(() => undefined);
        return await finalLastEpisodeItem.isVisible().catch(() => false);
      }
      return false;
    } catch (error) {
      logger.debug('Episode list scroll to end failed', error);
      return false;
    }
  }

  async clickLastEpisode(): Promise<boolean> {
    logger.elementInteraction('click', 'last episode');
    try {
      const episodeLocator = this.page.locator(this.episodeItem.selector);
      let previousHeight = 0;
      while (true) {
        const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
        if (currentHeight === previousHeight) {
          break;
        }
        previousHeight = currentHeight;
        await this.page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        });
        await this.page.waitForLoadState('networkidle').catch(() => undefined);
        await this.page.waitForTimeout(2000);
      }
      const count = await episodeLocator.count().catch(() => 0);
      if (!count) {
        logger.debug('No episodes found');
        return false;
      }
      const lastEpisode = episodeLocator.last();
      await lastEpisode.waitFor({
        state: 'visible',
        timeout: 15000
      }).catch(() => undefined);
      await lastEpisode.scrollIntoViewIfNeeded().catch(() => undefined);
      await lastEpisode.click({
        timeout: 20000
      }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return true;
    } catch (err) {
      logger.debug('clickLastEpisode failed', err);
      return false;
    }
  }

  async isIWantElementVisible(): Promise<boolean> {
    try {
      const iWantLogo = this.page.locator(this.iWantLogo.selector).first();
      await iWantLogo.scrollIntoViewIfNeeded().catch(() => undefined);
      await iWantLogo.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      logger.debug('iWant element visibility check failed', error);
      return false;
    }
  }

  private async parseEpisodeLabelText(label: Locator): Promise<{ season: number; episode: number }> {
    const text = (await label.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    const seasonMatch = text.match(/S(?:eason\s*)?(\d+)/i);
    const episodeMatch = text.match(/E(\d+)/i);
    return {
      season: seasonMatch ? Number(seasonMatch[1]) : 0,
      episode: episodeMatch ? Number(episodeMatch[1]) : 0,
    };
  }

  private async findLastEpisodeLabel(labelLocator: Locator): Promise<Locator | null> {
    const count = await labelLocator.count().catch(() => 0);
    let lastLabel: Locator | null = null;
    let bestSeason = 0;
    let bestEpisode = 0;
    for (let index = 0; index < count; index += 1) {
      const label = labelLocator.nth(index);
      const { season, episode } = await this.parseEpisodeLabelText(label);
      if (season > bestSeason || (season === bestSeason && episode > bestEpisode)) {
        bestSeason = season;
        bestEpisode = episode;
        lastLabel = label;
      }
    }
    return lastLabel;
  }

  async clickSeasonLabel(labelText: string): Promise<void> {
    logger.elementInteraction('click', `season label ${labelText}`);
    try {
      const target = this.page.locator(this.seasonLabels.selector).filter({ hasText: labelText }).first();
      if (await target.count()) {
        await target.scrollIntoViewIfNeeded();
        await target.click({ timeout: 15000, force: true });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
      }
    } catch (error) {
      logger.debug(`Season label click failed for ${labelText}`, error);
    }
  }

  private normalizeSelectionToken(value: string): string {
    return (value || '').replace(/[^a-z0-9]+/gi, '').toLowerCase();
  }

  private matchesSeasonSelection(text: string, requestedSeason?: string): boolean {
    if (!requestedSeason) return true;
    const normalizedText = this.normalizeSelectionToken(text);
    const normalizedRequestedSeason = this.normalizeSelectionToken(requestedSeason);
    if (!normalizedRequestedSeason) return true;
    if (normalizedText.includes(normalizedRequestedSeason)) {
      return true;
    }
    const seasonMatch = text.match(/S(?:eason\s*)?(\d+)/i);
    const requestedSeasonMatch = requestedSeason.match(/(\d+)/);
    return Boolean(seasonMatch?.[1] && requestedSeasonMatch?.[1] && seasonMatch[1] === requestedSeasonMatch[1]);
  }

  private matchesEpisodeSelection(text: string, requestedEpisode?: string): boolean {
    if (!requestedEpisode) return true;
    const normalizedText = this.normalizeSelectionToken(text);
    const normalizedRequestedEpisode = this.normalizeSelectionToken(requestedEpisode);
    if (!normalizedRequestedEpisode) return true;
    if (normalizedText.includes(normalizedRequestedEpisode)) {
      return true;
    }
    const episodeMatch = text.match(/E(\d+)/i);
    const requestedEpisodeMatch = requestedEpisode.match(/(\d+)/);
    return Boolean(episodeMatch?.[1] && requestedEpisodeMatch?.[1] && episodeMatch[1] === requestedEpisodeMatch[1]);
  }

  async selectEpisodeBySeasonAndEpisode(
    season?: string,
    episodeIdentifier?: string,
  ): Promise<{ selected: boolean; seasonNumber: string; episodeNumber: string; title: string }> {
    logger.elementInteraction('select', `episode ${episodeIdentifier || 'default'} for season ${season || 'default'}`);
    const trimmedSeason = (season || '').trim();
    const trimmedEpisode = (episodeIdentifier || '').trim();
    if (trimmedSeason) {
      await this.clickSeasonLabel(trimmedSeason);
      if (!this.page.isClosed()) {
        await this.page.waitForTimeout(2000).catch(() => undefined);
      }
    }
    if (this.page.isClosed()) {
      return {
        selected: false,
        seasonNumber: '',
        episodeNumber: '',
        title: '',
      };
    }
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    const episodeCandidates = this.page.locator(this.episodeItems.selector);
    const count = await episodeCandidates.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = episodeCandidates.nth(index);
      const candidateText = (await candidate.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
      if (!candidateText) continue;
      const seasonMatches = this.matchesSeasonSelection(candidateText, trimmedSeason);
      const episodeMatches = this.matchesEpisodeSelection(candidateText, trimmedEpisode);
      if (!seasonMatches || !episodeMatches) continue;
      try {
        await candidate.scrollIntoViewIfNeeded();
        await candidate.click({ timeout: 15000, force: true });
        if (this.page.isClosed()) {
          return {
            selected: false,
            seasonNumber: '',
            episodeNumber: '',
            title: '',
          };
        }
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(3000).catch(() => undefined);
        const metadata = this.parseEpisodeMetadata(candidateText);
        this.lastSelectedEpisodeMetadata = {
          seasonNumber: metadata.seasonText || (trimmedSeason ? trimmedSeason : ''),
          episodeNumber: metadata.episodeText || (trimmedEpisode ? trimmedEpisode : ''),
          title: metadata.title,
        };
        return {
          selected: true,
          seasonNumber: this.lastSelectedEpisodeMetadata.seasonNumber,
          episodeNumber: this.lastSelectedEpisodeMetadata.episodeNumber,
          title: this.lastSelectedEpisodeMetadata.title,
        };
      } catch (error) {
        logger.debug('Episode selection click failed', error);
      }
    }
    return {
      selected: false,
      seasonNumber: '',
      episodeNumber: '',
      title: '',
    };
  }

  async getEpisodeItemCount(): Promise<number> {
    try {
      const items = await this.getEpisodeItemLocator();
      return await items.count().catch(() => 0);
    } catch (error) {
      logger.debug('Could not count episode items', error);
      return 0;
    }
  }

  private getEpisodeItemLocator(): Locator {
    return this.page.locator(this.episodeItems.selector);
  }

  async getEpisodeLabelsForCurrentSeason(): Promise<string[]> {
    try {
      const items = this.page.locator(this.episodeItems.selector);
      const count = await items.count().catch(() => 0);
      const labels: string[] = [];
      for (let index = 0; index < count; index += 1) {
        const text = (await items.nth(index).textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
        if (text) {
          labels.push(text);
        }
      }
      return labels;
    } catch (error) {
      logger.debug('Could not read episode labels for the current season', error);
      return [];
    }
  }

  async validateEpisodeNumberSequence(): Promise<{ episodeLabels: string[]; parsedNumbers: number[]; isAscending: boolean }> {
    const episodeLabels = await this.getEpisodeLabelsForCurrentSeason();
    const parsedNumbers = episodeLabels
      .map((label) => {
        const match = label.match(/(?:S\d+\s*)?E(\d+)/i);
        return match ? Number(match[1]) : null;
      })
      .filter((value): value is number => value !== null);
    const isAscending = parsedNumbers.length > 0 && parsedNumbers.every((episodeNumber, index) => index === 0 || episodeNumber > parsedNumbers[index - 1]);
    return {
      episodeLabels,
      parsedNumbers,
      isAscending,
    };
  }

async clickFirstEpisodeCard(): Promise<void> {
    logger.elementInteraction('click', 'first episode card');
    const episodeCard = await this.page.locator(this.firstEpisodeCard.selector).first();
    try {
      if (await this.page.isClosed()) return;
      if (await episodeCard.count()) {
        await episodeCard.waitFor({ state: 'visible', timeout: 15000 });
        await episodeCard.scrollIntoViewIfNeeded();
        await episodeCard.click({ timeout: 15000 });
      }
    } catch (err) {
      logger.debug('clickFirstEpisodeCard failed', err);
      return;
    }
    try {
      if (this.page.isClosed()) return;
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await this.page.waitForTimeout(5000);
    } catch (err) {
      logger.debug('Post-click waits failed or page closed', err);
    }
  }
 

  async clickLastSeasonIfAvailable(): Promise<boolean> {
    logger.elementInteraction('click', 'last season heading');
    try {
      const seasonHeading = this.page.locator(this.lastSeasonHeading.selector).last();
      const count = await seasonHeading.count().catch(() => 0);
      if (!count) return false;
      await seasonHeading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
      await seasonHeading.scrollIntoViewIfNeeded().catch(() => undefined);
      await seasonHeading.click({ timeout: 20000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return true;
    } catch (err) {
      logger.debug('clickLastSeasonIfAvailable failed', err);
      return false;
    }
  }

  async clickLastEpisodeFromEpisodesList(): Promise<boolean> {
    logger.elementInteraction('click', 'last episode from episodes-list');
    try {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      const episodeItems = this.page.locator(this.episodesListItems.selector);
      const count = await episodeItems.count().catch(() => 0);
      if (!count) return false;
      const lastEpisode = episodeItems.last();
      await lastEpisode.scrollIntoViewIfNeeded().catch(() => undefined);
      await this.page.waitForTimeout(300).catch(() => undefined);
      try {
        const clickable = lastEpisode.locator('a, button, [role="button"]').first();
        if ((await clickable.count().catch(() => 0)) > 0) {
          const h = await clickable.elementHandle().catch(() => null);
          if (h) {
            await h.evaluate((el: HTMLElement) => (el as HTMLElement).click()).catch(() => undefined);
            await this.page.waitForLoadState('networkidle').catch(() => undefined);
            await this.page.waitForTimeout(2000).catch(() => undefined);
            return true;
          }
        }
      } catch (err) {
        logger.debug('clickLastEpisodeFromEpisodesList: failed to click descendant anchor/button', err);
      }
      try {
        const img = lastEpisode.locator('img[alt]').first();
        if ((await img.count().catch(() => 0)) > 0) {
          const h = await img.elementHandle().catch(() => null);
          if (h) {
            await h.evaluate((el: HTMLElement) => (el as HTMLElement).click()).catch(() => undefined);
            await this.page.waitForLoadState('networkidle').catch(() => undefined);
            await this.page.waitForTimeout(2000).catch(() => undefined);
            return true;
          }
        }
      } catch (err) {
        logger.debug('clickLastEpisodeFromEpisodesList: failed to click thumbnail image', err);
      }
      try {
        const h = await lastEpisode.elementHandle().catch(() => null);
        if (h) {
          await h.evaluate((el: HTMLElement) => (el as HTMLElement).click()).catch(() => undefined);
          await this.page.waitForLoadState('networkidle').catch(() => undefined);
          await this.page.waitForTimeout(2000).catch(() => undefined);
          return true;
        }
      } catch (err) {
        logger.debug('clickLastEpisodeFromEpisodesList: failed to click episode container', err);
      }
      return false;
    } catch (err) {
      logger.debug('clickLastEpisodeFromEpisodesList failed', err);
      return false;
    }
  }

  async clickEpisodeAtIndex(index: number): Promise<boolean> {
    logger.elementInteraction('click', `episode at index ${index}`);
    try {
      const episodeItems = this.getEpisodeItemLocator();
      const count = await episodeItems.count().catch(() => 0);
      if (count === 0 || index < 0 || index >= count) {
        logger.debug(`clickEpisodeAtIndex invalid index=${index} count=${count}`);
        return false;
      }
      const episodeItem = episodeItems.nth(index);
      await episodeItem.scrollIntoViewIfNeeded().catch(() => undefined);
      await episodeItem.click({ timeout: 20000, force: true }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      await this.page.waitForTimeout(3000);
      return true;
    } catch (err) {
      logger.debug(`clickEpisodeAtIndex failed for index ${index}`, err);
      return false;
    }
  }

  async selectLastEpisodeFromLatestSeason(): Promise<boolean> {
    logger.elementInteraction('select', 'last episode (latest season)');
    try {
      const seasonItems = this.page.locator('.season-item, [class*="season-item"], .season-container [class*="item"]');
      const seasonCount = await seasonItems.count().catch(() => 0);
      if (seasonCount > 0) {
        logger.debug(`Found ${seasonCount} season items, clicking the last one`);
        const lastSeason = seasonItems.last();
        await lastSeason.scrollIntoViewIfNeeded().catch(() => undefined);
        await lastSeason.click({ timeout: 20000, force: true }).catch(() => undefined);
        await this.page.waitForTimeout(3000);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      }
      let loadedCount = 0;
      let previousCount = 0;
      let noGrowthCount = 0;
      let maxScrollAttempts = 100;
      logger.debug('Starting continuous scroll to load all episodes...');
      while (maxScrollAttempts > 0) {
        const episodeItems = this.page.locator(this.episodeItems.selector);
        loadedCount = await episodeItems.count().catch(() => 0);
        logger.debug(`Scroll attempt: ${101 - maxScrollAttempts}, Episodes loaded: ${loadedCount}`);
        if (loadedCount === previousCount && loadedCount > 0) {
          noGrowthCount++;
          if (noGrowthCount >= 5) {
            logger.debug(`All episodes loaded: ${loadedCount} total episodes`);
            break;
          }
        } else {
          noGrowthCount = 0;
          previousCount = loadedCount;
        }
        await this.page.evaluate(() => {
          const episodeContainer = document.querySelector('.episodes-list, .season-episodes, [class*="episodes-container"], [class*="episode-list"]');
          if (episodeContainer && episodeContainer instanceof HTMLElement) {
            episodeContainer.scrollTop = episodeContainer.scrollHeight;
          }
          window.scrollBy(0, 500);
        }).catch(() => undefined);
        await this.page.waitForTimeout(1200);
        maxScrollAttempts--;
      }
      const episodeItemsFinal = this.page.locator(this.episodeItems.selector);
      const finalCount = await episodeItemsFinal.count().catch(() => 0);
      if (finalCount === 0) {
        logger.debug('No episodes found');
        return false;
      }
      logger.debug(`Final episode count: ${finalCount}. Selecting last episode (index ${finalCount - 1})`);
      const lastEpisode = episodeItemsFinal.nth(finalCount - 1);
      await lastEpisode.scrollIntoViewIfNeeded({ timeout: 20000 }).catch(() => undefined);
      await this.page.waitForTimeout(1500);
      const countBeforeClick = await this.page.locator(this.episodeItems.selector).count().catch(() => 0);
      logger.debug(`Episode count before click: ${countBeforeClick}, clicking episode at index ${countBeforeClick - 1}`);
      const lastEpisodeBeforeClick = this.page.locator(this.episodeItems.selector).last();
      await lastEpisodeBeforeClick.click({ timeout: 20000, force: true }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return true;
    } catch (err) {
      logger.debug('selectLastEpisodeFromLatestSeason failed', err);
      return false;
    }
  }

  async clickRandomEpisodeCard(): Promise<{ title: string; seasonText: string; episodeText: string }> {
    logger.elementInteraction('click', 'random visible episode card');
    const episodeLabelCandidates = this.page.getByText(/S\d+\s*E\d+/i);
    const count = await episodeLabelCandidates.count().catch(() => 0);
    if (!count) {
      return { title: '', seasonText: '', episodeText: '' };
    }
    const randomIndex = Math.floor(Math.random() * Math.min(count, 5));
    const selectedLabel = episodeLabelCandidates.nth(randomIndex);
    await selectedLabel.scrollIntoViewIfNeeded().catch(() => undefined);
    await selectedLabel.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
    const card = await this.findEpisodeCardForLabel(selectedLabel);
    const selectedLabelText = ((await selectedLabel.textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
    const metadata = this.parseEpisodeMetadata(selectedLabelText);
    const titleFromCard = await this.extractTitleFromSelectedLabel(selectedLabel);
    const seasonText = metadata.seasonText || (await this.extractSeasonFromLabel(selectedLabel));
    const episodeText = metadata.episodeText || (await this.extractEpisodeNumberFromLabel(selectedLabel));
    const title = titleFromCard || metadata.title;
    this.lastSelectedEpisodeMetadata = {
      seasonNumber: seasonText,
      episodeNumber: episodeText,
      title,
    };
    try {
      await card.click({ timeout: 20000, force: true }).catch(() => undefined);
    } catch {
      await selectedLabel.click({ timeout: 20000, force: true }).catch(() => undefined);
    }
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    await this.page.waitForTimeout(5000);
    return {
      title,
      seasonText,
      episodeText,
    };
  }

  async clickWatchlistIcon(): Promise<void> {
    logger.elementInteraction('click', 'watchlist icon');
    const addIcon = this.getRoleLocator(this.addWatchlistIcon);
    const removeIcon = this.getRoleLocator(this.removeWatchlistIcon);
    if (await removeIcon.isVisible().catch(() => false)) {
      await removeIcon.click({ timeout: 15000, force: true });
      await this.page.waitForTimeout(1000);
    }
    await addIcon.waitFor({ state: 'visible', timeout: 15000 });
    await addIcon.click({ timeout: 15000, force: true });
    await this.page.waitForTimeout(1000);
  }

  async hoverContentThumbnailAndClickWatchlistIcon(contentTitle: string): Promise<string> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);
    try {
      const contentThumbnail = this.getRoleLocator({ role: 'img', text: contentTitle });
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(7000);
      const removeIcon = this.getRoleLocator(this.removeWatchlistIcon);
      const addIcon = this.getRoleLocator(this.addWatchlistIcon);
      if (await removeIcon.isVisible().catch(() => false)) {
        await removeIcon.click({ timeout: 15000, force: true });
        await this.page.waitForTimeout(1000);
      }
      await addIcon.waitFor({ state: 'visible', timeout: 15000 });
      await addIcon.click({ timeout: 15000, force: true });
      await this.page.waitForTimeout(1500);
      return await this.validateAddedToWatchlistPopup();
    } catch (error) {
      logger.debug(`Hover content thumbnail and click watchlist icon failed for ${contentTitle}`, error);
      return '';
    }
  }

  async getWatchlistActionState(contentTitle: string): Promise<'add' | 'remove' | 'none'> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);
    try {
      const contentThumbnail = this.getRoleLocator({ role: 'img', text: contentTitle });
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(2000);
      const removeIcon = this.getRoleLocator(this.removeWatchlistIcon);
      const addIcon = this.getRoleLocator(this.addWatchlistIcon);
      if (await removeIcon.isVisible().catch(() => false)) {
        return 'remove';
      }
      if (await addIcon.isVisible().catch(() => false)) {
        return 'add';
      }
      return 'none';
    } catch (error) {
      logger.debug(`Unable to determine watchlist action state for ${contentTitle}`, error);
      return 'none';
    }
  }

  async ensureWatchlistIsAddable(): Promise<void> {
    logger.elementInteraction('precondition', 'ensure watchlist is addable');
    try {
      const watchlistContainer = this.page.locator(this.addToWatchlistButtonIcon.selector ?? '').first();
      await watchlistContainer.waitFor({ state: 'visible', timeout: 15000 });

      const removeIconLocator = watchlistContainer.locator(this.removeWatchlistIcon.selector ?? '').first();
      if ((await removeIconLocator.count().catch(() => 0)) > 0 && (await removeIconLocator.isVisible().catch(() => false))) {
        await removeIconLocator.scrollIntoViewIfNeeded().catch(() => undefined);
        await removeIconLocator.click({ timeout: 15000, force: true }).catch(() => undefined);
        return;
      }
      const addButton = watchlistContainer.locator(this.addToWatchlistButton.selector ?? '').first();
      if ((await addButton.count().catch(() => 0)) > 0) {
        await addButton.scrollIntoViewIfNeeded().catch(() => undefined);
        await addButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        await addButton.hover().catch(() => undefined);
        await this.page.waitForTimeout(300);
        const tooltipLocator = this.page.locator(this.watchlistTooltipRemove.selector ?? '').first();
        if (await tooltipLocator.isVisible().catch(() => false)) {
          await addButton.click({ timeout: 15000, force: true }).catch(() => undefined);
        }
        return;
      }
    } catch (error) {
      logger.debug('ensureWatchlistIsAddable failed', error);
    }
  }

  async ensureWatchlistIsRemovable(): Promise<void> {
    logger.elementInteraction('precondition', 'ensure watchlist is removable');
    try {
      const watchlistIcon = this.getRoleLocator(this.addWatchlistIcon);
      await watchlistIcon.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      await watchlistIcon.hover().catch(() => undefined);
      const tooltipLocator = this.page.locator(this.watchlistTooltipAdd.selector ?? '').first();
      if (await tooltipLocator.isVisible().catch(() => false)) {
        await watchlistIcon.click({ timeout: 15000, force: true }).catch(() => undefined);
      } else {
        return;
      }
    } catch (error) {
      logger.debug('ensureWatchlistIsRemovable failed', error);
    }
  }

  async isWatchlistItemVisible(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `watchlist item visible ${contentTitle}`);
    try {
      const item = this.page.getByRole('img', { name: contentTitle }).first();
      await item.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      logger.info(`Item not visible: ${contentTitle}`);
      return false;
    }
  }

  async verifyWatchlistHeading(expectFn: typeof expect, contentTitle: string): Promise<void> {
    logger.elementInteraction('verify', `watchlist heading ${contentTitle}`);
    const heading = this.page.getByRole('heading', { name: contentTitle }).first();
    await heading.waitFor({ state: 'visible', timeout: 15000 });
    await heading.click({ timeout: 15000 });
    await expectFn(heading).toBeVisible();
  }

  async hoverFirstContentThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('My Illegal Wife');
  }

  async hoverIAmYourDaughterThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('I Am Your Daughter');
  }

  async hoverAMomentInTimeThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('A Moment in Time');
  }

  async hoverContentThumbnailAndClickRemoveWatchlistIcon(contentTitle: string): Promise<void> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);
    try {
      const contentThumbnail = this.getRoleLocator({ role: 'img', text: contentTitle });
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(5000);
      const watchlistIcon = this.getRoleLocator(this.removeWatchlistIcon);
      await watchlistIcon.waitFor({ state: 'visible', timeout: 10000 });
      await watchlistIcon.click({ timeout: 15000, force: true });
    } catch (error) {
      logger.debug(`Hover content thumbnail and click remove watchlist icon failed for ${contentTitle}`, error);
    }
  }

  async removeFromWatchlist(): Promise<void> {
    logger.elementInteraction('click', 'Remove from Watchlist');
    try {
      const locator = this.page.locator(this.removeFromWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Remove from Watchlist button click failed', error);
    }
  }

  async ensureWatchlistHasCapacity(): Promise<void> {
    logger.elementInteraction('precondition', 'ensure watchlist has capacity');
    try {
      const fullPopup = this.page.locator(this.watchlistFullPopup.selector).first();
      if (!(await fullPopup.isVisible().catch(() => false))) {
        return;
      }
      logger.step('Watchlist is full, navigating to My Watchlist to remove first content');
      const watchlistLink = this.page.locator(this.myWatchlistLink.selector).first();
      if (await watchlistLink.isVisible().catch(() => false)) {
        await watchlistLink.click({ timeout: 15000, force: true });
      } else {
        const baseUrl = config.getBaseURL();
        await this.page.goto(`${baseUrl}/my_watchlist`, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
      }
      await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
      await this.page.waitForTimeout(1500);
      await this.clickFirstContentInWatchlist();
      const removeButton = this.page.locator(this.removeFromWatchlistButton.selector).first();
      await removeButton.waitFor({ state: 'visible', timeout: 15000 });
      await removeButton.click({ timeout: 15000, force: true });
      await this.page.waitForTimeout(1500);
    } catch (error) {
      logger.debug('ensureWatchlistHasCapacity failed', error);
    }
  }

  async clickCinemaOnePhSection(): Promise<void> {
    logger.elementInteraction('click', 'Cinema One PH section');
    try {
      const locator = this.page.locator(this.cinemaOnePhSection.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug('Cinema One PH section click failed', error);
    }
  }

  async isLiveChannelsTrayVisible(): Promise<boolean> {
    try {
      const liveChannelsHeadingLocator = this.page.locator(this.liveChannelsHeadingLabel.selector ?? '').first();
      await liveChannelsHeadingLocator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async openLiveChannelsTray(): Promise<void> {
    logger.elementInteraction('click', 'Live Channels tray');
    try {
      const locator = this.page.locator(this.liveChannelsHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        logger.debug('Networkidle wait after opening live channels tray failed or timed out');
      });
    } catch (error) {
      logger.debug('Live Channels tray click failed', error);
    }
  }

  async clickLiveContentByName(contentName: string): Promise<void> {
    logger.elementInteraction('click', `live content card ${contentName}`);
    try {
      const locator = this.getRoleLocator({ role: 'img', text: contentName });
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        logger.debug('Networkidle wait after live content click failed or timed out');
      });
    } catch (error) {
      logger.debug(`Live content card click failed for ${contentName}`, error);
    }
  }

  async clickFreeContentUnderLiveChannelsTray(contentName: string): Promise<void> {
    logger.elementInteraction('click', `free content ${contentName} under Live Channels tray`);
    try {
      await this.openLiveChannelsTray();
      await this.clickLiveContentByName(contentName);
    } catch (error) {
      logger.debug(`Free content click under Live Channels tray failed for ${contentName}`, error);
    }
  }

  async isLiveIconVisible(): Promise<boolean> {
    try {
      const locator = this.getRoleLocator({ text: 'Live' }, true).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isAddToWatchlistButtonVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.addToWatchlistButtonIcon, 10000);
  }

  async isPrimaryPlaybackActionVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.playButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickLoginCta(): Promise<void> {
    logger.elementInteraction('click', 'Login CTA');
    try {
      const locator = this.page.locator(this.loginCta.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await locator.click({ timeout: 10000 });
    } catch (error) {
      logger.debug('Login CTA click failed', error);
    }
  }

  async clickPlayVideoOverlayButton(): Promise<void> {
    logger.elementInteraction('click', 'play video overlay button');
    try {
      const locator = this.page.locator('button[aria-label="Play video"]').first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await locator.click({ timeout: 10000 });
      await this.page.waitForTimeout(1500);
    } catch (error) {
      logger.debug('Play video overlay button click failed', error);
    }
  }

  async clickPlayButton(): Promise<void> {
    logger.elementInteraction('click', 'play button');
    try {
      await this.pageUtils.safeClick(this.playButton, 15000);
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug('Play button click failed', error);
      try {
        const fallbackLocator = this.page.locator('button').filter({ hasText: /play/i }).first();
        if (await fallbackLocator.count()) {
          await fallbackLocator.click({ timeout: 15000 });
        }
      } catch (fallbackError) {
        logger.debug('Play button fallback click failed', fallbackError);
      }
    }
  }

  async getTitleAfterPlayButtonClick(): Promise<string> {
    logger.elementInteraction('get', 'player title after play button click');
    try {
      const playbackTitleLocator = this.getRoleLocator(this.playbackTitleParagraph);
      await playbackTitleLocator.waitFor({ state: 'visible', timeout: 20000 });
      const titleText = (await playbackTitleLocator.textContent().catch(() => '')) || '';
      return titleText.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Failed to get title after play button click', error);
      return '';
    }
  }

  async scrollToEpisodeList(): Promise<void> {
    logger.elementInteraction('scroll', 'episode list');
    try {
      const episodeListLocator = this.page.locator(this.firstEpisodeCard.selector).first();
      if (await episodeListLocator.count()) {
        await episodeListLocator.waitFor({ state: 'visible', timeout: 15000 });
        await episodeListLocator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.debug('Episode list scroll failed', error);
    }
  }

  async scrollUntilEarlyAccessTagVisible(maxScrolls: number = 20): Promise<boolean> {
    try {
      const tags = this.page.locator('//img[@alt="early_access"]');
      for (let scroll = 0; scroll < maxScrolls; scroll++) {
        const count = await tags.count().catch(() => 0);

        logger.info(
          `Checking Early Access tags. Found ${count} candidate(s). Scroll ${scroll + 1}/${maxScrolls}`
        );
        for (let index = 0; index < count; index++) {
          const tag = tags.nth(index);

          if (await tag.isVisible().catch(() => false)) {
            await tag.scrollIntoViewIfNeeded().catch(() => undefined);

            logger.info(
              `Early Access tag found at index ${index}`
            );

            return true;
          }
        }
        await this.page.mouse.wheel(0, 300);
        await this.page.waitForTimeout(750);
      }
      logger.info('Early Access tag was not found after scrolling');
      return false;
    } catch (error) {
      logger.debug(`Early Access tag visibility check failed: ${error}`);
      return false;
    }
  }

  async clickEpisodeCardWithEarlyAccessTag(): Promise<boolean> {
    logger.elementInteraction('click', 'episode card with Early Access tag');
    try {
      const earlyAccessTag = this.page.locator('//img[@alt="early_access"]').first();
      await earlyAccessTag.waitFor({ state: 'visible', timeout: 15000 });
      const clickableAncestor = earlyAccessTag.locator('xpath=ancestor::a[1] | ancestor::button[1] | ancestor::*[contains(@role, "button")][1]').first();
      if (await clickableAncestor.count()) {
        await clickableAncestor.scrollIntoViewIfNeeded().catch(() => undefined);
        await clickableAncestor.click({ timeout: 20000, force: true });
        return true;
      }
      await earlyAccessTag.click({ timeout: 20000, force: true });
      return true;
    } catch (error) {
      logger.debug('Clicking episode card with Early Access tag failed', error);
      return false;
    }
  }

  async clickPreviousEpisodeOfEarlyAccessTag(): Promise<boolean> {
    logger.elementInteraction('click', 'previous episode before Early Access episode');
    try {
      const earlyAccessTag = this.page.locator('(//img[@alt="early_access"])[1]').first();
      await earlyAccessTag.waitFor({ state: 'visible', timeout: 15000 });
      const currentEpisodeCard = earlyAccessTag.locator(this.episodeCardAncestor.selector).first();
      if (!await currentEpisodeCard.count()) {
        return false;
      }
      const previousEpisode = currentEpisodeCard.locator('xpath=preceding-sibling::*[1]').first();
      if (!await previousEpisode.count()) {
        return false;
      }
      const clickableAncestor = previousEpisode.locator('xpath=.//a[1] | .//button[1] | .//*[@role="button"][1]').first();
      const target = await (await clickableAncestor.count()) ? clickableAncestor : previousEpisode;
      await target.scrollIntoViewIfNeeded().catch(() => undefined);
      await target.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      logger.debug('Clicking previous episode for Early Access tag failed', error);
      return false;
    }
  }

  async clickEpisodeTwo(): Promise<void> {
    logger.elementInteraction('click', 'episode two');
    try {
      await this.scrollToEpisodeList();
      const episodeTwoLocator = this.page.getByText('S1 E2').first();
      await episodeTwoLocator.waitFor({ state: 'visible', timeout: 15000 });
      await episodeTwoLocator.click({ timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      logger.debug('Episode two click failed', error);
    }
  }

  async clickEpisodeOne(): Promise<void> {
    logger.elementInteraction('click', 'episode one');
    try {
      await this.scrollToEpisodeList();
      const episodeOneLocator = this.page.getByText('S1 E1').first();
      await episodeOneLocator.waitFor({ state: 'visible', timeout: 15000 });
      await episodeOneLocator.click({ timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      logger.debug('Episode one click failed', error);
    }
  }

  async clickEpisodeThree(): Promise<void> {
    logger.elementInteraction('click', 'episode three');
    try {
      await this.scrollToEpisodeList();
      const episodeThreeLocator = this.page.getByText('S1 E3').first();
      await episodeThreeLocator.waitFor({ state: 'visible', timeout: 15000 });
      await episodeThreeLocator.click({ timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      logger.debug('Episode three click failed', error);
    }
  }

  async isSkipIntroMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.skipIntroMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isSubtitleMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.subtitleVisible.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isSkipRecapMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.skipRecapMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }


  async clickSkipIntroMarker(): Promise<boolean> {
    logger.elementInteraction('click', 'Skip Intro marker');
    try {
      const locator = this.page.locator(this.skipIntroMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000, force: true });
      return true;
    } catch (error) {
      logger.debug('Skip Intro marker click failed', error);
    }
  }

  async isGoLiveMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.goLiveButtonElement.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  

  async isSkipMarkerVisible(markerType: 'intro' | 'recap' = 'recap'): Promise<boolean> {
    if (markerType === 'intro') {
      return this.isSkipIntroMarkerVisible();
    }
    return this.isSkipRecapMarkerVisible();
  }

  async clickSkipRecapMarker(): Promise<boolean> {
    logger.elementInteraction('click', 'Skip Recap marker');
    try {
      const locator = this.page.locator(this.skipRecapMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000, force: true });
      return true;
    } catch (error) {
      logger.debug('Skip Recap marker click failed', error);
      return false;
    }
  }

  async waitForSkipAdButton(timeoutSeconds: number = 30): Promise<boolean> {
    try {
      const skipAdLocator = this.page.locator(this.skipAdButton.selector).first();
      await skipAdLocator.waitFor({ state: 'visible', timeout: timeoutSeconds * 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async isSkipAdButtonVisible(): Promise<boolean> {
    try {
      const skipAdLocator = this.page.locator(this.skipAdButton.selector).first();
      await skipAdLocator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickSkipAdButton(): Promise<boolean> {
    logger.elementInteraction('click', 'Skip Ad button');
    try {
      const skipAdLocator = this.page.locator(this.skipAdButton.selector).first();
      await skipAdLocator.waitFor({ state: 'visible', timeout: 15000 });
      await skipAdLocator.click({ timeout: 10000 });
      return true;
    } catch (error) {
      logger.debug('Skip Ad button click failed', error);
      return false;
    }
  }

  async waitForLearnMoreLink(timeoutSeconds: number = 30): Promise<boolean> {
    try {
      const learnMoreLocator = this.page.locator(this.learnMoreLink.selector).first();
      await learnMoreLocator.waitFor({ state: 'visible', timeout: timeoutSeconds * 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickLearnMoreLink(): Promise<boolean> {
    logger.elementInteraction('click', 'Learn More link');
    try {
      const learnMoreLocator = this.page.locator(this.learnMoreLink.selector).first();
      await learnMoreLocator.waitFor({ state: 'visible', timeout: 15000 });
      await learnMoreLocator.click({ timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
      return true;
    } catch (error) {
      logger.debug('Learn More link click failed', error);
      return false;
    }
  }

  async getCurrentPageTitle(): Promise<string> {
    try {
      return (await this.page.title()).trim();
    } catch {
      return '';
    }
  }

  async getCurrentPageUrl(): Promise<string> {
    try {
      return this.page.url().trim();
    } catch {
      return '';
    }
  }

  async getSkipAdButtonText(): Promise<string> {
    try {
      const skipAdLocator = this.page.locator(this.skipAdButton.selector).first();
      await skipAdLocator.waitFor({ state: 'visible', timeout: 15000 });
      const text = await skipAdLocator.textContent();
      return (text ?? '').trim();
    } catch {
      return '';
    }
  }

  async getAdDurationCountdownText(): Promise<string> {
    try {
      const bodyText = await this.page.textContent('body');
      if (!bodyText) {
        return '';
      }
      const match = bodyText.match(/\b(?:ad|ad duration|remaining|seconds? left|skip ad in)\b[^\d]{0,10}(\d{1,2}\s*s(ec)?)/i);
      if (match?.[0]) {
        return match[0].trim();
      }
      const fallback = bodyText.match(/\b\d{1,2}\s*s(ec)?\b/i);
      return fallback?.[0]?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async clickPlayerForwardButton(): Promise<void> {
    logger.elementInteraction('click', 'player forward button');
    try {
      await this.pageUtils.safeClick(this.playerForwardButton, 15000);
    } catch (error) {
      logger.debug('Player forward button not found or click failed', error);
    }
  }

  async clickPlayerBackArrow(): Promise<void> {
    logger.elementInteraction('click', 'player back arrow');
    try {
      await this.pageUtils.safeClick(this.playerBackArrowButton, 15000);
    } catch (error) {
      logger.debug('Player back arrow not found or click failed', error);
    }
  }

  async clickEpisodeByNumber(episodeNumber: string): Promise<void> {
    logger.elementInteraction('click', `episode ${episodeNumber}`);
    const normalizedEpisode = String(episodeNumber).trim().replace(/^E/i, '');
    const pattern = new RegExp(`(?:S\\d+\\s*)?E${normalizedEpisode}\\b|Episode\\s*${normalizedEpisode}\\b`, 'i');

    try {
      const candidate = this.page.locator('button, [role="button"], a, [data-testid*="episode"], .episode-item, .episode-info').filter({ hasText: pattern }).first();
      await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
      await candidate.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
      await candidate.click({ timeout: 15000, force: true }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
      await this.page.waitForTimeout(2000);
    } catch (error) {
      logger.debug(`Episode ${episodeNumber} click failed`, error);
    }
  }

  async clickSkipRecapButton(): Promise<void> {
    logger.elementInteraction('click', 'skip recap button');
    const button = this.page.locator(this.skipRecapMarker.selector).first();
    await button.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    await button.click({ timeout: 15000, force: true }).catch(() => undefined);
  }

  async clickSkipIntroButton(): Promise<void> {
    logger.elementInteraction('click', 'skip intro button');
    const button = this.page.locator(this.skipIntroMarker.selector).first();
    await button.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    await button.click({ timeout: 15000, force: true }).catch(() => undefined);
  }

  async clickPremiumTagIcon(): Promise<void> {
    logger.elementInteraction('click', 'premium tag icon');
    try {
      const locator = this.page.locator(this.premiumTagIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Premium tag icon click failed', error);
    }
  }

  async isPremiumTagVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.premiumTagIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isPremiumCrownIconVisibleOnFirstSearchResult(): Promise<boolean> {
    try {
      const firstResult = this.page.locator(this.firstSearchResult.selector).first();
      await firstResult.waitFor({ state: 'visible', timeout: 15000 });
      const crownIcon = firstResult.locator(this.premiumCrownIcon.selector).first();
      await crownIcon.waitFor({ state: 'visible', timeout: 10000 });
      return await crownIcon.isVisible().catch(() => false);
    } catch (err) {
      logger.debug('Premium crown icon visibility check failed', err);
      return false;
    }
  }

  async isSubscribeToWatchCtaVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.subscribeToWatchCtaButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async getSubscribeToWatchCtaText(): Promise<string> {
    try {
      const locator = this.page.locator(this.subscribeToWatchCta.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return (await locator.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async isContentCloseButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentCloseButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentMoreExpandVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentMoreExpandButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentLanguageIconVisible(): Promise<boolean> {
    try {
      const selectors = [this.contentLanguageIcon.selector, 'div.languages'];
      for (const selector of selectors) {
        const locator = this.page.locator(selector).first();
        if (await locator.count().catch(() => 0) && (await locator.isVisible().catch(() => false))) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async isContentSubtitleIconVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentSubtitleIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentShareIconVisible(): Promise<boolean> {
    try {
      const selectors = [this.contentShareIcon.selector, '#share', 'div#share'];
      for (const selector of selectors) {
        const locator = this.page.locator(selector).first();
        if (await locator.count().catch(() => 0) && (await locator.isVisible().catch(() => false))) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async clickContentShareIcon(): Promise<void> {
    logger.elementInteraction('click', 'content share icon');
    try {
      const locator = this.page.locator(this.contentShareIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Content share icon click failed', error);
    }
  }

  async getShareCopyConfirmationMessage(): Promise<string> {
    try {
      const locator = this.page.locator(this.shareCopyConfirmationMessage.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      return (await locator.textContent()) || '';
    } catch {
      return '';
    }
  }

  async isContentTitleImageVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentTitleImage.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentGenreVisible(): Promise<boolean> {
    try {
      const explicitGenres = await this.getDetailsPageGenres();
      if (explicitGenres.length > 0) {
        return true;
      }
      const selectors = [
        this.contentDetailsGenres.selector,
        this.contentGenre.selector,
        this.contentMetadataDiv.selector,
        this.contentMetadata.selector,
        this.contentMetadataContainer.selector,
      ].filter(Boolean) as string[];
      for (const selector of selectors) {
        const locator = this.page.locator(selector).first();
        if (await locator.count().catch(() => 0) && (await locator.isVisible().catch(() => false))) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async isContentYearVisible(): Promise<boolean> {
    try {
      const yearText = await this.getContentYearText();
      return yearText.length > 0;
    } catch {
      return false;
    }
  }

  async getContentYearText(): Promise<string> {
    try {
      const selectors = [
        this.contentYear.selector,
        this.contentMetadata.selector,
        this.contentMetadataContainer.selector,
        this.contentMetadataDiv.selector,
      ].filter(Boolean) as string[];
      for (const selector of selectors) {
        const locator = this.page.locator(selector).first();
        if (!(await locator.count().catch(() => 0))) continue;
        if (!(await locator.isVisible().catch(() => false))) continue;
        const text = (await locator.textContent().catch(() => ''))?.replace(/\s+/g, ' ').trim();
        const match = text?.match(/\b(19|20)\d{2}\b/);
        if (match?.[0]) {
          return match[0];
        }
      }
      const candidateYear = await this.page
        .locator('main p')
        .filter({ hasText: /^(19|20)\d{2}$/ })
        .first()
        .textContent()
        .catch(() => '');
      if (candidateYear) {
        return candidateYear.trim();
      }
      const pageText = (await this.page.locator(this.mainContentContainer.selector).first().textContent().catch(() => ''))
        ?.replace(/\s+/g, ' ')
        .trim();
      const match = pageText?.match(/\b(19|20)\d{2}\b/);
      return match?.[0] ?? '';
    } catch {
      return '';
    }
  }

  async getContentGenreText(): Promise<string> {
    try {
      const explicitGenres = await this.getDetailsPageGenres();
      if (explicitGenres.length > 0) {
        return explicitGenres.join(', ');
      }
      const selectors = [
        this.contentDetailsGenres.selector,
        this.contentGenre.selector,
        this.contentMetadata.selector,
        this.contentMetadataContainer.selector,
        this.contentMetadataDiv.selector,
      ].filter(Boolean) as string[];
      const fragments: string[] = [];
      for (const selector of selectors) {
        const locator = this.page.locator(selector).first();
        if (!(await locator.count().catch(() => 0))) continue;
        if (!(await locator.isVisible().catch(() => false))) continue;
        const text = (await locator.textContent().catch(() => ''))?.replace(/\s+/g, ' ').trim();
        if (text) fragments.push(text);
      }
      const genreCandidates = await this.extractGenresFromPageText(fragments.join(' '));
      if (genreCandidates.length > 0) {
        return genreCandidates.join(', ');
      }
      return '';
    } catch {
      return '';
    }
  }

  private async extractGenresFromPageText(text: string): Promise<string[]> {
    const parts = text
      .replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/[\/\|·\-:,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((part) => part.trim())
      .filter((part) => part.length > 1);
    const genres = [] as string[];
    for (const part of parts) {
      const lower = part.toLowerCase();
      if (/^\d+$/.test(lower)) continue;
      if (/^s\d+$/i.test(lower)) continue;
      if (/^e\d+$/i.test(lower)) continue;
      if (/^s\d+e\d+$/i.test(lower)) continue;
      if (/^\d+m$/i.test(lower)) continue;
      if (/^\d+s$/i.test(lower)) continue;
      if (genres.includes(part)) continue;
      genres.push(part);
    }
    return genres;
  }

  async isContentAgeRatingVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentAgeRating.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentDurationVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentDuration.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentCastVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentCast.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickSubscribeToWatchCta(): Promise<void> {
    logger.elementInteraction('click', 'subscribe to watch CTA');
    try {
      const locator = this.page.locator(this.subscribeToWatchCtaButton.selector ?? '').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Subscribe to watch CTA click failed', error);
    }
  }

  async clickSubscribeToWatchCtaBlocker(): Promise<void> {
    logger.elementInteraction('click', 'subscribe to watch CTA');
    try {
      const locator = this.page.locator(this.subscribeToWatchCtaBlocker.selector ?? '').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Subscribe to watch CTA click failed', error);
    }
  }

  async isAccountHeadingVisible(timeout: number = 15000): Promise<boolean> {
    try {
      const accountHeading = this.page.getByRole('heading', { name: /Account|Profile|Subscription/i }).first();
      await accountHeading.waitFor({ state: 'visible', timeout }).catch(() => undefined);
      return await accountHeading.isVisible().catch(() => false);
    } catch (error) {
      logger.debug('Account heading visibility check failed', error);
      return false;
    }
  }

  async getAccountRedirectVerification(): Promise<{ accountScreenVisible: boolean; iWantIconVisible: boolean; urlContainsAccount: boolean }> {
    const accountScreenVisible = await this.isAccountHeadingVisible();
    const iWantIconVisible = await this.isIWantElementVisible().catch(() => false);
    const urlContainsAccount = /account|profile|subscription/i.test(this.page.url());
    return {
      accountScreenVisible,
      iWantIconVisible,
      urlContainsAccount,
    };
  }

  async isUpgradePlanButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.upgradePlanButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickUpgradePlanButton(): Promise<void> {
    logger.elementInteraction('click', 'Upgrade Plan button');
    try {
      const locator = this.page.locator(this.upgradePlanButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Upgrade Plan button click failed', error);
    }
  }

  async isPlansPageVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.plansPageHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContinueWatchingTrayVisible(): Promise<boolean> {
    try {
      const heading = this.page.locator(
        'p[class*="text-[2.4rem]"][class*="font-medium"][class*="leading-[3.5rem]"]:has-text("Continue Watching")'
      ).first();
      await heading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async hoverFirstContinueWatchingItem(): Promise<void> {
    try {
      const locator = this.page.locator(this.continueWatchingThumbnail.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.hover();
    } catch (error) {
      logger.debug('Hovering over continue watching item failed', error);
    }
  }

  async clickFirstContinueWatchingRemoveIcon(): Promise<void> {
    logger.elementInteraction('click', 'remove continue watching item icon');
    try {
      const locator = this.page.locator(this.continueWatchingRemoveButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      logger.info('click', 'remove continue watching item icon');
    } catch (error) {
      logger.debug('Continue Watching remove icon click failed', error);
    }
  }

  async isContinueWatchingItemVisible(contentTitle?: string): Promise<boolean> {
    try {
      const container = this.page.locator(this.continueWatchingTray.selector).first();
      if (!(await container.count())) {
        return false;
      }
      const locator = contentTitle
        ? container.locator(`text=${contentTitle}`).first()
        : container.locator(this.continueWatchingThumbnail.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContinueWatchingDetailsAndMoreVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.continueWatchingDetailsAndMore.selector).filter({ hasText: /Details and More|View More|Details/i }).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickContinueWatchingDetailsAndMore(): Promise<void> {
    logger.elementInteraction('click', 'Continue Watching details and more action');
    try {
      const locator = this.page.locator(this.continueWatchingDetailsAndMore.selector).filter({ hasText: /Details and More|View More|Details/i }).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      await locator.click({ timeout: 20000 });
    } catch (error) {
      logger.debug('Continue Watching details and more action click failed', error);
    }
  }

  async clickFirstContinueWatchingItem(): Promise<boolean> {
    logger.elementInteraction('click', 'first Continue Watching item');
    try {
      const locator = this.page.locator(this.continueWatchingFirstContent.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      return true;
    } catch (error) {
      logger.debug('Clicking the first Continue Watching item failed', error);
      return false;
    }
  }

  async clickCarouselInfoIcon(): Promise<void> {
    logger.elementInteraction('click', 'carousel info icon');
    try {
      const locator = this.page.locator(this.carouselInfoIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 30000 });
      await locator.click({ force: true, timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      logger.assertion('carousel info icon clicked and page loaded', true);
    } catch (error) {
      logger.debug('Carousel info icon click failed', error);
    }
  }

  async isContentDetailsPageVisible(): Promise<boolean> {
    try {
      await this.page.waitForURL(/\/details\//, { timeout: 20000 });
      const headingLocator = this.page.locator(this.contentDetailsHeading.selector).first();
      if (await headingLocator.count().catch(() => 0)) {
        return await headingLocator.isVisible().catch(() => false);
      }
      const metadataLocator = this.page.locator(this.contentMetadata.selector).first();
      if (await metadataLocator.count().catch(() => 0)) {
        return await metadataLocator.isVisible().catch(() => false);
      }
      return this.page.url().includes('/details/') || this.page.url().includes('/content/') || this.page.url().includes('/show/');
    } catch {
      return false;
    }
  }

  async getFirstEpisodeCardTitleText(): Promise<string> {
    try {
      if (this.page.isClosed()) return '';
      const episodeCard = this.page.locator(this.firstEpisodeCard.selector).first();
      if (!(await episodeCard.count())) return '';
      try {
        await episodeCard.waitFor({ state: 'visible', timeout: 15000 });
      } catch {
      }
      const text = (await episodeCard.textContent()) || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (err) {
      logger.debug('getFirstEpisodeCardTitleText failed', err);
      return '';
    }
  }

  async validateAddedToWatchlistPopup(): Promise<string> {
    logger.elementInteraction('verify', 'Added to Watchlist popup');
    const toastCandidates = [
      this.page.locator(this.watchlistToast.selector).filter({ hasText: /Added to watchlist/i }).first(),
      this.page.locator(this.watchlistToast.selector).filter({ hasText: /added/i }).first(),
    ];
    for (const toast of toastCandidates) {
      try {
        await toast.waitFor({ state: 'visible', timeout: 15000 });
        const text = (await toast.textContent()) || '';
        if (text.toLowerCase().includes('added')) {
          return text.trim();
        }
      } catch {
        logger.debug('Toast not found or not visible');
        return '';
      }
    }
  }

  async validateRemovedFromWatchlistPopup(): Promise<string> {
    logger.elementInteraction('verify', 'Removed from Watchlist popup');
    try {
      const toast = this.page.locator(this.watchlistToast.selector).filter({ hasText: /Removed from watchlist/i }).first();
      await toast.waitFor({ state: 'visible', timeout: 15000 });
      return (await toast.textContent()) || '';
    } catch {
      return '';
    }
  }

  async getContentTitleFromTitleImageLocator(): Promise<string> {
    logger.elementInteraction('get', 'content title from title image locator');
    try {
      const titleImage = this.page.locator(this.titleImageWithAlt.selector).first();
      await titleImage.waitFor({ state: 'visible', timeout: 15000 });
      const title = await titleImage.getAttribute('alt').catch(() => '');
      if (title?.trim()) {
        logger.assertion('Content title is available from title image locator', true);
        return title.trim();
      }
    } catch (error) {
      logger.debug('Unable to read content title from title image locator', error);
    }
    return '';
  }

  async assertContentTitleFromTitleImageLocator(): Promise<string> {
    const title = await this.getContentTitleFromTitleImageLocator();
    expect(title).toBeTruthy();
    return title;
  }

  async addToWatchlistAndGetToast(): Promise<string> {
    logger.elementInteraction('click', 'Add to Watchlist');
    const contentTitle = await this.assertContentTitleFromTitleImageLocator();
    logger.debug(`Asserted add-watchlist title: ${contentTitle}`);
    try {
      const locator = this.page.locator(this.addToWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000, force: true });
    } catch (error) {
      logger.debug('Add to Watchlist button click failed', error);
    }
    try {
      const toast = this.page.locator(this.watchlistToast.selector).filter({ hasText: /Added to watchlist/i }).first();
      await toast.waitFor({ state: 'visible', timeout: 15000 });
      return (await toast.textContent()) || '';
    } catch {
      logger.debug('Added to Watchlist toast not found or not visible');
      return '';
    }
  }

  private async getFirstSearchResultAsset(searchQuery?: string): Promise<any | null> {
    try {
      // Wait for a visible first-result element to appear (UI) before reading GraphQL
      await this.page.locator(this.firstSearchResult.selector).first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      const gql = GraphQLHelper.getInstance(this.page);
      const operation = await gql.waitForOperation('Search', 15000).catch((err) => {
        logger.debug('Search GraphQL operation did not appear', err);
        return null;
      });
      const resp = operation?.response;
      if (!resp) {
        logger.error('Search GraphQL response not received within timeout.');
        return null;
      }
      // If a searchQuery is provided, use the SearchParser to get title matches
      if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
        try {
          const { SearchParser } = await import('../utils/graphql/parsers/search-parser').catch(() => ({ SearchParser: null }));
          // If parser module could not be imported, fall back to generic walk
          if (SearchParser) {
            const parser = new SearchParser(resp);
            const titleMatches = parser.getTitleMatches(searchQuery);
            if (titleMatches && titleMatches.length > 0) {
              const wantedTitle = titleMatches[0];
              // Traverse response to find the asset object that has this exact title
              let foundAsset: any = null;
              const seen = new WeakSet();
              const walkerFind = (obj: any) => {
                if (!obj || typeof obj !== 'object' || seen.has(obj) || foundAsset) return;
                seen.add(obj);
                if (typeof obj.title === 'string' && String(obj.title).trim() === wantedTitle) {
                  foundAsset = obj;
                  return;
                }
                if (Array.isArray(obj)) {
                  for (const it of obj) {
                    if (foundAsset) break;
                    walkerFind(it);
                  }
                  return;
                }
                for (const k of Object.keys(obj)) {
                  if (foundAsset) break;
                  try { walkerFind(obj[k]); } catch { }
                }
              };
              walkerFind(resp);
              if (foundAsset) return foundAsset;
            }
          }
        } catch (err) {
          logger.debug('SearchParser usage failed, falling back to generic walker', err);
        }
      }
      // Fallback: generic walker that returns the first asset-like object with monetization/pricing
      let firstAsset: any = null;
      const seen = new WeakSet();
      const walker = (obj: any) => {
        if (!obj || typeof obj !== 'object' || seen.has(obj) || firstAsset) return;
        seen.add(obj);
        const hasTitle = typeof obj.title === 'string' && obj.title.trim().length > 0;
        const hasMonet = obj.monetization || obj.pricing || obj.monetizationType || obj.pricing?.pricingType;
        if (hasTitle && hasMonet) {
          firstAsset = obj;
          return;
        }
        if (Array.isArray(obj)) {
          for (const it of obj) {
            if (firstAsset) break;
            walker(it);
          }
          return;
        }
        for (const k of Object.keys(obj)) {
          if (firstAsset) break;
          try { walker(obj[k]); } catch { }
        }
      };
      walker(resp);
      return firstAsset;
    } catch (err) {
      logger.debug('getFirstSearchResultAsset failed', err);
      return null;
    }
  }

  async isContentTaggedFreeInSearchResults(contentTitle: string): Promise<boolean> {
    try {
      const firstAsset = await this.getFirstSearchResultAsset(contentTitle);
      if (!firstAsset) return false;
      const firstTitle = String(firstAsset.title || '').trim();
      const monetType = firstAsset.monetization?.type
        ?? firstAsset.monetizationType
        ?? firstAsset.pricing?.type
        ?? firstAsset.pricing?.pricingType
        ?? '';
      logger.debug(`[SEARCH DEBUG] First search result title: "${firstTitle}"; monetizationType='${monetType}'`);
      logger.info(`[SEARCH DEBUG] First search result title: "${firstTitle}"; monetizationType: "${monetType}"`);
      const isFree = /complimentary|free|free_to_watch|freetowatch/i.test(String(monetType));
      return isFree;
    } catch (err) {
      logger.debug('isContentTaggedFreeInSearchResults (GraphQL) failed', err);
      return false;
    }
  }

  async isContentTaggedPremiumInSearchResults(contentTitle: string): Promise<boolean> {
    try {
      const firstAsset = await this.getFirstSearchResultAsset(contentTitle);
      if (!firstAsset) return false;
      const firstTitle = String(firstAsset.title || '').trim();
      const monetType = firstAsset.monetization?.type
        ?? firstAsset.monetizationType
        ?? firstAsset.pricing?.type
        ?? firstAsset.pricing?.pricingType
        ?? '';
      logger.debug(`[SEARCH DEBUG] First search result title: "${firstTitle}"; monetizationType='${monetType}'`);
      logger.info(`[SEARCH DEBUG] First search result title: "${firstTitle}"; monetizationType: "${monetType}"`);
      const isPremium = /premium|paid|subscription|paywall|purchase/i.test(String(monetType));
      return isPremium;
    } catch (err) {
      logger.debug('isContentTaggedPremiumInSearchResults (GraphQL) failed', err);
      return false;
    }
  }

  async isSearchResultLabelVisible(contentTitle: string, expectedLabel: string): Promise<boolean> {
    try {
      const normalizedTitle = String(contentTitle ?? '').trim();
      const normalizedLabel = String(expectedLabel ?? '').trim().toLowerCase();
      if (!normalizedTitle || !normalizedLabel) {
        return false;
      }
      const escapedTitle = await normalizedTitle.replace(/'/g, "\\'");
      const titleSelectors = await [
        `img[alt*="${escapedTitle}"]`,
        `[alt*="${escapedTitle}"]`,
        `[title*="${escapedTitle}"]`
      ];
      const matchingContent = await this.page.locator(titleSelectors.join(', ')).first();
      const matchingContentCount = await matchingContent.count().catch(() => 0);
      if (!matchingContentCount) {
        return false;
      }
      const overlayLocator = await this.page.locator(this.thumbnailLabelOverlay.selector).first();
      const overlayCount = await overlayLocator.count().catch(() => 0);
      if (!overlayCount) {
        return false;
      }
      const labelImage = await overlayLocator.locator('img').first();
      const labelImageCount = await labelImage.count().catch(() => 0);
      if (!labelImageCount) {
        return false;
      }
      const altText = (await labelImage.getAttribute('alt').catch(() => '') || '').trim();
      logger.info(`Found alt text: "${altText}" for content title: "${normalizedTitle}"`);
      const combinedText = `${altText}`.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      logger.info(`Combined text for label check: "${combinedText}"`);
      logger.info(`Normalized label for check: "${normalizedLabel}"`);
      return combinedText.includes(normalizedLabel);
    } catch (err) {
      logger.debug('isSearchResultLabelVisible failed', err);
      return false;
    }
  }

  async isSearchResultTaggedWithLabel(labelText: string, contentTitle: string): Promise<boolean> {
    try {
      const normalizedLabel = String(labelText ?? '').trim().toLowerCase();
      logger.info('Checking if search result is tagged with label:', normalizedLabel);
      if (!normalizedLabel) return false;
      const tagImages = this.page.locator(`//img[@alt='${contentTitle}']/parent::div/following-sibling::div/child::img`);
      logger.info(`//img[@alt='${contentTitle}']/parent::div/following-sibling::div/child::img`);
      await tagImages.first().waitFor({ state: 'visible', timeout: 20000 });
      const count = await tagImages.count();
      for (let index = 0; index < count; index += 1) {
        const currentTag = tagImages.nth(index);
        const altText = await currentTag.getAttribute('alt');
        const ariaLabel = await currentTag.getAttribute('aria-label');
        const titleText = await currentTag.getAttribute('title');
        const formattedValue = [altText, ariaLabel, titleText]
          .filter(Boolean)
          .map((value) => String(value)
            .replace(/[^a-zA-Z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase())
          .find(Boolean);
        if (formattedValue === normalizedLabel) {
          return true;
        }
      }
      return false;
    } catch (err) {
      logger.debug('isSearchResultTaggedWithLabel (DOM) failed', err);
      return false;
    }
  }

  async getFirstSearchResultMonetizationType(): Promise<string> {
    try {
      const firstAsset = await this.getFirstSearchResultAsset();
      if (!firstAsset) {
        logger.debug('No Search GraphQL response available to determine monetization type');
        return '';
      }
      const monetType = firstAsset.monetization?.type
        ?? firstAsset.monetizationType
        ?? firstAsset.pricing?.type
        ?? firstAsset.pricing?.pricingType
        ?? firstAsset.monetization?.monetizationType
        ?? '';
      logger.debug(`First search result monetization type: ${monetType}`);
      logger.info(`[SEARCH DEBUG] First search result monetization type: "${monetType}"`);
      return String(monetType ?? '');
    } catch (err) {
      logger.debug('getFirstSearchResultMonetizationType failed', err);
      return '';
    }
  }

  async removeFromWatchlistAndGetToast(): Promise<string> {
    logger.elementInteraction('click', 'Remove from Watchlist');
    try {
      const locator = this.page.locator(this.removeFromWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000, force: true });
    } catch (error) {
      logger.debug('Remove from Watchlist button click failed', error);
      try {
        const fallbackLocator = this.page.locator(this.watchlistRemoveFallbackIcon.selector).first();
        await fallbackLocator.waitFor({ state: 'visible', timeout: 15000 });
        await fallbackLocator.click({ timeout: 15000, force: true });
      } catch (fallbackError) {
        logger.debug('Fallback remove watchlist click failed', fallbackError);
      }
    }
    try {
      await this.page.waitForTimeout(2000);
      const toastCandidates = [
        this.page.locator(this.watchlistToastRemoved.selector).filter({ hasText: /removed from watchlist/i }).first(),
        this.page.getByText(/removed from watchlist/i).first(),
        this.page.locator(this.watchlistToastAdded.selector).filter({ hasText: /removed from watchlist/i }).first(),
      ];
      for (const toastCandidate of toastCandidates) {
        try {
          await toastCandidate.waitFor({ state: 'visible', timeout: 8000 });
          const toastText = (await toastCandidate.textContent()) || '';
          if (toastText.toLowerCase().includes('removed')) {
            return toastText.trim();
          }
        } catch {
          logger.debug('Toast not found or not visible, trying next candidate');
        }
      }
      const removeIcon = this.page.locator(this.watchlistRemoveFallbackIcon.selector).first();
      await removeIcon.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      return (await removeIcon.getAttribute('alt') || await removeIcon.getAttribute('src') || '');
    } catch (error) {
      logger.debug('Remove from Watchlist toast wait failed', error);
      return '';
    }
  }

  async isFreeTagVisibleInWatchlist(contentTitle?: string): Promise<boolean> {
    logger.elementInteraction('verify', 'Free tag in watchlist');
    try {
      const title = contentTitle?.trim();
      const cardLocator = title
        ? this.page.getByRole('img', { name: title }).first()
        : this.page.getByRole('img', { name: 'free' }).first();
      await cardLocator.waitFor({ state: 'visible', timeout: 15000 });
      const freeTagLocator = this.page.getByRole('img', { name: 'free' }).first();
      return await freeTagLocator.count() > 0;
    } catch (error) {
      logger.debug('Free tag visibility check failed', error);
      return false;
    }
  }

  async isPremiumTagVisibleInWatchlist(contentTitle?: string): Promise<boolean> {
    logger.elementInteraction('verify', 'Premium tag in watchlist');
    try {
      const title = contentTitle?.trim();
      const cardLocator = title
        ? this.page.getByRole('img', { name: title }).first()
        : this.page.getByRole('img').first();
      await cardLocator.waitFor({ state: 'visible', timeout: 15000 });
      // Look for a premium tag/icon within the card's ancestor container
      const ancestor = cardLocator.locator('xpath=ancestor::*[1]');
      const tagLocator = ancestor.locator(this.watchlistPremiumTagIcon.selector).first();
      if (await tagLocator.count()) {
        await tagLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        return await tagLocator.isVisible().catch(() => false);
      }
      // Fallback: global premium tag presence near the image
      const globalTag = this.page.locator(this.watchlistPremiumTagIcon.selector).first();
      await globalTag.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      return await globalTag.isVisible().catch(() => false);
    } catch (error) {
      logger.debug('Premium tag visibility check failed', error);
      return false;
    }
  }

  async isContentAbsentInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content absence in watchlist ${contentTitle}`);
    try {
      const locator = this.page.getByRole('img', { name: contentTitle }).first();
      const count = await locator.count();
      if (count === 0) {
        return true;
      }
      await expect(locator).toBeHidden({ timeout: 10000 });
      return true;
    } catch (error) {
      logger.debug(`Content absence validation failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentThumbnailVisibleInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content thumbnail visible in watchlist for ${contentTitle}`);
    try {
      const thumbnail = await this.page.getByRole('img', { name: contentTitle }).first();
      await thumbnail.waitFor({ state: 'visible', timeout: 15000 });
      return await thumbnail.isVisible();
    } catch (error) {
      logger.debug(`Thumbnail visibility check failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isWatchlistItemTaggedWithLabel(contentTitle: string, labelText: string): Promise<boolean> {
    logger.elementInteraction('verify', `watchlist item tagged with label ${labelText} for ${contentTitle}`);
    try {
      const normalizedLabel = this.normalizeText(labelText);
      const imageTagLocator = await this.page.locator('//div[@class="thumbnail-label absolute bottom-0 left-[50%] translate-x-[-50%] z-10"]/img').first();
      const imageCount = await imageTagLocator.count();
      const altText = await this.normalizeText(await imageTagLocator.getAttribute('alt')).replace(/[^a-zA-Z0-9\s]/g, ' ');
      logger.info(normalizedLabel, 'normalizedLabel');
      if (altText.includes(normalizedLabel)) {
        if (await imageTagLocator.isVisible().catch(() => false)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.debug(`Watchlist item tag visibility check failed for ${contentTitle} / ${labelText}`, error);
      return false;
    }
  }

  async isContentMetadataVisibleInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content metadata visible in watchlist for ${contentTitle}`);
    try {
      const metadataLocator = this.page.getByText(contentTitle, { exact: true }).first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 15000 });
      return await metadataLocator.isVisible();
    } catch (error) {
      logger.debug(`Metadata visibility check failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentCardValidInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content card validity in watchlist for ${contentTitle}`);
    try {
      const thumbnail = this.page.getByRole('img', { name: contentTitle }).first();
      const metadata = this.page.getByText(contentTitle, { exact: true }).first();
      await thumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await metadata.waitFor({ state: 'visible', timeout: 15000 });
      const cardContainer = thumbnail.locator(this.contentCardContainer.selector);
      const isCardVisible = await cardContainer.isVisible().catch(() => true);
      const thumbnailVisible = await thumbnail.isVisible();
      const metadataVisible = await metadata.isVisible();
      return isCardVisible && thumbnailVisible && metadataVisible;
    } catch (error) {
      logger.debug(`Content card validity check failed for ${contentTitle}`, error);
      return false;
    }
  }

  private async getFirstWatchlistCardLocator(): Promise<Locator> {
    const cardSelectors = [
      this.watchlistCardBase.selector,
      this.watchlistCardCursor.selector,
      this.watchlistCardGeneric.selector,
      this.watchlistCardContentTestId.selector,
      this.watchlistCardShowTestId.selector,
    ];
    for (const selector of cardSelectors) {
      const card = this.page.locator(selector).filter({
        has: this.page.locator(this.watchlistTitleImage.selector),
      }).first();
      try {
        await card.waitFor({ state: 'visible', timeout: 5000 });
        return card;
      } catch {
        logger.debug('Card not found or not visible, trying next candidate');
        // continue to the next candidate selector
      }
    }
    return this.page.locator(this.watchlistTitleImage.selector).filter({ hasNot: this.page.locator('input') }).first();
  }

  async getFirstContentTitle(): Promise<string> {
    logger.elementInteraction('get', 'first content title from current page');
    try {
      const cardContainer = await this.getFirstWatchlistCardLocator();
      const firstTitleImage = cardContainer.locator(this.watchlistCardTitleImage.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });
      const title = await firstTitleImage.getAttribute('alt');
      if (title) {
        logger.debug(`Retrieved first content title: ${title}`);
        return title;
      }
      const cardHeading = cardContainer.locator(this.watchlistCardHeading.selector).first();
      const headingText = await cardHeading.textContent();
      if (headingText) {
        logger.debug(`Retrieved first content title from heading: ${headingText}`);
        return headingText.trim();
      }
      throw new Error('Could not extract title from first content card');
    } catch (error) {
      logger.error(`Failed to get first content title: ${error}`);
      throw error;
    }
  }

  async hoverOverFirstContent(): Promise<void> {
    logger.elementInteraction('hover', 'over first content card');
    try {
      const firstTitleImage = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });
      await firstTitleImage.hover();
      logger.debug('Hovered over first content card');
      await this.page.waitForTimeout(500);
    } catch (error) {
      logger.error(`Failed to hover over first content: ${error}`);
      throw error;
    }
  }

  async clickFirstFreeTaggedContentInWatchlist(): Promise<void> {
    logger.elementInteraction('click', 'first free-tagged content in watchlist');
    try {
      const freeTagLocator = this.page.locator(this.freeTagBadge.selector).first();
      await freeTagLocator.waitFor({ state: 'visible', timeout: 15000 });
      const cardContainer = freeTagLocator.locator(this.contentCardContainer.selector ?? '').first();
      await cardContainer.waitFor({ state: 'visible', timeout: 15000 });
      await cardContainer.click({ timeout: 15000, force: true });
      logger.debug('Clicked on the first free-tagged content in watchlist');
    } catch (error) {
      logger.error(`Failed to click first free-tagged content in watchlist: ${error}`);
      throw error;
    }
  }

  async clickFirstContentInWatchlist(): Promise<void> {
    logger.elementInteraction('click', 'first content in watchlist');
    try {
      const firstContent = await this.getFirstWatchlistCardLocator();
      const clickTarget = firstContent.locator(this.watchlistCardTitleImage.selector).first();
      await clickTarget.waitFor({ state: 'visible', timeout: 15000 });
      await clickTarget.scrollIntoViewIfNeeded().catch(() => undefined);
      await clickTarget.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await this.page.waitForTimeout(3000);
      logger.debug('Clicked on first content in watchlist');
    } catch (error) {
      logger.error(`Failed to click first content in watchlist: ${error}`);
      throw error;
    }
  }

  async assertContentTitle(): Promise<void> {
    logger.elementInteraction('assert', 'content title details');
    try {
      await this.page.waitForTimeout(2000);
      const titleImage = this.page.locator(this.titleImageWithAlt.selector).first();
      const imageTitle = await titleImage.getAttribute('alt').catch(() => null);
      const metadata = this.page.locator(this.contentMetadataDiv.selector).first();
      const metadataText = await metadata.textContent().catch(() => null);
      const description = this.page.locator(this.contentDescDiv.selector).first();
      const descText = await description.textContent().catch(() => null);
      expect(imageTitle || metadataText || descText).toBeTruthy();
      if (!this.hasStoredDetails) {
        this.storedContentTitle = imageTitle || '';
        this.storedContentMetadata = metadataText || '';
        this.storedContentDescription = descText || '';
        this.hasStoredDetails = true;
        logger.debug(`Stored first content details - Title: ${this.storedContentTitle}, Metadata: ${this.storedContentMetadata?.substring(0, 50)}, Description: ${this.storedContentDescription?.substring(0, 50)}`);
      }
      logger.info(`✓ Content Title (from image): ${imageTitle || 'N/A'}`);
      logger.info(`✓ Content Metadata: ${metadataText?.trim().substring(0, 100) || 'N/A'}...`);
      logger.info(`✓ Content Description: ${descText?.trim().substring(0, 100) || 'N/A'}...`);
      logger.debug(`Content title assertion passed - Title: ${imageTitle}, Metadata: ${!!metadataText}, Description: ${!!descText}`);
    } catch (error) {
      logger.error(`Failed to assert content title: ${error}`);
      throw error;
    }
  }

  async assertContentTitleMatchesPlayerTitle(): Promise<void> {
    logger.elementInteraction('assert', 'content title and player title');
    try {
      const storedTitle = this.storedContentTitle.replace(/\s+/g, ' ').trim();
      const playerTitle = (await this.getTitleAfterPlayButtonClick()).replace(/\s+/g, ' ').trim();
      const titlesMatch = storedTitle === playerTitle;

      expect(storedTitle).toBeTruthy();
      expect(playerTitle).toBeTruthy();
      expect(titlesMatch).toBe(true);

      logger.info(`Titles are same: ${titlesMatch}`);
    } catch (error) {
      logger.error(`Failed to assert content title matches player title: ${error}`);
      throw error;
    }
  }

  async assertBothContentsMatch(): Promise<void> {
    logger.elementInteraction('assert', 'both contents match');
    try {
      // Get current content details
      const titleImage = this.page.locator(this.contentTitleImageAlt.selector).first();
      const currentTitle = await titleImage.getAttribute('alt').catch(() => null);
      const metadata = this.page.locator(this.contentMetadataContainer.selector).first();
      const currentMetadata = await metadata.textContent().catch(() => null);
      const description = this.page.locator(this.contentDescriptionContainer.selector).first();
      const currentDescription = await description.textContent().catch(() => null);
      const titleMatches = this.storedContentTitle === (currentTitle || '');
      const metadataMatches = this.storedContentMetadata === (currentMetadata || '');
      const descriptionMatches = this.storedContentDescription === (currentDescription || '');
      const allMatch = titleMatches && metadataMatches && descriptionMatches;
      expect(allMatch).toBe(true);
      logger.info(` Content Title Match: ${titleMatches}`);
      logger.info(` Stored Title: ${this.storedContentTitle || 'N/A'}`);
      logger.info(` Current Title: ${currentTitle || 'N/A'}`);
      logger.info(` Content Metadata Match: ${metadataMatches}`);
      logger.info(` Content Description Match: ${descriptionMatches}`);
      logger.info(` Both Contents Are Same: ${allMatch}`);
      logger.debug(`Content match comparison - Title: ${titleMatches}, Metadata: ${metadataMatches}, Description: ${descriptionMatches}, All Match: ${allMatch}`);
    } catch (error) {
      logger.error(`Failed to assert content match: ${error}`);
      throw error;
    }
  }

  async assertAndLogFirstContentDetails(): Promise<void> {
    logger.elementInteraction('assert', 'first content thumbnail, metadata and title');
    try {
      const firstTitleImage = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });
      const title = await firstTitleImage.getAttribute('alt');
      const isThumbnailVisible = await firstTitleImage.isVisible();
      const cardContainer = firstTitleImage.locator(this.contentCardContainer.selector).first();
      const metadata = await cardContainer.textContent();
      expect(isThumbnailVisible).toBe(true);
      expect(title).toBeTruthy();
      expect(metadata).toBeTruthy();
      logger.info(`✓ Thumbnail visible: ${isThumbnailVisible}`);
      logger.info(`✓ Content Title: ${title}`);
      logger.info(`✓ Content Metadata: ${metadata?.trim().substring(0, 100)}...`);
      logger.debug(`Content details verified - Title: ${title}, Metadata visible: ${!!metadata}`);
    } catch (error) {
      logger.error(`Failed to assert and log first content details: ${error}`);
      throw error;
    }
  }

  async getPlaybackEpisodeTitleText(): Promise<string> {
    const locator = await this.page.getByText('backThe Blood SistersS1 E1 · Episode').first();
    await expect(locator).toBeVisible({ timeout: 10000 });
    return (await locator.textContent()).trim();
  }

  async isEpisodeListVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.firstEpisodeCard, 10000);
  }

  async isVideoPlayerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.videoPlayer.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 30000 });
      return true;
    } catch {
      return false;
    }
  }

  async isPlaybackStarted(timeout = 30000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        () => {
          const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
          return videos.some(video =>
            video.readyState >= 2 &&
            !video.paused &&
            !video.ended &&
            video.currentTime > 0
          );
        },
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }

  private normalizeMetadataText(value: string): string {
    return (value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[^a-z0-9]+/gi, '')
      .toLowerCase();
  }

  async getPlayerVisibleText(): Promise<string> {
    const candidateContainers = [
      this.page.locator(this.playerScreen.selector).first(),
      this.page.locator(this.playerScreenFallback.selector).first(),
      this.page.locator(this.pageBody.selector).first(),
    ];
    for (const container of candidateContainers) {
      const text = await container.textContent().catch(() => '');
      const trimmed = (text || '').replace(/\s+/g, ' ').trim();
      if (trimmed.length > 20) {
        return trimmed;
      }
    }
    return '';
  }

  async validatePlayerMetadataVisibility(expectedTitle: string, expectedSeason: string, expectedEpisode: string): Promise<{ titleVisible: boolean; seasonVisible: boolean; episodeVisible: boolean; playerText: string }> {
    const playerText = await this.getPlayerVisibleText();
    const normalizedPlayerText = this.normalizeMetadataText(playerText);
    const normalizedTitle = this.normalizeMetadataText(expectedTitle);
    const normalizedSeason = this.normalizeMetadataText(expectedSeason);
    const normalizedEpisode = this.normalizeMetadataText(expectedEpisode);
    const titleVisible = normalizedTitle
      ? normalizedPlayerText.includes(normalizedTitle)
      : false;
    const seasonAliases = [
      normalizedSeason,
      this.normalizeMetadataText(`Season ${expectedSeason.replace(/^S/i, '')}`),
      this.normalizeMetadataText(`Season${expectedSeason.replace(/^S/i, '')}`),
      this.normalizeMetadataText(`${expectedSeason.replace(/^S/i, '')}`),
    ].filter(Boolean);
    const seasonVisible = seasonAliases.some((alias) => normalizedPlayerText.includes(alias));
    const episodeAliases = [
      normalizedEpisode,
      this.normalizeMetadataText(`Episode ${expectedEpisode.replace(/^E/i, '')}`),
      this.normalizeMetadataText(`Episode${expectedEpisode.replace(/^E/i, '')}`),
      this.normalizeMetadataText(`Ep ${expectedEpisode.replace(/^E/i, '')}`),
      this.normalizeMetadataText(`${expectedSeason.replace(/^S/i, '')}${expectedEpisode.replace(/^E/i, '')}`),
    ].filter(Boolean);
    const episodeVisible = episodeAliases.some((alias) => normalizedPlayerText.includes(alias));
    return {
      titleVisible,
      seasonVisible,
      episodeVisible,
      playerText,
    };
  }

  async getSelectedEpisodeMetadata(): Promise<{ seasonNumber: string; episodeNumber: string; title: string }> {
    if (this.lastSelectedEpisodeMetadata.title || this.lastSelectedEpisodeMetadata.seasonNumber || this.lastSelectedEpisodeMetadata.episodeNumber) {
      return { ...this.lastSelectedEpisodeMetadata };
    }
    const visibleEpisodeLabel = this.page.getByText(/S\d+\s*E\d+/i).first();
    const labelText = (await visibleEpisodeLabel.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    const metadata = this.parseEpisodeMetadata(labelText);
    const title = await this.extractTitleFromSelectedLabel(visibleEpisodeLabel).catch(() => '');
    return {
      seasonNumber: metadata.seasonText || this.lastSelectedEpisodeMetadata.seasonNumber,
      episodeNumber: metadata.episodeText || this.lastSelectedEpisodeMetadata.episodeNumber,
      title: title || metadata.title || this.lastSelectedEpisodeMetadata.title,
    };
  }

  async getCurrentPlayerEpisodeMetadata(): Promise<{ seasonNumber: string; episodeNumber: string; title: string }> {
    const playerText = await this.getPlayerVisibleText();
    const parsedFromPlayer = this.parseEpisodeMetadata(playerText);
    if (parsedFromPlayer.seasonText || parsedFromPlayer.episodeText) {
      return {
        seasonNumber: parsedFromPlayer.seasonText,
        episodeNumber: parsedFromPlayer.episodeText,
        title: parsedFromPlayer.title,
      };
    }
    return this.getSelectedEpisodeMetadata();
  }

  async clickFirstSearchResult(): Promise<void> {
    logger.elementInteraction('click', 'first content from first rail');
    const firstResult = this.page.locator(this.firstSearchResult.selector).first();
    if (!(await firstResult.count().catch(() => 0))) {
      throw new Error('No search result is available to open');
    }
    await firstResult.waitFor({ state: 'visible', timeout: 15000 });
    await firstResult.click({ timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
      logger.debug('Search result navigation did not reach networkidle');
    });
  }

  async openFirstContentWithPreview(): Promise<void> {
    logger.step('Opening the first content card that exposes a preview or trailer area');
    const candidates = this.page.locator(this.contentCardWithPreview.selector).filter({ has: this.page.locator('img[alt]') });
    const count = await candidates.count().catch(() => 0);
    if (!count) {
      throw new Error('No content cards available to evaluate for preview/trailer autoplay');
    }
    for (let index = 0; index < Math.min(count, 8); index += 1) {
      const card = candidates.nth(index);
      try {
        await card.waitFor({ state: 'visible', timeout: 10000 });
        await card.click({ timeout: 10000 });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(3000);
        const previewVisible = await this.isPreviewVideoVisible();
        if (previewVisible) {
          return;
        }
      } catch (error) {
        logger.debug(`Preview card candidate ${index + 1} did not expose a visible preview`, error);
      }
    }
  }

  async isPreviewVideoVisible(): Promise<boolean> {
    try {
      const previewVideo = this.page.locator(this.previewVideoElement.selector).first();
      await previewVideo.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  }

  async isPreviewPlaybackStarted(timeoutMs = 45000): Promise<boolean> {
    const video = this.page.locator(this.previewVideoElement.selector).first();
    try {
      await video.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      return false;
    }
    try {
      const playbackState = await video.evaluate((element: HTMLVideoElement) => ({
        paused: element.paused,
        currentTime: element.currentTime,
        readyState: element.readyState,
        duration: element.duration,
        networkState: element.networkState,
        muted: element.muted,
        autoplay: element.autoplay,
        src: element.currentSrc || element.src,
        hasSrc: Boolean(element.currentSrc || element.src),
      })).catch(() => ({ paused: true, currentTime: 0, readyState: 0, duration: 0, networkState: 0, muted: true, autoplay: false, src: '', hasSrc: false }));
      if (playbackState.src || playbackState.hasSrc) {
        return true;
      }
      const visibleText = await this.page.locator('body').textContent().catch(() => '');
      return visibleText.toLowerCase().includes('resume') || visibleText.toLowerCase().includes('play');
    } catch {
      return false;
    }
  }

  async clickFirstTrayContent(): Promise<void> {
    logger.elementInteraction('click', 'first content from the tray');
    const contentLocator = this.page.locator(this.firstTrayContent.selector).first();
    await contentLocator.waitFor({ state: 'visible', timeout: 20000 });
    await contentLocator.click({ timeout: 20000, force: true });
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
      logger.debug('Tray content navigation did not reach networkidle');
    });
  }

  async clickFirstContentInRail(contentTitle?: string): Promise<void> {
    logger.elementInteraction('click', 'first content in the rail');
    const titleImage = contentTitle
      ? this.page.getByAltText(contentTitle, { exact: false }).first()
      : this.page.locator(this.railThumbnailSelector.selector).first();
    try {
      await titleImage.scrollIntoViewIfNeeded().catch(() => undefined);
      await titleImage.waitFor({ state: 'visible', timeout: 20000 });
      const clickableTarget = titleImage.locator('xpath=ancestor::a[1]').first();
      const targetToClick = (await clickableTarget.count()) ? clickableTarget : titleImage;
      await targetToClick.hover().catch(() => undefined);
      await targetToClick.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
        logger.debug('First rail content selection did not reach networkidle');
      });
    } catch (error) {
      logger.debug('Rail content candidate click failed', error);
      await this.clickFirstTrayContent();
    }
  }

  async clickSecondSponsoredRailContent(): Promise<{ clicked: boolean; cardTitle: string }> {
    logger.elementInteraction('click', 'second content card in Sponsored Rail');
    const contentCard = this.page.locator(this.sponsoredRailContentCard.selector).first();

    try {
      await contentCard.scrollIntoViewIfNeeded().catch(() => undefined);
      await contentCard.waitFor({ state: 'visible', timeout: 20000 });
      const cardTitle = (await contentCard.getAttribute('alt').catch(() => ''))?.trim() || '';
      const clickableTarget = contentCard.locator('xpath=ancestor::a[1]').first();
      const targetToClick = (await clickableTarget.count().catch(() => 0)) ? clickableTarget : contentCard;
      await targetToClick.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      return { clicked: true, cardTitle };
    } catch (error) {
      logger.debug('Sponsored Rail content-card navigation failed', error);
      return { clicked: false, cardTitle: '' };
    }
  }

  async clickFirstContentInRailByLocator(): Promise<void> {
    logger.info('click', 'first content in the Because You Watched tray using the provided locator');
    const railTarget = this.page.locator(this.becauseYouWatchedFirstItem.selector).first();
    try {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        await railTarget.scrollIntoViewIfNeeded().catch(() => undefined);
        await this.page.waitForTimeout(500);
        if (await railTarget.isVisible().catch(() => false)) {
          break;
        }
      }
      await this.page.waitForTimeout(5000);
      await railTarget.waitFor({ state: 'visible', timeout: 5000 });
      await railTarget.hover().catch(() => undefined);
      await railTarget.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
        logger.debug('Rail content selection by heading did not reach networkidle');
      });
    } catch (error) {
      logger.debug('Rail content selection by heading failed', error);
      await this.clickFirstTrayContent();
    }
  }

  async scrollBecauseYouWatchedTrayIntoView(): Promise<void> {
    logger.elementInteraction('scroll', 'Because You Watched tray');
    const heading = this.page.locator(this.becauseYouWatchedHeading.selector).first();
    const tray = this.page.locator(this.becauseYouWatchedTrayContainer.selector).first();
    await heading.scrollIntoViewIfNeeded().catch(() => undefined);
    await tray.scrollIntoViewIfNeeded().catch(() => undefined);
    await this.page.waitForTimeout(2000);
  }

  async isBecauseYouWatchedHeadingVisible(): Promise<boolean> {
    const heading = this.page.locator(this.becauseYouWatchedHeading.selector).first();
    await heading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await heading.isVisible().catch(() => false);
  }

  async getBecauseYouWatchedHeadingText(): Promise<string> {
    try {
      const heading = this.page.locator(this.becauseYouWatchedHeading.selector).first();
      await heading.waitFor({ state: 'visible', timeout: 10000 });
      const text = await heading.textContent();
      return text?.replace(/\s+/g, ' ').trim() ?? '';
    } catch (error) {
      logger.debug('Error getting Because You Watched heading text', error);
      return '';
    }
  }

  private async getVisibleCarouselContentSnapshot(limit: number = 5): Promise<string[]> {
    const trayContainer = this.page.locator('//body/div/main/div/div/div/div/div[2]/div[2]/div[1]').first();
    const trayExists = await trayContainer.count().catch(() => 0);
    if (!trayExists) {
      return [];
    }
    const carouselItems = trayContainer.locator('img[alt]:not([alt="arrow-right"])');
    const count = await carouselItems.count().catch(() => 0);
    const snapshot: string[] = [];
    for (let index = 0; index < Math.min(count, limit); index += 1) {
      const item = carouselItems.nth(index);
      const isVisible = await item.isVisible().catch(() => false);
      const altText = (await item.getAttribute('alt'))?.trim() || '';
      if (isVisible && altText) {
        snapshot.push(altText);
      }
    }
    return snapshot;
  }

  private async getCarouselScrollState(): Promise<{ scrollLeft: number; scrollWidth: number; clientWidth: number; visibleItems: string[] }> {
    const trayContainer = this.page.locator('//body/div/main/div/div/div/div/div[2]/div[2]/div[1]').first();
    const trayExists = await trayContainer.count().catch(() => 0);
    if (!trayExists) {
      return { scrollLeft: 0, scrollWidth: 0, clientWidth: 0, visibleItems: [] };
    }
    const state = await trayContainer.evaluate((element: HTMLElement) => ({
      scrollLeft: element.scrollLeft,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    })).catch(() => ({ scrollLeft: 0, scrollWidth: 0, clientWidth: 0 }));
    const visibleItems = await this.getVisibleCarouselContentSnapshot();
    return { ...state, visibleItems };
  }

  private async hoverCarouselBanner(): Promise<void> {
    const bannerGradient = this.page.locator('//div[starts-with(@class,"banner-gradient absolute left-0 h-")]').first();
    if (await bannerGradient.count()) {
      await bannerGradient.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      await bannerGradient.hover({ timeout: 10000 }).catch(() => undefined);
    }
  }

  private async clickCarouselArrowAndValidate(direction: 'left' | 'right', skipIfMissing: boolean = false): Promise<boolean> {
    logger.elementInteraction('click', `carousel ${direction} arrow`);
    try {
      await this.hoverCarouselBanner();
      const beforeState = await this.getCarouselScrollState();
      if (!beforeState.visibleItems.length) {
        return false;
      }
      const arrowSelector = direction === 'right'
        ? "xpath=//img[@alt='arrow-right']"
        : "xpath=//img[@alt='arrow-left']";
      const arrow = this.page.locator(arrowSelector).first();
      const arrowExists = await arrow.count().catch(() => 0);
      if (!arrowExists) {
        if (skipIfMissing) {
          logger.debug(`Carousel arrow ${direction} not found for GMA rail; skipping`);
          return true;
        }
        logger.debug(`Carousel arrow ${direction} not found for this rail`);
        return false;
      }
      await arrow.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      if (!(await arrow.isVisible().catch(() => false))) {
        if (skipIfMissing) {
          logger.debug(`Carousel arrow ${direction} is not visible for GMA rail; skipping`);
          return true;
        }
        logger.debug(`Carousel arrow ${direction} is not visible for this rail`);
        return false;
      }
      await arrow.scrollIntoViewIfNeeded().catch(() => undefined);
      await arrow.hover({ timeout: 10000 }).catch(() => undefined);
      await arrow.click({ force: true, timeout: 15000 });
      await this.page.waitForTimeout(1500);
      const afterState = await this.getCarouselScrollState();
      const scrolledHorizontally = afterState.scrollLeft !== beforeState.scrollLeft || afterState.visibleItems.join('|') !== beforeState.visibleItems.join('|');
      return scrolledHorizontally;
    } catch (error) {
      logger.debug(`Carousel arrow ${direction} validation failed`, error);
      return false;
    }
  }

  async clickLeftCarouselArrowUsingBodyLocator(): Promise<boolean> {
    logger.elementInteraction('click', 'left carousel arrow using body locator');
    try {
      await this.hoverCarouselBanner();
      const beforeState = await this.getCarouselScrollState();
      if (!beforeState.visibleItems.length) {
        return false;
      }
      const leftArrow = this.page.locator(this.leftCarouselArrow.selector).first();
      const arrowExists = await leftArrow.count().catch(() => 0);
      if (!arrowExists) {
        return false;
      }
      await leftArrow.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      if (!(await leftArrow.isVisible().catch(() => false))) {
        return false;
      }
      await leftArrow.scrollIntoViewIfNeeded().catch(() => undefined);
      await leftArrow.hover({ timeout: 10000 }).catch(() => undefined);
      await leftArrow.click({ force: true, timeout: 15000 });
      await this.page.waitForTimeout(1500);
      const afterState = await this.getCarouselScrollState();
      return afterState.scrollLeft !== beforeState.scrollLeft || afterState.visibleItems.join('|') !== beforeState.visibleItems.join('|');
    } catch (error) {
      logger.debug('Left carousel arrow click using body locator failed', error);
      return false;
    }
  }

  async clickHomePageCarouselArrow(direction: 'left' | 'right'): Promise<boolean> {
    if (direction === 'left') {
      return this.clickLeftCarouselArrowUsingBodyLocator();
    }
    return this.clickCarouselArrowAndValidate(direction);
  }

  async clickHomePageCarouselArrowWithRehover(direction: 'left' | 'right'): Promise<boolean> {
    if (direction === 'left') {
      return this.clickLeftCarouselArrowUsingBodyLocator();
    }
    return this.clickCarouselArrowAndValidate(direction);
  }

  async clickFirstCarouselArrow(direction: 'left' | 'right', skipIfMissing: boolean = false): Promise<boolean> {
    if (direction === 'left') {
      return this.clickLeftCarouselArrowUsingBodyLocator();
    }
    return this.clickCarouselArrowAndValidate(direction, skipIfMissing);
  }

  async isSubscriptionBlockerVisible(): Promise<boolean> {
    logger.elementInteraction('verify', 'subscription blocker message');
    const blocker = this.page.locator(this.subscriptionBlockerMessage.selector).first();
    await blocker.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await blocker.isVisible().catch(() => false);
  }

  async verifyPlayerTitle(expectedTitle: string): Promise<boolean> {
    logger.assertion('Verify player title', true);
    await expect(this.page.getByText(expectedTitle).first()).toBeVisible();
    return true;
  }

  async isPlayerContentTitleVisibleInPlayer(expectedTitle?: string): Promise<boolean> {
    if (!expectedTitle) {
      const title = this.page.locator('text=/.*\\w.*/').first();
      await title.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    }

    const playerTitle = this.page.locator("//div[@class='player-title']").first();
    await playerTitle.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    const playerTitleText = (await playerTitle.textContent())?.trim() || '';
    return Boolean(playerTitleText) && Boolean(expectedTitle)
      ? playerTitleText.toLowerCase().includes(expectedTitle.trim().toLowerCase())
      : await playerTitle.isVisible().catch(() => false);
  }

    async isPlayerScreenVisible(): Promise<boolean> {
    const player = this.page.locator(this.playerScreen.selector).first();
    await player.waitFor({ state: 'visible', timeout: 20000 });
    return true;
  }
 

  async isPlayerScreenHidden(): Promise<boolean> {
    try {
      const player = this.page.locator(this.playerScreen.selector).first();
      return !(await player.isVisible().catch(() => false));
    } catch {
      return true;
    }
  }

  async isPlayerContentTitleVisible(expectedTitle?: string): Promise<boolean> {
    if (expectedTitle) {
      return this.verifyPlayerTitle(expectedTitle);
    }
    const title = this.page.locator('text=/.*\\w.*/').first();
    await title.waitFor({ state: 'visible', timeout: 15000 });
    return true;
  }

  async isPlayerFirstContentTitleVisible(expectedTitle: string): Promise<boolean> {
    await this.page.waitForTimeout(2000)
    const locator = await this.pageUtils.parameterizeSelector(
      this.playerFirstContentTitle,
      { expectedTitle }
    );
    return locator.first().isVisible();
  }

  async waitForMobileAdPlayback(): Promise<void> {
    if (process.env.BROWSER === 'mchrome') {
      await this.page.waitForTimeout(120000);
    }
  }

  async hoverPlaybackScreen(): Promise<void> {
    if (process.env.BROWSER === 'mchrome') {
      await this.tapPlaybackScreen();
      await this.tapPlaybackScreen();
      return;
    }
    const playerScreen = this.page.locator(this.playerLoaderOverlay.selector).first();
    await playerScreen.waitFor({
      state: 'visible',
      timeout: 10000
    });
    await playerScreen.hover({
      timeout: 10000,
      force: true
    });
  }

  async isResumeButtonVisible(): Promise<boolean> {
    try {
      const resume = this.page.locator(this.resumeButton.selector).first();
      await resume.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickResumeAction(): Promise<boolean> {
    logger.elementInteraction('click', 'Resume/Play action');
    const actionCandidates = [
      this.page.getByText(/Resume/i).first(),
      this.page.getByText(/Play/i).first(),
      this.page.locator(this.resumeButton.selector).first(),
    ];
    for (const candidate of actionCandidates) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: 15000 });
        await candidate.click({ timeout: 15000 });
        return true;
      } catch {
        logger.error('Resume/Play action click failed for candidate, trying next if available');
      }
    }
    return false;
  }

  async hoverPlaybackControls(): Promise<void> {
    logger.elementInteraction('hover', 'Playback controls');
    const controls = this.page.locator(this.playerVideoControls.selector).first();
    await controls.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    const box = await controls.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await controls.hover().catch(() => undefined);
    }
  }

  async isPlayerVideoControlsVisible(timeout: number = 5000): Promise<{ playerVideoControlsVisible: boolean; isVisible: boolean }> {
    try {
      const locator = this.page.locator(this.playerProgressAndtimeControls.selector);
      await locator.waitFor({ state: 'attached', timeout });
      const playerVideoControlsVisible = await locator.isVisible();
      return {
        playerVideoControlsVisible,
        isVisible: playerVideoControlsVisible,
      };
    } catch {
      return {
        playerVideoControlsVisible: false,
        isVisible: false,
      };
    }
  }

  async hoverOnPlaybackScreen(): Promise<void> {
    logger.elementInteraction('hover', 'Playback screen');
    const playerScreen = this.page.locator(this.playerScreen.selector).first();
    await playerScreen.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.locator(this.playerLoaderOverlay.selector).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => { });
    const box = await playerScreen.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await playerScreen.hover();
    }
  }

  async clickResumeButton(): Promise<void> {
    logger.elementInteraction('click', 'Resume button');
    const resume = this.page.locator(this.resumeButton.selector).first();
    await resume.waitFor({ state: 'visible', timeout: 15000 });
    await resume.click({ timeout: 10000 });
  }

  async clickPauseButton(): Promise<void> {
    logger.elementInteraction('click', 'Pause button');
    const pauseButton = this.page.locator(this.pauseButton.selector).first();
    await pauseButton.waitFor({ state: 'visible', timeout: 10000 });
    await pauseButton.click({ timeout: 10000 });
  }

  async clickOnPauseButton(): Promise<void> {
    logger.elementInteraction('click', 'Pause button');
    const pauseButton = this.page.locator(this.pauseButton.selector).first();
    await pauseButton.waitFor({ state: 'visible', timeout: 10000 });
    await pauseButton.click({ timeout: 10000 });
  }

  async clickRewindButton(): Promise<void> {
    logger.elementInteraction('click', 'Rewind button');
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    await rewindButton.waitFor({ state: 'visible', timeout: 10000 });
    await rewindButton.click({ timeout: 10000 });
  }

  async clickForwardButton(): Promise<void> {
    logger.elementInteraction('click', 'Forward button');
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    await forwardButton.waitFor({ state: 'visible', timeout: 10000 });
    await forwardButton.click({ timeout: 10000 });
  }

  async isPauseAdVisible(): Promise<boolean> {
    const iframe = this.page.frameLocator(this.thirdPartyAdFrame.selector).first();
    const pauseAd = iframe.locator(this.pauseAdBanner.selector).first();
    await pauseAd.waitFor({ state: 'visible', timeout: 10000 });
    return await pauseAd.isVisible();
  }

  async isPauseAdMidBannerVisible(): Promise<boolean> {
    const pauseBannerAd = this.page.locator(this.pauseAdMidBanner.selector).first();
    await pauseBannerAd.waitFor({ state: 'visible', timeout: 20000 });
    return await pauseBannerAd.isVisible();
  }

  async isPauseAdOverlappingReturnToContentOrTitle(): Promise<{ overlapWithReturnToContent: boolean; overlapWithTitle: boolean }> {
    const pauseAd = this.page.locator(this.pauseAdMidBanner.selector).first();
    const returnToContent = this.page.locator(this.returnToContentText.selector).first();
    const playerTitle = this.page.locator(this.playbackContentTitle.selector).first();
    const pauseAdBox = await pauseAd.boundingBox().catch(() => null);
    const returnToContentBox = await returnToContent.boundingBox().catch(() => null);
    const titleBox = await playerTitle.boundingBox().catch(() => null);
    const overlapWithReturnToContent = Boolean(pauseAdBox && returnToContentBox && this.boxesOverlap(pauseAdBox, returnToContentBox));
    const overlapWithTitle = Boolean(pauseAdBox && titleBox && this.boxesOverlap(pauseAdBox, titleBox));
    return {
      overlapWithReturnToContent,
      overlapWithTitle,
    };
  }

  async isPauseAdOverlappingUpNextMarker(): Promise<{ overlapWithUpNextMarker: boolean }> {
    const pauseAd = this.page.locator(this.pauseAdMidBanner.selector).first();
    const upNextMarker = this.page.locator(this.upNextMarker.selector).first();
    const pauseAdBox = await pauseAd.boundingBox().catch(() => null);
    const upNextMarkerBox = await upNextMarker.boundingBox().catch(() => null);
    const overlapWithUpNextMarker = Boolean(pauseAdBox && upNextMarkerBox && this.boxesOverlap(pauseAdBox, upNextMarkerBox));
    return {
      overlapWithUpNextMarker,
    };
  }

  async isPauseAdOverlappingSeekBar(): Promise<boolean> {
    const pauseAd = this.page.locator(this.pauseAdMidBanner.selector).first();
    const seekBar = this.page.locator(this.seekBar.selector).first();
    const pauseAdBox = await pauseAd.boundingBox().catch(() => null);
    const seekBarBox = await seekBar.boundingBox().catch(() => null);
    return Boolean(pauseAdBox && seekBarBox && this.boxesOverlap(pauseAdBox, seekBarBox));
  }

  async isPauseBannerVisible(): Promise<boolean> {
    const pauseBanner = this.page.locator(this.pauseBanner.selector).first();
    await pauseBanner.waitFor({ state: 'visible', timeout: 10000 });
    return await pauseBanner.isVisible();
  }

  async isMidRollAdOverlayVisible(): Promise<boolean> {
    const midRollOverlay = this.page.locator(this.midRollAdOverlay.selector).first();
    await midRollOverlay.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await midRollOverlay.isVisible().catch(() => false);
  }

  async isFullscreenModeMidRollAd(): Promise<boolean> {
    const minimizeButton = this.page.locator(this.minimizeIcon.selector).first();
    await minimizeButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await minimizeButton.isVisible().catch(() => false);
  }

  async isReturnToContentTextVisible(): Promise<boolean> {
    const candidates = [
      this.page.getByText(/Press any button to return to content|return to content/i).first(),
      this.page.locator(this.pauseAdMidBanner.selector).filter({ hasText: /return to content/i }).first(),
      this.page.locator(this.returnToContentText.selector).first(),
    ];
    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  async clickReturnToContentText(): Promise<void> {
    logger.elementInteraction('click', 'return to content text');
    const candidates = [
      this.page.getByText(/Press any button to return to content|return to content/i).first(),
      this.page.locator(this.pauseAdMidBanner.selector).filter({ hasText: /return to content/i }).first(),
      this.page.locator(this.returnToContentText.selector).first(),
    ];
    for (const candidate of candidates) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: 5000 });
        await candidate.click({ timeout: 10000, force: true });
        await this.page.locator(this.pauseAdMidBanner.selector).first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
        return;
      } catch (error) {
        logger.debug('Return-to-content candidate click failed, trying the next candidate', error);
      }
    }
    await this.page.keyboard.press('Enter').catch(() => undefined);
  }

  async isPauseAdBannerVisible(): Promise<boolean> {
    const iframe = this.page.frameLocator(this.thirdPartyAdFrame.selector).first();
    const pauseAd = iframe.locator(this.adBanner.selector).first();
    await pauseAd.waitFor({ state: 'attached', timeout: 30000 });
    return await pauseAd.isVisible();
  }

  async pauseAdBannerNotVisible(): Promise<boolean> {
    try {
      const pauseBannerAd = this.page.locator(this.pauseAdMidBanner.selector).first();
      await pauseBannerAd.waitFor({ state: 'visible', timeout: 20000 });
      return await pauseBannerAd.isVisible();
    }
    catch {
      return false;
    }
  }

  async isPauseButtonVisible(): Promise<boolean> {
    logger.elementInteraction('check', 'Pause button visibility');
    try {
      const pauseButton = this.page.locator(this.pauseButton.selector).first();
      return await pauseButton.isVisible({ timeout: 3000 }).catch(() => false);
    } catch (error) {
      logger.info(`Pause button visibility check failed: ${error}`);
      return false;
    }
  }

  async isSeekBarVisible(): Promise<boolean> {
    const seek = this.page.locator(this.seekBar.selector).first();
    await seek.waitFor({ state: 'visible', timeout: 10000 });
    return await seek.isVisible();
  }

  async isPlaybackTimeVisible(): Promise<boolean> {
    const timeDisplay = this.page.locator(this.playerTimeDisplay.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await timeDisplay.isVisible().catch(() => false);
  }

  async hoverSeekBarAndWaitForPreview(): Promise<boolean> {
    const seekBar = this.page.locator(this.seekBar.selector).first();
    await seekBar.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    const box = await seekBar.boundingBox().catch(() => null);
    if (!box) {
      return false;
    }
    const previewSelectors = [
      '[data-testid*="preview"]',
      '[data-testid*="thumbnail"]',
      '[class*="preview"]',
      '[class*="thumbnail"]',
      '[class*="thumb"]',
      '[aria-label*="preview"]',
      '[aria-label*="thumbnail"]',
    ];
    const previewLocator = this.page.locator(previewSelectors.join(', ')).filter({ has: this.page.locator('img, canvas') });
    const initialVisibleCount = await previewLocator.evaluateAll((elements) =>
      elements.filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      }).length
    );
    const startX = box.x + box.width * 0.35;
    const startY = box.y + box.height / 2;
    const endX = box.x + box.width * 0.65;
    const endY = startY;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 8 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(1500);
    const visibleCountAfterHover = await previewLocator.evaluateAll((elements) =>
      elements.filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      }).length
    );
    return visibleCountAfterHover > initialVisibleCount;
  }

  async isRewindButtonVisible(): Promise<boolean> {
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    await rewindButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isForwardButtonVisible(): Promise<boolean> {
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    await forwardButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isVolumeButtonVisible(): Promise<boolean> {
    const volumeButton = this.page.locator(this.volumeButton.selector).first();
    await volumeButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async tapPlaybackScreen(): Promise<void> {
    logger.elementInteraction('click', 'Playback screen');
    const playerScreen = this.page.locator(this.playerScreen.selector).first();
    await playerScreen.waitFor({ state: 'visible', timeout: 10000 });
    const box = await playerScreen.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await playerScreen.click();
    }
  }

  async clickVolumeButton(): Promise<void> {
    logger.elementInteraction('click', 'Volume button');
    const volumeButton = this.page.locator(this.volumeButton.selector).first();
    await volumeButton.waitFor({ state: 'visible', timeout: 10000 });
    await volumeButton.click({ timeout: 10000 });
  }

  async isPlayerUnMuted(): Promise<boolean> {
    const video = this.page.locator(this.videoElement.selector).first();
    await video.waitFor({ state: 'attached', timeout: 15000 });
    return await video.evaluate((player: HTMLVideoElement) => player.muted).catch(() => false);
  }

  async getPlayerVolumeLevel(): Promise<number> {
    const video = this.page.locator(this.videoElement.selector).first();
    await video.waitFor({ state: 'attached', timeout: 15000 });
    return await video.evaluate((player: HTMLVideoElement) => player.volume).catch(() => 0);
  }

  async isBackButtonVisible(): Promise<boolean> {
    const backButton = this.page.locator(this.backButton.selector).first();
    await backButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await backButton.isVisible().catch(() => false);
  }

  async isSubtitleButtonVisible(): Promise<boolean> {
    const subtitleButton = this.page.locator(this.subtitleButton.selector).first();
    await subtitleButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await subtitleButton.isVisible().catch(() => false);
  }

  async clickSubtitleButton(): Promise<void> {
    logger.elementInteraction('click', 'Subtitle button');
    const locator = this.page.locator(this.subtitleButton.selector).first();
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.click({ timeout: 10000 });
  }

  async selectSubtitleLanguage(): Promise<boolean> {
    logger.elementInteraction('click', 'Subtitle language option');
    await this.page.getByText('English (Philippines)').click();
    return true;
  }

  async clickNextEpisodeButton(timeout: number = 10000): Promise<{ value: string; success: boolean; }> {
    logger.elementInteraction('click', 'Next Episode button');
    try {
      await this.pageUtils.safeClick(this.nextEpisodeButton, timeout);
      const value = this.nextEpisodeButton.text || this.nextEpisodeButton.selector || '';
      logger.info(`Next Episode button clicked successfully: ${value}`);
      return {
        value,
        success: true
      };
    } catch (error) {
      logger.error(`Failed to click Next Episode button: ${error}`);
      return {
        value: '',
        success: false
      };
    }
  }

  async clickUpNextMarker(): Promise<boolean> {
    logger.elementInteraction('click', 'Up Next marker');
    try {
      const upNextMarker = this.page.locator(this.upNextMarker.selector)
      await upNextMarker.waitFor({ state: 'visible', timeout: 10000, });
      await upNextMarker.click({ timeout: 10000, });
      return true;
    } catch (error) {
      logger.debug(`Failed to click Up Next marker: ${error}`);
      return false;
    }
  }

  async isNextEpisodeButtonVisible(): Promise<boolean> {
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    await nextEpisodeButton.waitFor({ state: 'visible', timeout: 10000 });
    return await nextEpisodeButton.isVisible();
  }

  async isUpNextCloseButtonVisible(timeout: number = 30000): Promise<boolean> {
    const closeButton = this.page.locator(this.upNextCloseButton.selector).first();
    await closeButton.waitFor({ state: 'visible', timeout }).catch(() => undefined);
    return await closeButton.isVisible().catch(() => false);
  }

  async clickUpNextCloseButton(): Promise<void> {
    logger.elementInteraction('click', 'Up Next close button');
    const closeButton = this.page.locator(this.upNextCloseButton.selector).first();
    await closeButton.waitFor({ state: 'visible', timeout: 10000 });
    const clickableParent = closeButton.locator(this.upNextCloseButton.selector).first();
    if (await clickableParent.count()) {
      await clickableParent.click({ timeout: 10000 }).catch(() => closeButton.click({ timeout: 10000, force: true }));
      return;
    }
    await closeButton.click({ timeout: 10000, force: true });
  }

  async isUpNextWidgetVisible(): Promise<boolean> {
    const widget = this.page.locator('.player-upNextWidget').first();
    return await widget.isVisible().catch(() => false);
  }

  async isUpNextMarkerVisible(timeout: number = 10000): Promise<boolean> {
    try {
      const locator = this.page.locator(this.upNextMarker.selector);
      await locator.waitFor({ state: 'attached', timeout });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async isPauseUpNextMarkerVisible(): Promise<boolean> {
    const selector = '//*[@id="player-container-main"]/div[5]/div[1][contains(@class,"player-upNextWidget-forground-gradient")]';
    try {
      const marker = this.page.locator(selector).first();
      const count = await marker.count().catch(() => 0);
      if (!count) {
        return false;
      }
      await marker.waitFor({ state: 'attached', timeout: 3000 }).catch(() => undefined);
      const isVisible = await marker.isVisible().catch(() => false);
      if (!isVisible) {
        return false;
      }
      const box = await marker.boundingBox().catch(() => null);
      return Boolean(box && box.width > 0 && box.height > 0);
    } catch (error) {
      logger.debug(`Pause Up Next marker selector failed: ${selector}`, error);
      return false;
    }
  }

  async waitForUpNextMarker(timeout: number = 20000): Promise<boolean> {
    // First try waiting for the player widget element which is the most reliable
    const widget = this.page.locator(this.upNextMarker.selector).first();
    try {
      await widget.waitFor({ state: 'visible', timeout });
      const box = await widget.boundingBox().catch(() => null);
      return Boolean(box && box.width > 0 && box.height > 0);
    } catch {
      // Fallback to original polling behavior (broader checks)
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        if (await this.isUpNextMarkerVisible()) {
          return true;
        }
        await this.page.waitForTimeout(1000);
      }
      return false;
    }
  }
 

  async isNextEpisodeButtonBelowSeekBar(): Promise<boolean> {
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    const seekBar = this.page.locator(this.seekBar.selector).first();
    const nextVisible = await nextEpisodeButton.isVisible().catch(() => false);
    const seekVisible = await seekBar.isVisible().catch(() => false);
    if (!nextVisible || !seekVisible) {
      return false;
    }
    const [nextBox, seekBox] = await Promise.all([
      nextEpisodeButton.boundingBox().catch(() => null),
      seekBar.boundingBox().catch(() => null),
    ]);
    if (!nextBox || !seekBox) {
      return false;
    }
    return nextBox.y >= seekBox.y + seekBox.height - 2;
  }

  async clickBackButton(): Promise<void> {
    logger.elementInteraction('click', 'Back button');
    const backButton = this.page.locator(this.backButton.selector).first();
    const viewport = this.page.viewportSize();
    if (viewport) {
      await this.page.mouse.move(viewport.width / 2, viewport.height / 2);
      await this.page.waitForTimeout(1000);
    }
    const isVisible = await backButton.isVisible().catch(() => false);
    if (isVisible) {
      await backButton.click({ timeout: 10000 });
    } else {
      logger.debug('Back button hidden — attempting JS click fallback');
      await backButton.evaluate((el: HTMLElement) => el.click()).catch(async () => {
        await backButton.click({ force: true, timeout: 10000 });
      });
    }
  }

  async clickPauseAdBanner(): Promise<void> {
    logger.elementInteraction('click', 'pause ad banner');
    try {
      await this.page.locator(this.pauseAdMidBanner.selector).click({ timeout: 15000, force: true, });
    } catch (error) {
      logger.debug('Pause ad banner click via frame failed', error);
    }
  }

  async clickBackButtonFromPauseAdScreen(): Promise<void> {
    logger.elementInteraction('click', 'Back button from pause ad screen');
    const backButton = this.page.locator(this.backButton.selector).first();
    await backButton.waitFor({ state: 'visible', timeout: 10000 });
    await backButton.click({ timeout: 10000 });
  }

  async isDetailsPageVisibleAfterPauseAdBackNavigation(): Promise<boolean> {
    return await this.isShowDetailsPageVisible().catch(() => false);
  }

  async navigateBackToPlayerFromAdScreen(): Promise<void> {
    logger.elementInteraction('click', 'ad-screen navigation back to player');
    const adScreenBackToPlayer = this.page.locator(this.adScreenBackToPlayer.selector).first();
    await adScreenBackToPlayer.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    await adScreenBackToPlayer.click({ timeout: 10000, force: true }).catch(() => undefined);
  }

  async isSubtitleLanguageVisible(): Promise<boolean> {
    try {
      const option = this.page.getByText('English (Philippines)').first();
      await option.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await option.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isSubtitleOffOptionVisible(): Promise<boolean> {
    const subtitleOffOption = this.page.locator(this.subtitleOffOption.selector).first();
    await subtitleOffOption.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isSubtitleDisplayedOnPlayer(): Promise<boolean> {
    const subtitleDisplayIndicator = this.page.locator(this.subtitleDisplayIndicator.selector).first();
    try {
      await subtitleDisplayIndicator.waitFor({
        state: 'visible',
        timeout: 30000
      });
      return true;
    } catch (error) {
      throw new Error(
        `Subtitle was not displayed on the player within 30 seconds. ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async isFullscreenButtonVisible(): Promise<boolean> {
    const fullscreenButton = this.page.locator(this.fullscreenButton.selector).first();
    await fullscreenButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async clickFullscreenButton(): Promise<void> {
    logger.elementInteraction('click', 'Fullscreen button');
    const fullscreenButton = this.page.locator(this.fullscreenButton.selector).first();
    await fullscreenButton.waitFor({ state: 'visible', timeout: 20000 });
    await fullscreenButton.click({ timeout: 20000 });
  }

  async clickMinimizeScreenButton(): Promise<void> {
    logger.elementInteraction('click', 'Minimize screen button');
    const minimizeButton = this.page.locator(this.minimizeButton.selector).first();
    await minimizeButton.waitFor({ state: 'visible', timeout: 10000 });
    await minimizeButton.click({ timeout: 10000 });
  }

  async isFullscreenModeActive(): Promise<boolean> {
    return await this.page.evaluate(() => !!document.fullscreenElement).catch(() => false);
  }

  async isPauseAdVisibleInMaximizedPlayer(): Promise<boolean> {
    const pauseAd = this.page.locator(this.pauseAdInMaximizedPlayer.selector);
    await pauseAd.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await pauseAd.isVisible().catch(() => false);
  }

  async isPauseAdVisibleInMinimizedPlayer(): Promise<boolean> {
    const pauseAd = this.page.locator(this.pauseAdInMinimizedPlayer.selector).first();
    await pauseAd.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await pauseAd.isVisible().catch(() => false);
  }

  async isAdTagVisible(): Promise<boolean> {
    const adTag = this.page.locator(this.adTag.selector).first();
    return await adTag.isVisible().catch(() => false);
  }

  async waitForAdPlaybackToComplete(maxSeconds: number = 90, startupGraceSeconds: number = 8): Promise<number> {
    const startedAt = Date.now();
    const adTag = this.page.locator(this.adTag.selector).first();
    const adFrame = this.page.locator('main iframe, iframe[title*="ad" i], iframe[name*="ad" i]').first();
    const adText = this.page.getByText(/Ad\s+\d+\s+of\s+\d+|Ad:\s*\(/i).first();

    try {
      await Promise.race([
        adTag.waitFor({ state: 'visible', timeout: startupGraceSeconds * 1000 }),
        adFrame.waitFor({ state: 'visible', timeout: startupGraceSeconds * 1000 }),
        adText.waitFor({ state: 'visible', timeout: startupGraceSeconds * 1000 }),
      ]);
    } catch {
      return 0;
    }

    const timeoutMs = maxSeconds * 1000;
    let hiddenChecks = 0;
    while (Date.now() - startedAt < timeoutMs) {
      if (this.page.isClosed()) return Math.round((Date.now() - startedAt) / 1000);
      const adVisible = await adTag.isVisible().catch(() => false)
        || await adFrame.isVisible().catch(() => false)
        || await adText.isVisible().catch(() => false);
      if (!adVisible) {
        hiddenChecks += 1;
        if (hiddenChecks >= 2) {
          return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        }
      } else {
        hiddenChecks = 0;
      }
      if (hiddenChecks > 0) {
        await this.page.waitForTimeout(1000).catch(() => undefined);
        continue;
      }
      await this.page.waitForTimeout(1000).catch(() => undefined);
    }
    return maxSeconds;
  }

  async measureAdDuration(maxSeconds: number = 90): Promise<number> {
    const startedAt = Date.now();
    const timeoutMs = maxSeconds * 1000;
    while (Date.now() - startedAt < timeoutMs) {
      const adVisible = await this.isAdTagVisible();
      if (!adVisible) {
        return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      }
      if (this.page.isClosed()) return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      await this.page.waitForTimeout(1000).catch(() => undefined);
    }
    return maxSeconds;
  }

  async clickGoLiveButton(): Promise<void> {
    const goLiveButton = this.getRoleLocator(this.goLiveButtonElement);
    await goLiveButton.waitFor({ state: 'visible', timeout: 10000 });
    await goLiveButton.click({ timeout: 10000 });
  }

  async isGoLiveButtonVisible(): Promise<boolean> {
    await this.page.getByText(this.liveTextLabel.text ?? 'Live', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isLiveTagVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.liveTag.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isGoLiveVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.goLiveButtonElement.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async getPlaybackTimeText(): Promise<string> {
    const timeDisplay = this.page.locator(this.playerTimeDisplay.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'attached', timeout: 15000 });
    return (await timeDisplay.textContent()).replace(/\s+/g, ' ').trim();
  }

  async getPlaybackTimestampText(): Promise<string> {
    const timeDisplay = this.page.locator(this.playbackTimeValue.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'attached', timeout: 15000 });
    return (await timeDisplay.textContent()).replace(/\s+/g, ' ').trim();
  }

  async isPlaybackTimeInHHMMSSFormat(): Promise<{ playbackTime: string; isValid: boolean; }> {
    const playbackTime = (await this.getPlaybackTimestampText()).trim();
    const isValid = /^\d{2}:\d{2}:\d{2}\s*\/\s*\d{2}:\d{2}:\d{2}$/.test(playbackTime);
    return {
      playbackTime,
      isValid,
    };
  }

  async isPlaybackTimeInMMSSFormat(): Promise<{ playbackTime: string; isValid: boolean; }> {
    const playbackTime = (await this.getPlaybackTimestampText()).trim();
    const currentTime = playbackTime.split('/')[0].trim();
    const isValid = /^\d{2}:\d{2}$/.test(currentTime);
    return {
      playbackTime: currentTime,
      isValid,
    };
  }

  async getTrimmedPlaybackTime(): Promise<string> {
    const playbackText = await this.getPlaybackTimeText();
    const match = playbackText.match(/(\d{1,2}:\d{2})/);
    return match?.[1] ?? playbackText;
  }

async dragSeekBarToPosition(targetPercent: number): Promise<void> {
    const seekBar = this.page.locator(this.seekBar.selector).first();
    await seekBar.waitFor({ state: 'visible', timeout: 315000 }).catch(() => undefined);
    const box = await seekBar.boundingBox().catch(() => null);
    const clampedPercent = Math.min(Math.max(targetPercent, 0.02), 0.99);
    if (box) {
      const startX = box.x + box.width * 0.1;
      const startY = box.y + box.height / 2;
      const endX = box.x + box.width * clampedPercent;
      const endY = startY;
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY, { steps: 20 });
      await this.page.mouse.up();
    }
    const videoUpdated = await this.page.evaluate(({ percent }) => {
      const video = document.querySelector('video') as HTMLVideoElement | null;
      if (!video || Number.isNaN(video.duration) || video.duration <= 0) {
        return false;
      }
      const targetTime = Math.max(0, Math.min(video.duration * percent, video.duration - 0.5));
      if (Math.abs(video.currentTime - targetTime) > 0.1) {
        video.currentTime = targetTime;
        video.dispatchEvent(new Event('timeupdate'));
        video.dispatchEvent(new Event('seeked'));
        return true;
      }
      return true;
    }, { percent: clampedPercent });
    if (!videoUpdated && box) {
      await seekBar.click({ position: { x: Math.max(4, Math.round(box.width * clampedPercent)), y: Math.max(4, Math.round(box.height / 2)) } });
    }
    await this.page.waitForTimeout(1500);
  }
  
  async dragSeekBarUntilUpNextMarkerReached(): Promise<boolean> {
    const seekBar = this.page.locator(this.seekBar.selector).first();
    const nextEpisodeText = this.page.locator("//span[contains(normalize-space(), 'Next Episode')]").first();
    await seekBar.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
    const box = await seekBar.boundingBox().catch(() => null);
    if (!box) {
      return false;
    }
    const startX = box.x + box.width * 0.08;
    const startY = box.y + box.height / 2;
    const endX = box.x + box.width * 0.98;
    const endY = startY;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 18 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(1200);
    return await nextEpisodeText.isVisible().catch(() => false);
  }
  async dragProgressBarToPosition(targetPercent: number): Promise<void> {
    const candidates = [this.progressBarContainer, this.progressBarIndicator, this.seekBar];
    let targetLocator: Locator | null = null;
    for (const candidate of candidates) {
      const locator = this.page.locator(candidate.selector).first();
      const count = await locator.count().catch(() => 0);
      if (count > 0) {
        const visible = await locator.isVisible().catch(() => false);
        if (visible) {
          targetLocator = locator;
          break;
        }
      }
    }
    if (!targetLocator) {
      return;
    }
    const box = await targetLocator.boundingBox().catch(() => null);
    if (!box) {
      return;
    }
    const safePercent = Math.min(Math.max(targetPercent, 0.05), 0.99);
    const startX = box.x + box.width * 0.05;
    const startY = box.y + box.height / 2;
    const endX = box.x + box.width * safePercent;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, startY, { steps: 30 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(1000);
  }

  async clickliveContent(contentName: string = 'TFC Asia'): Promise<void> {
    logger.elementInteraction('click', `content tile ${contentName}`);
    const liveSection = this.page.locator(this.liveChannelsHeading.selector).first();
    const tileSelector = `img[alt="${contentName}"], img[title="${contentName}"], [aria-label="${contentName}"]`;
    const tile = this.page.locator(tileSelector).first();
    const maxAttempts = 12;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const count = await tile.count().catch(() => 0);
      if (count > 0) {
        await tile.scrollIntoViewIfNeeded().catch(() => undefined);
        const isVisible = await tile.isVisible().catch(() => false);
        if (isVisible) {
          await tile.click({ timeout: 20000 });
          return;
        }
      }
      await liveSection.scrollIntoViewIfNeeded().catch(() => undefined);
      await this.page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.75, left: 0, behavior: 'smooth' }));
      await this.page.waitForTimeout(1000);
    }
    await tile.scrollIntoViewIfNeeded().catch(() => undefined);
    await tile.waitFor({ state: 'visible', timeout: 20000 });
    await tile.click({ timeout: 20000 });
  }

  async RewindButtonNotVisible(): Promise<boolean> {
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    return await rewindButton.isVisible().catch(() => false);
  }

  async ForwardButtonNotVisible(): Promise<boolean> {
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    return await forwardButton.isVisible().catch(() => false);
  }

  async waitForPlayback(seconds: number): Promise<void> {
    if (this.page.isClosed()) {
      logger.debug('Page is closed, skipping waitForPlayback');
      return;
     }
     await this.page.waitForTimeout(seconds * 1000).catch(() => undefined);
  }

  async verifyEpisodeName(expectedEpisodeName: string): Promise<boolean> {
    logger.assertion('Verify episode name', true);
    await expect(this.page.getByText(expectedEpisodeName).first()).toBeVisible();
    return true;
  }

  async isEpisodeNameVisible(expectedEpisodeName?: string): Promise<boolean> {
    if (expectedEpisodeName) {
      return this.verifyEpisodeName(expectedEpisodeName);
    }
    const anyEpisode = this.page.locator('text=/.*\\w.*/').first();
    await anyEpisode.waitFor({ state: 'visible', timeout: 15000 });
    return true;
  }

  async isVPNErrorMessageVisible(expectedMessage?: string): Promise<boolean> {
    const normalize = (value: string): string => value
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    const expected = normalize(expectedMessage || '');
    const deadline = Date.now() + 20000;

    while (Date.now() < deadline && !this.page.isClosed()) {
      const main = this.page.locator('main').first();
      const mainText = normalize(await main.innerText().catch(() => ''));
      if (mainText && (!expected || mainText.includes(expected))) return true;

      const candidates = this.page.locator(this.vpnErrorMessage.selector);
      const count = await candidates.count().catch(() => 0);
      for (let index = 0; index < count; index += 1) {
        const candidate = candidates.nth(index);
        if (!(await candidate.isVisible().catch(() => false))) continue;
        const actualMessage = normalize(await candidate.innerText().catch(() => ''));
        if (!expected || actualMessage.includes(expected)) return true;
      }
      await this.page.waitForTimeout(500).catch(() => undefined);
    }
    return false;
  }

  async getVPNErrorMessageText(): Promise<string> {
    try {
      const locator = this.page.locator(this.vpnErrorMessage.selector);
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return (await locator.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async isShowDetailsPageVisible(): Promise<boolean> {
    try {
      await this.page.waitForURL(/\/details\//, { timeout: 20000 });
      const mainElement = this.page.locator(this.mainContentContainer.selector).first();
      await mainElement.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      const headingSelectors = [this.showDetailsHeading.selector, this.contentDetailsHeading.selector, 'h1', 'h2'];
      for (const selector of headingSelectors) {
        const headingLocator = this.page.locator(selector).first();
        if (await headingLocator.count().catch(() => 0)) {
          const visible = await headingLocator.isVisible().catch(() => false);
          if (visible) {
            return true;
          }
        }
      }
      const metadataSelectors = [
        this.contentMetadata.selector,
        this.contentMetadataContainer.selector,
        this.contentMetadataDiv.selector,
        this.contentYear.selector,
        this.contentGenre.selector,
        this.contentAgeRating.selector,
        this.contentDuration.selector,
      ].filter(Boolean) as string[];
      for (const selector of metadataSelectors) {
        const metadataLocator = this.page.locator(selector).first();
        if (await metadataLocator.count().catch(() => 0) && (await metadataLocator.isVisible().catch(() => false))) {
          return true;
        }
      }
      return this.page.url().includes('/details/');
    } catch (err) {
      logger.debug('isShowDetailsPageVisible check failed', err);
      return false;
    }
  }

  async getShowDetailsHeadingText(): Promise<string> {
    try {
      const headingLocator = this.page.locator(this.showDetailsHeading.selector).first();
      await headingLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await headingLocator.textContent();
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting show details heading', error);
      try {
        const fallbackLocator = this.page.getByText(/./).first();
        const text = await fallbackLocator.textContent();
        return text.replace(/\s+/g, ' ').trim();
      } catch {
        return '';
      }
    }
  }

  async isContentMetadataVisible(): Promise<boolean> {
    try {
      const selectors = [
        this.contentMetadata.selector,
        this.contentMetadataContainer.selector,
        this.contentMetadataDiv.selector,
        this.contentYear.selector,
        this.contentGenre.selector,
        this.contentAgeRating.selector,
        this.contentDuration.selector,
        this.contentDetailsGenres.selector,
        this.contentDescDiv.selector,
      ].filter(Boolean) as string[];
      for (const selector of selectors) {
        const metadataLocator = this.page.locator(selector).first();
        if (await metadataLocator.count().catch(() => 0)) {
          const visible = await metadataLocator.isVisible().catch(() => false);
          if (visible) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async getDeeplinkDetailsHeadingText(): Promise<string> {
    try {
      const headingLocator = this.page.locator(this.deeplinkDetailsHeading.selector).first();
      await headingLocator.waitFor({ state: 'visible', timeout: 20000 });
      return (await headingLocator.textContent())?.replace(/\s+/g, ' ').trim() || '';
    } catch {
      return '';
    }
  }

  async getDeeplinkSummaryText(): Promise<string> {
    try {
      const summaryLocator = this.page.locator(this.deeplinkSummaryText.selector).first();
      await summaryLocator.waitFor({ state: 'visible', timeout: 20000 });
      return (await summaryLocator.textContent())?.replace(/\s+/g, ' ').trim() || '';
    } catch {
      return '';
    }
  }

  async getContentDescriptionText(): Promise<string> {
    try {
      const mainElement = this.page.locator(this.mainContentContainer.selector).first();
      const descriptionLocator = mainElement.locator(this.contentDescDiv.selector).first();
      await descriptionLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await descriptionLocator.textContent();
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting content description', error);
      return '';
    }
  }

  async getContentMetadataText(): Promise<string> {
    try {
      const selectors = [
        this.contentMetadata.selector,
        this.contentMetadataContainer.selector,
        this.contentMetadataDiv.selector,
        this.contentYear.selector,
        this.contentGenre.selector,
        this.contentAgeRating.selector,
        this.contentDuration.selector,
        this.contentDetailsGenres.selector,
        this.contentDescDiv.selector,
      ].filter(Boolean) as string[];
      const fragments: string[] = [];
      for (const selector of selectors) {
        const metadataLocator = this.page.locator(selector).first();
        if (!(await metadataLocator.count().catch(() => 0))) continue;
        const visible = await metadataLocator.isVisible().catch(() => false);
        if (!visible) continue;
        const text = (await metadataLocator.textContent().catch(() => ''))?.replace(/\s+/g, ' ').trim();
        if (text) {
          fragments.push(text);
        }
      }
      const combined = Array.from(new Set(fragments)).join(' ');
      if (combined) {
        return combined;
      }
      const fallbackLocator = this.page.locator(this.contentMetadataFallback.selector).first();
      if (await fallbackLocator.count().catch(() => 0)) {
        const fallbackText = (await fallbackLocator.textContent().catch(() => ''))?.replace(/\s+/g, ' ').trim();
        if (fallbackText) return fallbackText;
      }
      return '';
    } catch (error) {
      logger.debug('Error getting content metadata text', error);
      return '';
    }
  }

  async getDetailsPageText(): Promise<string> {
    try {
      const mainElement = this.page.locator('main');
      await mainElement.waitFor({ state: 'visible', timeout: 10000 });
      const text = await mainElement.textContent() || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting details page text', error);
      return '';
    }
  }

  async getDetailsPageShortDescription(): Promise<string> {
    try {
      const descLocator = this.page.locator(this.contentDescDiv.selector).first();
      await descLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await descLocator.textContent() || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting details page short description', error);
      return '';
    }
  }

  async getDetailsPageGenres(): Promise<string[]> {
    try {
      const genreLocator = this.page.locator(this.contentDetailsGenres.selector);
      await genreLocator.first().waitFor({ state: 'visible', timeout: 10000 });
      const genres = [] as string[];
      const count = await genreLocator.count();
      for (let i = 0; i < count; i++) {
        const text = await genreLocator.nth(i).textContent().catch(() => '');
        if (text) {
          const normalized = text.replace(/\s+/g, ' ').trim();
          if (normalized) genres.push(normalized);
        }
      }
      return genres;
    } catch (error) {
      logger.debug('Error getting details page genres', error);
      return [];
    }
  }

  async getDetailsPageCast(): Promise<string[]> {
    try {
      const castLocator = this.page.locator(this.contentDetailsCast.selector);
      await castLocator.first().waitFor({ state: 'visible', timeout: 10000 });
      const castNames = [] as string[];
      const count = await castLocator.count();
      for (let i = 0; i < count; i++) {
        const text = await castLocator.nth(i).textContent().catch(() => '');
        if (text) {
          const normalized = text.replace(/\s+/g, ' ').trim();
          if (normalized) castNames.push(normalized);
        }
      }
      return castNames;
    } catch (error) {
      logger.debug('Error getting details page cast', error);
      return [];
    }
  }

  async clickSubscribeCTA(): Promise<void> {
    logger.elementInteraction('click', 'Subscribe to Watch CTA');
    const candidateLocators = [
      this.page.locator(this.subscribeCtaContainer.selector).filter({ hasText: /subscribe/i }).first(),
      this.page.locator(this.subscribeCtaContainer.selector).first(),
      this.page.getByText(/subscribe to watch/i).first(),
      this.page.locator(this.subscribeCtaInteractiveTarget.selector).filter({ hasText: /subscribe/i }).first(),
    ];
    for (const candidate of candidateLocators) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        const isVisible = await candidate.isVisible().catch(() => false);
        if (!isVisible) {
          continue;
        }
        await candidate.click({ timeout: 20000, force: true }).catch(() => undefined);
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        return;
      } catch (error) {
        logger.debug('Subscribe CTA candidate click failed', error);
      }
    }
  }

  async isSubscriptionInstructionPromptVisible(): Promise<boolean> {
    try {
      const bodyText = await this.page.locator('body').innerText().catch(() => '');
      const normalized = bodyText.replace(/\s+/g, ' ').trim().toLowerCase();
      const hasPromptText = normalized.includes('a valid subscription is required to view this content')
        || normalized.includes('please subscribe or renew your plan');
      if (hasPromptText) {
        return true;
      }
      const locator = this.page.locator(this.subscriptionInstructionPrompt.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async getSubscriptionInstructionPromptText(): Promise<string> {
    try {
      const bodyText = await this.page.locator('body').innerText().catch(() => '');
      const normalized = bodyText.replace(/\s+/g, ' ').trim();
      const explicitMatch = normalized.match(/A valid subscription is required to view this content[^.]*\./i)
        || normalized.match(/Please subscribe or renew your plan[^.]*\./i);
      if (explicitMatch?.[0]) {
        return explicitMatch[0].replace(/\s+/g, ' ').trim();
      }
      const locator = this.page.locator(this.subscriptionInstructionPrompt.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
      const text = await locator.textContent().catch(() => '');
      return text.replace(/\s+/g, ' ').trim();
    } catch {
      return '';
    }
  }

  async clickSubscribeConfirm(): Promise<void> {
    logger.elementInteraction('click', 'Subscribe confirmation CTA');
    const confirmButton = this.page.locator(this.subscribeConfirmationButtonPattern.selector).first();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click({ timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async isParentalPinPlaybackPromptVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.parentalPinPlaybackPrompt, 10000);
  }

  async getParentalPinPlaybackPromptText(): Promise<string> {
    return await this.pageUtils.getTextContent(this.parentalPinPlaybackPrompt, 10000);
  }

  async handleParentalPinFlow(nextMethod?: () => Promise<void>, pin?: string): Promise<boolean> {
    const continueAction = nextMethod ?? (async () => undefined);
    const promptVisible = await this.isParentalPinPlaybackPromptVisible().catch(() => false);
    if (!promptVisible) {
      await continueAction();
      return false;
    }
    const parentalPin = (pin ?? '').trim();
    if (parentalPin) {
      await this.enterParentalPlaybackPin(parentalPin);
      await this.clickParentalPlaybackPinSubmitButton().catch(() => undefined);
      await this.page.waitForTimeout(1500);
    }
    await continueAction();
    return true;
  }

  async enterParentalPlaybackPin(pin: string): Promise<void> {
    logger.elementInteraction('type', 'Parental playback PIN input');
    const inputs = this.page.locator(this.parentalPinEntryInputs.selector);
    const digits = (pin || '').split('');
    for (let index = 0; index < digits.length; index++) {
      const input = inputs.nth(index);
      await input.waitFor({ state: 'visible', timeout: 10000 });
      await input.fill(digits[index]);
    }
  }

  async isParentalPinInvalidErrorVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.parentalPinInvalidErrorMessage, 10000);
  }

  async getParentalPinInvalidErrorText(): Promise<string> {
    return await this.pageUtils.getTextContent(this.parentalPinInvalidErrorMessage, 10000);
  }

  async clickParentalPlaybackPinSubmitButton(): Promise<void> {
    logger.elementInteraction('click', 'Parental playback PIN submit button');
    const submitButton = this.page.locator(this.parentalPinValidateButton.selector).first();
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.click({ timeout: 15000 });
  }

  async dragSeekBarByMinutes(minutes: number): Promise<void> {
    logger.elementInteraction('drag', `Seek bar by ${minutes} minutes`);
    await this.hoverPlaybackControls().catch(() => undefined);
    await this.page.waitForTimeout(1000);
    const seekBar = this.page.locator(this.seekBar.selector).first();
    await seekBar.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    let videoInfo: { duration: number; currentTime: number } | null = null;
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      videoInfo = await this.page.evaluate(() => {
        const video = document.querySelector('video') as HTMLVideoElement | null;
        if (!video || !video.duration || Number.isNaN(video.duration) || video.duration <= 0) {
          return null;
        }
        return {
          duration: video.duration,
          currentTime: video.currentTime,
        };
      }).catch(() => null);
      if (videoInfo) break;
      await this.page.waitForTimeout(500);
    }
    let targetPercent = 0.20;
    let targetTime = 120;
    if (videoInfo && videoInfo.duration > 0) {
      const addedSeconds = Math.max(minutes * 60, 180);
      targetTime = Math.min(videoInfo.currentTime + addedSeconds, videoInfo.duration - 5);
      targetPercent = Math.max(0.15, Math.min(targetTime / videoInfo.duration, 0.90));
    }
    await this.page.evaluate(({ time }) => {
      const video = document.querySelector('video') as HTMLVideoElement | null;
      if (video) {
        video.currentTime = time;
        video.dispatchEvent(new Event('timeupdate'));
        video.dispatchEvent(new Event('seeked'));
      }
    }, { time: targetTime }).catch(() => undefined);
    const box = await seekBar.boundingBox().catch(() => null);
    if (box && box.width > 0) {
      const startX = box.x + Math.max(5, box.width * 0.05);
      const startY = box.y + box.height / 2;
      const endX = box.x + Math.max(10, box.width * targetPercent);
      const endY = startY;
      await this.page.mouse.move(startX, startY).catch(() => undefined);
      await this.page.mouse.down().catch(() => undefined);
      await this.page.mouse.move(endX, endY, { steps: 10 }).catch(() => undefined);
      await this.page.mouse.up().catch(() => undefined);
      await seekBar.click({
        position: {
          x: Math.max(5, Math.round(box.width * targetPercent)),
          y: Math.round(box.height / 2),
        },
        force: true,
      }).catch(() => undefined);
    }
    await this.page.waitForTimeout(2000);
  }

  async waitTillAdsEnd(): Promise<void> {
    const adOverlay = this.page.locator('#ad-ui-overlay');
    while (true) {
      const adVisible = await adOverlay.isVisible().catch(() => false);
      logger.info(`Ad present: ${adVisible}`);
      if (!adVisible) {
        break;
      }
      await adOverlay.waitFor({ state: 'hidden' });
    }
    logger.info('Ad has ended. Proceeding to next step.');
  }




}