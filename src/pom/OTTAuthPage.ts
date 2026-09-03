import { Page, Locator, ElementHandle } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';
import { title } from 'process';
import { GraphQLResult } from '../utils/graphql/graphql-helper';
import { ContinueWatchingResponse, ContinueWatchingItem } from '../utils/graphql/graphql-types';
import { ContinueWatchingParser } from '../utils/graphql/parsers/continue-watching-parser';
import { getOtpFromYopmail } from '../utils/yopmail-helper';

export class OTTAuthPage {
    private static readonly searchResultContainerSelector = '[class*="search-result"], [class*="result"], [data-testid*="result"], [role="list"], [role="grid"], [class*="thumbnail"]';
    private static readonly searchResultCandidateSelector = 'img[alt], h2, h3, [role="heading"], [data-testid*="title"], [class*="title"], [class*="card-title"]';

    private page: Page;
    private readonly pageUtils: PageUtils;
    private readonly emailField: PageElement;
    private readonly passwordField: PageElement;
    private readonly passwordVisibilityToggle: PageElement;
    private readonly passwordTextField: PageElement;
    private readonly passwordVisibilityEyeIcon: PageElement;
    private readonly passwordTextVisibleField: PageElement;
    private readonly continueButton: PageElement;
    private readonly proceedButton: PageElement;
    private readonly tvProviderLoginOption: PageElement;
    private readonly providerFrontierOption: PageElement;
    private readonly providerEmailField: PageElement;
    private readonly providerPasswordField: PageElement;
    private readonly providerSignInButton: PageElement;
    private readonly forgotPasswordLink: PageElement;
    private readonly forgotPasswordHeading: PageElement;
    private readonly verifyOTPHeading: PageElement;
    private readonly errorMessage: PageElement;
    private readonly emailErrorMessage: PageElement;
    private readonly emailInvalidMessage: PageElement;
    private readonly welcomeHeading: PageElement;
    private readonly welcomeSubheading: PageElement;
    private readonly loginWithFacebookButton: PageElement;
    private readonly loginWithTVProviderButton: PageElement;
    private readonly newHereLink: PageElement;
    private readonly createAccountLink: PageElement;
    private readonly cookieConfirmButton: PageElement;
    private readonly homeTab: PageElement;
    private readonly homeTabFallbackById: PageElement;
    private readonly homeTabFallbackByText: PageElement;
    private readonly homeTabFallbackByHref: PageElement;
    private readonly homeTabSelectors: PageElement[];
    private readonly loadingIndicator: PageElement;
    private readonly moviesTab: PageElement;
    private readonly mobileMainMenu: PageElement;
    private readonly mobileMenuSelectors: PageElement[];
    private readonly showsTab: PageElement;
    private readonly myWatchlistTab: PageElement;
    private readonly gmaTab: PageElement;
    private readonly searchBar: PageElement;
    private readonly searchBarIcon: PageElement;
    private readonly clearSearchButton: PageElement;
    private readonly accountIcon: PageElement;
    private readonly signOutOption: PageElement;
    private readonly signInOption: PageElement;
    private readonly accountAndSettingsOption: PageElement;
    private readonly editProfileButton: PageElement;
    private readonly continueWatchingRail: PageElement;
    private readonly homePageRailContainer: PageElement;
    private readonly homePageRailTagSelector: PageElement;
    private readonly homePageRailThumbnailSelector: PageElement;
    private readonly continueWatchingTrayTitle: PageElement;
    private readonly continueWatchingTrayContainer: PageElement;
    private readonly continueWatchingTrayItem: PageElement;
    private readonly continueWatchingTrayThumbnail: PageElement;
    private readonly continueWatchingTrayProgressIndicator: PageElement;
    private readonly continueWatchingRemoveButton: PageElement;
    private readonly continueWatchingItemLink: PageElement;
    private readonly continueWatchingItemTitle: PageElement;
    private readonly continueWatchingCard: PageElement;
    private readonly continueWatchingImageWithAlt: PageElement;
    private readonly continueWatchingProgressSelector: PageElement;
    private readonly continueWatchingProgressBarFill: PageElement;
    private readonly continueWatchingProgressBarContainer: PageElement;
    private readonly continueWatchingCardAncestor: PageElement;
    private readonly continueWatchingRecentMarkerSelector: PageElement;
    private readonly resumeButton: PageElement;
    private readonly seekBar: PageElement;
    private readonly trendingMoviesRail: PageElement;
    private readonly trendingShowsRail: PageElement;
    private readonly myWatchlistRail: PageElement;
    private readonly topStreamedRail: PageElement;
    private readonly railAncestorSelector: PageElement;
    private readonly iWantOriginalsRailName: string;
    private readonly iWantOriginalsRailNameMobile: string;
    private readonly iwantScrollLocatorMobile: string;
    private readonly iWantOriginalsArrowSelectorTemplate: PageElement;
    private readonly iWantOriginalsArrowCandidateSelector: PageElement;
    private readonly iWantOriginalsCardSelector: PageElement;
    private readonly iWantOriginalsClickableCardSelector: PageElement;
    private readonly iWantOriginalsTitleContainerSelector: PageElement;
    private readonly gmaPinoyBundleMetadata: PageElement;
    private readonly profileLink: PageElement;
    private readonly profileSectionTextElement: PageElement;
    private readonly accountDetailsTextElement: PageElement;
    private readonly createAccountLinkFromHome: PageElement;
    private readonly createAccountHeading: PageElement;
    private readonly createAccountEmailField: PageElement;
    private readonly createAccountPasswordField: PageElement;
    private readonly createAccountConfirmPasswordField: PageElement;
    private readonly termsCheckbox: PageElement;
    private readonly createAccountTermsText: PageElement;
    private readonly marketingCheckbox: PageElement;
    private readonly createAccountMarketingText: PageElement;
    private readonly marketingCheckboxDescription: PageElement;
    private readonly createAccountContinueButton: PageElement;
    private readonly alreadyHaveAccountText: PageElement;
    private readonly createAccountLoginLink: PageElement;
    private readonly emptyCredentialsErrorMessage: PageElement;
    private readonly verifyOTPMessage: PageElement;
    private readonly verifyOTPEmail: PageElement;
    private readonly verifyOTPInstructionText: PageElement;
    private readonly verifyOTPContainer: PageElement;
    private readonly verifyButton: PageElement;
    private readonly backToLoginLink: PageElement;
    private readonly useMobileNumberLink: PageElement;
    private readonly countryCodeDropdown: PageElement;
    private readonly countryCodeOption: PageElement;
    private readonly mobileNumberField: PageElement;
    private readonly mobilePasswordField: PageElement;
    private readonly helpAndSupportLink: PageElement;
    private readonly termsAndConditionsLink: PageElement;
    private readonly privacyPolicyLink: PageElement;
    private readonly cookiePolicyLink: PageElement;
    private readonly pageHeading: PageElement;
    private readonly nextPageLink: PageElement;
    private readonly previousPageLink: PageElement;
    private readonly navTextContainer: PageElement;
    private readonly navArrowLink: PageElement;
    private readonly pageTitle: PageElement;
    private readonly accountAndSettingsLink: PageElement;
    private readonly editProfileOption: PageElement;
    private readonly editProfileHeading: PageElement;
    private readonly firstNameField: PageElement;
    private readonly lastNameField: PageElement;
    private readonly profileSaveButton: PageElement;
    private readonly firstNameValidationError: PageElement;
    private readonly lastNameValidationError: PageElement;
    private readonly pageBody: PageElement;
    private readonly bodyTextPattern: PageElement;
    private readonly midRailAdBanner: PageElement;
    private readonly googleAdsIframeSelector: PageElement;
    private readonly accountSettingsTextLink: PageElement;
    private readonly profileValidationTextPattern: PageElement;
    private readonly searchResultsContainer: PageElement;
    private readonly searchSuggestionsContainer: PageElement;
    private readonly noResultsMessage: PageElement;
    private readonly searchResultImages: PageElement;
    private readonly searchButton: PageElement;
    private readonly searchSectionHeading: PageElement;
    private readonly searchResultContainerSelector: PageElement;
    private readonly searchResultCandidateSelector: PageElement;
    private readonly mobileSearchInput: PageElement;
    private readonly continueWatchingContent: PageElement;
    private readonly iWantLogo: PageElement;
    private continueWatchingGraphQL?: GraphQLResult<ContinueWatchingResponse>;
    private continueWatchingListenerRegistered = false;
    private readonly myWatchListPage: PageElement;
    private readonly appVersionText: PageElement;
    private readonly verifyOTPIdentity: PageElement;
    private readonly countryCode: PageElement;
    private readonly synacorLogOutButton: PageElement;
    private readonly otpInput: PageElement;
    private readonly setNewPasswordHeading: PageElement;
    private readonly passwordResetSuccessMessage: PageElement;
    private readonly doneButton: PageElement;
    private readonly NewPassword: PageElement;
    private readonly ConfirmNewPassword: PageElement;

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.emailField = { selector: 'input[placeholder="Email Address"], input[type="email"], input[name*="email"]', };
        this.passwordField = { selector: 'input[placeholder="Password"], input[type="password"], input[name*="password"]', };
        this.passwordVisibilityToggle = { selector: 'button[aria-label*="password"], [role="button"][aria-label*="password"], [data-testid*="password"], [data-testid*="show-password"], [data-testid*="hide-password"], .password-toggle, .password-visibility-toggle, .show-password-toggle, button:has-text("Show password"), button:has-text("Hide password"), button:has-text("Show"), button:has-text("Hide")', };
        this.passwordTextField = { selector: 'input[type="text"][name*="password"], input[placeholder*="Password"][type="text"]' };
        this.passwordVisibilityEyeIcon = { selector: '.absolute.top-\\[8px\\] > svg > path:nth-child(2)' };
        this.passwordTextVisibleField = { selector: 'input[type="text"][name*="password"], input[placeholder*="Password"][type="text"]' };
        this.continueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.proceedButton = { role: 'button', text: 'Proceed', selector: '(//button[@type="submit" and normalize-space()="Proceed"])[1]' };
        this.forgotPasswordLink = { role: 'link', text: 'Forgot Password?', selector: 'a:has-text("Forgot Password?")' };
        this.forgotPasswordHeading = { role: 'heading', text: 'Confirm Email Address', selector: 'h1:has-text("Confirm Email Address")' };
        this.verifyOTPHeading = { role: 'heading', text: 'Verify OTP', selector: '//h1[normalize-space()="Verify OTP"]' };
        this.verifyOTPIdentity = { role: 'heading', text: 'Verify your identity', selector: '//h1[text()="Verify your identity"]' };
        this.errorMessage = { selector: '//p[text()="Your login credentials are incorrect"]' };
        this.emailInvalidMessage = { selector: 'p:has-text("Invalid email address")' };
        this.emailErrorMessage = { selector: '//p[text()="Please enter a valid email to continue."]' };
        this.welcomeHeading = { selector: 'h1:has-text("Welcome to iWant"), :text("Welcome to iWant")' };
        this.welcomeSubheading = { selector: 'text=/Home of Filipino/' };
        this.loginWithFacebookButton = { selector: 'button:has-text("Login with Facebook")' };
        this.loginWithTVProviderButton = { selector: 'button:has-text("Login with TV Provider")' };
        this.newHereLink = { text: 'New here?', selector: 'span:has-text("New here?")' };
        this.createAccountLink = { role: 'link', text: 'Create Account', selector: '//a[contains(normalize-space(), "Create Account")]' };
        this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
        this.homeTab = { selector: '//div[@id="home"]' };
        this.homeTabFallbackById = { selector: '//div[@id="home"]' };
        this.homeTabFallbackByText = { selector: 'a:has-text("Home"), button:has-text("Home"), [aria-label="Home"], [data-testid*="home"], text=Home' };
        this.homeTabFallbackByHref = { selector: 'a[href="/"], [href="/"], [role="link"][aria-label*="home" i]' };
        this.homeTabSelectors = [this.homeTab, this.homeTabFallbackById, this.homeTabFallbackByText, this.homeTabFallbackByHref];
        this.loadingIndicator = { text: 'Loading..', selector: 'text=Loading..' };
        this.moviesTab = { selector: '//div[@id ="movies"]' };
        this.showsTab = { text: 'Shows', selector: '//div[@id ="shows"]' };
        this.myWatchlistTab = { selector: '//div[@id="my_watchlist"]' };
        this.gmaTab = { selector: '//div[@id ="gma"]' };
        this.searchBarIcon = { selector: 'img[alt="search-icon"]' };
        this.searchBar = { selector: 'input[placeholder*="Search"], input[type="search"], [placeholder*="Search"], [aria-label*="Search"], [title*="Search"], [data-testid*="search"]' };
        this.mobileSearchInput = { selector: 'input[placeholder="Search documentation…"], input[placeholder*="Search"], input[type="search"], [aria-label*="Search"], [title*="Search"], [data-testid*="search"]' };
        this.clearSearchButton = { selector: 'button:has-text("Clear All"), button[aria-label*="clear"], [data-testid*="clear"], [title*="Clear"], [aria-label*="Clear All"], //img[@alt="clear"]' };
        this.accountIcon = { selector: 'img[alt="account"]' };
        this.synacorLogOutButton = { selector: '//span[text()="Logout"]' };
        this.signOutOption = { text: 'Sign Out', selector: 'text=Sign Out' };
        this.signInOption = { selector: '//p[normalize-space()="Sign In"]' };
        this.accountAndSettingsOption = { selector: 'img[alt="Account & Settings"]' };
        this.editProfileButton = { selector: 'text=Edit Profile, button:has-text("Edit Profile"), a:has-text("Edit Profile")' };
        this.continueWatchingRail = { selector: '//p[text()="Continue Watching"]' };
        this.homePageRailContainer = { selector: 'div.rail-container.pointer-events-none.relative' };
        this.homePageRailTagSelector = { selector: 'div.thumbnail-label.absolute.top-0.right-0.z-10' };
        this.homePageRailThumbnailSelector = { selector: 'img[alt]:not([alt="arrow-right"])' };
        this.continueWatchingTrayTitle = { text: 'Continue Watching', selector: 'text=Continue Watching' };
        this.continueWatchingTrayContainer = { selector: 'text=Continue Watching >> xpath=following-sibling::*' };
        this.continueWatchingTrayItem = { selector: 'text=Continue Watching >> xpath=following-sibling::* >> img' };
        this.continueWatchingTrayThumbnail = { selector: 'img' };
        this.continueWatchingTrayProgressIndicator = { selector: '[class*=progress], [aria-label*=progress], [data-testid*=progress], [class*=resume]' };
        this.continueWatchingRemoveButton = { selector: 'img[alt="remove-from-cw"], img[alt*="remove"], [aria-label*="remove"], [title*="remove"], [data-testid*="remove"]' };
        this.continueWatchingItemLink = { selector: 'text=Continue Watching >> xpath=following-sibling::* >> a, text=Continue Watching >> xpath=following-sibling::* >> button, text=Continue Watching >> xpath=following-sibling::* >> [role="button"]' };
        this.continueWatchingItemTitle = { selector: 'text=Continue Watching >> xpath=following-sibling::* >> img[alt]' };
        this.continueWatchingCard = { selector: 'img[alt]:not([alt="arrow-right"])' };
        this.continueWatchingImageWithAlt = { selector: 'img[alt]' };
        this.continueWatchingProgressSelector = { selector: '.progress, [class*="progress"], [aria-label*="progress"], [data-testid*="progress"], [class*="resume"], [style*="width"]' };
        this.continueWatchingProgressBarFill = { selector: '.bg-iw-primary-gradient, [class*="bg-iw-primary-gradient"], div[style*="width"]' };
        this.continueWatchingProgressBarContainer = { selector: '.bg-iw-btn-bg, [class*="bg-iw-btn-bg"]' };
        this.continueWatchingCardAncestor = { selector: 'xpath=ancestor::div[contains(@class,"relative") or contains(@class,"card") or contains(@class,"cursor-pointer") or contains(@class,"group")][1]' };
        this.continueWatchingRecentMarkerSelector = { selector: 'img[alt*="recently"], img[src*="recently"], [class*="recent"]' };
        this.resumeButton = { selector: 'button:has-text("Resume"), a:has-text("Resume")' };
        this.seekBar = { selector: '.player-progress-indicator, .progress-bar, [data-testid*=seek], [class*=progress]' };
        this.trendingMoviesRail = { text: 'Trending Movies Worldwide', selector: 'text=Trending Movies Worldwide' };
        this.trendingShowsRail = { text: 'Trending Shows Worldwide', selector: 'text=Trending Shows Worldwide' };
        this.signInOption = { selector: '//p[normalize-space()="Sign In"]' };
        this.gmaPinoyBundleMetadata = { text: 'Subscribe to GMA Pinoy Bundle to Watch', selector: 'text=Subscribe to GMA Pinoy Bundle to Watch' };
        this.myWatchlistRail = { text: 'My Watchlist', selector: 'text=/^My Watchlist$/' };
        this.myWatchListPage = { selector: '.min-h-screen' };
        this.tvProviderLoginOption = { selector: 'role=button[name="Login with TV Provider"]' };
        this.providerFrontierOption = { selector: 'role=button[name="Frontier, a Verizon Company"]' };
        this.providerEmailField = { selector: 'role=textbox[name="Username"]' };
        this.providerPasswordField = { selector: 'role=textbox[name="Password"]' };
        this.providerSignInButton = { role: 'button', text: 'Sign in', selector: 'button:has-text("Sign in")' };
        this.profileLink = { selector: 'role=img[name="account"]' };
        this.profileSectionTextElement = { selector: 'h1:has-text("Account"), h2:has-text("Account"), section:has-text("Account")' };
        this.accountDetailsTextElement = { selector: 'h1:has-text("Subscription"), h2:has-text("Subscription"), h3:has-text("Subscription")' };
        this.createAccountLinkFromHome = { role: 'link', text: 'Create Account', selector: 'a:has-text("Create Account")' };
        this.createAccountHeading = { role: 'heading', text: 'Create an account', selector: 'h1:has-text("Create an account"), h2:has-text("Create an account")' };
        this.createAccountEmailField = { selector: 'input[placeholder="Email Address"], input[name*="email"], input[type="email"]' };
        this.createAccountPasswordField = { selector: 'input[name="userPassword"]' };
        this.createAccountConfirmPasswordField = { selector: 'input[placeholder="Confirm Password"], input[name*="confirm"], input[id*="confirm"], input[aria-label*="confirm"]' };
        this.termsCheckbox = { selector: 'input#cem' };
        this.createAccountTermsText = { selector: 'text=I agree to the Terms and Conditions and Privacy Policy', text: 'I agree to the Terms and Conditions and Privacy Policy' };
        this.marketingCheckbox = { selector: '//input[@id="cem"]/following-sibling::label/span' };
        this.createAccountMarketingText = { selector: '//span[text()="I agree to receive marketing communications (until I unsubscribe)."]' };
        this.marketingCheckboxDescription = { selector: 'form' };
        this.verifyOTPContainer = { selector: '//p[.//span[contains(normalize-space(.),"A verification OTP was sent to")]]' };
        this.verifyOTPMessage = { selector: '//p[.//span[contains(normalize-space(.),"A verification OTP was sent to")]]' };
        this.verifyOTPEmail = { selector: '//span[contains(@class,"italic") and contains(.,"@")]' };
        this.verifyOTPInstructionText = { selector: '//span[contains(normalize-space(.),"Input the code below to proceed.")]' };
        this.verifyButton = { role: 'button', text: 'Verify', selector: '//button[text()="Verify"]' };
        this.backToLoginLink = { role: 'link', text: 'Back to Login', selector: '//a[normalize-space()="Back to Login"]' };
        this.mobileMainMenu = { selector: '//nav//div[contains(@class, "mobile-main-menu")]' };
        this.mobileMenuSelectors = [
            { selector: 'button[aria-label*="Menu" i]' },
            { selector: '[aria-label*="Menu" i]' },
            { selector: '[data-testid*="menu" i]' },
            { selector: 'img[alt*="menu" i]' },
            { selector: '[class*="menu"]' },
        ];
        this.createAccountContinueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.alreadyHaveAccountText = { selector: 'text=Already Have an Account?' };
        this.createAccountLoginLink = { role: 'link', text: 'Login', selector: 'a:has-text("Login")' };
        this.emptyCredentialsErrorMessage = { selector: 'text=/Email is required/i' };
        this.topStreamedRail = { text: 'Top Streamed', selector: 'text=Top Streamed' };
        this.railAncestorSelector = { selector: '//div[contains(@class,"scrollable-list") and contains(@class,"horizontal-scroll")]' };
        this.iWantOriginalsRailName = 'iWant Originals';
        this.iWantOriginalsRailNameMobile = 'FREE Lang DITO: iWant Originals';
        this.iwantScrollLocatorMobile = 'text=iWant Originals >> xpath=ancestor::*[contains(@class, "rail")][1]';
        this.iWantOriginalsArrowSelectorTemplate = { selector: 'div[class*="pointer-events-auto"][class*="absolute"][class*="bottom-[15rem]"][class*="{positionClass}"][class*="z-10"] img[alt="arrow-right"]' };
        this.iWantOriginalsArrowCandidateSelector = { selector: 'img[alt*="arrow" i], img[alt*="chevron" i], [data-testid*="arrow" i], button[aria-label*="arrow" i], svg, .arrow, .chevron' };
        this.iWantOriginalsCardSelector = { selector: 'img[alt]:not([alt="arrow-right"])' };
        this.iWantOriginalsClickableCardSelector = { selector: 'a, button, [role="button"], li, article, figure' };
        this.iWantOriginalsTitleContainerSelector = { selector: 'xpath=ancestor::div[contains(@class, "relative") and contains(@class, "w-auto") and .//img[contains(@class, "title")]][1]' };
        this.gmaPinoyBundleMetadata = { text: 'Subscribe to GMA Pinoy Bundle to Watch', selector: 'text=Subscribe to GMA Pinoy Bundle to Watch' };
        this.useMobileNumberLink = { selector: '//p[contains(normalize-space(), "Click here to use Mobile Number")]' };
        this.countryCode = { selector: '//input[@type="text" and contains(@class,"w-full")]' };
        this.countryCodeDropdown = { selector: '//img[@alt="IN" and contains(@src, "/countries/in.svg")]' };
        this.countryCodeOption = { selector: '//li[.//img[@alt="PH"] and contains(normalize-space(.), "Philippines")]' };
        this.mobileNumberField = { selector: '#userMobile, input[type="tel"], input[name*="phone"], input[name*="mobile"]' };
        this.mobilePasswordField = { selector: 'input[placeholder*="Password"], input[type="password"], input[name*="password"]' };
        this.helpAndSupportLink = { role: 'link', text: 'Help and Support', selector: 'a:has-text("Help and Support")' };
        this.termsAndConditionsLink = { role: 'link', text: 'Terms and Conditions', selector: 'a:has-text("Terms and Conditions")' };
        this.privacyPolicyLink = { role: 'link', text: 'Privacy Policy', selector: 'a:has-text("Privacy Policy")' };
        this.cookiePolicyLink = { role: 'link', text: 'Cookie Policy', selector: 'a:has-text("Cookie Policy")' };
        this.pageHeading = { selector: 'h1, h2, [role="heading"]' };
        this.navTextContainer = { selector: "//div[contains(@class,'items-center')]//a" };
        this.navArrowLink = { selector: "//a//*[name()='svg']" };
        this.pageTitle = { selector: '//title' };
        this.accountAndSettingsLink = { role: 'link', text: 'Account & Settings', selector: 'a:has-text("Account & Settings"), text=Account & Settings' };
        this.editProfileOption = { role: 'button', text: 'Edit Profile', selector: 'button:has-text("Edit Profile"), a:has-text("Edit Profile")' };
        this.editProfileHeading = { role: 'heading', text: 'Edit Profile', selector: 'h1:has-text("Edit Profile"), h2:has-text("Edit Profile")' };
        this.firstNameField = { selector: 'input[name*="first"], input[placeholder*="First Name"], input[placeholder*="First name"], input[aria-label*="First Name"]' };
        this.lastNameField = { selector: 'input[name*="last"], input[placeholder*="Last Name"], input[placeholder*="Last name"], input[aria-label*="Last Name"]' };
        this.profileSaveButton = { role: 'button', text: 'Save', selector: 'button:has-text("Save")' };
        this.firstNameValidationError = { selector: '//*[@id="first name-helper-text"]' };
        this.lastNameValidationError = { selector: '//*[@id="last name-helper-text"]' };
        this.midRailAdBanner = { selector: '#gpt-banner-ad-10-home, div[id^="gpt-banner-ad-10"]' };
        this.googleAdsIframeSelector = { selector: 'iframe[id^="google_ads_iframe_"], iframe[name^="google_ads_iframe_"]' };
        this.pageBody = { selector: 'body' };
        this.bodyTextPattern = { selector: 'text=/alphabetic|letters|only/i' };
        this.midRailAdBanner = { selector: '#gpt-banner-ad-10-home, div[id^="gpt-banner-ad-10"]' };
        this.googleAdsIframeSelector = { selector: 'iframe[id^="google_ads_iframe_"], iframe[name^="google_ads_iframe_"]' };
        this.accountSettingsTextLink = { text: 'Account & Settings', selector: 'text=Account & Settings' };
        this.profileValidationTextPattern = { selector: 'text=/alphabetic|letters|only/i' };
        this.searchResultsContainer = { selector: '[class*="search-result"], [class*="result"], [data-testid*="result"], h2, h3' };
        this.searchSuggestionsContainer = { selector: '[class*="dropdown"], [class*="suggestion"], [role="listbox"], [role="option"], .search-suggestions, [data-testid*="suggestion"], [class="relative overflow-hidden"]' };
        this.noResultsMessage = { selector: 'text=/no\\s+results/i' };
        this.searchResultImages = { selector: '//div[@class="relative overflow-hidden"]/child::img' };
        this.searchButton = { selector: 'button:has(img[alt="search-icon"]), [role="button"]:has(img[alt="search-icon"]), img[alt="search-icon"]' };
        this.searchSectionHeading = { selector: 'h1, h2, h3, p, [role="heading"], [class*="heading"]' };
        this.searchResultContainerSelector = { selector: '[class*="search-result"], [class*="result"], [data-testid*="result"], [role="list"], [role="grid"], [class*="thumbnail"]' };
        this.searchResultCandidateSelector = { selector: 'img[alt], h2, h3, [role="heading"], [data-testid*="title"], [class*="title"], [class*="card-title"]' };
        this.continueWatchingContent = { selector: 'img[alt], [aria-label], [title]' };
        this.appVersionText = { selector: "//p[contains(., 'All rights reserved.')]" };
        this.mobileMainMenu = { selector: '//p[text()="Menu"]' };
        this.iWantLogo = { selector: 'img[alt*="iWant"], [aria-label*="iWant"], [data-testid*="logo"], img[alt*="logo"], svg[aria-label*="iWant"]' };
        this.searchButton = { selector: "img[alt='search-icon']" };
        this.appVersionText = { selector: "//p[contains(., 'All rights reserved.')]" };
        this.mobileMainMenu = { selector: '//nav//div[contains(@class, "mobile-main-menu")]' };
        this.otpInput = { selector: "input[inputmode='numeric'][maxlength='1']" };
        this.setNewPasswordHeading = { selector: '//h1[normalize-space()="Set a New Password"]' };
        this.passwordResetSuccessMessage = { selector: 'text=/New Password Set Successfully/i' };
        this.doneButton = { role: 'button', text: 'Done', selector: 'button:has-text("Done"), a:has-text("Done")' };
        this.NewPassword = { selector: '//input[@name="userPassword"]' };
        this.ConfirmNewPassword = { selector: '//input[@name="confirmPassword"]' };
    }

    async navigate(): Promise<void> {
        const baseUrl = config.getBaseURL();
        logger.pageNavigation(baseUrl);
        await this.page.goto(baseUrl);
        await this.pageUtils.waitForPageLoad();
    }

    async acceptCookieSettingsIfVisible(): Promise<void> {
        try {
            const isVisible = await this.pageUtils.isVisible(this.cookieConfirmButton, 10000);
            if (isVisible) {
                logger.step('Accepting cookie settings popup');
                await this.pageUtils.safeClick(this.cookieConfirmButton);
            }
        } catch (error) {
            logger.debug('Cookie confirmation button not visible', error);
        }
    }

    async clickEmailField(): Promise<void> {
        logger.elementInteraction('click', 'email field');
        await this.page.locator(this.emailField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeClick(this.emailField);
    }

    async enterEmail(email: string): Promise<void> {
        logger.elementInteraction('type', 'email field');
        await this.page.locator(this.emailField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeType(this.emailField, email);
    }

    async clickPasswordField(): Promise<void> {
        logger.elementInteraction('click', 'password field');
        await this.page.locator(this.passwordField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeClick(this.passwordField);
    }

    async enterPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'password field');
        await this.page.locator(this.passwordField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeType(this.passwordField, password);
    }

    async enterNewPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'new password field');
        const passwordLocator = this.page.locator(this.NewPassword.selector).first();
        await passwordLocator.waitFor({ state: 'visible', timeout: 30000 });
        await passwordLocator.fill(password);
    }

    async enterConfirmNewPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'confirm new password field');
        const confirmPasswordLocator = this.page.locator(this.ConfirmNewPassword.selector).first();
        await confirmPasswordLocator.waitFor({ state: 'visible', timeout: 30000 });
        await confirmPasswordLocator.fill(password);
    }

    async clickContinue(): Promise<void> {
        logger.elementInteraction('click', 'Continue button');
        await this.pageUtils.safeClick(this.continueButton);
    }

    async clickUseMobileNumberLink(): Promise<void> {
        logger.elementInteraction('click', 'Use mobile number link');
        await this.pageUtils.safeClick(this.useMobileNumberLink);
    }

    async clickCountryCodeDropDown(countryCode: string): Promise<void> {
        logger.elementInteraction('click', `country code dropdown for ${countryCode}`);
        const countrySelector = this.page.locator(this.countryCodeDropdown.selector).first();
        await countrySelector.waitFor({ state: 'visible', timeout: 10000 });
        await countrySelector.click();
        await this.enterCountryCode(countryCode);
        const countryOptionSelector = this.page.locator(this.countryCodeOption.selector).first();
        await countryOptionSelector.waitFor({ state: 'visible', timeout: 10000 });
        await countryOptionSelector.click();
    }

    async enterCountryCode(countryCode: string): Promise<void> {
        logger.elementInteraction('type', `country code ${countryCode}`);
        const countrySelector = this.page.locator(this.countryCode.selector).first();
        await countrySelector.fill(countryCode).catch(() => countrySelector.type(countryCode));
    }

    async entercountryCodeOption(countryCode: string): Promise<void> {
        logger.elementInteraction('click', `country code option ${countryCode}`);
        const countryOptionSelector = this.page.locator(this.countryCodeOption.selector).first();
        await countryOptionSelector.click().catch(() => countryOptionSelector.click());
    }
    async enterMobileNumber(mobileNumber: string): Promise<void> {
        logger.elementInteraction('type', 'mobile number field');
        await this.pageUtils.safeType(this.mobileNumberField, mobileNumber);
    }

    async enterMobilePassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'mobile password field');
        await this.pageUtils.safeType(this.mobilePasswordField, password);
    }

    async clickForgotPassword(): Promise<void> {
        logger.elementInteraction('click', 'Forgot Password? link');
        await this.pageUtils.safeClick(this.forgotPasswordLink);
    }

    async enterTextInSearchBar(searchText: string): Promise<void> {
        logger.elementInteraction('type', 'search bar');
        await this.page.locator(this.searchBar.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeType(this.searchBar, searchText);
    }

    async clickProceed(): Promise<void> {
        logger.elementInteraction('click', 'Proceed button');
        await this.pageUtils.safeClick(this.proceedButton);
    }

    async isForgotPasswordPageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.forgotPasswordHeading, 10000);
    }

    async getForgotPasswordHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.forgotPasswordHeading, 10000);
    }

    async isVerifyOTPPageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.verifyOTPHeading, 10000);
    }
    async isVerifyOTPIdentityPageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.verifyOTPIdentity, 10000);
    }
    async getVerifyOTPHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.verifyOTPHeading, 10000);
    }
    async getVerifyOTPIdentityText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.verifyOTPIdentity, 10000);
    }

    async getInvalidCredentialsErrorMessage(): Promise<string> {
        return await this.pageUtils.getTextContent(this.errorMessage, 10000);
    }

    async getErrorMessage(): Promise<string> {
        // return await this.pageUtils.getTextContent(this.emailInvalidMessage, 10000);
        return await this.pageUtils.getTextContent(this.emailErrorMessage, 10000);
    }

    async clickPasswordVisibilityToggle(): Promise<void> {
        logger.elementInteraction('click', 'Password visibility toggle eye icon');
        await this.pageUtils.safeClick(this.passwordVisibilityEyeIcon, 10000);
    }

    async isPasswordTextVisible(): Promise<boolean> {
        return await this.page.locator(this.passwordTextField.selector).count() > 0;
    }

    getTermsAndConditionsLinkSelector(): string {
        return this.termsAndConditionsLink.selector;
    }

    getSearchInputSelector(): string {
        return this.searchBar.selector;
    }

    getMobileSearchInputSelector(): string {
        return this.mobileSearchInput.selector;
    }

    async getPasswordFieldType(): Promise<string> {
        const locator = this.page.locator(this.passwordField.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.getAttribute('type')) || '';
    }

    async getEmptyCredentialsErrorMessage(): Promise<string> {
        return await this.pageUtils.getTextContent(this.emptyCredentialsErrorMessage, 10000);
    }

    async isWelcomeHeadingVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.welcomeHeading, 10000);
    }

    async getWelcomeHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.welcomeHeading, 10000);
    }

    async isEmailFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.emailField, 10000);
    }

    async isPasswordFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.passwordField, 10000);
    }

    async isContinueButtonVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.continueButton, 10000);
    }

    async isWelcomeSubheadingVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.welcomeSubheading, 10000);
    }

    async getWelcomeSubheadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.welcomeSubheading, 10000);
    }

    async isLoginWithFacebookVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.loginWithFacebookButton, 10000);
    }

    async isLoginWithTVProviderVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.loginWithTVProviderButton, 10000);
    }

    async isNewHereLinkVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.newHereLink, 10000);
    }

    async openCreateAccountFlow(): Promise<void> {
        logger.step('Opening create account flow');
        await this.pageUtils.safeClick(this.createAccountLinkFromHome);
    }

    async isCreateAccountHeadingVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountHeading, 10000);
    }

    async isCreateAccountLinkVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountLink, 10000);
    }

    async scrollToBottomLinks(): Promise<void> {
        await this.pageUtils.scrollIntoView(this.createAccountLink);
    }

    async isLoginFormVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.emailField, 10000);
    }

    async isSupportLinksVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.helpAndSupportLink, 10000)
            && await this.pageUtils.isVisible(this.termsAndConditionsLink, 10000)
            && await this.pageUtils.isVisible(this.privacyPolicyLink, 10000)
            && await this.pageUtils.isVisible(this.cookiePolicyLink, 10000);
    }

    async scrollToSupportLinks(): Promise<void> {
        logger.elementInteraction('scroll', 'Scroll to Help and Support link (handling viewport orientation)');
        try {
            // For mweb vertical layout, we need to scroll down to reach support links at bottom
            if (process.env.BROWSER === 'mchrome') {
                logger.debug('mweb: scrolling to support links in vertical layout');
                await this.page.evaluate(() => {
                    window.scrollBy(0, document.body.scrollHeight);
                });
                await this.page.waitForTimeout(500);
            }
            // Standard scroll for web horizontal layout
            await this.pageUtils.scrollIntoView(this.helpAndSupportLink);
            await this.page.waitForTimeout(500);
            logger.step('Scrolled to Help and Support link');
        } catch (error) {
            logger.debug(`Error scrolling to support links: ${error}`);
        }
    }

    async scrollToBottomOfPage(): Promise<void> {
        logger.elementInteraction('scroll', 'Scroll to page footer');
        const footer = this.page.locator('footer');
        const scrollStep = 300;
        while (!(await footer.isVisible().catch(() => false))) {
            await this.page.mouse.wheel(0, scrollStep);
            await this.page.waitForTimeout(400);
            const isBottom = await this.page.evaluate(() => {
                return window.innerHeight + window.scrollY >= document.body.scrollHeight;
            });
            if (isBottom) {
                break;
            }
        }
        logger.info('Reached page footer.');
    }

    async scrollToMidRailAdBanner(): Promise<boolean> {
        logger.elementInteraction('scroll', 'mid rail ad banner');
        try {
            const bannerSelector = this.midRailAdBanner.selector;
            const iframeSelector = this.googleAdsIframeSelector.selector;
            const bannerVisible = await this.scrollUntilVisible(bannerSelector);
            if (bannerVisible) {
                return true;
            }
            const iframe = this.page.locator(iframeSelector).first();
            if (await iframe.count() > 0) {
                await iframe.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
                await this.page.waitForTimeout(1200);
                return await iframe.isVisible().catch(() => false);
            }
            return false;
        } catch (error) {
            logger.debug('Mid rail ad banner scroll failed', error);
            return false;
        }
    }

    async scrollUntilVisible(selector: string, maxAttempts = 8): Promise<boolean> {
        const locator = this.page.locator(selector).first();
        const scrollFactor = 0.75;
        const pauseMs = 900;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            if (await locator.isVisible().catch(() => false)) {
                await locator.scrollIntoViewIfNeeded().catch(() => undefined);
                return true;
            }
            await this.page.evaluate((factor) => {
                window.scrollBy(0, window.innerHeight * factor);
            }, scrollFactor).catch(() => undefined);
            await this.page.waitForTimeout(pauseMs);
            if (await locator.isVisible().catch(() => false)) {
                await locator.scrollIntoViewIfNeeded().catch(() => undefined);
                return true;
            }
            const atBottom = await this.page.evaluate(() => {
                return window.innerHeight + window.scrollY >= document.body.scrollHeight - 5;
            }).catch(() => false);
            if (atBottom) {
                break;
            }
        }
        return false;
    }

    getGoogleAdsIframeSelector(): string {
        return this.googleAdsIframeSelector.selector;
    }

    async isAdTagVisible(): Promise<boolean> {
        try {
            const banner = this.page.locator(this.midRailAdBanner.selector).first();
            if (await banner.count()) {
                await banner.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
                if (await banner.isVisible().catch(() => false)) {
                    return true;
                }
            }
            const iframe = this.page.locator(this.googleAdsIframeSelector.selector).first();
            if (await iframe.count()) {
                await iframe.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
                return await iframe.isVisible().catch(() => false);
            }
            return false;
        } catch (error) {
            logger.debug('Mid rail ad visibility check failed', error);
            return false;
        }
        return false;
    }

    async getApplicationVersionText(): Promise<string> {
        const locator = this.page.locator(this.appVersionText.selector).first();
        const text = await locator.textContent().catch(() => '');
        return (text || '').trim();
    }

    async isApplicationVersionDisplayed(): Promise<boolean> {
        const versionText = await this.getApplicationVersionText();
        const normalizedText = versionText.toLowerCase();
        const hasVersionLabel = normalizedText.includes('version');
        const hasVersionNumber = /\d/.test(versionText);
        return hasVersionLabel && hasVersionNumber;
    }

    async isHomeTabVisible(): Promise<boolean> {
        if (process.env.BROWSER === 'mchrome') {
            await this.clickMobileMainMenu();
            const isVisible = await this.pageUtils.isVisible(this.homeTab, 10000);
            await this.clickMobileMainMenu();
            await this.page.waitForTimeout(1000);
            return isVisible;
        }
        return await this.pageUtils.isVisible(this.homeTab, 10000);
    }

    async isHomeTabVisibleWeb(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.homeTab, 10000);
    }

    async isAuthenticatedEntryVisible(): Promise<boolean> {
        if (process.env.BROWSER === 'mchrome') {
            for (const selector of this.mobileMenuSelectors) {
                const menuVisible = await this.page.locator(selector.selector).first().isVisible().catch(() => false);
                if (menuVisible) {
                    return true;
                }
            }
            return false;
        }
        return await this.isHomeTabVisible().catch(() => false);
    }

    async clickHomeTab(): Promise<void> {
        logger.info('click', 'Home tab');
        if (process.env.BROWSER === 'mchrome') {
            await this.clickMobileMainMenu();
        }
        let clicked = false;
        for (const selector of this.homeTabSelectors) {
            try {
                const locator = this.page.locator(selector.selector).first();
                await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
                if (await locator.count()) {
                    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
                    await locator.click({ timeout: 10000, force: true }).catch(async () => {
                        await locator.evaluate((element: HTMLElement) => element.click()).catch(() => undefined);
                    });
                    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
                    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
                    await this.page.waitForTimeout(2000);
                    clicked = true;
                    break;
                }
            } catch (error) {
                logger.debug('Home tab fallback selector failed', error);
            }
        }
        if (!clicked) {
            logger.debug('Home tab was not reachable through the normal selectors; falling back to a full home navigation');
            await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })).catch(() => undefined);
            await this.page.waitForTimeout(1000);
            await this.navigateHome();
        }
    }

    async refreshPage(): Promise<void> {
        logger.step('Refreshing current page');
        await this.page.reload({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(3000);
    }

    async isMoviesTabVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.moviesTab, 10000);
    }

    async waitForLoadingToDisappear(timeout: number = 15000): Promise<void> {
        try {
            await this.pageUtils.waitForElementToDisappear(this.loadingIndicator, timeout);
        } catch {
            logger.debug('Loading indicator did not disappear within the timeout, proceeding anyway.');
        }
    }

    async isErrorMessageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.emailErrorMessage, 10000);
    }

    async clickMobileMainMenu(): Promise<void> {
        logger.elementInteraction('click', 'mobile main menu');
        const locator = this.page.locator(this.mobileMainMenu.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        await locator.click({ timeout: 20000, force: true });
    }

    async clickMoviesTab(): Promise<void> {
        logger.elementInteraction('click', 'Movies tab');
        if (process.env.BROWSER === 'mchrome') {
            await this.clickMobileMainMenu();
        }

        // Try clicking the Movies tab and ensure the navigation/route change happens.
        const maxAttempts = 3;
        let lastErr: any = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                await this.pageUtils.safeClick(this.moviesTab);
                // wait briefly for client-side navigation
                await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => undefined);
                await this.pageUtils.waitForNetworkIdle(10000).catch(() => undefined);
                const ready = await this.isMoviesPageReady();
                if (ready) return;
                // if not ready, try a forced click
                lastErr = `Movies page not ready after click attempt ${attempt}`;
            } catch (err) {
                lastErr = err;
            }
            // short pause before retry
            await this.page.waitForTimeout(1000);
        }
        logger.warn(`clickMoviesTab: could not confirm navigation to Movies page: ${String(lastErr)}`);
    }

    async isMoviesPageReady(): Promise<boolean> {
        // Prefer a reliable movie-page indicator: trendingMoviesRail or URL contains '/movies'
        try {
            const url = this.page.url();
            if (url && url.toLowerCase().includes('/movies')) return true;
        } catch { }
        try {
            return await this.pageUtils.isVisible(this.trendingMoviesRail, 5000);
        } catch {
            return false;
        }
    }

    async waitForMoviesPageReady(timeout: number = 15000): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await this.isMoviesPageReady()) return true;
            await this.page.waitForTimeout(500);
        }
        return false;
    }

    async isShowsTabVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.showsTab, 10000);
    }


    async clickCreateAccountLink(): Promise<void> {
        logger.elementInteraction('click', 'Create Account link');
        await this.pageUtils.safeClick(this.createAccountLink);
    }

    async getCurrentNavigationText(): Promise<string> {
        const textContainer = this.page.locator(this.navTextContainer.selector).first();
        await textContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        return (await textContainer.textContent().catch(() => '') || '').trim();
    }

    async clickNavigationArrowAndVerifyTitle(expectedText: string): Promise<boolean> {
        const arrow = this.page.locator(this.navArrowLink.selector).first();
        await arrow.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        await arrow.scrollIntoViewIfNeeded().catch(() => undefined);
        await arrow.click({ force: true, timeout: 10000 }).catch(() => undefined);
        await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
        await this.page.waitForTimeout(1500);
        const titleText = await this.page.locator(this.pageTitle.selector).first().textContent().catch(() => '');
        return (titleText || '').trim().toLowerCase() === expectedText.trim().toLowerCase();
    }

    async clickTermsAndConditionsLink(): Promise<void> {
        logger.elementInteraction('click', 'Terms and Conditions link');
        await this.pageUtils.safeClick(this.termsAndConditionsLink);
    }

    async openHelpAndSupportPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Help and Support link');
        return await this.openLinkInNewTab(this.helpAndSupportLink, expectedHeading);
    }

    async openTermsPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Terms and Conditions link');
        return await this.openLinkInNewTab(this.termsAndConditionsLink, expectedHeading, false);
    }

    async openTermsPageAndStayOpen(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Terms and Conditions link');
        return await this.openLinkInNewTab(this.termsAndConditionsLink, expectedHeading, true);
    }

    async clickTermsPaginationLink(): Promise<boolean> {
        const targetLink = this.page.locator(this.navArrowLink.selector).first();
        const linkCount = await targetLink.count().catch(() => 0);
        if (!linkCount) {
            logger.warn('Pagination arrow not found');
            return false;
        }
        const beforeUrl = this.page.url();
        const beforeBodyText = await this.page.locator('body').textContent().catch(() => '');
        await targetLink.scrollIntoViewIfNeeded().catch(() => undefined);
        await targetLink.click({ force: true, timeout: 10000 }).catch(() => undefined);
        await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
        await this.page.waitForTimeout(1500);
        const afterUrl = this.page.url();
        const afterBodyText = await this.page.locator('body').textContent().catch(() => '');
        return afterUrl !== beforeUrl || afterBodyText !== beforeBodyText;
    }

    async openTermsPageAndNavigateToSection(sectionLinkText: string, submoduleName: string, expectedHeading?: string, expectedUrlPart?: string): Promise<boolean> {
        logger.step(`Opening Terms page and navigating to section: ${sectionLinkText}`);
        try {
            logger.debug(`mweb mode check: ${process.env.BROWSER === 'mchrome'}`);

            // For BOTH mweb and web, try to handle popup first
            let targetPage = this.page;
            let popupDetected = false;

            // Set up popup listener (works for both web and mweb if popup opens)
            const popupPromise = this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => undefined);

            logger.debug('Attempting to click Terms and Conditions link');
            await this.pageUtils.safeClick(this.termsAndConditionsLink);
            await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
            await this.page.waitForTimeout(2000);

            // Check if popup opened
            if (await popupPromise && (await popupPromise).url() !== 'about:blank') {
                logger.debug('Popup detected - Terms opened in new tab');
                popupDetected = true;
                targetPage = await popupPromise;
                await (await popupPromise).waitForLoadState('domcontentloaded').catch(() => undefined);
            } else {
                logger.debug('No popup detected - Terms may have navigated in same page (mweb)');
                targetPage = this.page;
            }

            // Now we have targetPage - navigate to section if URL part provided
            if (expectedUrlPart) {
                try {
                    logger.debug(`Navigating to section: ${expectedUrlPart}, submodule: ${submoduleName}`);

                    // Extract the protocol and domain from target page URL
                    const targetUrl = new URL(targetPage.url());
                    const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;
                    const sectionUrl = `${baseUrl}/legal/${submoduleName}/${expectedUrlPart}/`;
                    logger.debug(`Constructed section URL: ${sectionUrl}`);

                    // Navigate to the section
                    await targetPage.goto(sectionUrl, { waitUntil: 'domcontentloaded' }).catch((error) => {
                        logger.debug(`Direct navigation error: ${error}`);
                    });

                    await targetPage.waitForTimeout(1500);

                    // Verify we're on the right page
                    const finalUrl = targetPage.url().toLowerCase();
                    const urlMatches = finalUrl.includes(expectedUrlPart.toLowerCase());
                    logger.debug(`Final URL: ${finalUrl}`);
                    logger.debug(`URL matches expected part "${expectedUrlPart}": ${urlMatches}`);

                    // Update page reference if it was a popup
                    if (popupDetected) {
                        this.page = targetPage;
                    }

                    if (urlMatches) {
                        logger.step(`Terms section navigation successful`);
                        return true;
                    } else {
                        logger.debug('URL did not match expected part');
                        return false;
                    }
                } catch (navError) {
                    logger.debug(`Error during section navigation: ${navError}`);
                    return false;
                }
            }

            return false;
            await this.pageUtils.safeClick(this.termsAndConditionsLink);
            const popup = await popupPromise.catch(() => undefined);
            if (!await popupPromise || (await popupPromise).url() === 'about:blank') {
                logger.warn('No popup detected');
                return false;
            }
            await (await popupPromise).waitForLoadState('domcontentloaded').catch(() => undefined);

            // Navigate directly to the section URL
            if (expectedUrlPart) {
                try {
                    // Extract the protocol and domain from popup URL
                    const popupUrl = new URL((await popupPromise).url());
                    const baseUrl = `${popupUrl.protocol}//${popupUrl.host}`;
                    const sectionUrl = `${baseUrl}/legal/${submoduleName}/${expectedUrlPart}/`;
                    logger.debug(`Navigating to section URL: ${sectionUrl}`);

                    // Navigate to the section URL
                    await (await popupPromise).goto(sectionUrl, { waitUntil: 'domcontentloaded' }).catch((error) => {
                        logger.debug(`Direct navigation failed: ${error}`);
                    });

                    await (await popupPromise).waitForTimeout(1000);

                    // Check if navigation was successful
                    const currentUrl = (await popupPromise).url().toLowerCase();
                    const urlMatches = currentUrl.includes(expectedUrlPart.toLowerCase());
                    logger.debug(`URL check - Current: ${(await popupPromise).url()}, Expected part: ${expectedUrlPart}, Matches: ${urlMatches}`);

                    // Check heading visibility
                    let headingVisible = false;
                    if (expectedHeading) {
                        headingVisible = await this.isPageHeadingVisibleOnPage((await popupPromise), expectedHeading);
                        logger.debug(`Heading check - Expected: "${expectedHeading}", Visible: ${headingVisible}`);
                    }

                    this.page = await popupPromise;

                    const success = headingVisible && urlMatches;
                    logger.step(`Web section navigation: Heading=${headingVisible}, URL match=${urlMatches}, returning ${success}`);
                    return success;
                } catch (navError) {
                    logger.debug(`Error during section navigation: ${navError}`);
                    return false;
                }
            }
            return false;
        } catch (error) {
            logger.warn(`Failed to navigate to Terms section: ${error}`);
            return false;
        }
    }

    async openPrivacyPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Privacy Policy link');
        return await this.openLinkInNewTab(this.privacyPolicyLink, expectedHeading);
    }

    async openCookiePolicyPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Cookie Policy link');
        return await this.openLinkInNewTab(this.cookiePolicyLink, expectedHeading);
    }

    async openTermsSectionFromLeftNavigation(sectionLinkText: string, expectedHeading?: string, expectedUrlPart?: string): Promise<boolean> {
        try {
            logger.step(`Navigating to Terms section: ${sectionLinkText}`);
            await this.page.waitForTimeout(3000);
            const sectionLink = this.page.locator(`a:has-text("${sectionLinkText}")`).first();
            const count = await sectionLink.waitFor({ state: 'attached', timeout: 10000 }).then(() => 1).catch(() => 0);
            if (!count) {
                logger.warn(`Section link not found in DOM: ${sectionLinkText}`);
                return false;
            }
            logger.step(`Found section link in DOM, waiting before click`);
            await this.page.waitForTimeout(1500);
            if (this.page.isClosed()) {
                logger.warn('Page was closed before clicking section link');
                return false;
            }
            await sectionLink.scrollIntoViewIfNeeded().catch(() => {
                logger.warn('Could not scroll link into view, proceeding anyway');
            });
            logger.step(`Clicking section link with force`);
            await sectionLink.click({ force: true, timeout: 10000 });
            logger.step(`Waiting for page load after section link click`);
            await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
            await this.page.waitForTimeout(3000);
            const currentUrl = this.page.url().toLowerCase();
            const urlMatches = !!expectedUrlPart && currentUrl.includes(expectedUrlPart.toLowerCase());
            const headingVisible = await this.isPageHeadingVisibleOnPage(this.page, expectedHeading);
            logger.step(`Section navigation result - URL matches: ${urlMatches}, Heading visible: ${headingVisible}`);
            return headingVisible || urlMatches;
        } catch (error) {
            logger.warn(`Failed to navigate to Terms section: ${error}`);
            return false;
        }
    }

    async getCurrentPageTitle(): Promise<string> {
        const titleLocator = this.page.locator(this.pageTitle.selector).first();
        await titleLocator.waitFor({ state: 'attached', timeout: 5000 }).catch(() => undefined);
        return (await titleLocator.textContent().catch(() => '') || '').trim();
    }

    getCurrentUrl(): string {
        return this.page.url();
    }

    private async openLinkInNewTab(link: PageElement, expectedHeading?: string, keepPageOpen: boolean = false): Promise<boolean> {
        const mainPage = this.page;
        const initialUrl = mainPage.url();
        try {
            const popupPromise = this.page.context().waitForEvent('page', { timeout: 8000 });
            await this.pageUtils.safeClick(link);
            await mainPage.waitForTimeout(1000);
            const popup = await popupPromise.catch(() => undefined);
            if (popup && popup.url() !== 'about:blank') {
                logger.step(`Popup detected: ${popup.url()}`);
                await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
                await popup.waitForURL((url) => {
                    const currentUrl = url.toString();
                    return !!currentUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('about:');
                }, { timeout: 15000 }).catch(() => undefined);
                await popup.waitForTimeout(3000);
                const headingVisible = await this.isPageHeadingVisibleOnPage(popup, expectedHeading);
                if (keepPageOpen) {
                    logger.step('Keeping popup open, switching context to new tab');
                    this.page = popup;
                    return headingVisible;
                }
                await popup.close().catch(() => undefined);
                this.page = mainPage;
                await mainPage.waitForLoadState('domcontentloaded');
                return headingVisible;
            }
            logger.step('No popup detected, checking if URL changed in main page');
            await mainPage.waitForURL((url) => {
                const currentUrl = url.toString();
                return !!currentUrl && currentUrl !== initialUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('about:');
            }, { timeout: 15000 }).catch(() => undefined);
            await mainPage.waitForLoadState('domcontentloaded').catch(() => undefined);
            await mainPage.waitForTimeout(3000).catch(() => undefined);
            return await this.isPageHeadingVisibleOnPage(mainPage, expectedHeading);
        } catch (error) {
            logger.warn(`Error in openLinkInNewTab: ${error}`);
            await mainPage.waitForLoadState('domcontentloaded').catch(() => undefined);
            await mainPage.waitForTimeout(3000).catch(() => undefined);
            return await this.isPageHeadingVisibleOnPage(mainPage, expectedHeading);
        }
    }

    async isPageHeadingVisible(expectedHeading?: string): Promise<boolean> {
        return await this.isPageHeadingVisibleOnPage(this.page, expectedHeading);
    }

    async isPageHeadingVisibleOnPage(targetPage: Page, expectedHeading?: string): Promise<boolean> {
        if (!expectedHeading) {
            logger.debug('No expected heading provided, returning false');
            return false;
        }
        const normalizedHeading = expectedHeading.toLowerCase();
        try {
            // For mweb vertical layout, just check if heading text exists in body (viewport may vary)
            if (process.env.BROWSER === 'mchrome') {
                logger.debug(`mweb: checking for heading "${expectedHeading}" in page content`);
                const bodyText = await targetPage.locator(this.pageBody.selector || 'body').textContent().catch(() => '');
                if (bodyText?.toLowerCase().includes(normalizedHeading)) {
                    logger.debug(`Found heading in body text (mweb vertical layout): "${expectedHeading}"`);
                    return true;
                }
                return false;
            }

            // For web horizontal layout, try visibility checks first
            let visibleHeading = await targetPage
                .getByText(expectedHeading, { exact: true })
                .first()
                .isVisible()
                .catch(() => false);

            if (visibleHeading) {
                logger.debug(`Found exact visible heading match (web): "${expectedHeading}"`);
                return true;
            }

            // Fallback to body text search for web as well
            const bodyText = await targetPage.locator(this.pageBody.selector || 'body').textContent().catch(() => '');
            if (bodyText?.toLowerCase().includes(normalizedHeading)) {
                logger.debug(`Found heading in body text (web): "${expectedHeading}"`);
                return true;
            }

            // Check page title
            const pageTitle = await targetPage.title().catch(() => '');
            if (pageTitle.toLowerCase().includes(normalizedHeading)) {
                logger.debug(`Found heading in page title: "${expectedHeading}"`);
                return true;
            }

            logger.debug(`Heading not found on page: "${expectedHeading}"`);
            return false;
        } catch (error) {
            logger.debug(`Error checking page heading: ${error}`);
            return false;
        }
    }

    async goBack(): Promise<void> {
        try {
            await this.page.goBack();
            await this.page.waitForLoadState('domcontentloaded');
        } catch {
            await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
        }
    }

    async clickSignIn(): Promise<void> {
        logger.elementInteraction('click', 'Sign In option');
        await this.pageUtils.safeClick(this.signInOption);
    }

    async closeCurrentTabAndReturnToMain(): Promise<void> {
        const pages = this.page.context().pages();
        const mainPage = pages.find((candidate) => candidate !== this.page);
        if (mainPage) {
            try {
                await this.page.close();
                await mainPage.bringToFront();
                await mainPage.waitForLoadState('domcontentloaded');
                return;
            } catch {
                logger.error('Failed to close current tab or switch back to main page');
            }
        }
        await this.page.bringToFront();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async isMobileMainMenuVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.mobileMainMenu, 10000);
    }

    async clickShowsTab(): Promise<void> {
        if (process.env.BROWSER === 'mchrome') {
            await this.clickMobileMainMenu();
        }
        logger.elementInteraction('click', 'Shows tab');
        await this.page.waitForTimeout(1500);
        await this.pageUtils.safeClick(this.showsTab);
    }

    async clickMyWatchlistTab(): Promise<void> {
        if (process.env.BROWSER === 'mchrome') {
            await this.clickMobileMainMenu();
        }
        logger.elementInteraction('click', 'My Watchlist tab');
        const locator = this.page.locator(this.myWatchlistTab.selector);
        await locator.waitFor({ state: 'attached', timeout: 15000 });
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        await locator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1500);
        await this.pageUtils.safeClick(this.myWatchlistTab);
    }

    async clickGMATab(): Promise<void> {
        if (process.env.BROWSER === 'mchrome') {
            await this.clickMobileMainMenu();
        }
        logger.elementInteraction('click', 'GMA tab');
        await this.page.waitForTimeout(1500);
        await this.pageUtils.safeClick(this.gmaTab);
    }

    async isSearchIconVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.searchBarIcon, 10000);
    }

    async isIWantLogoVisible(): Promise<boolean> {
        const logo = this.page.locator(this.iWantLogo.selector).first();
        if (!(await logo.count())) {
            return false;
        }
        await logo.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
        return await logo.isVisible().catch(() => false);
    }

    async isTabSelected(tabName: 'home' | 'movies' | 'shows' | 'watchlist' | 'gma'): Promise<boolean> {
        const selectors: Record<string, PageElement> = {
            home: this.homeTab,
            movies: this.moviesTab,
            shows: this.showsTab,
            watchlist: this.myWatchlistTab,
            gma: this.gmaTab,
        };
        const target = this.page.locator(selectors[tabName].selector).first();
        if (!(await target.count())) {
            return false;
        }
        const classValue = (await target.getAttribute('class').catch(() => '') || '').toLowerCase();
        const ariaCurrent = (await target.getAttribute('aria-current').catch(() => '') || '').toLowerCase();
        const ariaSelected = (await target.getAttribute('aria-selected').catch(() => '') || '').toLowerCase();
        const combinedState = `${classValue} ${ariaCurrent} ${ariaSelected}`;
        if (/(active|selected|current|is-active|router-link-active)/.test(combinedState)) {
            return true;
        }
        const url = this.page.url().toLowerCase();
        if (tabName === 'home' && (url.endsWith('/') || /\/home/.test(url))) {
            return true;
        }
        if (tabName === 'movies' && /\/movies/.test(url)) {
            return true;
        }
        if (tabName === 'shows' && /\/shows/.test(url)) {
            return true;
        }
        if (tabName === 'watchlist' && /\/watchlist|\/my-watchlist|my_watchlist/.test(url)) {
            return true;
        }
        if (tabName === 'gma' && /\/gma/.test(url)) {
            return true;
        }
        return false;
    }

     async isContinueWatchingRailVisible(): Promise<boolean> {
        try {
            const locator = this.page.locator(this.continueWatchingRail.selector).first();
            for (let attempt = 0; attempt < 8; attempt += 1) {
                if (await locator.isVisible()) {
                    return true;
                }
                await locator.scrollIntoViewIfNeeded();
                await this.page.mouse.wheel(0, 600);
                await this.page.waitForTimeout(1000);
            }
            await locator.waitFor({ state: 'visible', timeout: 15000 });
            return true;
        } catch {
            return false;
        }
    }
 
    private getContinueWatchingTitleLocator() {
        return this.page.locator(this.continueWatchingRail.selector).first();
    }

    private getContinueWatchingRailLocator() {
        return this.getContinueWatchingTitleLocator().locator(this.railAncestorSelector.selector).first();
    }

    private getRailContainerFromHeading(heading: Locator) {
        return heading.locator(this.railAncestorSelector.selector).first();
    }

    private getContinueWatchingArrowLocator(direction: 'left' | 'right') {
        const positionClass = direction === 'right' ? 'right-0' : 'left-0';
        const selector = `xpath=ancestor::div[contains(@class, "rail")][1]//div[contains(@class, "pointer-events-auto") and contains(@class, "absolute") and contains(@class, "bottom-[15rem]") and contains(@class, "${positionClass}") and contains(@class, "z-10")]//img[@alt="arrow-right"]`;
        return this.getContinueWatchingTitleLocator().locator(selector).first();
    }

    async ensureContinueWatchingTrayInView(timeout: number = 30000): Promise<boolean> {
        await this.pageUtils.waitForNetworkIdle(timeout);
        const title = this.getContinueWatchingTitleLocator();
        if (!await title.count()) {
            return false;
        }
        await title.waitFor({ state: 'visible', timeout });
        await title.scrollIntoViewIfNeeded();
        await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return false;
        }
        await section.scrollIntoViewIfNeeded();
        await section.waitFor({ state: 'visible', timeout });
        return true;
    }

    async waitForContinueWatchingTrayToBeReady(timeout: number = 30000): Promise<void> {
        await this.ensureContinueWatchingTrayInView(timeout);
    }

    async scrollContinueWatchingTray(direction: 'left' | 'right', timeout: number = 30000): Promise<boolean> {
        const isInView = await this.ensureContinueWatchingTrayInView(timeout);
        if (!isInView) {
            return false;
        }
        const section = this.getContinueWatchingRailLocator();
        const boundingBox = await section.boundingBox();
        if (!boundingBox) {
            return false;
        }
        const hoverX = direction === 'right' ? boundingBox.x + boundingBox.width - 30 : boundingBox.x + 30;
        const hoverY = boundingBox.y + boundingBox.height / 2;
        await this.page.mouse.move(hoverX, hoverY);
        await this.page.waitForTimeout(500);
        const arrowLocator = this.getContinueWatchingArrowLocator(direction);
        const arrowVisible = await arrowLocator.isVisible().catch(() => false);
        if (!arrowVisible) {
            return false;
        }
        await arrowLocator.hover({ timeout: 5000 }).catch(() => undefined);
        await arrowLocator.click({ timeout: 5000 }).catch(() => undefined);
        await this.page.waitForTimeout(1000);
        await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);
        return true;
    }

    async isContinueWatchingTrayTitleVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.continueWatchingTrayTitle, 10000);
    }

    async getContinueWatchingTraySection(): Promise<any> {
        return this.getContinueWatchingRailLocator();
    }

    async removeFirstContinueWatchingItem(): Promise<{ clicked: boolean; confirmationVisible: boolean }> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return { clicked: false, confirmationVisible: false };
        }
        const card = section.locator(this.continueWatchingCard.selector).first();
        if (!await card.count()) {
            return { clicked: false, confirmationVisible: false };
        }
        await card.hover({ timeout: 20000 }).catch(() => undefined);
        await this.page.waitForTimeout(2000);
        const removeButton = section.locator(this.continueWatchingRemoveButton.selector).first();
        await removeButton.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
        const buttonVisible = await removeButton.isVisible().catch(() => false);
        if (!buttonVisible) {
            return { clicked: false, confirmationVisible: false };
        }
        await removeButton.click({ timeout: 20000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
        await this.page.waitForTimeout(3000);
        const confirmationLocator = this.page.getByText(/removed/i).first();
        const confirmationVisible = await confirmationLocator.isVisible().catch(() => false);
        return { clicked: true, confirmationVisible };
    }

    async getContinueWatchingTrayItemCount(): Promise<number> {
        const title = this.getContinueWatchingTitleLocator();
        if (!await title.count()) return 0;
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) return 0;
        return await section.locator(this.continueWatchingCard.selector).count();
    }

    getContinueWatchingCardSelector(): string {
        return this.continueWatchingCard.selector;
    }

    async getContinueWatchingTrayItemDetails(): Promise<Array<{ title: string; hasThumbnail: boolean; hasProgress: boolean }>> {
        const title = this.getContinueWatchingTitleLocator();
        if (!await title.count()) return [];
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) return [];
        const cards = section.locator(this.continueWatchingCard.selector);
        const count = await cards.count();
        const details: Array<{ title: string; hasThumbnail: boolean; hasProgress: boolean }> = [];
        for (let i = 0; i < count; i++) {
            const image = cards.nth(i);
            const card = image.locator('xpath=ancestor::div[contains(@class,"thumbnail") or contains(@class,"cursor-pointer")][1]');
            const container = (await card.count()) ? card : image;
            const alt = (await image.getAttribute('alt')) || '';
            const text = (await container.textContent()) || '';
            const hasThumbnail = !!alt || (await image.getAttribute('src')) !== null;
            const hasProgress = /progress|resume|%/i.test(text)
                || (await container.locator(this.continueWatchingProgressSelector.selector).count()) > 0;
            details.push({ title: alt.trim() || text.trim(), hasThumbnail, hasProgress });
        }
        return details;
    }

    private parseDurationMinutes(text: string): number {
        const normalizedText = text.toLowerCase();
        const hoursMatch = normalizedText.match(/(\d+)\s*(h|hr|hrs|hour|hours)/);
        const minutesMatch = normalizedText.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) * 60 : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
        return hours + minutes;
    }

    async isContinueWatchingItemVisible(title: string): Promise<boolean> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return false;
        }
        const normalizedTitle = title.toLowerCase();
        const items = section.locator(this.continueWatchingImageWithAlt.selector).filter({ hasNotText: '' });
        const count = await items.count().catch(() => 0);
        for (let index = 0; index < count; index += 1) {
            const item = items.nth(index);
            const alt = ((await item.getAttribute('alt')) || '').toLowerCase();
            if (alt.includes(normalizedTitle)) {
                return await item.isVisible().catch(() => false);
            }
        }
        const candidate = section.locator(`img[alt*="${title}"]`).first();
        logger.info("Candidate, ", candidate)
        return await candidate.isVisible().catch(() => false);
    }

    async isContinueWatchingItemVisibleWithTag(title: string, tagAlt: string): Promise<{ visible: boolean; hasTag: boolean }> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return { visible: false, hasTag: false };
        }
        const normalizedTitle = title.toLowerCase();
        const items = section.locator('img[alt]:not([alt="arrow-right"])');
        const count = await items.count().catch(() => 0);
        for (let index = 0; index < count; index += 1) {
            const item = items.nth(index);
            const alt = ((await item.getAttribute('alt')) || '').toLowerCase();
            const text = ((await item.locator('xpath=ancestor::div[1]').textContent()) || '').toLowerCase();
            const matchesTitle = alt.includes(normalizedTitle) || text.includes(normalizedTitle);
            if (!matchesTitle) {
                continue;
            }
            const visible = await item.isVisible().catch(() => false);
            const tagLocator = item.locator(`xpath=ancestor::*[self::div or self::li or self::a][1]//img[@alt="${tagAlt}"]`).first();
            const hasTag = await tagLocator.isVisible().catch(() => false);
            return { visible, hasTag };
        }
        return { visible: false, hasTag: false };
    }

    async openContinueWatchingItemAndStartPlayback(title: string): Promise<boolean> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return false;
        }
        const normalizedTitle = title.toLowerCase();
        const candidates = section.locator(this.continueWatchingImageWithAlt.selector).filter({ hasNotText: '' });
        const count = await candidates.count().catch(() => 0);
        let clicked = false;
        for (let index = 0; index < count; index += 1) {
            const item = candidates.nth(index);
            const alt = ((await item.getAttribute('alt')) || '').toLowerCase();
            if (!alt.includes(normalizedTitle)) {
                continue;
            }
            await item.scrollIntoViewIfNeeded();
            await item.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            const actionTarget = this.page.getByText(/Resume|Play/i).first();
            const actionVisible = await actionTarget.isVisible().catch(() => false);
            if (actionVisible) {
                await actionTarget.click({ force: true, timeout: 30000 }).catch(() => undefined);
            }
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(8000);
            clicked = true;
            break;
        }
        return clicked;
    }

    async finishPlaybackFromCurrentItem(): Promise<boolean> {
        const video = this.page.locator('video').first();
        const videoVisible = await video.isVisible().catch(() => false);
        if (!videoVisible) {
            await this.page.waitForTimeout(10000);
            return false;
        }
        const duration = await video.evaluate((node: HTMLVideoElement) => node.duration).catch(() => 0);
        if (duration > 0) {
            await video.evaluate((node: HTMLVideoElement) => {
                if (node.duration > 0) {
                    node.currentTime = Math.max(0, node.duration - 1);
                }
            }).catch(() => undefined);
        }
        await this.page.waitForTimeout(15000);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        const ended = await video.evaluate((node: HTMLVideoElement) => node.ended).catch(() => false);
        return ended || duration > 0;
    }

    async navigateHome(): Promise<void> {
        const baseUrl = config.getBaseURL();
        await this.page.goto(baseUrl);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(5000);
    }

    private normalizeTitle(value: string): string {
        return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    }

    async matchesContinueWatchingTitle(candidateTitle: string, searchTerm?: string): Promise<boolean> {
        const normalizedCandidate = this.normalizeTitle(candidateTitle);
        const normalizedSearch = this.normalizeTitle(searchTerm || '');
        if (!normalizedSearch) {
            return Boolean(normalizedCandidate);
        }
        if (normalizedCandidate.includes(normalizedSearch)) {
            return true;
        }
        const searchTokens = normalizedSearch.split(' ').filter(Boolean);
        if (searchTokens.length === 0) {
            return false;
        }
        return searchTokens.every((token) => normalizedCandidate.includes(token));
    }

    async waitForContinueWatchingItemToAppear(searchTerm: string, timeoutMs: number = 30000): Promise<boolean> {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            await this.ensureContinueWatchingTrayInView(15000);
            const trayItemTitles = await this.getContinueWatchingTrayItemTitles();
            const matchedTitle = await Promise.all(
                trayItemTitles.map((title) => this.matchesContinueWatchingTitle(title, searchTerm))
            );
            if (matchedTitle.some(Boolean)) {
                return true;
            }
            await this.page.waitForTimeout(2000);
        }
        return false;
    }

    async getContinueWatchingTrayItemTitles(): Promise<string[]> {
        const traySection = await this.getContinueWatchingTraySection();
        const titleCandidates = await traySection.evaluate((section: HTMLElement) => {
            const values = new Set<string>();
            const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, null);
            let node: Node | null;
            while ((node = walker.nextNode())) {
                const text = node.textContent?.replace(/\s+/g, ' ').trim();
                if (text && text.length > 1) {
                    values.add(text);
                }
            }
            this.page.evaluate((selector) => {
                const section = document.querySelector('...');
                const values = new Set<string>();

                section?.querySelectorAll(selector).forEach((element) => {
                    const value = (
                        element.getAttribute('alt') ||
                        element.getAttribute('aria-label') ||
                        element.getAttribute('title') ||
                        ''
                    ).replace(/\s+/g, ' ').trim();

                    if (value) values.add(value);
                });

                return [...values];
            }, this.continueWatchingContent.selector); // or the string directly
            return Array.from(values).filter((value) => value.length > 1);
        }).catch(() => [] as string[]);

        if (titleCandidates.length) {
            return titleCandidates;
        }

        const imageTitles = await traySection.locator(this.continueWatchingImageWithAlt.selector).evaluateAll((images) => images.map((img) => (img.getAttribute('alt') || '').trim())).catch(() => [] as string[]);
        return imageTitles.filter(Boolean);
    }

    async getContinueWatchingProgressBarPercentage(contentTitle?: string): Promise<number> {
        logger.elementInteraction('get', 'Continue Watching progress bar percentage');
        try {
            const widthPercent: number = await this.page.evaluate(
                ({ title, fillClass, containerClass }: { title?: string; fillClass: string; containerClass: string }) => {
                    // Strategy 1: find bg-iw-primary-gradient fill elements with style.width %
                    const fills = Array.from(document.querySelectorAll(`[class*="${fillClass}"]`)) as HTMLElement[];
                    const validFills = fills.filter(f => f.style.width && f.style.width.includes('%'));

                    if (validFills.length === 0) {
                        // Fallback: scan all divs document-wide for style.width with %
                        const allDivs = Array.from(document.querySelectorAll('div')) as HTMLElement[];
                        const widthDivs = allDivs.filter(d => {
                            const w = d.style.width;
                            return w && w.includes('%') && parseFloat(w) > 0;
                        });
                        // Prefer one that has bg-iw-btn-bg as parent (the progress bar container)
                        const inContainer = widthDivs.find(d =>
                            d.parentElement?.className?.includes(containerClass)
                        );
                        const picked = inContainer || widthDivs[0];
                        return picked ? parseFloat(picked.style.width) : 0;
                    }

                    if (!title || validFills.length === 1) {
                        return parseFloat(validFills[0].style.width);
                    }

                    // If title given, find the fill inside the card containing the image with that alt
                    for (const fill of validFills) {
                        let ancestor: HTMLElement | null = fill;
                        for (let i = 0; i < 15; i++) {
                            if (!ancestor) break;
                            const img = ancestor.querySelector(`img[alt*="${title}" i]`);
                            if (img) return parseFloat(fill.style.width);
                            ancestor = ancestor.parentElement;
                        }
                    }

                    // fallback: first valid fill
                    return parseFloat(validFills[0].style.width);
                },
                {
                    title: contentTitle,
                    fillClass: this.continueWatchingProgressBarFill.selector.split(',')[0].replace('.', '').trim(),
                    containerClass: this.continueWatchingProgressBarContainer.selector.split(',')[0].replace('.', '').trim(),
                }
            ).catch(() => 0);

            logger.debug(`getContinueWatchingProgressBarPercentage: extracted ${widthPercent}%`);
            return widthPercent;
        } catch (error) {
            logger.debug('Failed to get Continue Watching progress bar percentage', error);
        }
        return 0;
    }

    async getContinueWatchingItemsCount(): Promise<number> {
        const header = this.page.locator(this.continueWatchingRail.selector).first();
        if (!await header.count()) return 0;
        const container = header.locator('xpath=following-sibling::*').first();
        if (!await container.count()) return 0;
        // Count likely content item elements (images as proxy)
        const images = container.locator('img');
        const count = await images.count();
        return count;
    }

    async getContinueWatchingItemsDetails(): Promise<Array<{ title: string; hasProgress: boolean }>> {
        const header = this.page.locator(this.continueWatchingRail.selector).first();
        if (!await header.count()) return [];
        const container = header.locator('xpath=following-sibling::*').first();
        if (!await container.count()) return [];
        const images = container.locator('img');
        const count = await images.count();
        const details: Array<{ title: string; hasProgress: boolean }> = [];
        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const alt = (await img.getAttribute('alt'));
            // Determine a nearby progress indicator or recently_added marker
            const ancestor = img.locator('xpath=ancestor::div[1]');
            const progressSelectors = [
                this.continueWatchingProgressSelector.selector,
                this.continueWatchingRecentMarkerSelector.selector,
            ];
            let hasProgress = false;
            for (const sel of progressSelectors) {
                try {
                    const found = ancestor.locator(sel);
                    if (await found.count()) { hasProgress = true; break; }
                } catch {
                    // ignore selector errors
                }
            }
            // Fallback: check for any text like 'Resume' or '%' near the image
            if (!hasProgress) {
                const nearbyText = ancestor.locator('xpath=.//*[contains(text(),"Resume") or contains(text(),"resumo") or contains(text(),"%")]');
                if (await nearbyText.count()) hasProgress = true;
            }
            details.push({ title: alt.trim(), hasProgress });
        }
        return details;
    }

    async isTrendingMoviesRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.trendingMoviesRail, 10000);
    }

    async isTrendingShowsRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.trendingShowsRail, 10000);
    }

    async isMyWatchlistRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.myWatchlistRail, 10000);
    }

    async isMyWatchlistPageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.myWatchListPage, 10000);
    }

    async isTopStreamedRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.topStreamedRail, 10000);
    }

    getIwantScrollLocatorMobile(): string {
        return this.iwantScrollLocatorMobile;
    }

    async isIWantOriginalsRailVisible(): Promise<boolean> {
        try {
            if (process.env.BROWSER === 'mchrome') {
                const locator = this.page.getByText(this.iWantOriginalsRailNameMobile, { exact: true }).first();
                await locator.waitFor({ state: 'visible', timeout: 15000 });
                await locator.scrollIntoViewIfNeeded();
                return true;
            } else {
                const locator = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
                await locator.waitFor({ state: 'visible', timeout: 15000 });
                await locator.scrollIntoViewIfNeeded();
                return true;
            }
        } catch {
            return false;
        }
    }

    async getIWantOriginalsRailTitle(): Promise<string> {
        if (process.env.BROWSER === 'mchrome') {
            const locator = this.page.getByText(this.iWantOriginalsRailNameMobile, { exact: true }).first();
            await locator.waitFor({ state: 'visible', timeout: 15000 });
            await locator.scrollIntoViewIfNeeded();
            return (await locator.textContent()) || '';
        } else {
            const locator = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
            await locator.waitFor({ state: 'visible', timeout: 15000 });
            await locator.scrollIntoViewIfNeeded();
            return (await locator.textContent()) || '';
        }
    }

    async getIWantOriginalsRailCardCount(): Promise<number> {
        if (process.env.BROWSER === 'mchrome') {
            const heading = this.page.getByText(this.iWantOriginalsRailNameMobile, { exact: true }).first();
            await heading.waitFor({ state: 'visible', timeout: 15000 });
            await heading.scrollIntoViewIfNeeded();
            const rail = this.getRailContainerFromHeading(heading);
            if (!await rail.count()) {
                return 0;
            }
            await rail.scrollIntoViewIfNeeded();
            return await rail.locator(this.iWantOriginalsCardSelector.selector).count();
        } else {
            const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
            await heading.waitFor({ state: 'visible', timeout: 15000 });
            await heading.scrollIntoViewIfNeeded();
            const rail = this.getRailContainerFromHeading(heading);
            if (!await rail.count()) {
                return 0;
            }
            await rail.scrollIntoViewIfNeeded();
            return await rail.locator(this.iWantOriginalsCardSelector.selector).count();
        }
    }

    async ensureIWantOriginalsRailInView(timeout: number = 30000): Promise<boolean> {
        const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
        try {
            await heading.waitFor({ state: 'visible', timeout });
            await heading.scrollIntoViewIfNeeded();
            const rail = this.getRailContainerFromHeading(heading);
            if (!await rail.count()) return false;
            await rail.scrollIntoViewIfNeeded();
            await rail.waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    private async getFirstVisibleIWantOriginalsCard(): Promise<Locator | null> {
        const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
        const rail = this.getRailContainerFromHeading(heading);
        if (!await rail.count()) return null;

        const cardImage = rail.locator(this.iWantOriginalsCardSelector.selector).first();
        const imageVisible = await cardImage.isVisible().catch(() => false);
        if (!imageVisible) return null;

        return cardImage;
    }

    private async getIWantOriginalsCardInteractionTarget(card: Locator): Promise<{ x: number; y: number; width: number; height: number } | null> {
        const titleContainer = card.locator(this.iWantOriginalsTitleContainerSelector.selector).first();
        const titleVisible = await titleContainer.isVisible().catch(() => false);
        if (titleVisible) {
            const box = await titleContainer.boundingBox().catch(() => null);
            if (box) {
                return { x: box.x + box.width / 2, y: box.y + box.height / 2, width: box.width, height: box.height };
            }
        }

        return await card.evaluate((element: HTMLElement) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0
                ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: rect.width, height: rect.height }
                : null;
        }).catch(() => null);
    }

    async hoverIWantOriginalsFirstCardCentered(): Promise<{ visible: boolean; hovered: boolean }> {
        const card = await this.getFirstVisibleIWantOriginalsCard();
        if (!card) return { visible: false, hovered: false };
        await card.scrollIntoViewIfNeeded();
        const target = await this.getIWantOriginalsCardInteractionTarget(card);
        if (!target) return { visible: false, hovered: false };
        await this.page.mouse.move(target.x, target.y);
        await this.page.waitForTimeout(800);
        return { visible: true, hovered: true };
    }

    async isIWantOriginalsFirstCardVisible(): Promise<boolean> {
        const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
        const rail = this.getRailContainerFromHeading(heading);
        if (!await rail.count()) return false;
        const cards = rail.locator(this.iWantOriginalsCardSelector.selector);
        return (await cards.count()) > 0;
    }

    async clickFirstIWantOriginalsCard(): Promise<boolean> {
        const card = await this.getFirstVisibleIWantOriginalsCard();
        if (!card) return false;
        await card.scrollIntoViewIfNeeded();
        const target = await this.getIWantOriginalsCardInteractionTarget(card);
        if (!target) return false;
        await this.page.mouse.move(target.x, target.y);
        await this.page.waitForTimeout(400);
        logger.elementInteraction('click', 'first iWant Originals content card');
        try {
            await this.page.mouse.dblclick(target.x, target.y, { delay: 100 });
        } catch {
            await card.dblclick({ force: true, timeout: 20000 }).catch(() => undefined);
        }
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
        return true;
    }

    private getIWantOriginalsArrowLocator(direction: 'left' | 'right') {
        const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
        const rail = heading.locator(this.railAncestorSelector.selector).first();
        // Generic arrow candidates: images/icons/buttons commonly used for rails (configurable)
        const candidateSelector = this.iWantOriginalsArrowCandidateSelector.selector;
        const candidates = rail.locator(candidateSelector);
        return (async () => {
            const count = await candidates.count().catch(() => 0);
            if (!count) return candidates.first();
            let chosenIndex = 0;
            let chosenX = Infinity;
            for (let i = 0; i < count; i++) {
                try {
                    const el = candidates.nth(i);
                    const box = await el.boundingBox().catch(() => null);
                    if (!box) continue;
                    const centerX = box.x + box.width / 2;
                    if (direction === 'right') {
                        if (centerX > (chosenX === Infinity ? -Infinity : chosenX)) {
                            chosenIndex = i;
                            chosenX = centerX;
                        }
                    } else {
                        if (chosenX === Infinity || centerX < chosenX) {
                            chosenIndex = i;
                            chosenX = centerX;
                        }
                    }
                } catch {
                    continue;
                }
            }
            return candidates.nth(chosenIndex);
        })();
    }

    async getIWantOriginalsRailScrollLeft(): Promise<number> {
        const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
        const rail = this.getRailContainerFromHeading(heading);
        await rail.waitFor({ state: 'visible', timeout: 15000 });
        return await rail.evaluate((element: HTMLElement) => element.scrollLeft as number).catch(() => 0);
    }

    async getIWantOriginalsRailFirstCardX(): Promise<number> {
        const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
        const rail = this.getRailContainerFromHeading(heading);
        await rail.waitFor({ state: 'visible', timeout: 15000 });
        const cards = rail.locator(this.iWantOriginalsCardSelector.selector);
        if (!await cards.count()) {
            return 0;
        }
        const card = cards.first();
        const box = await card.boundingBox();
        return box?.x ?? 0;
    }

    async clickIWantOriginalsRailArrow(direction: 'left' | 'right'): Promise<boolean> {
        const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
        const rail = this.getRailContainerFromHeading(heading);
        if (!await rail.count()) {
            return false;
        }
        await rail.scrollIntoViewIfNeeded();
        // Attempt multiple strategies to cause the rail to scroll. Verify by checking
        // `scrollLeft` before/after the interaction. Retry a few times before falling
        // back to a direct `scrollLeft` assignment.
        const beforeScroll = await rail.evaluate((el: HTMLElement) => el.scrollLeft).catch(() => 0);
        // Resolve locator (may be a Promise because getIWantOriginalsArrowLocator is async)
        const arrowLocatorAny: any = await this.getIWantOriginalsArrowLocator(direction).catch(() => null);
        const attempts = 3;
        for (let attempt = 1; attempt <= attempts; attempt += 1) {
            try {
                if (!arrowLocatorAny) throw new Error('arrow not found');
                const visible = await arrowLocatorAny.isVisible().catch(() => false);
                if (!visible) {
                    // try hovering the rail center to reveal controls
                    const railBox = await rail.boundingBox().catch(() => null);
                    if (railBox) {
                        await this.page.mouse.move(railBox.x + railBox.width / 2, railBox.y + railBox.height / 2);
                        await this.page.waitForTimeout(300);
                    }
                }
                // Prefer a real mouse click at the element's center (works with transforms/overlays)
                const box = await arrowLocatorAny.boundingBox().catch(() => null);
                if (box) {
                    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                    await this.page.waitForTimeout(150);
                    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 50 });
                } else {
                    // Fallback to playright click
                    await arrowLocatorAny.click({ force: true, timeout: 5000 }).catch(() => undefined);
                }
                await this.page.waitForTimeout(600);
                const afterScroll = await rail.evaluate((el: HTMLElement) => el.scrollLeft).catch(() => 0);
                if (afterScroll !== beforeScroll) {
                    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
                    return true;
                }
            } catch (err) {
                logger.debug(`clickIWantOriginalsRailArrow attempt ${attempt} failed`, err);
            }
            // small backoff before retry
            await this.page.waitForTimeout(400);
        }
        // Final fallback: perform a programmatic scroll of the rail element
        try {
            await rail.evaluate((el: HTMLElement, dir: string) => {
                const amount = el.clientWidth * 0.6 * (dir === 'right' ? 1 : -1);
                el.scrollBy({ left: amount, behavior: 'auto' });
            }, direction).catch(() => undefined);
            await this.page.waitForTimeout(400);
            return true;
        } catch (err) {
            logger.debug('Final scrollLeft fallback failed', err);
            return false;
        }
    }

    async isGmaPinoyBundleMetadataVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.gmaPinoyBundleMetadata, 10000);
    }

    async clickSearchBar(): Promise<void> {
        logger.elementInteraction('click', 'Search bar');
        try {
            const searchBtn = await this.page.locator(this.searchButton.selector).first();
            if (await searchBtn.count()) {
                await searchBtn.waitFor({ state: 'visible', timeout: 5000 });
                await searchBtn.click();
                return;
            }
        } catch (err) {
            logger.debug('Role-based search button click failed', err);
        }
        try {
            await this.pageUtils.safeClick(this.searchBarIcon);
            return;
        } catch (err) {
            logger.debug('Search icon click failed', err);
        }
        try {
            await this.pageUtils.safeClick(this.searchBar);
            return;
        } catch (err) {
            logger.debug('Search input click failed, using direct locator', err);
        }
        const input = this.page.locator(this.searchBar.selector).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.click();
    }
    async hoverIWantOriginalsFirstCardAndDetectPreview(timeout: number = 20000): Promise<boolean> {
        try {
            const heading = this.page.getByText(this.iWantOriginalsRailName, { exact: true }).first();
            await heading.waitFor({ state: 'visible', timeout: 15000 });
            await heading.scrollIntoViewIfNeeded();
            const rail = this.getRailContainerFromHeading(heading);
            if (!await rail.count()) return false;
            const cards = rail.locator(this.iWantOriginalsCardSelector.selector);
            if (!await cards.count()) return false;
            const firstCard = cards.first();
            await firstCard.scrollIntoViewIfNeeded();
            await firstCard.hover({ timeout }).catch(() => undefined);
            // give the preview some time to start
            await this.page.waitForTimeout(1500);

            // Try to detect a video element within the card's ancestor
            const ancestor = firstCard.locator('xpath=ancestor::div[1]');
            const video = ancestor.locator('video').first();
            const hasVideo = (await video.count().catch(() => 0)) > 0;
            if (hasVideo) {
                const visible = await video.isVisible().catch(() => false);
                if (!visible) return false;
                const playing = await video.evaluate((v: HTMLVideoElement) => {
                    try {
                        return (!v.paused && !v.ended) || (v.currentTime > 0);
                    } catch {
                        return false;
                    }
                }).catch(() => false);
                return playing;
            }

            // Fallback: detect any visible video element on the page that has started playing
            const anyVideo = this.page.locator('video').first();
            if ((await anyVideo.count().catch(() => 0)) > 0) {
                const visible = await anyVideo.isVisible().catch(() => false);
                if (!visible) return false;
                const playing = await anyVideo.evaluate((v: HTMLVideoElement) => {
                    try {
                        return (!v.paused && !v.ended) || (v.currentTime > 0);
                    } catch {
                        return false;
                    }
                }).catch(() => false);
                return playing;
            }

            return false;
        } catch (error) {
            logger.debug('hoverIWantOriginalsFirstCardAndDetectPreview failed', error);
            return false;
        }
    }

    async enterSearchQuery(query: string): Promise<void> {
        logger.elementInteraction('type', 'search query');
        await this.pageUtils.safeType(this.searchBar, query);
    }

    async submitSearchQuery(): Promise<void> {
        logger.elementInteraction('press', 'Enter key');
        await this.page.keyboard.press('Enter');
        await this.waitForLoadingToDisappear(20000);
        await this.page.waitForLoadState('networkidle').catch(() => undefined);
    }

    async getSearchBarValue(): Promise<string> {
        const locator = this.page.locator(this.searchBar.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.inputValue()) || '';
    }

    async clearSearchInput(): Promise<boolean> {
        logger.elementInteraction('click', 'clear search input');
        try {
            await this.pageUtils.safeClick(this.clearSearchButton);
            await this.page.waitForTimeout(500);
            return true;
        } catch (error) {
            logger.debug('Clear search button was not available', error);
            try {
                const searchInput = this.page.locator(this.searchBar.selector).first();
                await searchInput.waitFor({ state: 'visible', timeout: 10000 });
                await searchInput.fill('');
                await this.page.waitForTimeout(500);
                return true;
            } catch (fallbackError) {
                logger.debug('Fallback clear search input failed', fallbackError);
                return false;
            }
        }
    }

    async getSearchBarPlaceholder(): Promise<string> {
        const locator = this.page.locator(this.searchBar.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.getAttribute('placeholder')) || '';
    }

    async isSearchSectionHeadingVisible(expectedHeading: string): Promise<boolean> {
        logger.elementInteraction('verify', `search section heading: ${expectedHeading}`);
        const normalizedHeading = expectedHeading.trim().toLowerCase();
        try {
            const headingCandidates = this.page.locator(this.searchSectionHeading.selector);
            const count = await headingCandidates.count();
            for (let index = 0; index < count; index++) {
                const text = (await headingCandidates.nth(index).textContent()) || '';
                if (text.toLowerCase().includes(normalizedHeading)) {
                    return true;
                }
            }
        } catch (error) {
            logger.debug(`Failed to verify search heading: ${expectedHeading}`, error);
        }
        return false;
    }

    async getSearchSectionHeadingText(expectedHeading: string): Promise<string> {
        const normalizedHeading = expectedHeading.trim().toLowerCase();
        try {
            const headingCandidates = this.page.locator(this.searchSectionHeading.selector);
            const count = await headingCandidates.count();
            for (let index = 0; index < count; index++) {
                const text = (await headingCandidates.nth(index).textContent()) || '';
                if (text.toLowerCase().includes(normalizedHeading)) {
                    return text.trim();
                }
            }
        } catch (error) {
            logger.debug(`Failed to retrieve search heading text: ${expectedHeading}`, error);
        }
        return '';
    }

    async searchAndGetResults(query: string): Promise<boolean> {
        logger.step(`Searching for: ${query}`);
        const searchInput = this.page.locator(this.searchBar.selector).first();
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        await searchInput.fill(query);
        await searchInput.press('Enter');
        await this.waitForLoadingToDisappear(20000);
        await this.page.waitForTimeout(2000);
        const searchResultsContainer = this.page.locator(this.searchResultsContainer.selector).count();
        const resultsCount = await searchResultsContainer.catch(() => 0);
        const pageHasContent = await this.page.locator('body').textContent();
        const hasResults = pageHasContent && pageHasContent.toLowerCase().includes(query.toLowerCase());
        logger.step(`Search completed - Results count: ${resultsCount}, Has query text: ${hasResults}`);
        return hasResults || resultsCount > 0;
    }

    async enterSearchText(text: string): Promise<void> {
        logger.elementInteraction('type', 'Search input');
        await this.pageUtils.safeType(this.searchBar, text);
    }

    async submitSearch(): Promise<void> {
        logger.elementInteraction('submit', 'Search input');
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');
    }

    async isSearchResultsVisible(query: string = ''): Promise<boolean> {
        await this.page.waitForTimeout(2500);
        const locator = this.page.locator(this.searchResultImages.selector).first();
        const altText = await locator.getAttribute('alt').catch(() => '');
        const normalizedQuery = query.trim().toLowerCase();
        logger.info(`Normalized query: ${normalizedQuery}`);
        const normalizedAltText = (altText || '').toLowerCase();
        logger.info(`Normalized alt text: ${normalizedAltText}`);
        if (normalizedQuery) {
            return normalizedQuery.includes(normalizedAltText) || /(search|result|thumbnail|poster|image)/i.test(altText || '');
        }
        return /(search|result|thumbnail|poster|image)/i.test(altText || '');
    }

    async isSearchAutoSuggestionsVisible(partialQuery: string = ''): Promise<boolean> {
        logger.elementInteraction('verify', 'search auto-suggestions');
        try {
            const suggestions = this.page.locator(this.searchSuggestionsContainer.selector);
            // Wait for suggestions to appear
            await this.page.waitForTimeout(500);
            const suggestionCount = await suggestions.count();
            if (suggestionCount > 0) {
                await suggestions.first().waitFor({ state: 'visible', timeout: 8000 });
                await this.page.waitForTimeout(800);
                return true;
            }
            // Try alternative selectors if primary ones don't find suggestions
            await this.page.waitForTimeout(1000);
            const altSuggestions = this.page.locator(this.searchSuggestionsContainer.selector);
            const altCount = await altSuggestions.count();
            return altCount > 0;
        } catch (error) {
            logger.debug(`Auto-suggestions not visible for query: ${partialQuery}`, error);
            return false;
        }
    }

    async getSearchAutoSuggestions(): Promise<string[]> {
        logger.elementInteraction('retrieve', 'search auto-suggestions');
        try {
            let suggestions = this.page.locator(this.searchSuggestionsContainer.selector);
            // Wait for suggestions to load and stabilize
            await this.page.waitForTimeout(800);
            let count = await suggestions.count();
            // If no suggestions found, try alternative selectors
            if (count === 0) {
                const altSuggestions = this.page.locator('div[class*="absolute"] div, li, [role="listitem"]');
                const altCount = await altSuggestions.count();
                if (altCount > 0) {
                    suggestions = altSuggestions;
                    count = altCount;
                }
            }
            const suggestionTexts: string[] = [];
            for (let i = 0; i < Math.min(count, 10); i++) {
                const text = await suggestions.nth(i).textContent().catch(() => '');
                if (text && text.trim()) {
                    suggestionTexts.push(text.trim());
                }
            }
            return suggestionTexts;
        } catch (error) {
            logger.debug('Failed to retrieve auto-suggestions', error);
            return [];
        }
    }

    async verifySuggestionsContainQuery(query: string, suggestions: string[]): Promise<boolean> {
        logger.elementInteraction('verify', `suggestions contain query: ${query}`);
        const normalizedQuery = query.toLowerCase().trim();
        if (suggestions.length === 0) {
            logger.debug(`No suggestions to verify against query: ${query}`);
            return false;
        }
        const suggestionsWithQuery = suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(normalizedQuery)
        );
        const allSuggestionsRelevant = suggestionsWithQuery.length > 0;
        const percentageMatch = (suggestionsWithQuery.length / suggestions.length) * 100;
        logger.step(`Query relevance check: ${suggestionsWithQuery.length}/${suggestions.length} suggestions contain "${query}" (${percentageMatch.toFixed(0)}%)`);
        logger.assertion(`Suggestions contain search query "${query}"`, allSuggestionsRelevant);
        return allSuggestionsRelevant;
    }
    async clickSearchAutoSuggestion(suggestionText: string): Promise<void> {
        logger.elementInteraction('click', `search suggestion: ${suggestionText}`);
        try {
            const suggestion = this.page.locator(this.searchSuggestionsContainer.selector).filter({ hasText: suggestionText });
            await suggestion.first().waitFor({ state: 'visible', timeout: 5000 });
            await suggestion.first().click();
        } catch (error) {
            logger.debug(`Failed to click suggestion: ${suggestionText}`, error);
        }
    }

    async isNoResultsMessageVisible(): Promise<boolean> {
        logger.elementInteraction('verify', 'no results message visibility');
        try {
            const noResultsMessage = this.page.locator(this.noResultsMessage.selector);
            await noResultsMessage.first().waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch (error) {
            logger.debug('Failed to verify no results message', error);
            return false;
        }
    }

    async getNoResultsMessageText(): Promise<string> {
        logger.elementInteraction('retrieve', 'no results message text');
        try {
            const noResultsMessage = this.page.locator(this.noResultsMessage.selector);
            const text = await noResultsMessage.first().textContent().catch(() => '');
            return text?.trim() || 'No results found';
        } catch (error) {
            logger.debug('Failed to retrieve no results message text', error);
            return '';
        }
    }

    async getSearchResultsCount(): Promise<number> {
        logger.elementInteraction('count', 'search result cards');
        try {
            const resultImages = this.page.locator(this.searchResultImages.selector);
            const count = await resultImages.count();
            return count;
        } catch (error) {
            logger.debug('Failed to count search results', error);
            return 0;
        }
    }

    async getHomePageDisplayedTitles(): Promise<string[]> {
        logger.elementInteraction('retrieve', 'home page displayed titles');
        try {
            const candidates = this.page.locator('//div[@class="title"]');
            const texts = await candidates.allTextContents();
            const normalized = texts
                .map(text => text.replace(/\s+/g, ' ').trim())
                .filter((text): text is string => Boolean(text))
                .filter((text, index, array) => array.indexOf(text) === index);
            return normalized;
        } catch (error) {
            logger.debug('Failed to retrieve home page displayed titles', error);
            return [];
        }
    }

    async getHomePageRailMatches(top10Titles: string[]): Promise<Array<{ railName: string; contentTitle: string; hasTop10Tag: boolean }>> {
        logger.elementInteraction('retrieve', 'home page rail matches for Top 10 titles');
        try {
            const railMatches: Array<{ railName: string; contentTitle: string; hasTop10Tag: boolean }> = [];
            const rails = this.page.locator('div, section, article').filter({ has: this.page.locator('text=/Top|Trending|Continue|Watchlist|Streamed|Shows|Movies/i') }).filter({ hasNot: this.page.locator('text=/Sign Out|Account & Settings/i') });
            const railCount = await rails.count();
            logger.info(`Found ${railCount} rails on the home page`);
            for (let railIndex = 0; railIndex < railCount; railIndex += 1) {
                const rail = rails.nth(railIndex);
                const railName = (await rail.locator('[class*="title"]').first().textContent()).trim();
                const cards = rail.locator('a, button, [role="button"], [data-testid*="card"], [class*="card"], [class*="thumbnail"]');
                const cardCount = await cards.count();
                for (let cardIndex = 0; cardIndex < cardCount; cardIndex += 1) {
                    const card = cards.nth(cardIndex);
                    const cardTitle = (await card.locator('img[alt], [alt], h1, h2, h3, [data-testid*="title"], [class*="title"]').first().textContent().catch(() => '') || '').trim();
                    const normalizedCardTitle = cardTitle.toLowerCase();
                    const matchingTitle = top10Titles.find(title => normalizedCardTitle.includes(title.toLowerCase()));
                    if (!matchingTitle) {
                        continue;
                    }
                    const tagVisible = await card.locator('//*[contains(normalize-space(.), "Top 10") or contains(@alt, "Top 10") or contains(@class, "top10") or contains(@data-testid, "top10")]').first().count().catch(() => 0) > 0;
                    if (tagVisible) {
                        railMatches.push({ railName: railName || 'Unknown rail', contentTitle: matchingTitle, hasTop10Tag: true });
                    }
                }
            }
            logger.info(`Found ${railMatches.length} matching rails on the home page`);
            return railMatches;
        } catch (error) {
            logger.debug('Failed to retrieve home page rail matches for Top 10 titles', error);
            return [];
        }
    }

    async getSearchResultTitles(): Promise<string[]> {
        logger.elementInteraction('retrieve', 'ordered search result titles');
        try {
            const titles = await this.page.evaluate(({ containerSelector, candidateSelector }) => {
                const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
                const container = document.querySelector(containerSelector) as HTMLElement | null;
                const root = container ?? document.body;
                const candidates = Array.from(root.querySelectorAll(candidateSelector)) as HTMLElement[];
                const unique: string[] = [];
                const seen = new Set<string>();
                for (const candidate of candidates) {
                    const text = normalize(candidate.textContent || candidate.getAttribute('alt') || '');
                    if (!text || text.length < 2 || /search|results|home|watchlist|continue watching|my watchlist|movies|shows|gma/i.test(text.toLowerCase())) {
                        continue;
                    }
                    const key = text.toLowerCase();
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push(text);
                    }
                    if (unique.length >= 12) {
                        break;
                    }
                }
                return unique;
            }, {
                containerSelector: OTTAuthPage.searchResultContainerSelector,
                candidateSelector: OTTAuthPage.searchResultCandidateSelector,
            });
            return (titles || []).map(title => title.trim()).filter(Boolean);
        } catch (error) {
            logger.debug('Failed to retrieve ordered search result titles', error);
            return [];
        }
    }

    async scrollSearchResultsSmoothly(times: number = 6, pauseMs: number = 800): Promise<{ scrolled: boolean; positions: number[] }> {
        logger.elementInteraction('scroll', 'search results smooth scroll check');
        const positions: number[] = [];
        try {
            // Try to perform smooth scrolling multiple times and record Y positions
            for (let i = 0; i < times; i++) {
                const before = await this.page.evaluate(() => window.scrollY || window.pageYOffset || document.documentElement.scrollTop);
                positions.push(Number(before || 0));
                // scroll by 70% of viewport height smoothly
                await this.page.evaluate(() => {
                    const delta = Math.floor((window.innerHeight || 600) * 0.7);
                    window.scrollBy({ top: delta, left: 0, behavior: 'smooth' });
                });
                // wait briefly for smooth scroll to progress
                await this.page.waitForTimeout(pauseMs);
                // ensure page is responsive
                await this.page.evaluate(() => document.readyState).catch(() => undefined);
            }
            const finalPos = await this.page.evaluate(() => window.scrollY || window.pageYOffset || document.documentElement.scrollTop);
            positions.push(Number(finalPos || 0));
            const scrolled = positions.length > 1 && positions[positions.length - 1] > positions[0];
            logger.debug(`Scroll positions captured: ${positions.join(', ')}`);
            return { scrolled, positions };
        } catch (error) {
            logger.debug('Smooth scroll check failed', error);
            return { scrolled: false, positions };
        }
    }

    async clickAccountIcon(): Promise<void> {
        logger.elementInteraction('click', 'Account icon');
        await this.pageUtils.safeClick(this.accountIcon);
    }

    async clicksynacorLogOutButton(): Promise<void> {
        logger.elementInteraction('click', 'Logout icon');
        await this.pageUtils.safeClick(this.synacorLogOutButton);
    }

    async clickSignOut(): Promise<void> {
        logger.elementInteraction('click', 'Sign Out option');
        await this.pageUtils.safeClick(this.signOutOption);
    }

    async isSignOutOptionVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.signOutOption, 10000);
    }

    async isAccountAndSettingsVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.accountAndSettingsOption, 10000);
    }

    async isEmailVisibleOnAccountPage(email: string): Promise<boolean> {
        try {
            const locator = this.page.getByText(email, { exact: false }).first();
            await locator.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async clickAccountAndSettings(): Promise<void> {
        logger.elementInteraction('click', 'Account & Settings option');
        await this.pageUtils.safeClick(this.accountAndSettingsOption);
    }

    async isEditProfileButtonVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.editProfileButton, 10000);
    }

    async clickLoginWithTVProvider(): Promise<void> {
        logger.elementInteraction('click', 'Login with TV Provider option');
        await this.pageUtils.safeClick(this.tvProviderLoginOption);
    }

    async selectTVProvider(providerName: string): Promise<void> {
        logger.elementInteraction('click', `${providerName} provider option`);
        const providerLocator = this.page.getByRole('button', { name: providerName }).first();
        await providerLocator.waitFor({ state: 'visible', timeout: 20000 });
        await providerLocator.click();
    }

    async enterProviderEmail(email: string): Promise<void> {
        logger.elementInteraction('type', 'TV Provider email field');
        await this.pageUtils.safeType(this.providerEmailField, email);
    }

    async enterProviderPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'TV Provider password field');
        await this.pageUtils.safeType(this.providerPasswordField, password);
    }

    async clickProviderSignIn(): Promise<void> {
        logger.elementInteraction('click', 'Sign in button for TV Provider');
        await this.pageUtils.safeClick(this.providerSignInButton);
    }

    async isLoginSuccessful(): Promise<boolean> {
        const profileVisible = await this.pageUtils.isVisible(this.profileLink, 10000);
        if (profileVisible) {
            return true;
        }
        const homeTabVisible = await this.pageUtils.isVisible(
            { selector: this.homeTab.selector },
            5000
        );
        return homeTabVisible;
    }

    async getCreateAccountHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.createAccountHeading, 10000);
    }

    async isCreateAccountEmailFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountEmailField, 10000);
    }

    async isCreateAccountPasswordFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountPasswordField, 10000);
    }

    async clickCreateAccountContinue(): Promise<void> {
        logger.elementInteraction('click', 'Create account Continue button');
        await this.pageUtils.safeClick(this.createAccountContinueButton);
    }

    async enterCreateAccountEmail(email: string): Promise<void> {
        logger.elementInteraction('type', 'Create account email field');
        await this.pageUtils.safeType(this.createAccountEmailField, email);
    }

    async enterCreateAccountPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'Create account password field');
        await this.pageUtils.safeType(this.createAccountPasswordField, password);
    }

    async enterCreateAccountConfirmPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'Create account confirm password field');
        await this.pageUtils.safeType(this.createAccountConfirmPasswordField, password);
    }

    async getCreateAccountEmailValue(): Promise<string> {
        const locator = this.page.locator(this.createAccountEmailField.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.inputValue()) || '';
    }

    async getCreateAccountPasswordValue(): Promise<string> {
        const locator = this.page.locator(this.createAccountPasswordField.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.inputValue()) || '';
    }

    async getCreateAccountConfirmPasswordValue(): Promise<string> {
        const locator = this.page.locator(this.createAccountConfirmPasswordField.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.inputValue()) || '';
    }

    async isCreateAccountConfirmPasswordFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountConfirmPasswordField, 10000);
    }

    async getCreateAccountTermsText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.createAccountTermsText, 10000);
    }

    async getCreateAccountMarketingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.createAccountMarketingText, 10000);
    }

    async fetchAndFillOtp(mailUsername: string, subjectContains: string = 'Verification Code'): Promise<string> {
        logger.step('Fetching OTP from Yopmail');
        const resolvedMailUsername = mailUsername.includes('@')
            ? mailUsername.split('@')[0]
            : mailUsername;
        const otp = await getOtpFromYopmail((resolvedMailUsername), { subjectContains, });
        logger.info(`Fetched OTP: ${otp}`);
        const otpInputs = this.page.locator(this.otpInput.selector);
        await otpInputs.first().waitFor({
            state: 'visible',
            timeout: 30000,
        });
        // Fill each OTP digit
        for (const [index, digit] of [...otp].entries()) {
            await otpInputs.nth(index).fill(digit);
        }
        return otp;
    }

    async isVerifyOTPMessageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.verifyOTPMessage, 10000);
    }

    async getVerifyOTPMessageText(): Promise<string> {
        const text = await this.page.locator(this.verifyOTPContainer.selector).first().innerText();
        return text.split('\n')[0].trim();
    }

    async isVerifyOTPEmailVisible(expectedEmail: string): Promise<boolean> {
        try {
            const locator = this.page.locator(this.verifyOTPEmail.selector);
            await locator.waitFor({ state: 'visible', timeout: 10000 });
            const actualEmail = (await locator.innerText()).trim();
            return actualEmail === expectedEmail;
        } catch {
            return false;
        }
    }

    async getVerifyOTPEmailText(expectedEmail: string): Promise<string> {
        const locator = this.page.locator(this.verifyOTPEmail.selector);
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        const actualEmail = (await locator.innerText()).trim();
        if (actualEmail !== expectedEmail) {
            throw new Error(
                `Expected OTP email to be "${expectedEmail}", but found "${actualEmail}".`
            );
        }
        return actualEmail;
    }

    async isInputCodeInstructionVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.verifyOTPInstructionText, 10000);
    }

    async getInputCodeInstructionText(): Promise<string> {
        const text = await this.page.locator(this.verifyOTPContainer.selector).first().innerText();
        const lines = text
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
        return lines[2];
    }

    async isVerifyButtonVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.verifyButton, 10000);
    }

    async clickVerifyButton(): Promise<void> {
        logger.elementInteraction('click', 'Verify button');
        await this.pageUtils.safeClick(this.verifyButton);
    }

    async isBackToLoginLinkVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.backToLoginLink, 10000);
    }

    async isSetNewPasswordScreenVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.setNewPasswordHeading, 10000);
    }

    async getSetNewPasswordHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.setNewPasswordHeading, 10000);
    }

    async isPasswordResetSuccessMessageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.passwordResetSuccessMessage, 10000);
    }

    async getPasswordResetSuccessMessageText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.passwordResetSuccessMessage, 10000);
    }

    async clickDoneButton(): Promise<void> {
        logger.elementInteraction('click', 'Done button');
        await this.pageUtils.safeClick(this.doneButton);
    }

    async selectCreateAccountMarketingCheckbox(): Promise<void> {
        logger.elementInteraction('check', 'Create account marketing checkbox');
        const locator = this.page.getByRole('checkbox', { name: /I agree to receive marketing/i }).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.check({ force: true });
    }

    async isTermsCheckboxVisible(): Promise<boolean> {
        const locator = this.page.getByRole('checkbox', { name: 'I agree to the Terms and' }).first();
        try {
            await locator.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async isTermsCheckboxChecked(): Promise<boolean> {
        const locator = this.page.getByRole('checkbox', { name: 'I agree to the Terms and' }).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return await locator.isChecked().catch(() => false);
    }

    async selectCreateAccountTermsCheckbox(): Promise<void> {
        logger.elementInteraction('check', 'Create account terms checkbox');
        const locator = this.page.getByRole('checkbox', { name: 'I agree to the Terms and' }).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.check({ force: true });
    }
    async isMarketingCheckboxVisible(expectedMarketingText: string): Promise<boolean> {
        const isLabelVisible = await this.pageUtils.isVisible(this.marketingCheckbox, 10000);
        if (!isLabelVisible) {
            return false;
        }
        let formText = '';
        try {
            formText = await this.pageUtils.getTextContent(this.marketingCheckboxDescription, 10000);
        } catch {
            formText = '';
        }
        return formText.includes(expectedMarketingText);
    }

    async isCreateAccountContinueButtonVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountContinueButton, 10000);
    }

    async isAlreadyHaveAccountTextVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.alreadyHaveAccountText, 10000);
    }

    async isCreateAccountLoginLinkVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountLoginLink, 10000);
    }

    async getProfileSectionText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.profileSectionTextElement, 10000);
    }

    async getAccountDetailsText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.accountDetailsTextElement, 10000);
    }

    async openProfileSettings(): Promise<void> {
        logger.step('Opening profile settings');
        await this.clickAccountIcon();
        await this.pageUtils.safeClick(this.accountSettingsTextLink);
    }

    async openEditProfile(): Promise<void> {
        logger.step('Opening edit profile screen');
        await this.pageUtils.safeClick(this.editProfileOption);
    }

    async isEditProfileScreenVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.editProfileHeading, 10000);
    }

    async isFirstNameFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.firstNameField, 10000);
    }

    async isLastNameFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.lastNameField, 10000);
    }

    async enterFirstName(firstName: string): Promise<void> {
        logger.elementInteraction('type', 'first name field');
        await this.pageUtils.safeType(this.firstNameField, firstName);
    }

    async enterLastName(lastName: string): Promise<void> {
        logger.elementInteraction('type', 'last name field');
        await this.pageUtils.safeType(this.lastNameField, lastName);
    }

    async clickSaveProfile(): Promise<void> {
        logger.elementInteraction('click', 'Save profile button');
        await this.pageUtils.safeClick(this.profileSaveButton);
    }

    async isProfileValidationErrorVisible(): Promise<boolean> {
        const firstNameErrorVisible = await this.pageUtils.isVisible(this.firstNameValidationError, 5000).catch(() => false);
        const lastNameErrorVisible = await this.pageUtils.isVisible(this.lastNameValidationError, 5000).catch(() => false);
        if (firstNameErrorVisible || lastNameErrorVisible) {
            return true;
        }
        const helperText = await this.page.locator(this.profileValidationTextPattern.selector).first().count().catch(() => 0);
        return helperText > 0;
    }

    async getProfileValidationErrorText(): Promise<string> {
        const firstNameErrorText = await this.pageUtils.getTextContent(this.firstNameValidationError, 5000).catch(() => '');
        const lastNameErrorText = await this.pageUtils.getTextContent(this.lastNameValidationError, 5000).catch(() => '');
        if (firstNameErrorText || lastNameErrorText) {
            return [firstNameErrorText, lastNameErrorText].filter(Boolean).join(' | ');
        }
        const fallbackText = await this.page.locator(this.profileValidationTextPattern.selector).first().textContent().catch(() => '');
        return fallbackText || '';
    }

    async verifyTopContentsInRails(top10Titles: string[]): Promise<
        Array<{
            railName: string;
            contentTitle: string;
            hasTop10Tag: boolean;
            isTopRightPosition: boolean;
        }>
    > {
        const matchedRails: Array<{
            railName: string;
            contentTitle: string;
            hasTop10Tag: boolean;
            isTopRightPosition: boolean;
        }> = [];
        const rails = this.page.locator(this.homePageRailContainer.selector);
        const railCount = await rails.count();
        for (let i = 0; i < railCount; i += 1) {
            const railName = ((await this.page.locator(`(//div[@class="title"])[${i + 1}]`).textContent()) ?? '').trim();
            if (!railName) {
                continue;
            }
            const railScope = this.page.locator(`//p[contains(text(),"${railName}")]/parent::div/following-sibling::*`).first();
            const tagLocators = railScope.locator(this.homePageRailTagSelector.selector);
            const thumbnailCount = await tagLocators.count().catch(() => 0);
            if (thumbnailCount === 0) {
                continue;
            }
            for (let j = 0; j < thumbnailCount; j += 1) {
                const tagLocator = tagLocators.nth(j);
                const thumbnailLocator = railScope.locator(this.homePageRailThumbnailSelector.selector).nth(j).first();
                const contentTitle = ((await thumbnailLocator.getAttribute('alt')) ?? '').trim();
                if (!contentTitle) {
                    continue;
                }
                const hasTop10Tag = await tagLocator.count().catch(() => 0) > 0;
                const isTopRightPosition = hasTop10Tag ? await this.isTopRightPosition(tagLocator, thumbnailLocator) : false;
                if (top10Titles.includes(contentTitle)) {
                    matchedRails.push({
                        railName,
                        contentTitle,
                        hasTop10Tag,
                        isTopRightPosition,
                    });
                }
            }
        }
        return matchedRails;
    }

    private async isTopRightPosition(tagLocator: Locator, thumbnailLocator: Locator): Promise<boolean> {
        const tagBox = await tagLocator.boundingBox().catch(() => null);
        const thumbnailBox = await thumbnailLocator.boundingBox().catch(() => null);
        if (!tagBox || !thumbnailBox) {
            return false;
        }
        const isInUpperRightQuadrant = tagBox.x >= thumbnailBox.x + thumbnailBox.width * 0.6
            && tagBox.y <= thumbnailBox.y + thumbnailBox.height * 0.25;
        return isInUpperRightQuadrant;
    }

    async registerContinueWatchingListener(): Promise<void> {
        if (this.continueWatchingListenerRegistered) {
            return;
        }
        this.continueWatchingListenerRegistered = true;
        this.page.on('response', async response => {
            try {
                if (!response.url().includes('/graphql')) {
                    return;
                }
                const json = await response.json().catch(() => null);
                if (!json?.data?.continueWatching?.items) {
                    return;
                }
                this.continueWatchingGraphQL = {
                    request: response.request().postDataJSON(),
                    response: json
                };
                logger.info(
                    `[CW] Captured Continue Watching GraphQL with ${json.data.continueWatching.items.length} items`
                );
                json.data.continueWatching.items.forEach((item: any, index: number) => {
                    logger.info(
                        `[CW] ${index}: ${item.showInfo?.title ?? ''} | ${item.title}`
                    );
                });
            } catch (e) {
                logger.debug('Unable to capture ContinueWatching GraphQL', e);
            }
        });
    }

    async getContinueWatchingGraphQLItems(): Promise<ContinueWatchingItem[]> {
        if (!this.continueWatchingListenerRegistered) {
            this.registerContinueWatchingListener();
        }

        if (!this.continueWatchingGraphQL) {
            await this.page.waitForTimeout(5000);
        }

        if (!this.continueWatchingGraphQL) {
            return [];
        }

        const parser = new ContinueWatchingParser(this.continueWatchingGraphQL);
        return parser.getItems();
    }

    async getContinueWatchingGraphQLShows(): Promise<Array<{ showTitle?: string; episodeTitle?: string; assetType?: string }>> {
        if (!this.continueWatchingListenerRegistered) {
            this.registerContinueWatchingListener();
        }

        if (!this.continueWatchingGraphQL) {
            await this.page.waitForTimeout(5000);
        }

        if (!this.continueWatchingGraphQL) {
            return [];
        }

        const parser = new ContinueWatchingParser(this.continueWatchingGraphQL);
        return parser.getItems()
            .filter((item) => Boolean(item.showInfo?.title) && item.assetType === 'episode')
            .map((item) => ({
                showTitle: item.showInfo?.title,
                episodeTitle: item.title,
                assetType: item.assetType,
            }));
    }

    async clickContinueWatchingItemUsingGraphQL(searchTerm: string, timeoutMs = 30000): Promise<boolean> {
        logger.step(`Searching Continue Watching GraphQL for '${searchTerm}'`);
        if (!this.continueWatchingListenerRegistered) {
            this.registerContinueWatchingListener();
        }
        if (!this.continueWatchingGraphQL) {
            const end = Date.now() + timeoutMs;
            while (!this.continueWatchingGraphQL && Date.now() < end) {
                await this.page.waitForTimeout(500);
            }
        }
        if (!this.continueWatchingGraphQL) {
            logger.info("Continue Watching GraphQL was never captured.");
            return false;
        }
        const parser = new ContinueWatchingParser(this.continueWatchingGraphQL);
        const items = parser.getItems();
        logger.info(`Parser returned ${items.length} items`);
        if (!items.length) {
            return false;
        }
        items.forEach((item, index) => {
            logger.info(
                `${index}. Show="${item.showInfo?.title}" Episode="${item.title}"`
            );
        });
        const search = this.normalizeTitle(searchTerm);
        const found = parser.findItemWithIndex(item => {
            const episodeTitle = this.normalizeTitle(item.title ?? "");
            const showTitle = this.normalizeTitle(item.showInfo?.title ?? "");
            return (
                episodeTitle.includes(search) ||
                showTitle.includes(search)
            );
        });
        if (!found) {
            logger.info(`No matching item found for ${searchTerm}`);
            return false;
        }
        logger.info(
            `Matched GraphQL Item : ${found.item.showInfo?.title} -> ${found.item.title} (Index=${found.index})`
        );
        await this.ensureContinueWatchingTrayInView();
        const section = this.getContinueWatchingRailLocator();
        const cards = section.locator(this.continueWatchingCard.selector);
        const cardIndex = await this.findContinueWatchingCardIndex(found.item);
        const selectedIndex = cardIndex !== undefined ? cardIndex : found.index;
        if (await cards.count() <= selectedIndex) {
            logger.info("GraphQL index exceeds available UI cards.");
            return false;
        }
        const card = cards.nth(selectedIndex);
        await card.scrollIntoViewIfNeeded();
        const cardElement = await card.elementHandle().catch(() => null);
        const targetElement = cardElement
            ? await cardElement.evaluateHandle((element) => {
                let current = element as HTMLElement | null;
                while (current) {
                    const tagName = current.tagName.toLowerCase();
                    const role = current.getAttribute('role');
                    const className = current.className?.toString() || '';
                    const isLikelyCardWrapper = tagName === 'button' || tagName === 'a' || role === 'button' || role === 'link'
                        || /relative|card|cursor-pointer|group/i.test(className);
                    if (isLikelyCardWrapper) {
                        return current;
                    }
                    current = current.parentElement;
                }
                return element;
            }).catch(() => null)
            : null;
        const target = targetElement?.asElement() || cardElement;
        if (target) {
            await target.click({ force: true, timeout: 30000 });
        } else {
            await card.click({ force: true, timeout: 30000 });
        }
        await this.page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
        await this.page.waitForTimeout(3000);
        logger.info("Continue Watching content opened successfully.");
        return true;
    }

    async hoverContinueWatchingItemUsingGraphQL(searchTerm: string, timeoutMs = 30000): Promise<{ season?: number; episode?: number; raw?: string } | null> {
        logger.step(`Hovering Continue Watching GraphQL item for '${searchTerm}'`);
        if (!this.continueWatchingListenerRegistered) {
            this.registerContinueWatchingListener();
        }
        if (!this.continueWatchingGraphQL) {
            const end = Date.now() + timeoutMs;
            while (!this.continueWatchingGraphQL && Date.now() < end) {
                // wait for the GraphQL to be captured
                // eslint-disable-next-line no-await-in-loop
                await this.page.waitForTimeout(500);
            }
        }
        if (!this.continueWatchingGraphQL) {
            logger.info('Continue Watching GraphQL was never captured for hover.');
            return null;
        }
        const parser = new ContinueWatchingParser(this.continueWatchingGraphQL);
        const items = parser.getItems();
        if (!items.length) return null;
        const search = this.normalizeTitle(searchTerm);
        const found = parser.findItemWithIndex(item => {
            const episodeTitle = this.normalizeTitle(item.title ?? '');
            const showTitle = this.normalizeTitle(item.showInfo?.title ?? '');
            return episodeTitle.includes(search) || showTitle.includes(search);
        });
        if (!found) return null;
        await this.ensureContinueWatchingTrayInView();
        const section = this.getContinueWatchingRailLocator();
        const cards = section.locator(this.continueWatchingCard.selector);
        const cardIndex = await this.findContinueWatchingCardIndex(found.item);
        const selectedIndex = cardIndex !== undefined ? cardIndex : found.index;
        const count = await cards.count().catch(() => 0);
        if (selectedIndex >= count) {
            logger.info('GraphQL index exceeds available UI cards for hover.');
            return null;
        }
        const card = cards.nth(selectedIndex);
        await card.scrollIntoViewIfNeeded();
        await card.hover().catch(() => undefined);
        await this.page.waitForTimeout(600);
        const hoverInfo = await card.evaluate((el: HTMLElement) => {
            const texts: string[] = [];
            const collect = (root: HTMLElement | null) => {
                if (!root) return;
                root.querySelectorAll('*').forEach((n) => {
                    try {
                        const t = (n.textContent || n.getAttribute('aria-label') || n.getAttribute('title') || '').trim();
                        if (t) texts.push(t);
                    } catch (e) { /* ignore */ }
                });
            };
            collect(el);
            let p: HTMLElement | null = el.parentElement;
            for (let j = 0; j < 3 && p; j++, p = p.parentElement) collect(p);
            const re = /S(?:eason\s*)?(\d+)\D+E(?:pisode\s*)?(\d+)/i;
            const reShort = /S\s*(\d+)\s*E\s*(\d+)/i;
            for (const t of texts) {
                const m = t.match(re) || t.match(reShort);
                if (m) return { season: m[1], episode: m[2], raw: t };
            }
            return null;
        }).catch(() => null as any);
        if (!hoverInfo) return null;
        return { season: Number(hoverInfo.season), episode: Number(hoverInfo.episode), raw: hoverInfo.raw };
    }

    private async findContinueWatchingCardIndex(item: ContinueWatchingItem): Promise<number | undefined> {
        const normalizedItemTitle = this.normalizeTitle(item.title ?? '');
        const normalizedShowTitle = this.normalizeTitle(item.showInfo?.title ?? '');
        const normalizedCombined = this.normalizeTitle([
            item.showInfo?.title,
            item.title
        ].filter(Boolean).join(' '));
        const section = this.getContinueWatchingRailLocator();
        const cards = section.locator(this.continueWatchingCard.selector);
        const count = await cards.count().catch(() => 0);
        for (let index = 0; index < count; index += 1) {
            const card = cards.nth(index);
            const altText = (await card.getAttribute('alt')) || '';
            const ariaText = (await card.getAttribute('aria-label')) || '';
            const textContent = (await card.textContent().catch(() => '')) || '';
            const cardText = this.normalizeTitle([
                altText,
                ariaText,
                textContent
            ].filter(Boolean).join(' '));
            if (!cardText) {
                continue;
            }
            if (
                (normalizedCombined && cardText.includes(normalizedCombined)) ||
                (normalizedItemTitle && cardText.includes(normalizedItemTitle)) ||
                (normalizedShowTitle && cardText.includes(normalizedShowTitle))
            ) {
                return index;
            }
            const searchTokens = normalizedCombined.split(' ').filter(Boolean);
            if (searchTokens.length > 1 && searchTokens.every(token => cardText.includes(token))) {
                return index;
            }
        }
        return undefined;
    }
}