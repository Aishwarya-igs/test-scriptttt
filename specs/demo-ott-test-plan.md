# OTT Home Page Navigation Test Plan

## Application Overview

This test plan covers validation of application launch behavior for the OTT platform. The objective is to verify that users can successfully access the application URL and are navigated to the Home page after application initialization.

## Test Scenarios

### 1. Happy Path - Home Page Launch Validation
**Seed:** `tests/seed.spec.ts`

#### 10.1. IW3-T1859: Verify the message displayed on entering invalid credentials during login.
**File:** `tests/home/login-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   3. Click on Email field
   4. Enter invalid email as "abcd@gmail.com" in email field.
   5. Click on Password field
   6. Enter invalid password as "Hello@123" in password field
   7. Tap on "Continue" button.
      * expect "Your login credentials are incorrect" error message     should be displayed. 

#### 10.2. IW3-T1860 Verify the navigation on tapping "Forgot Password?" option.
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. User should be navigated to "Forgot Password?" screen.
      * expect "Confirm Email Address" page should be displayed

#### 10.3. IW3-T1861 Verify the navigation on entering "Email" and tapping on "Proceed" button on the "Forgot Password?" screen.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. Enter the "Email Address" in Email Address field.
   6. Tap on "Proceed" CTA and observe.
   7. User should be navigated to "Verify OTP" screen.

#### 10.4. IW3-T1869 Verify the UI/UX of the "Welcome to iWant" screen for PH region.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
      * expect "Welcome to iWant" and "Home of Filipino Feels" should be displayed
      * expect "Email" field should be displayed.
      * expect "Password" field should be displayed.
      * expect "Continue" button should be displayed.
      * expect "Login with Facebook" button should be displayed.
      * expect "Login with TV Provider" button should be displayed.
   4. Scroll down 
      * expect "New here?" link should be displayed.
      * expect "Create Account" link should be displayed.

#### 10.5. IW3-T1880 Verify smooth navigation between Home, Shows, Movies, GMA, Search, and Profile icons.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. When user is on "Home" tab
      * expect "Continue Watching" rail should be displayed
   6. When user is on "Movies" tab
      * expect "Trending Movies Worldwide" rail should be displayed
   7. When user is on "Shows" tab
      * expect "Trending Shows Worldwide" rail should be displayed
   8. When user is on "My Watchlist" tab
      * expect "My Watchlist" rail should be displayed
   9. When user is on "GMA" tab
      * expect "Top Streamed" rail should be displayed
   10. Click on Search bar
      * expect the search bar should display inner text as "Search by title, actor, genre..."
   11.  Click on Account icon
      * expect "Sign Out" option should be displayed

### 10.6. IW3-T1867 Verify the "Login with TV Provider" functionality.
**File:** `tests/home/landing-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Click on "Login with TV Provider" option
   5. Select the Frontier from available options and Click on Continue
   6. Input the TV Provider credentials (Ex: ftrfios1@frontier.com/Frontier1)
   6. Click on "Continue" CTA.
      * User should be successfully landed on the "Home" screen.

### 20.1. IW3-T4703 Verify that the “Top 10” tag is displayed on the content thumbnail when Top 10 rail content appears in other rails.
**File:** `tests/home/landing-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Return a 10 contents title from Top 10 Shows from collection graphQL API.
      * except : Print 10 contents name in the below format
         (Ex : Top 10 Shows Content 1 : returned 1st value, Print all 10 values in this format)
      * except : Check UI of entire home page, wherever these content appears in any rail Print rail name along with Content displayed in that rail.
         (Ex: Rail Name : Content Name)

### 20.2. IW3-T4704 Verify that "Top 10" tag displayed on the content thumbnail at the top right corner.
**File:** `tests/home/landing-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Observe the "Top 10" tag appears on the content thumbnail
      * except : The “Top 10” tag should be displayed clearly on the top-right corner of the
      content thumbnail.

 
### 10.7. IW3-T1865 Verify the mobile number login functionality.
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Click on "Click here to use mobile number" link.
   5. Select the country code as "63"
   6. Enter the mobile number and password (Ex: 63| 9178039002/Password123!)
   7. Click on "Continue" CTA.
      *expect:* User should be able to login with mobile number and navigated to "Home" screen.

### 10.8. IW3-T4332 Verify that **Welcome to iWant**, **Terms and Conditions**, **Cookie Policy**, and **Privacy Policy** pages are displayed when the user taps their respective links
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Help and Support** link.  
      *expect:* User should be navigated to the **Welcome to iWant / Help and Support** page and the **page title** should be validated.
   6. Navigate back to the previous page.
   7. Tap the **Terms and Conditions** link.  
      *expect:* User should be navigated to the **Terms and Conditions** page and the **page title** should be validated.
   8. Navigate back to the previous page.
   9. Tap the **Privacy Policy** link.  
      *expect:* User should be navigated to the **Privacy Policy** page and the **page title** should be validated.
   10. Navigate back to the previous page.
   11. Tap the **Cookie Policy** link.  
      *expect:* User should be navigated to the **Cookie Policy** page and the **page title** should be validated.
   12. Verify that each link consistently opens the correct page and that the user can return to the previous page after viewing it.  
      *expect:* The **Welcome to iWant / Help and Support**, **Terms and Conditions**, **Privacy Policy**, and **Cookie Policy** pages should be displayed successfully, and the **page title** should match the expected title for each page.

### 10.9. IW3-T4333 Verify that the user can navigate to any section from the left navigation menu on the **Terms and Conditions** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.  
      *expect:* User should be navigated to the **Terms and Conditions** page and the **page title** should be validated.
   6. Tap on **iWant Terms and Conditions** button from the left navigation menu 
      *expect* link **For customers in the Philippines** should be diaplayed 
   7. Tap on **Customers in the Philippines** link
      *expect* **Customers in the Philippines** text should be displayed

### 10.10. IW3-T4334 Verify that the corresponding page details are displayed when the user taps any link from the **Terms and Conditions** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL.
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.  
      *expect:* User should be navigated to the **Terms and Conditions** page.
   6. Tap any link from the left navigation menu (e.g., **The Data We Collect About You**).
   7. Verify that the corresponding section is displayed.  
      *expect:* The page should navigate to the selected section, and the corresponding details should be displayed correctly.
   8. Verify that the selected navigation link consistently displays the correct content.  
      *expect:* The respective **Terms and Conditions** section and its details should be displayed successfully.

### 10.11. IW3-T4337 Verify that the user is able to search any page via the search field from the **Terms and Conditions** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL.
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.  
   *expect:* User should be navigated to the **Terms and Conditions** page.
   6. Tap the **Search Documentation** search field displayed at the top-right corner.
   7. Enter a search query (e.g., **For the customers in the Philippines**).
   8. Verify that the corresponding search results are displayed.  
   *expect:* Search results relevant to the entered query should be displayed successfully.
   9. Verify that the user is able to search for any page using the search field.  
   *expect:* The user should be able to search any page via the search field, and the corresponding results should be displayed correctly.

### 10.12. IW3-T4339 Verify that the respective page is displayed when the user taps any link in the **Introduction** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   3. Click on Email field
   4. Enter valid email as "abhilash584@gmail.com" in email field.
   5. Click on Password field
   6. Enter valid password as "Test1234" in password field
   7. Tap on "Continue" button.
   8. Tap on "Shows" option from home page.
   9. Click on the first content from first rail
   *expect User should navigate to the respective content Details Page
   *expect validate the details page
 
 ### 1.9. IW3-T1865 Verify the mobile number login functionality.
 
**File:** ``tests/home/home-page-launch.spec.ts`
 
**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Click here to use mobile number" link.
5. Select the country code as "63"
6. Enter the mobile number and password (Ex: 63| 9178039002/Password123!)
7. Click on "Continue" CTA.
   *expect : User should be able to login with mobile number and navigated to "Home" screen.
 
### 1.10. IW3-T1871 Verify the content starts playing on tapping the "Play" button for a free asset.

**File:** `tests/home/home-page.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with free user credentials.
5. Click on any free movie or show displayed on the homepage.
6. Click on the "Play" button.
7. Observe the playback screen for 10s.
   * expect the content should start playing successfully on tapping the "Play" button.

### 1.11. IW3-T1931 Verify the Continue Watching tray for the loggedin user who has not watched any content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** User should not have watched any content.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page after successful login.
6. Observe the available content trays on the Home page.
   * **Expect** The **"Continue Watching"** tray **should not be displayed** for a logged-in user with no watch history.

### 1.12. IW3-T1960 Verify that movie content gets removed from CW tray post completely watching the same content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have partially watched a movie so that it appears in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Using **continue watching** graphQL API get movie from continue watching tray.
    - Save the content name such that it can be used for validation.
7. Select and navigate to content details page.
7. Click the **Play** button to resume playback.
8. Drag the seek bar until end.
9. Return to the **Home** page and refresh the page
10. Osbserve the **Continue Watching** tray.
   - **Expect:** Once the movie has been watched completely, it should be removed from the **Continue Watching** tray using **continue watching** graphQL API.

### 1.13. IW3-T2025 Verify the message displayed when user try to play premium content.

**File:** `tests/playback/subscription.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to any **premium** movie or show.
5. Click the **Play** button to attempt playback.
6. Observe the player screen.
   - **Expect** A subscription prompt should be displayed with the message:
     > **"A valid subscription is required to view this content. Please subscribe or renew your plan."**
   - **Expect** The following action buttons should be displayed:
     - **"Maybe Later"**
     - **"Subscribe to Watch"**

### 1.14. IW3-T2010 Verify that the pause and resume buttons function correctly during live playback.

**File:** `tests/home/playback.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Live TV** section.
5. Select and play any live TV channel.
6. Verify the playback.
7. Tap the **Pause** button.
8. Verify that the live stream is paused.
9. Tap the **Play/Resume** button.
10. Observe the playback.
    - **Expect:** Tapping the **Pause** button should pause the live playback, and tapping the **Play/Resume** button should continue the stream from the current live position.

### 1.15. IW3-T2030	Verify that the user is able to initiate video playback directly from the 'My Watchlist' page by selecting any listed content.

**File:** `tests/watchlist/watchlist.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **My Watchlist** page.
5. Select any content from the watchlist.
6. Click the **Play** or **Resume** button on the content details page.
7. Observe the player screen.
   - **Expect** The user should be successfully redirected to the player screen, and the selected content should start playing successfully.

### 1.16. IW3-T2032 Verify that "Subscribe to watch" CTA is displayed for premium carousel contents for free user

**File:** `tests/home/subscription.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **Home** page.
5. Observe the premium content carousels.
   - **Expect:** The **"Subscribe to Watch"** button should be displayed for all premium content cards visible to free users.

### 1.17. IW3-T2035 Verify the message displayed on "Subscribe to watch" CTA from Home/Shows/Movies/GMA tabs from "Carousel".

**File:** `tests/home/subscription.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **Home**, **Shows**, **Movies**, or **GMA** page.
5. Locate a premium content card displaying the **"Subscribe to Watch"** button.
6. Click the **"Subscribe to Watch"** button.
7. Observe the subscription prompt.
   - **Expect:** A subscription prompt should be displayed with the message:
     > **"A valid subscription is required to view this content. Please subscribe or renew your plan."**
   - **Expect:** The following action buttons should be displayed:
     - **"Maybe Later"**
     - **"Subscribe to Watch"**

### 1.18. IW3-T1932 Verify the UI/UX of the Continue Watching tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate the **Continue Watching** tray.
7. Observe the tray and its contents.
   - **Expect:** The **Continue Watching** tray title should be displayed.
   - **Expect:** The tray should display the available content cards.
   - **Expect:** Each content card should display its **thumbnail** and **content title**.
   - **Expect:** A **progress bar** should be displayed below each content thumbnail indicating the watch progress.

### 1.19. IW3-T1933 Verify the scroll functionality for the contents under Continue Watching tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate the **Continue Watching** tray.
7. Scroll the **Continue Watching** tray from **right to left**.
8. Verify that additional content cards are displayed.
9. Scroll the **Continue Watching** tray from **left to right**.
10. Observe the tray behavior.
    - **Expect:** The **Continue Watching** tray should scroll smoothly in both directions, and all available content cards should be accessible without any UI or functionality issues.

### 1.21. IW3-T1937- Verify that "Resume" CTA turns to "Play" button and retains to default season number and episode number on removing the content from CW tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have partially watched episodes from **Season 1** of a series, and the series should be available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Search for a content.
7. Extract the content name and episode number. 
8. Click on play on 4th episode.
9. Drag the seekbar until 40% and let it play for 10 seconds.
10. Navigate back to homepage and refresh the page.
11. Locate the series in the **Continue Watching** tray if it exists or not.
    - **Expect:** series should be in the continue watching tray 
12. Hover on the content and extract Season and episode number. 
12. Hover on the content and Click the **X** icon on the content card.
13. Search and navigate to the **Content Details** page of the extracted content.
14. Observe the playback action and episode information.
    - **Expect:** The **"Resume"** button should be replaced with the **"Play"** button.
    - **Expect:** The series should revert to the **default season and episode** instead of the previously watched episode.

### 7.1. IW3-T2060 VVerify the Search icon is visible in the top navigation bar on all pages (Home, Movies,Shows,My Watchlist, GMA)
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. When user is on "Home" tab
      * expect Search icon should be visible in the top Navigation bar
   6. When user is on "Movies" tab
      * expect Search icon should be visible in the top Navigation bar
   7. When user is on "Shows" tab
      * expect Search icon should be visible in the top Navigation bar
   8. When user is on "My Watchlist" tab
      * expect Search icon should be visible in the top Navigation bar
   9. When user is on "GMA" tab
      * expect Search icon should be visible in the top Navigation bar

### 7.2. IW3-T2062 Verify that the user can type a search query in the input box
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type 'Abandoned' in search field 
      * expect Observe 'Abandoned' text should appear clearly in the input box

### 7.3. IW3-T2064 Verify the search results are shown when a valid title is entered in the Search field
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type 'Abandoned' in search field 
   7. Observe the Search result
      * expect Observe 'Abandoned' related results should appear with thumbnails and labels

### 7.4. IW3-T2058 Verify user is able to add content to My Watchlist via hover from search page
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type any Movie/Show content name
   7. Hover on Movie/Show content
   8. Tap on add to watchlist icon
      * expect Content should be added to my watchlist and "Added to Watchlist" toast message should be displayed

### 7.5. IW3-T2059 Verify user is able to remove content from my watchlist via hover from search page
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type any Movie/Show content name
   7. Hover on Movie/Show content
   8. Tap on add to watchlist icon
   9. Hover on same content
   10. Click on remove from my watchlist icon
      * expect Content should be removed from my watchlist and "Removed from watchlist" toast message should be displayed

### 7.6. IW3-T2063 Verify the auto-suggestions while typing in the search field
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type anything and Observe
      * expect Auto-suggestions should appear based on partial input

### 7.7. IW3-T2065 Verify the message like 'No results found.' is shown for irrelevant search terms
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type anything and observe(Ex: tfdiyhujehfdyhglfjh843847hgfhilwajigjlu, @#%*",)
      * expect A proper "No results found." message should be displayed, assert this excepted mesaage

### 7.8. IW3-T2066 Verify if subscribed users can play premium content from search results
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Search any content
   7. Tap on that particular content(Premium)
   8. Tap on play and Observe      
   * expect Playback should start successfully when the user play premium content from search results if they have a subscription

### 7.9. IW3-T2067 Verify that "Clear All" icon removes the Search text/ input from the "Search" field
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Search any content
   7. Tap on 'Clear all' icon
   8. Observe the Search field
      * except The search text should be cleared immediately from the input field, and the placeholder text (Ex: "Search by title, actor, genre...") should be displayed again

### 7.10. IW3-T2068 Verify that the search supports typing of actor name or show genres in the Search field
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Search any content
   7. Type any actor name
      * except Results should include searched actor related contents (Use graphql api response to validate field name : cast)
   8. Clear serach
   8. Type any genre name
      * except Results should include searched genre-related contents (Use graphql api response to validate field name : genres)

### 7.11. IW3-T2069 Verify if free and premium content are labeled accordingly on the Search page
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Return a free content and premium content from collection graphQL API
   6. Click on search icon
   7. Search/Type free content returned
      * except Thumbnails should show correct 'Free' tags on search page (Use search graphql api response to validate field name : type, should be equal to Free)
   8. Clear search field Search/Type free Premium returned
      * except Thumbnails should show correct 'Premium' tags on search page (Use search graphql api response to validate field name : type, should be equal to Premium)

### 7.12. IW3-T2070 Verify placeholder text in search field
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Observe the Search field
      * except Search input field should show placeholder like "Search by title, actor, genre..."
      
### 7.13. IW3-T2073 Verify if user can search with partial keyword in search field
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   6. Click on search icon
   7. Enter partial content name returned from Collection graphQL API
   8. Observe result
      * except Related results should appear, assert Content returned from collection API with first content displayed in search screen

### 7.14. IW3-T2076 Verify that tapping on any search result redirects to the Detail page
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   5. Click on search icon
   6. Enter content name returned from Collection graphQL API
      * except Assert content searched with first content displayed in search screen
   7. Store and Print First content title, shortDescription, genres, cast
   8. Click on the first content searched 
      * except App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast disaplyed in details page)

### 7.15. IW3-T2077 Verify that smooth scrolling is maintained when the user searches for content
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   5. Click on search icon
   6. Enter content name returned from Collection graphQL API
      * except Assert content searched with first content displayed in search screen
   7. Scroll the search result to bottom of the search results
      * except All search results should load progressively displayed without any crash, lag or freeze the user to scroll smoothly through the entire list.

### 7.16. IW3-T2083 Verify if user enters junk characters with space in search field
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Tap on Search icon
   6. Enter junk characters like "gdfy 6487yhgf y98yfgjkb nbdjgh" in the
   search field
   7. Observe the search behavior
      * except 'No search results found' message should be displayed when the user enters junk characters in the search bar.

### 7.17. IW3-T2085 Verify if irrelevant search suggestions are being displayed which don't have valid results.
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Tap on Search icon
   6. Begin typing a random or invalid string (e.g., 123z)
   7. Observe suggestions
      * except Relevant search suggestions should display for entered keywords. Print the suggested contents displayed

### 7.18. IW3-T2086 Verify that live content is not displayed in search when user enters live content title
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any live channel title name from live channel rail from Collection graphQL API 
      * except Print live channel title returned (Ex : Live Channel title : returnd value)
   5. Tap on Search icon
   6. Type live cannel returned
   7. Observe suggestions
      * except Live content searched should not be displayed when user searches for it.

### 7.19. IW3-T2087 Verify user Navigated back to search screen post tapping back button from content details screen.
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   5. Click on search icon
   6. Enter content name returned from Collection graphQL API
      * except Assert content searched with first content displayed in search screen
   7. Store and Print First content title, shortDescription, genres, cast
   8. Click on the first content searched 
      * except App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast disaplyed in details page)
   9. Tap the content back button
   10. Observe the Navigation
      * except User should be correctly Navigated back to the Search results screen with the previous search term and results still visible.

### 7.20. IW3-T2088 Verify that exact title matches appear at the top of the search results.

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   5. Click on search icon
   6. Enter content name returned from Collection graphQL API
      * except The result with the exact title match should appear at the top of the
      search result list, followed by partial or related matches.

### 7.21. IW3-T2089 Verify that trending results are shown when the user taps on the Search icon without entering any query.

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   5. Click on search icon
   6. Enter content name returned from Collection graphQL API
   7. Clear the search results.
   8. Observe the 'trending search' results
      * except When the user Navigates to the Search screen without entering any query in the search bar, a list of trending results should be automatically
      displayed
   
### 7.22. IW3-T2090 Verify Trending search/Top picks near you title displayed on Navigating to search tab

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   6. Click on search icon
   7. Enter content name returned from Collection graphQL API
   8. Clear the search results.
   9. Observe the 'Top Picks Near You' results
      * except Top Picks Near You header should be displayed on Navigating to search page (Assert header Top Picks Near You)

### 7.23. IW3-T2091 Verify that trending results are not displayed when the user enters any query in the search field.

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   6. Click on search icon
   7. Enter content name returned from Collection graphQL API
   8. Clear the search results.
   9. Start entering any other query. (EX : LOVE)
      * except Once the user starts typing in the search field, Top Picks Near You should disappear and be replaced by search results relevant to the query


### 7.24. IW3-T2092 Verify that when the user taps on any trending content from the Search page, Navigated to the corresponding Detail Page.

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Get any content from Collection graphQL API 
   6. Click on search icon
   7. Enter content name returned from Collection graphQL API
   8. Tap on 'Clear all' icon
      * 'Top Picks Near You' screen header should be displayed
   9. Return first content details from "title": "Top Picks Near You", from search api after clearing search
   10. Click on First content displayed under Top Picks Near You
      * except App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast disaplyed in details page)

### 7.25. IW3-T2080 VVerify search results load even without login to iwanttfc application.

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. User will lands on the "Home" page.
   4. Tap on 'Search' icon
   5. Search for any content.
   6. Observe search page
      * except Search results should appear without login

### 7.26. IW3-T2082 Verify "New Episode", "Coming Soon", "GMA", "Recently Added" display on Search results for applicable content
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Return content title name having id has new_episode value form label from Collection graphQL API, if no matching return null
      * except Print  content name (Ex : New Episode : retuned value)
   6. Return content title name having id has coming_soon value form label from Collection graphQL API, if no matching return null
      * except Print coming soon content name (Ex : Coming Soon : retuned value)
   7. Return content title name having id has recently_added value form label from Collection graphQL API, if no matching return null
      * except Print recently added content name (Ex : Recently added : retuned value)
   8. Return content title name having GMA as contentOwner form label from Collection graphQL API, if no matching return null
      * except Print GMA content name (Ex : GMA : retuned value)
   9. Click on search icon
   10. Enter New Episode content name returned from Collection graphQL API
      * except Assert content tag img alt attribute should have recently_added value
   11. Click on search icon
   12. Enter Coming Soon content name returned from Collection graphQL API
      * except Assert content tag img alt attribute should have coming_soon value   
   13. Click on search icon
   14. Enter Recently Added content name returned from Collection graphQL API
      * except Assert content tag img alt attribute should have recently_added value   
   15. Click on search icon
   16. Enter GMA content name returned from Collection graphQL API
      * except Assert content tag should have monetization 

   
### 8.2. IW3-T2095 Verify Parental pin toggle will be in disable state by default
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings".
   6. Scroll to bottom of the page.
      * except Observe "Parental PIN" toggle should be in disabled/off state by default.

### 8.3. IW3-T2097 Verify Password text field will be display when user click on parental pin toggle
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button
      * except Password input text field should be displayed

### 8.4. IW3-T2098 Verify Password text field will be display when user click on parental pin toggle
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
   9. Click on submit cta and Observe
      * except 'Set an account owner PIN' should be display when user entered correct password

### 8.5. IW3-T2099 Verify "eye" icon will be display in password text field and user is able to see entered value when  enables the eye icon
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
      * except "eye" icon should be displayed in password input field
   9. Click on Eye Icon
      * except Entered password should be shown when user enables eye icon
   
### 8.6. IW3-T2100 Verify "Invalid credentials. Please try again." error message will be display when user enter incorrect login credentails
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button
   9. Enter Incorrect passord
   10. Click on Submit button
      * except "Invalid credentials. Please try again." error message should be display when user entered incorrect password
      * except Assert text "Invalid credentials. Please try again."

### 8.7. IW3-T2101 Verify 4 digit numeric pin will be display when user enable the parental pin toggle
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
   9. Click on Submit cta
   10. Enter the value PARENTAL_PIN_PASSWORD from .env file in input field and Observe the Input field
      * except Input boxes should accept only 4-digit numeric input.

### 8.8. IW3-T2102 Verify parental pin will be  accept numbers only
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
   9. Click on Submit cta
   10. Enter the value in input field and Observe the Input field.
   11. Try entering alphabets or special characters in the PIN fields.
      * except Input fields should restrict to numeric values only (0�9).

### 8.9. IW3-T2103 Verify success message is display when user setup the parental pin
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Click on "Account & Settings"
   7. Scroll to bottom of the page
   8. Observe "Parental Controls" section
   9. Click on toggle "Off" button and Enter Password
   10. Click on Submit cta
   11. Enter pin in input box(ex:1111)
   12. Click Save CTA and Observe
      * except "Parental Controls Updated" pop up header should appear.
      * except "Your changes to the parental controls have been saved successfully." pop up details should appear.
      * except "Continue" button should be displayed in the pop-up.

### 8.10. IW3-T2104 Verify "Parental Pin" promt is displayed when user try to play any content post setup the pin
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. If the toggle button is in Off condition:
      - Enter the account password.
      - Click Submit CTA.
      - Enter a PIN
      - Click Save CTA.
      - Click Continue CTA.
   9. If the toggle button is already in On condition, proceed to the next step.
   10. Navigate to the Home page.
   11. Tap on any content under Continue Watching.
   12. Play the content
      - except 'Enter the PIN to Access' page should be displayed when user try to play any content post setup the pin.

### 8.11. IW3-T2108 Verify Proper error message "Invalid Pin" is displayed when user enter incorrect parental pin in playback screen
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. If the toggle button is in Off condition:
      - Enter the account password.
      - Click Submit CTA.
      - Enter a PIN
      - Click Save CTA.
      - Click Continue CTA.
   9. If the toggle button is already in On condition, proceed to the next step.
   10. Navigate to the Home page.
   11. Tap on any content under Continue Watching.
   12. Play the content
   13. Enter Incorrect Parental pin - Invalid Pin
      - except 'Invalid Pin' error message is displayed. The user remains on the same page with the ability to retry.

### 8.12. IW3-T2105 Verify parental pin gets dispabled post entering the password
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. Click the toggle On button
   9. Enter the password.
   10. Tap on "Submit" CTA.
   11. Observe "Parental controls Updated" popup is displayed.
      * except "Parental Controls Updated" pop up header should appear.
      * except "Your changes to the parental controls have been saved successfully." pop up details should appear.
      * except "Continue" button should be displayed in the pop-up.
   12. Click Continue and parental pin id should be in Off Condition.
      * except Parental Pin toggle should be disabled post entering the password.

### 8.13. IW3-T2109 Verify user is able to play any content if parental pin is turn off
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
  1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. If the toggle button is in On condition:
      - Click on toggle Off button
      - Enter the account password.
      - Click Submit CTA.
   9. If the toggle button is already in Off condition, proceed to the next step.
   10. Navigate to the Home page.
   11. Tap on any content under Continue Watching.
   12. Play the content
      * expect The content should play directly without prompting for PIN

### 8.14. Verify that the selected episode from the Continue Watching tray resumes playback from the last watched position, and not from the beginning or the first episode when the parental pin is enabled.
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
    1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Return any show content from collection graphQL api
   5. Search and navigate to returned show details page 
   4. Play first Episode partially till the content added to CWT.
   5. Then Navigate to Continue watching and Content Detail page.
   6. Click on Resume button.
   7. Enter the parental pin.
   8. Observe the Episode number

#### 2.1. IW3-T1967 Verify that tapping the play button from the content detail page NFvigates the user to the player screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A Family affair" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The episode name and content title are displayed at the top left corner of the Player screen.
   - expect: The title and episode name displayed at the top of the playback should match the selected content and episode.
   - expect: The seek bar and playback controls are visible.
   - expect: The playback time is displayed at the end of the progress bar.

#### 2.2. IW3-T1907 Verify that playback starts post tapping on 'Play/Resume' CTA

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "The Secrets of Hotel 88" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The seek bar and playback controls are visible.
12. Add wait for 10sec timeout 
13. Click the Pause button and add wait for 10sec timeout 
   - expect: The seek bar and playback controls are visible. 

#### 2.3. IW3-T1968 Verify that the video playback starts successfully and plays smoothly without any interruption.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "The blood sisters" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The episode name and content title are displayed at the top left corner of the Player screen.
   - expect: The title and episode name displayed at the top of the playback should match the selected content and episode.
   - expect: The seek bar and playback controls are visible.
   - expect: The playback time is displayed at the end of the progress bar.
12. Wait for 20 sec 

#### 2.4. IW3-T1999 Verify that dragging the seek bar updates the video playback position accurately to the selected timestamp.

**File:** `tests/home/playback.spec.ts`

**Steps:**


1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A love to last" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The seek bar and playback controls are visible.
12. Drag the seek bar for few minutes and store the value of the player time 
13. wait for 10sec and assert the player time  
14. Stored player time should not be equal to the player time after waiting for 10sec 

#### 2.5. IW3-T2008 Verify user is not able to seek forward/backward in true live stream

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the "TFC Asia" live channel content in the home screen
9. Verify that 10s rewind button and 10s forward button is not visible    

#### 2.6. IW3-T2000 Verify that the seek bar functions correctly on all supported browsers, allowing smooth seeking and accurate playback position updates.

**File:** `tests/home/playback.spec.ts`

**Steps:**


1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A love to last" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. verify the seek bar is visible
12. Drag the seek bar for few minutes and store the value of the player time 
13. wait for 10sec and assert the player time  
14. Stored player time should not be equal to the player time after waiting for 10sec 

#### 2.7 IW3-T2002 Verify that the player controls appear when the user taps once on the screen during playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**


1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A love to last" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. verify the seek bar, playback time, rewind 10s, forward 10s, volume, subtitle and fullscreen button are visible

#### 2.8 IW3-T2012 Verify that live playback begins on tapping "Go Live" CTA.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the "TFC Asia" live channel content in the home screen
9. Click on pause button and wait for 5sec
10. click on GO live button
11. Verify live button is visible 

#### 2.9 IW3-T2013 Verify that a pre-roll ad plays automatically and completely before the main content starts playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Nurse the dead" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. Verify there is a AD tag on the play screen 
13. Add wait for 90sec
14. Verify the playback is playing by asserting the title of the episode   

#### 2.10 IW3-T1974 Verify that the video playback pauses immediately when the pause action is triggered by the user .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Nurse the dead" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. wait for 20sec and click pause button
13. Store the time value and wait for 10sec 
14. Again store the time value and both the stored value should be same  

#### 2.11 IW3-T1975 Verify that the video playback resumes smoothly from the paused position when the user triggers the resume action.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Nurse the dead" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. wait for 20sec and click pause button
13. Store the time value 
14. Click paly button and wait for 10sec
15. Again store the time value and both the stored value should be same  

#### 2.12 IW3-T1977 Verify that the forward and backward button controls function correctly even when the video is in a paused state.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Anak" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button and store the time value 
12. Click the pause button
12. Click on forward 10sec and store the time value
13. both stored value should not be equal 

#### 2.13 IW3-T1976 Verify that tapping the seek forward or backward button (CTA) skips the video playback ahead or back by exactly 10 seconds in movies or TV shows.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Anak" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button and store the time value 
12. Click on forward 10sec and store the time value
13. both stored value should not be equal 

#### 2.14 IW3-T1980 Verify that "Full screen" icon is displayed on the player screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Momay" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Verify full screen button is visible  

#### 2.15 IW3-T1978 Verify that the video player displays the timestamp in HH:MM:SS format when the total video duration exceeds one hour.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "captain barbell" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar upto 60% and click pause
13. Store the time value and verify stored time value is in format HH:MM:SS 

#### 2.16 IW3-T1979 Verify that the video player displays the playback time in MM:SS format when the total video duration is less than one hour.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Sin Island" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar upto 20% and click pause
13. Store the time value and verify stored time value is in format MM:SS 

#### 2.17 IW3-T1981 Verify that user can able to select the available subtitle during playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Sin Island" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. click on English(Phillippines) language option
14. verify subtitle is selected.

#### 2.18 IW3-T1982 Verify that selected subtitle option from the current episode continues for the next epiosde.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Blood vs duty" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. Just verify English(Phillippines) language is selected
14. Click on next episode button 
15. Click on Sub title button
16. Just Verify English(Phillippines) language is selected

#### 2.19 IW3-T1983 Verify that selected subtitle option from one content carry to any other content if the same subtitle is available.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Miss behave" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. Select English(Phillippines) language
14. Click back button 
15. Click on the search icon 
16. Type "will you fake marry me" in the search box and Click "Enter"
17. Click on the first content from first rail
18. Click the play button 
19. Click on Sub title button
20. verify English(Phillippines) language is already selected

#### 2.20 IW3-T1984 Verify that subtitles are set to 'Off' by default.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "fractured" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. Verify off option is set by default 

#### 2.21 IW3-T1985 Verify that selected subtitles are displayed on the player screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "doble kara" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. click on English(Phillippines) language option 
14. verify subtitle is visible post selecting the language on playback screen

#### 2.22 IW3-T1986 Verify that subtitles display correctly and remain synchronized with the video during seeking operations.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Beauty and the bestie" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. click on English(Phillippines) language option 
14. verify subtitle is visible post selecting the language on playback screen(wait till the subtitle is displayed)
15. Click on forward button, rewind button and drag the seek bar
16. Verify subtitle is visible post selecting each button and dragging seek bar (wait till the subtitle is displayed)

#### 2.23 IW3-T1987	Verify the functioNFlity on tapping "Full screen" icon .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ang Panday" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on full screen button
13. Verify the title of content is visible 
14. Store the time value and wait for 10sec 
15. Store the time value and verify both time should not be equal  

#### 2.24 IW3-T1988 Verify the UI of the player screen .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ang Panday" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on full screen button
13. Verify the following buttons are visible
   - Back button
   - Content title
   - Seek bar
   - Pause/play 
   - Forward and rewind
   - Subtitle (condition: If visible)
   - Next episode (Condition: If visible)
   - Content duration time in HH:MM:SS or MM:SS
 
#### 2.25 IW3-T1989 Verify that the 'Next Episode' CTA appears under the seek bar of the player scree when next episode exists.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Altar" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Verify the Next episode buttons are visible(have a condition)

#### 2.26 IW3-T1990 Verify that the "Up Next" binge marker appears at the end of the content playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ghosting" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar till end 
13. Verify for the appearance of the 'Up next wedge' button CTA at the end

#### 2.27 IW3-T1992	Verify that user Navigates to previous screen on tapping back button

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ghosting" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click the back button 
13. Verify that post clicking the back button goes to back screen 

#### 2.28 IW3-T1997 Verify that the player controls auto-dismiss automatically after a 5 seconds of infectivity during video playback

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "ekstra" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Wait for 5sec
13. Verify that player control is not visible after 5sec of playing content 

#### 2.29 IW3-T1998 Verify that the player controls are dismissed when the user hovers on the screen while controls are visible 

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ma" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Verify that player control is not visible after 5sec
13. Verify that player control is visible after hover the screen 

#### 2.30 IW3-T2005 Verify that user can increase or decrease the volume using volume button .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ma" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on volume button 
14. Verify you volume can mute and unmute by clicking on volume button

#### 2.31. End-To-End: launch, login, navigation across tabs, search and playback of a content

**File:** `tests/home/EndToEnd.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
      * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. When user is on "Home" tab
      * expect "Continue Watching" rail should be displayed
6. When user is on "Movies" tab
      * expect "Trending Movies Worldwide" rail should be displayed
7. When user is on "Shows" tab
      * expect "Trending Shows Worldwide" rail should be displayed
8. When user is on "My Watchlist" tab
      * expect "My Watchlist" rail should be displayed
9. When user is on "GMA" tab
      * expect "Top Streamed" rail should be displayed
10. Click on Search bar
      * expect the search bar should display inner text as "Search by title, actor, genre..."
11. Click on Account icon
      * expect "Sign Out" option should be displayed
12. Click on search icon
13. Type 'BLOOD VS DUTY' in search field 
14. Observe the Search result
      * expect Observe 'BLOOD VS DUTY' related results should appear with thumbnails and labels 
15. Hover on Movie content
      * expect Content details popup should be displayed with "Add to watchlist" icon, 'Remove" icon, with "Resume" and "Play" button
16. Click on content
      * expect Navigates to content details screen.
      * expect content details screen is displayed with title of the content, genre, rating number, quality of player, content description, subtitle language(if visible) with "Resume" and "Play" button, "Add to watchlist" and "share" icon
17. Click on play button
      * expect navigates to player screen.
      * expect player screen should be displayed with "Content title", "Seek bar" with "Back", "Pause/play", "Forward and rewind", "Subtitle (condition: If visible)", "Next episode (Condition: If visible)" button, and "Content duration time in HH:MM:SS or MM:SS"
18. Click on back button
      * expect Navigates to content details screen.

#### 2.32 IW3-T2009 Verify the "LIVE" tag is displayed on the player screen during live streaming.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the "TFC Asia" live channel content in the home screen
9. Verify "live" tag is visible  

#### 2.33 IW3-T2014 Verify the UI of the player screen during Ad playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Eva Fonda" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. Verify there is a AD tag on the play screen 

#### 2.34 IW3-T2017 Verify that all ads do not exceed a maximum duration of 90 seconds.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Eva Fonda" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. Verify there is a AD tag on the play screen 
13. Add wait for 90sec
14. Verify there is no AD tag visible after 90 sec on the play screen

#### 2.35 IW3-T2003 Verify that the content gets paused on tapping the player screen when the player controls are visible.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ma" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Player should pause on tapping the player screen
12. Verify that player control is visible 

#### 2.36 IW3-T2001 Verify that the seekbar displays thumbNFil previews when scrubbing through the content. 

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "oh my gan" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Hover on the screen 
13. Thumbnail should displayed when seek bar is hovered on player screen.

#### 2.37 IW3-T1991 Verify that tapping the 'Up Next binge" marker Navigates and starts the next episode playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Are you G?" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar till end 
13. Click the 'Up next wedge' button CTA
14. Verify the content has navigated to the next episode playback. 

#### 2.38 IW3-T2004 Verify that the player automatically Navigates and starts playback of the next episode immediately after the current episode ends without requiring user intervention.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Annaliza" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar till end 
13. Wait till player navigates to next episode
14. Verify the content has navigated to the next episode playback 

#### 2.39 IW3-T2020 Verify that a clear and visible label is displayed on the player screen whenever an ad is playing.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Biniverse and Chorus" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. Verify yellow color tag with name 'Ad' with a timer is displayed whenever an ad is playing.

#### 2.40 IW3-T2022 Verify that the seek bar is not visible on the player screen during ad playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Biniverse and Chorus" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. Verify the seek bar is not visible on the player screen during ad playback.

#### 2.41 IW3-T2023 Verify user Navigates to content details screen when the last season last episode completely watched 

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Can't buy me love" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Verify it navigates to content details screen.
12. Click on the last season of content in the content detailed screen
13. Click on the last episode in content detailed screen
14. Drag the seek bar till end of the episode 
15. Verify the screen is navigated to the content details page after dragging the seek bar till end of the episode.

#### 2.42 IW3-T2024 Verify user Navigates to content details screen post completely watching movie content.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Sukob" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Verify it navigates to content details screen.
12. Click the play button
13. Drag the seek bar till end of movie episode 
15. Verify the screen is navigated to the content details page after the complete play of movie.  

#### 2.43 IW3-T2027 Verify that clicking "Subscribe to watch" redirects to "Account" screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Everything About Her" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click on the subscribe to watch button in the content page 
12. Click on the subscribe to watch in the player screen 
13. Verify that post clicking the subscribe to watch button in the player screen should navigate the account page 
14. Verify account page is displayed with iwant icon and "Account" name  

#### 2.44 IW3-T3679 Verify that "Early Access" content with the tag is not displayed on "Continue Watching" tray upon partially watching.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Get Early Access tagged content from Collection graphQL API
9. Click on the search icon
10. Enter content name returned from Collection graphQL API
    * expect Assert content searched with first content displayed in search screen
11. Store and Print First content title
12. Click on the first content searched
    * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast disaplyed in details page)
13. Scroll the content details page till early access tag is visible on the episode thumbnail
14. Click on the episode which has the early access tag.
15. Drag the seek bar upto 10%
16. Click back button and navigate to home page 
17. Verify Early access tag is not diplayed on the content titled that was stored in continue watching rail.

#### 2.45 IW3-T2016 Verify that the 'Skip Ad' CTA appears at the correct timestamp during pre-roll ad playback and functions as expected by tapping the "Skip Ad".

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
5. Return a free content and premium content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
   * expect Thumbnails should show correct 'Free' tags on search page (Use search graphql api response to validate field name : type, should be equal to Free)
8. Click on the first content searched
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
9. Wait for some sec so that Ad plays 
10. Verify Ad tag is visible on the ad player screen.
11. wait for skip Ad button visible till ad tag is on the screen 
12. If skipAd button appears click on the skipAd button, else return as the skipAd is not visible(Validate if skipad visible and clicked else return as skipad button not visible)

#### 2.46 IW3-T2018 Verify that the ad duration countdown and the skip button countdown are displayed correctly during ad playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
5. Return a free content and premium content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
   * expect Thumbnails should show correct 'Free' tags on search page (Use search graphql api response to validate field name : type, should be equal to Free)
8. Click on the first content searched
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
9. Wait for some sec so that Ad plays 
10. Verify Ad tag is visible on the ad player screen.
11. wait for skip Ad button visible till ad tag is on the screen, else return as the skipAd is not visible(Validate if skipad visible else return as skipad button not visible)

#### 2.47 IW3-T2019 Verify that the mid-roll ad interrupts the main content playback exactly at each midroll Ad.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
5. Return a free content and premium content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
   * expect Thumbnails should show correct 'Free' tags on search page (Use search graphql api response to validate field name : type, should be equal to Free)
8. Click on the first content searched
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
9. Wait for some sec so that Ad plays 
10. Verify Ad tag is visible on the ad player screen.
11. Add wait for 90sec
12. Verify the playback is playing by asserting the title of the episode 
13. Drag the seek bar upto 50%
14. Verify ad interrupts the player content with the Ad tag displayed on the Ad player screen

#### 2.48 IW3-T2021 Verify that tapping 'Learn More' during playback redirects the user to the ad-related link 

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
5. Return a free content and premium content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
   * expect Thumbnails should show correct 'Free' tags on search page (Use search graphql api response to validate field name : type, should be equal to Free)
8. Click on the first content searched
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
9. Wait for some sec so that Ad plays 
10. Verify Ad tag is visible on the ad player screen.
11. Tap on the Ad player screen
    *expect: User should be navigated to the **Ad-realted** page and the **page title** should be validated and printed in the logger.

#### 2.49 IW3-T3685 Verify that a subscribed user can access early access episodes via Up Next binge marker or Next Episode CTA from the player screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Return a Early access tag content from collection graphQL API
6. Click on search icon
7. Search/Type Early access tag content returned
   * expect Thumbnails should show correct 'Early access' tags on search page (Use search graphql api response to validate field name : type, should be equal to Early access)
8. Click on the first content searched
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
9. Scroll the content details page till early access tag is visible on the episode thumbnail
10. Click on the previous episode of the early access tag
11. Drag the seek bar till 95%
12. Click on Up Next binge marker or Next Episode CTA
13. Content should play without after clicking next episode.

#### 2.50 IW3-T3686 Verify that a free user can initiate the subscription flow from an Early Access episode


**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Return a Early access tag content from collection graphQL API
6. Click on search icon
7. Search/Type Early access tag content returned
   * expect Thumbnails should show correct 'Early access' tags on search page (Use search graphql api response to validate field name : type, should be equal to Early access)
8. Click on the first content searched
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
9. Scroll the content details page till early access tag is visible on the episode thumbnail
10. Click on the episode which has the early access tag
11. Verify "Unlock Early Access" displayed on the screen and Click on "Update to Watch now" button
12. Verify user navigates to the Account page with "Account" and "Subscription" title displayed on screen.

#### 2.51 IW3-T4707 Verify that user navigates to content details screen on tapping "May be later" CTA from the "Unlock Early Access" screen.


**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Return a Early access tag content from collection graphQL API
6. Click on search icon
7. Search/Type Early access tag content returned
   * expect Thumbnails should show correct 'Early access' tags on search page (Use search graphql api response to validate field name : type, should be equal to Early access)
8. Click on the first content searched
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
9. Scroll the content details page till early access tag is visible on the episode thumbnail
10. Click on the episode which has the early access tag
11. Verify "Unlock Early Access" displayed on the screen and Click on "May be later" button
12. Verify user navigates to the content details page.
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page).

#### 2.52 IW3-T2113 Verify functionality of Skip Intro marker.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Lavender fields" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Verify "Skip Intro" button is visible and Store the time value
13. Click on "Skip Intro" button and store the time value after clicking
14. Print the both time value and validate both are not same 

#### 2.53 IW3-T2115 Verify functionality of Skip Recap marker.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Lavender fields" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the second episode in the details page
    * expect content title, and S1 E2 is displayed on the player screen 
12. Click on "Skip Intro"    
13. Verify "Skip Recap" button is visible and Store the time value
14. Click on "Skip Recap" button and store the time value after clicking
15. Print the both time value and validate both are not same 

#### 2.54 IW3-T2120 Verify that the markers remains visible after pausing or resuming the content playback.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Lavender fields" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the second episode in the details page
    * expect content title, and S1 E2 is displayed on the player screen 
12. Drag the seek bar till 95% 
    *expect Up Next binge is visible on the player screen
13. Pause/Resume the player by taping on player screen
14. Verify Up Next binge is visible on the player screen.

#### 2.55 IW3-T2121 Verify clicking on "Skip Intrio" , "Skip Recap"  skip the content playback for a specified duration

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Lavender fields" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the second episode in the details page
    * expect content title, and S1 E2 is displayed on the player screen 
12. Verify "Skip Recap" button is visible and Store the initial skip Recap time value
13. Click on "Skip Recap" button and store the updated skip Recap time value after clicking
14. Print and validate both initial skip recap time value and updated skip recap time are not same
15. Verify "Skip Intro" button is visible and Store the initial skip intro time value
16. Click on "Skip Intro" button and store the updated skip intro time value after clicking
17. Print and validate both initial skip intro time value and updated skip intro time are not same 

#### 2.56 IW3-T2122 Verify that markers reappear after they have been displayed and the content is rewound.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Lavender fields" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the second episode in the details page
    * expect content title, and S1 E2 is displayed on the player screen 
12. Verify "Skip Recap" button is visible and Store the initial skip Recap time value
13. Click on "Skip Recap" button and store the updated skip Recap time value after clicking
14. Print and validate both initial skip intro time value and updated skip intro time are not same 
15. Verify "Skip Intro" button is visible and Store the initial skip intro time value
16. Click on "Skip Intro" button and store the updated skip intro time value after clicking
17. Print and validate both initial skip recap time value and updated skip recap time are not same
18. Drag the seek bar till 95%
    *expect Up Next binge is visible on the player screen
19. Drag the seek bar back to the initial position from first
    *expect validate the time value is 00:00
20. Verify skip Recap button is visible

#### 2.57 IW3-T2116 Verify presence of Skip Outro(Up Next) binge marker at end of the content playback.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Click on the search icon 
6. Type "YSpeak 2.0" in the search box and Click "Enter"
7. Click on the first content from first rail
8. Click the play button 
9. Drag the seek  bar till 99%
10. Verify for the appearance of the 'Up next wedge' button CTA at the end.

#### 2.58 IW3-T2117 Verify functionality of Skip Outro(Up Next) binge marker.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Click on the search icon 
6. Type "Unbreak My Heart" in the search box and Click "Enter"
7. Click on the first content from first rail
8. Click the play button 
9. Drag the seek  bar till 98%
10. Verify for the appearance of the 'Up next wedge' button CTA at the end.
11. Store the time value of the content when 'Up next wedge' button is visible 
12. Click on the 'Up next wedge' button
    * expect - Content should navigate to next episode and Stored time value before 'Up next wedge' clicked should be not equal to after clicked 'Up next wedge'.

#### 2.59 IW3-T2118 Verify that "X" button is displayed on the "Up Next" binge marker to close the "Outro"

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Click on the search icon
6. Type "Araw Gabi" in the search box and Click "Enter"
7. Click on the first content from first rail
8. Click the play button
9. Drag the seek  bar till 98%
10. Verify for the appearance of the 'Up next wedge' button CTA at the end.
11. Verify "X" button is displayed on the "Up Next" binge marker
12. Click on the "X" button on the "Up Next" binge marker
    * expect content should continue play after clicking on the "X" button

#### 2.60 IW3-T2119 Verify clicking "Skip Outro(Up Next) binge marker" moves to next episode when user clicks.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Click on the search icon
6. Type "Araw Gabi" in the search box and Click "Enter"
7. Click on the first content from first rail
8. Click the play button
9. Drag the seek  bar till 98%
10. Verify for the appearance of the 'Up next wedge' button CTA at the end.
11. Click the 'Up next wedge' button CTA only
12. Verify the content has navigated to the next episode playback
    * expect next episode should play smoothly after clicking on the "Up Next Wedge"

#### 2.61 IW3-T4338 Verify search result will be displayed based on the search input text

**File:** `tests/home/home-page-launch.spec.ts`

**Steps:**
   1. Open the browser.
   2. Enter the URL.
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.  
   *expect:* User should be navigated to the **Terms and Conditions** page.
   6. Tap the **Search Documentation** search field displayed at the top-right corner.
   7. Enter a search query (e.g., **Terms & Conditions of Subscription and/or use for Customers in the Philippines**).
   8. Verify that the corresponding search results are displayed.  
   *expect:* Search results relevant to the entered query should be displayed successfully.
   9. Verify that the user is able to search for any page using the search field.  
   *expect:* The user should be able to search any page via the search field, and the corresponding results should be displayed correctly.

#### 2.62 IW3-T4335 Verify application version will be displayed at the bottom of the page

**File:** `tests/home/home-page-launch.spec.ts`

**Steps:**
   1. Open the browser.
   2. Enter the URL.
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.
   *expect:* User should be navigated to the **Terms and Conditions** page.
   6. Scroll to the bottom of the page.
   7. Verify application version will be displayed at the bottom of the page and print the version displayed
   *expect:* The user should be able to see the application version.

#### 2.63 IW3-T2123 Verify ""Skip Intro or Skip Recap"" markers not displayed for the contents under CW tray.

**File:** `tests/home/skip_intro/outro.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with valid Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Click on the search icon 
6. Type "Unbreak My Heart" in the search box and Click "Enter"
7. Click on the first content from first rail
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Lavender fields" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the third episode in the details page
    * expect content title, and S1 E3 is displayed on the player screen 
12. Click on "Skip Recap" button and store the updated skip Recap time value after clicking
13. Click on "Skip Intro" button and store the updated skip intro time value after clicking
    * expect validate both initial skip recap time value and updated skip recap time are not same
14. Drag the seek bar till 50% and click on back button 
15. Navigate to home page and click on the first content in the continue watching rail
16. Verify "Skip Recap" and "Skip Intro" is not visible on the player screen 

#### 2.64 IW3-T1873 Verify the details screen share functionality for the PH region guest user.

**File:** `tests/home/ph_region.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Double click on any content on the home page 
   * expect App should redirect to the correct content details page(Validate Content title, shortDescription, genres, cast displayed in details page)
4. Click on Share icon button in the content details page
5. "Share link copied to clipboard" message is displayed post clicking on the share icon.

#### 2.65 IW3-T1891 Verify login page will be display when user tap on Add to Watchlist icon via mouse hover on any tray content from PH region.

**File:** `tests/home/ph_region.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Return a free content from collection graphQL API
4. Click on search icon
5. Search/Type free content returned
   * expect Thumbnails should show correct 'Free' tags on search page (Use search graphql api response to validate field name : type, should be equal to Free)
6. Hover on the first content searched
   *expect content details should pop-up with the Play/Resume, add to watchlist button icon and meta data related to the content 
7. Click on the "Add to watchlist" button which is displayed on the pop-up screen
   *expect user should be navigated to the login page.
   
#### 2.66 IW3-T2132 Verfiy the spacing between the contents and other rails post configuring the Mid rail banner Ad

**File:** `tests/home/landing-page-launch.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with Free user Email and Password
   * expect - successfully navigated to home page with "Home", "Movies", "Shows", "My Watchlist", "GMA", "Search", "Account" icon
5. Navigate to **Home** tab.
6. Scroll till mid rail ad banner.
   * Expect mid rail ad banner is visible
7. Verify the Spacing between the contents and other rails should be proper without breaking the UI in mid rail Ad
8. Navigate to **Movies** tab.
- Asset if the ad is visible.
9. Verify the Spacing between the contents and other rails should be proper without breaking the UI in mid rail Ad
10. Navigate to **Shows** tab.
- Asset if the ad is visible.
11. Verify the Spacing between the contents and other rails should be proper without breaking the UI in mid rail Ad

#### 2.66 IW3-T1889 Verify that carousel content, sub-navigation tabs, and trays load properly for a guest user from the Philippines.

**File:** `tests/home/ph_region.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. When user is on "Home" tab
      * expect "Continue Watching" rail should be displayed
4. Scroll the page slowly till end of the page
     * expect all the rails are loaded and user able to scroll the page till end with ad displayed in mid rail 
5. When user is on "Movies" tab
      * expect "Trending Movies Worldwide" rail should be displayed
6. Scroll the page slowly till end of the page
     * expect all the rails are loaded and user able to scroll the page till end with ad displayed in mid rail
7. When user is on "Shows" tab
      * expect "Trending Shows Worldwide" rail should be displayed
8. Scroll the page slowly till end of the page
     * expect all the rails are loaded and user able to scroll the page till end with ad displayed in mid rail

#### 2.67 IW3-T2034 Verify that crown icon is displayed on the content thumbnail for premium contents.

**File:** `tests/home/subscription.spec.ts`

**Steps:**

1. Open the browser.
2. Return a premium content from collection graphQL API
3. Click on search icon
4. Search/Type free content returned
   * except Thumbnails should show correct 'Premium' Crown on search page (Use search graphql api response to validate field name : type, should be equal to Premium).
5. Verify "crown" icon is displayed on the first content thumbnail  after search

### 2.68. IW3-T1862 Verify the Navigation on entering OTP for the forgot password.

**File:** `tests/home/registration-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on the **Create Account** option.
   *expect:* User should be navigated to the **Create an Account** screen.
5. Click on the **Email Address** field.
6. Enter a valid email address (email generated from randomYopmailAddress ).
7. Click on the **Password** field.
8. Enter a valid password (e.g., `Abcd@1234`).
9. Click on the **Confirm Password** field.
10. Enter the same password (e.g., `Abcd@1234`) in the **Confirm Password** field.
11. Select the **"I agree to the Terms and Conditions and Privacy Policy."** checkbox.
12. Select the **"I agree to receive marketing communications."** checkbox.
13. Click the **Continue** button.
    *expect:* User should be navigated to the **Verify OTP** screen.
14. Fetch the OTP from the given email only and enter the OTP
15. Click on Verify button
    *expect:* User should be navigated to "Home" screen
16. Click on Account Icon Button
17. Tap on "Sign Out"
   *expect:* user should be Navigated to "Login screen".
18. Tap on "Forgot Password?"
19. User should be navigated to "Forgot Password?" screen.
      * expect "Confirm Email Address" page should be displayed
20. Enter a valid email address  (email generated from randomYopmailAddress ).
21. Tap on "Proceed" CTA.
22. Fetch the OTP from the given email only and enter the OTP
23. Click on Verify button
    *expect:* User should be navigated to "Set a New Password" screen

### 2.69. IW3-T1863 Verify the UI/UX and "Forgot Password" functionality popup.

**File:** `tests/home/registration-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on the **Create Account** option.
   *expect:* User should be navigated to the **Create an Account** screen.
5. Click on the **Email Address** field.
6. Enter a valid email address (email generated from randomYopmailAddress ).
7. Click on the **Password** field.
8. Enter a valid password (e.g., `Abcd@1234`).
9. Click on the **Confirm Password** field.
10. Enter the same password (e.g., `Abcd@1234`) in the **Confirm Password** field.
11. Select the **"I agree to the Terms and Conditions and Privacy Policy."** checkbox.
12. Select the **"I agree to receive marketing communications."** checkbox.
13. Click the **Continue** button.
    *expect:* User should be navigated to the **Verify OTP** screen.
14. Fetch the OTP from the given email only and enter the OTP
15. Click on Verify button
    *expect:* User should be navigated to "Home" screen
16. Click on Account Icon Button
17. Tap on "Sign Out"
   *expect:* user should be Navigated to "Login screen".
18. Tap on "Forgot Password?"
19. User should be navigated to "Forgot Password?" screen.
      * expect "Confirm Email Address" page should be displayed
20. Enter a valid email address (email generated from randomYopmailAddress ).
21. Tap on "Proceed" CTA.
22. Fetch the OTP from the given email only and enter the OTP
23. Click on Verify button
    *expect:* User should be navigated to "Set a New Password" screen 
24. Click on the **Password** field.
25. Enter a valid password (e.g., `iWant_tfc_004`).
26. Click on the **Confirm Password** field.
27. Enter the same password (e.g., `iWant_tfc_004`) in the **Confirm Password** field.
28. Tap on "Proceed" CTA.
    *expect:* User should see the popup message "New Password Set Successfully"
29. Click on "Done" button
   *expect:* user should be Navigated to "Login screen".

### 2.70. IW3-T1866 Verify that user can able to login with new password credentials.

**File:** `tests/home/registration-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on the **Create Account** option.
   *expect:* User should be navigated to the **Create an Account** screen.
5. Click on the **Email Address** field.
6. Enter a valid email address (email generated from randomYopmailAddress ).
7. Click on the **Password** field.
8. Enter a valid password (e.g., `Abcd@1234`).
9. Click on the **Confirm Password** field.
10. Enter the same password (e.g., `Abcd@1234`) in the **Confirm Password** field.
11. Select the **"I agree to the Terms and Conditions and Privacy Policy."** checkbox.
12. Select the **"I agree to receive marketing communications."** checkbox.
13. Click the **Continue** button.
    *expect:* User should be navigated to the **Verify OTP** screen.
14. Fetch the OTP from the given email only and enter the OTP
15. Click on Verify button
    *expect:* User should be navigated to "Home" screen
16. Click on Account Icon Button
17. Tap on "Sign Out"
   *expect:* user should be Navigated to "Login screen".
18. Tap on "Forgot Password?"
19. User should be navigated to "Forgot Password?" screen.
      * expect "Confirm Email Address" page should be displayed
20. Enter a valid email address (email generated from randomYopmailAddress ).
21. Tap on "Proceed" CTA.
22. Fetch the OTP from the given email only and enter the OTP
23. Click on Verify button
    *expect:* User should be navigated to "Set a New Password" screen 
24. Click on the **Password** field.
25. Enter a valid password (e.g., `iWant_tfc_004`).
26. Click on the **Confirm Password** field.
27. Enter the same password (e.g., `iWant_tfc_004`) in the **Confirm Password** field.
28. Tap on "Proceed" CTA.
    *expect:* User should see the popup message "New Password Set Successfully"
29. Click on "Done" button
   *expect:* user should be Navigated to "Login screen".
30. Enter a valid email address (email generated from randomYopmailAddress ).
31. Enter a valid password (e.g., `iWant_tfc_004`).
32. Click on Continue button
    *expect:* User should be navigated to "Home" screen
33. Click on Account icon profile 
34. Tap on "Account and Setting" option 
    *expect*: User should navigate to "Account" page and the email(email generated from randomYopmailAddress ) used to create an account is displayed on the "Account" page

#### 2.71. IW3-T2011 Verify that the 'Go Live' tag is displayed on the player screen when the user pause the content.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the "TFC Asia" live channel content in the home screen
9. Click on pause button and wait for 5sec
   *expect*: User should see the "Go Live" button displayed on the player screen  



#### 1.1. IW3-T1846 Verify that user NFvigates to "Welcome to iwant" screen on entering the URL "https://iwanttfc.com/" from Non-PH region.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`)

* expect: 
- User should be navigated to the **"Welcome to iWant"** screen on launching the application.


#### 1.2. IW3-T1847 Verify the UI/UX of the "Welcome to iWant" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Observe the "Login" screen.

* expect:
- Text "Welcome to iWant" and "Home of Filipino Stories" displayed at the top middle of the screen.
- "Email or Mobile Number" text field.
- "Password" text field.
- "Login" CTA highlighted in dark blue color.
- "Login with Facebook" option highlighted in blue color.
- "Login with TV Provider" option.
- "New here? Create Account" label displayed.


#### 1.3. IW3-T1848 Verify the NFvigation on tapping of "Create Account"

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
* expect: 
- User should be navigated to the **"Create an Account"** screen.

#### 1.1.4 IW3-T1849 Verify the UI/UX of the "Lets Get Started" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
   - User should be navigated to the **"Create an Account"** screen.
   - expect: The "Create an Account" heading is displayed.
   - expect: The "Email Address" text field is displayed.
   - expect: The "Password" text field is displayed.
   - expect: The checkbox with text "I agree to the Terms and Conditions and Privacy Policy" is displayed.
   - expect: The checkbox with text "I agree to receive marketing communication (until I Unsubscribe)" is displayed.
   - expect: The "Continue" CTA is displayed.
   - expect: The text "Already Have an Account?" and the "Login" link are displayed.

#### 1.4. IW3-T1850 Verify the functioNFlity of entering the email id and Password in the 'Let's Get Started' screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
5. Click on the "Email" text field.
6. Enter a valid email address.(e.g abhilash584@gmail.com)
* expect: 
- User should be able to enter and view the entered email address in the "Email" text field.

#### 1.5. IW3-T1855 Verify the error message on entering invalid email/phone number and password on the "Email" text field on "Get Started" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
5. Click on the "Email" text field.
6. Enter an invalid email address (e.g., `bb11`).
7. Select 1 checkbox.
8. Click on "Continue" CTA.
* expect: 
- User should see a valid error message indicating that the entered email address is invalid.


#### 1.6. IW3-T1857 Verify the message displayed when new user try to login without registration.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Enter a new email address (not registered) and a password.(e.g: abcd@gmail.com, abcd)
5. Select one checkbox.
6. Tap on the "Continue" CTA.
* expect: 
   - A valid error message should be displayed.


#### 1.7. IW3-T1858 Verify the password visibility toggle.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Enter the email address and password.
5. Click on the password visibility icon.
   * expect the entered password should be visible.


#### 1.9. IW3-T1864 Verify the message displayed on entering the mobile number on "Forgot Password?" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Tap on "Forgot Password?".
5. Enter the "Mobile number".
6. Tap on the "Continue" CTA.
   * expect the user should get "Invalid email".


#### 2. IW3-T1921 Verify that respective episode playback starts post tapping on episode cards in detail page

**File:** `tests\ott-app\details_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Enter valid email as "abhilash584@gmail.com" in email field.
4. Click on Password field
5. Enter valid password as "Test1234" in password field
6. Click on the search icon in the top right.
7. Enter the text: 'the blood sisters'
8. Press enter.
9. Select the content that matches the name entered in the search box.
10. Scroll down and find the list of episodes.
11. Click on first episode.
   - expect: The user is redirected to the Player screen and playback starts.
   - expect: The episode name and content title are displayed at the top left corner of the Player screen along with back arrow.


#### 3.IW3-T1936 Verify the functioNFlity of "Remove From Continue Watching" CTA displayed on the  CW tray bottom bar popup from Home screen.

**File:** `tests\ott-app\continue_watching.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Enter the valid email address `abhilash584@gmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Clcik on Contuinue button
6. Click on the Search icon at the top right corner.
7. Search for the content **"The Blood Sisters"**.
8. Press Enter.
9. Select the content that matches the search text.
10. Scroll down to the Episodes section.
11. Click on the first episode.
12. Click on the Forward button in the player controls.
13. Click on the Back arrow at the top of the Player screen.
14. Click on the Home tab.
15. Scroll down to the Continue Watching tray.
16. Hover over the first content thumbnail.
17. Click on the **X** icon.
    - expect: The content is no longer displayed in the Continue Watching tray.
  


#### 4.IW3-T2033 Verify that "Subscribe to watch" CTA is displayed for premium contents inside content details
screen.

**File:** `tests\home\subscription.spec.ts`

**Steps:**

1. Open the browser and navigate to https://www.iwanttfc.com/
2. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on the Email Address field.
4. Enter the valid email address `sanitycheck@yopmail.com`.
5. Click on the Password field.
6. Enter the valid password `Test1234`.
7. Click on the Continue CTA.
8. Click on the Search icon.
9. Search for **"Karnal"** and press Enter.
10. Click on the first content from the first rail.
    - expect: The "Subscribe to Watch" CTA is displayed on the Content Details
    - expect: The content is marked as premium.



#### 4.1 IW3-T2039 Verify the NFvigation on tapping "Upgrade Plan" button from the subscription blocker screen.

**File:** `tests\home\subscription.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Log in with free user credentials (e.g., `sanitycheck@yopmail.com` / `Test1234`).
4. Navigate to the GMA tab.
5. Click on the "Subscribe to Watch" CTA in the carousel.
6. Click on the "Subscribe to Watch" CTA.
7. Click on the "Upgrade Plan" button.
   - expect: The user is navigated to the Plans page.
   - expect: The "Plans & Payment" page is displayed.



#### 5.bIW3-T2112 Verify presence of Skip Intro marker during intial content Playback

**File:** `tests\ott-app\Skip_Intro.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the Email Address field.
4. Enter the valid email address.
5. Click on the Password field.
6. Enter the valid password.
7. Click on the Continue CTA.
8. Click on the Search icon.
9. Search for **"Lavender Fields"** and press Enter.
10. Click on the first content from the first rail.
11. Click on the Play button.
    - expect: The "Skip Intro" button is displayed during the initial content playback.



#### 5.1 IW3-T2114 Verify presence of Skip Recap marker during intial content Playback.

**File:** `tests\ott-app\Skip_Intro.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the Email Address field.
4. Enter the valid email address
5. Click on the Password field.
6. Enter the valid password.
7. Click on the Continue CTA.
8. Click on the Search icon.
9. Search for **"Incognito"** and press Enter.
10. Click on the first content from the first rail.
11. Scroll to episode list.
12. Click on episode2.
13. Click on the Play button.
    - expect: The "Skip Recap" button is displayed during the initial content playback.



### 6. IW3-T3658 Verify the user is able see the Account & subscriptions details in My Space/Profile sections

**File:** `tests\ott-app\Sychor_Changes.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the "Login with TV Provider" option.
4. Select **Frontier** from the available TV Provider options 
5. Click on Continue.
6. Click on the Email Address field.
7. Enter the valid email address 
8. Click on the Password field.
9. Enter the valid password.
10. Click on the Continue CTA.
11. Click on the Account icon at the top right corner.
12. Click on **Account & Settings**.
   - expect: The user is able to view the **Account & Subscription** entitlements.



#### 6.1 IW3-T3659 Verify the user is able to add/remove any contents to the My watchlist page using Add/Remove from watchlist

**File:** `tests\ott-app\Sychor_Changes.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the "Login with TV Provider" option.
4. Select **Frontier** from the available TV Provider options 
5. Click on Continue.
6. Click on the username field.
7. Enter the valid username (e.g ftrfios1@frontier.com)
8. Click on the Password field.
9. Enter the valid password. (e.g:Frontier1)
10. Click on the Sign In CTA.
11. Click on the Search icon.
12. Search for **"Nurse The Dead"** and press Enter.
13. Click on the first content from the first rail.
14. Click on the **+** (Add to Watchlist) icon.
    - expect: A popup with the message **"Added to Watchlist"** is displayed.
15. Click on the **X** (Remove from Watchlist) icon.
    - expect: A popup with the message **"Removed from Watchlist"** is displayed.



#### 1.11 IW3-T4024 Verify the validation of first NFme and last NFme fields inside the "Edit Profiel" screen.

**File:** `tests\ott-app\login-page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `abhilash584@gmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Account icon.
8. Click on the **Account & Settings** option.
9. Click on the **Edit Profile** option.
10. Enter alphanumeric values in the **First Name** and **Last Name** text fields.
   - expect: The **First Name** and **Last Name** fields accept only alphabetic characters.
   - expect: A validation error message is displayed.


#### 1.12 IW3-T1872 Verify the NFvigation on tapping "Watchlist" icon for the PH region guest user. (PH REGION)

**File:** `tests\home\ph_region.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on any free asset.
3. Click on the Watchlist icon.
   - expect: The user is navigated to the Login screen.



#### 1.13 IW3-T1876 Verify the search functioNFlity for the PH region guest user (PH REGION)

**File:** `tests\home\ph_region.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Search icon.
3. Search for a content keyword (e.g., **"Lavender Fields"**).
   - expect: The user is able to fill the text in the search bar for the content.
4. Click on the first content from the first rail.
   - expect: The user is navigated to the Content Details page.
   - expect: The title displayed on the Content Details page matches the searched content title.


#### 1.14 Verify the NFvigation on "Subscribe" CTA  for the PH region guest user.

**File:** `tests\home\ph_region.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
3. Click on the **Cinema One PH** section in the homepage.
4. If the **Try Again** CTA is displayed, end the test and mark it as **Passed**.
5. Otherwise, click on the **Login** CTA.
   - expect: The user is navigated to the Login screen.



####  1.15 IW3-T1856 Verify the error message on tapping "Get Started" by leaving the "Email and Password" screen blank and without password criteria in "Get Started" screen.

**File:** `tests\create-account-navigation.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the **Create Account** link.
4. Select both consent checkboxes.
5. Click on the **Get Started** CTA without entering any details.
   - expect: A valid error message is displayed.


#### 7. IW3-T2047 Verify Add to Watchlist option is not displayed for Live content

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Navigate to the **Live Channels** tray.
8. Click on **DZMM Teleradyo** live content.
   - expect: The **Live** icon is visible in the playback.
   - expect: The **Add to Watchlist** option is not displayed for live content.


#### 7.1. IW3-T2046 Verify content can be played directly from my watchlist.

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://uat.iwanttfc.com/)
3. Login with **free user** credential.
4. Click on the Continue CTA.
5. Search for free tag conetnt.
6. Click on first free tag conetnt.
7. Add content to my watchlist.
- Assert title name of the content.
8. Navigate to my watchlist page
9. Click first content in the rail.
10. Click on playbutton.
11. Wait for 120 seconds till the ad  completes.
12. Tap on playback screen.
- The title displayed while adding the content to the Watchlist and the title displayed in the player should match


#### 7.2 IW3-T2049 Verify that "Free" tag is displayed for free content in my watchlist

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the first **'Free'** tag content in the home page.
8. Click on the Watchlist icon.
9. Navigate to the **My Watchlist** page.
   - expect: The title of the first content in **My Watchlist** matches the   title of the searched content.
   - expect: The added content card displays the **"Free"** tag.
10. Clcik on the first 'free' tag content in the **My watchlist** page.
11. Click on watchlist icon.


#### 7.3 IW3-T2050 Verify that user is able to add free content into my watchlist

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the first **'Free'** tag content in the home page.
8. Click on the Watchlist icon.
- expect Add to watchlist toast is displayed.
9. Navigate to the **My Watchlist** page.
10. Click on the first 'free' tag content in the **My watchlist** page.
- expect: The title of the first content in **My Watchlist** matches the      title of the content added to watchlist.
11. Click on watchlist icon.


#### 7.4 IW3-T2051 Verify that user is able to remove free content from my watchlist

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Login using "freeUser" credentials
4. Click on the first **'Free'** tag content in the home page.
5. Click on the Watchlist icon.
- expect Add to watchlist toast is displayed.
6. Navigate to the **My Watchlist** page.
7. Click on the first 'free' tag content in the **My watchlist** page.
- expect: The title of the first content in **My Watchlist** matches the        title of the content added to watchlist.
8. Click on watchlist icon.
   - expect: A popup with the message **"Removed from Watchlist"** is displayed.


#### 7.5 IW3-T2052 Verify that use is able to add premium content to my watchlist

**File:** `tests\home\watchlist-management.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Search icon.
8. Search for **"Everybody Sing"** and press Enter.
9. Click on the first content from the first rail.
10. Click on the Watchlist icon.
   - expect: The **"Added to Watchlist"** toast message is displayed.
11. Navigate to **My Watchlist** tab
12. Click the first content of the rail.
   - expect: The added content is visible in the My Watchlist.


#### 7.6 IW3-T2053 Verify that user is able to remove premium content from my watchlist

**File:** `tests\home\watchlist-management.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Search icon.
8. Search for **"Everybody Sing"** and press Enter.
9. Click on the first content from the first rail.
10. Click on the Watchlist icon.
   - expect: The **"Removed from the Watchlist"** toast message is displayed.
11. Navigate to the **My Watchlist** tab.
12. Verify the removed content is not displayed in the **My Watchlist**.
   - expect: The removed content is not visible in the **My Watchlist**.


#### 7.7 IW3-T2056 Verify that user is able to add content to my watchlist from search page

**File:** `tests\home\watchlist-management.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Search icon.
8. Search for **"Everybody Sing"** and press Enter.
9. Click on the first content from the first rail.
10. Click on the Watchlist icon.
   - expect: The **"Added to Watchlist"** toast message is displayed.


#### 7.8 IW3-T2057 Verify that user is able to remove content from my watchlist from search page

**File:** `tests\home\watchlist-management.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Search icon.
8. Search for **"Everybody Sing"** and press Enter.
9. Click on the first content from the first rail.
10. Click on the Watchlist icon.
   - expect: The **"Added to Watchlist"** toast message is displayed.
11. Navigate to watchlist tab and click on first content.
12. Click on watchlist icon.
   - expect: The **"Removed from to watchlist"** toast is displayed.


#### 7.9 IW3-T2048 Verify that Movie/Show content in my watchlist page loads correctly with correct thumbnails and meta data
**File:** `tests\home\watchlist-management.spec.ts`
**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Navigate to the **Movies** tab.
- assert content title.
8. Click on the Watchlist icon.
- expect: Added to watchlist message displayed.
9. Navigate to the **My Watchlist** page.
10. Click on the first content in the rail.
   - expect: The added Watchlist items are displayed with the correct titlename and metadata.

### 5.2 IW3-T1934 Verify the content playback from the Continue Watching tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Select any playable content and start playback.
5. Watch the content partially, then exit the player.
6. Navigate to the **Home** page.
7. Locate the content in the **Continue Watching** tray.
8. Select a content from the **Continue Watching** tray.
9. Resume the content from content details page.
10. Click pause in the player screen.
11. Extract the time duration from the player.
12. Navigate back to the homepage.
13. Click the same content that was selected initially.
14. Resume the content from the details page.
15. Observe the player screen and playback behavior.
   - **Expect:** The selected content should resume playback from the last watched position.
   - **Expect:** The player should load successfully without buffering or playback errors.
   - **Expect:** Playback should start seamlessly from the previously watched position.

### 5.3 IW3-T1941 Verify that the content is updated in the Continue Watching (CW) tray when the user partially watches it.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Select a content item from the **Continue Watching** tray.
    - **Extract** the content name
7. Play/resume the content and drag for 2 minutes.
    - **Extract** the player timer.
8. Navigate to **Home** page 
9. Click on the same content again.
10. Exit the player.
11. Navigate to the **Home** page.
12. Observe the content in the **Continue Watching** tray.
    - **Expect:** The content should remain in the **Continue Watching** tray.
    - **Expect:** The progress bar should accurately reflect the updated playback position where the user stopped watching.
- assert content title.
- assert both conetnt matches.
- expect: The added Watchlist items are displayed with the correct titlename and metadata.


### 5.5 IW3-T1951	Verify the Continue Watching tray upon logout and login with same account.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Verify that the **Continue Watching** tray is displayed with existing content.
6. Log out of the application.
7. Log in again using the same user credentials.
8. Navigate to the **Home** page.
9. Observe the **Continue Watching** tray.
   - **Expect:** The **Continue Watching** tray should remain unchanged after logout and login.
   - **Expect:** The previously available content and its watch progress should be preserved.

### 5.6 IW3-T1935 Verify the Navigation on tapping 3 dots and "Details and More" option displayed on the  CW tray bottom bar popup.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate a content card in the **Continue Watching** tray.
7. Hover on the content card.
8. Click on **View More**
9. Observe the navigation.
   - **Expect:** The user should be navigated to the **Content Details** page for the selected content.

### 5.7 IW3-T1945 Verify the content under Continue watching tray upon watching the content from different tabs.

**File:** `tests/home/continue-watching-across-tabs.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **Movies** or **Shows** tab.
5. Select any playable content and start playback.
6. Watch the content partially, then exit the player.
7. Navigate back to the **Home** page.
8. Locate the **Continue Watching** tray.
9. Observe the tray contents.
   - **Expect:** The partially watched content should be displayed in the **Continue Watching** tray.
   - **Expect:** Content watched from different tabs (such as **Movies** and **Shows**) should appear in the **Continue Watching** tray.

### 5.8 IW3-T1958 Verify that "Resume" CTA is displayed inside the details screen for the partially watched contents.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched content item available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Continue Watching** tray where the partially watched content is displayed.
6. Select the content to open its **Content Details** page.
7. Observe the primary playback action.
   - **Expect:** The **"Resume"** button should be displayed on the **Content Details** page for the partially watched content.

### 5.9 IW3-T1959 Verify that content gets resumed on tapping "Resume" CTA.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched content item available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Continue Watching** tray where the partially watched content is displayed.
6. Select the content to open its **Content Details** page.
7. Click the **"Resume"** button.
8. Observe the player screen.
   - **Expect:** The content should resume playback from the previously watched position when the **"Resume"** button is clicked.

### 5.10 IW3-T1927 Verify the Continue Watching tray on the "Home Page" for the new users upon watching 5% of the content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to **Movies** tab.
5. Click on a movie.
6. Click the **Play** button to start playback.
7. Drag the seekbar to 5% of the seekbar.
8. Exit the player
9. Navigate to the **Home** page.
10. Observe the available content trays.
   - **Expect:** A **Continue Watching** tray should be created.
   - **Expect:** The partially watched content should be displayed in the **Continue Watching** tray.

### 5.11 IW3-T1928 Verify the Continue Watching tray  on the "Home Page" for the new users upon watching less than 5% of the content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to **Home** tab.
5. Search for a content and click on the content.
6. Click the **Play** button to start playback.
7. Drag the seekbar to **less than 5%** of the seekbar.
8. Exit the player
9. Navigate to the **Home** page.
10. Observe the available content trays.
   - **Expect:** The **Continue Watching** tray should not be created for a user who watches less than **5%** of the content.
   - **Expect:** The partially watched content should not appear in the **Continue Watching** tray.

### 5.12 IW3-T1929 Verify the Continue Watching tray upon watching 50% of the content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with new user credentials.
4. Search and select a content.
5. Extract the content name.
6. Click the **Play** button to start playback.
7. Drag the seekbar to **50%** of the seekbar.
8. Exit the player
9. Navigate to the **Home** page.
10. Observe the **Continue Watching** tray.
   - **Expect:** The watched content should be displayed in the **Continue Watching** tray after reaching **50%** playback.
   - **Expect:** The progressbar should be filled till 50% of the content.

### 5.13 IW3-T1964 Verify the content from the CW tray when user partially watches the content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched content item available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Select the content from the **Continue Watching** tray.
7. Drag the seekbar for 75% of the Seekbar.
8. Exit the player and return to the **Home** page.
9. Observe the **Continue Watching** tray.
    - **Expect:** The content should remain in the **Continue Watching** tray.
    - **Expect:** The watch progress should be updated based on the latest viewing history.
    - **Expect:** The content should not be removed from the **Continue Watching** tray.

### 5.14 IW3-T1954 Verify that the Up Next binge marker appears and the next episode plays automatically after the current episode ends when resuming content from the Continue Watching (CW) tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched show available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Get only **show** content from Collection graphQL API
7. Select the **show** from the **Continue Watching** tray.
8. Resume playback of the current episode.
9. Drag the seekbar until it reaches the end.
10. Observe the end-of-playback behavior.
   - **Expect:** An **Up Next** binge marker should be displayed near the end of the current episode.
   - **Expect:** After the current episode ends, the next episode should automatically begin playback.

### 5.15 IW3-T1955 Verify "Next Episode" starts playing post tapping on "Next Episode" CTA.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched show available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Get only **show** content from Collection graphQL API
7. Select the **show** from the **Continue Watching** tray.
8. Resume playback of the current episode.
9. Drag the seekbar until it reaches the end.
10. Click on the **Up next** popup.
10. Observe the end-of-playback behavior.
   - **Expect:** An **Up Next** binge marker should be displayed near the end of the current episode.
   - **Expect:** After the current episode ends, the next episode should automatically begin playback.

### 5.16 IW3-T1956 Verify next season first episode starts playing automatically upon completing last episode of the first season.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched multi-season show in the **Continue Watching** tray, with the last episode of **Season 1** available to resume.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Using graphQL API response for continue watching collect only **shows** which has **2 seasons**.
7. Search and select the content name.
8. Play episode 5 of season 1.
9. Drag the seekbar until 50%.
10. Exit the player and return to the **Home** page.
11. Select the same content that was played from **continue watching** tray.
12. Extract the shows which have 2 seasons in the continue watching tray from grapgQL API collection.
13. Select the show from the **Continue Watching** tray.
14. Scroll and Select the last episode of **Season 1**.
15. Drag the seekbar until it reaches the end.
16. Observe the playback after the episode ends.
   - **Expect:** The first episode of **Season 2** should automatically start playing after the last episode of **Season 1** is completed.

### 5.17 IW3-T1942 Verify that Ad gets played for the free user on resuming the content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid **free user** credentials.
5. Navigate to the **Home** page.
6. Hover or the first content under **Continue Watching** tray.
7. Resume playback of the content.
8. Observe the player before the content resumes.
   - **Expect:** An advertisement should play before the content resumes for a free user.
   - **Expect:** After the advertisement finishes, the content should resume from the last watched position.

### 5.18 IW3-T1930 Verify that latest watched episode/movies of a season gets updated in the Continue watching tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Search and navigate to a **show** content.
5. Start playback of an episode.
6. Watch the episode until at least **50%** of its duration has been played.
7. Exit the player and return to the **Home** page.
8. Locate the **Continue Watching** tray.
9. Observe the series card.
   - **Expect:** The **Continue Watching** tray should be updated with the **latest watched episode** from the series.
   - **Expect:** after Hover on The series card, it should display the latest episode based on the user's watch progress.

### 5.19 IW3-T1947 Verify that the subscription popup appears when attempting to play a premium episode of content listed under the Continue Watching tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a freemium series available in the **Continue Watching** tray, where the next episode requires a premium subscription.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid **free user** credentials.
5. Navigate to the **Home** page.
6. Get premium contents from continue watching graphQL API.
7. Click on the content in the continue watching tray.
8. Get premium episode list from the tvshow episodes API using graphQL API.
9. Select episode before the 1st premium episode. 
10. Add wait for 90 seconds for Ads to be completed.
11. Drag the seekbar until end.
12. Observe the behavior after the episode ends.
   - **Expect:** A subscription screen should be displayed before the next premium episode starts.
   - **Expect:** The user should be prompted to subscribe to continue watching the premium episode.

### 5.20 IW3-T1948 Verify that the 'Continue Watching' tray is displayed with content of all types (free and premium).

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Get **Continue watching** API response from graphQL API parser. 
   - **Expect:** Both the partially watched **free** content and **paid** content should be displayed in the **Continue Watching** tray.

### 5.21 IW3-T1961 Verify that show content gets removed from CW tray post completely watching show content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched show available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Using graphQL API response for continue watching collect only **shows**.
7. Click on the content and play Last episode.
8. Drag the seekbar until the end.
9. Navigate to the **Home** page and refresh.
10. Observe the **Continue Watching** tray.
    - **Expect:** Once all episodes of the show have been watched completely, the show should be automatically removed from the **Continue Watching** tray.

### 5.22 IW3-T1946 Verify that the season number and episode number are updated after completing the last episode of the current season and partially playing an episode from the next season.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have partially watched episodes from **Season 1** of a multi-season show so that it appears in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid **valid user** credentials.
5. Navigate to the **Home** page.
6. Using graphQL API response for continue watching collect only **shows** which has **2 seasons**.
7. Search and select the content name.
8. Play episode 5 of season 1.
9. Drag the seekbar until 50%.
10. Exit the player and return to the **Home** page.
11. Select the same content that was played from **continue watching** tray.
12. Select the last Episode from season 1.
13. Drag the seekbar until end.
14. Add wait for 20 seconds.
15. Drag the seekbar until 20%.
16. Exit the player and return to the **Home** page.
17. Observe the **Continue Watching** tray.
    - **Expect:** The **Continue Watching** tray should display the updated **Season** and **Episode** number corresponding to the partially watched episode from **Season 2**.

### 6.1 IW3-T1895 Verify the user Navigates to content details page post tapping on any Movie/Show contents from Home, Shows, Movies, search, My Space pages.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to any page containing playable content (e.g., **Home**, **Movies**, **Shows**, or **Search**).
5. Select any content card.
6. Observe the navigation.
   - **Expect:** The user should be navigated to the **Content Details** page for the selected content.

### 6.2 IW3-T1896 Verify the UI of the Details Page of movie/Show/GMA contents

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://uat.iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to any page containing movie content.
5. Select any movie from a content tray.
6. Observe the **Content Details** page.
   - **Expect:** A **preview screen** with a **Close/Cancel** button should be displayed.
   - **Expect:** The **original content title** should be displayed.
   - **Expect:** The **content metadata** should include:
     - Year of release
     - Genre
     - Runtime
     - Content rating
     - Video quality
     - Audio type
   - **Expect:** One of the appropriate playback actions should be displayed:
     - **Play**
     - **Resume**
     - **Subscribe to Watch**
   - **Expect:** The **content description/summary** should be displayed.
   - **Expect:** A **More/Expand** option should be available if the summary exceeds three lines.
   - **Expect:** The **Language** icon and **Subtitle** icon should be displayed.
   - **Expect:** The **Watchlist** icon and **Share** icon should be displayed.

### 6.3 IW3-T1908 Verify that user can add and Remove the content to 'My Watchlist' on the Details Page.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Content Details** page of any playable content.
5. Click the **My Watchlist** icon to add the content to the watchlist.
6. Verify the confirmation message.
7. Click the **My Watchlist** icon again to remove the content from the watchlist.
8. Observe the **My Watchlist** icon and confirmation message.
   - **Expect:** The selected content should be successfully added to **My Watchlist**, and an **"Added to Watchlist"** confirmation message should be displayed.
   - **Expect:** Clicking the **My Watchlist** icon again should remove the content from **My Watchlist**, and a **"Removed from Watchlist"** confirmation message should be displayed.

### 6.4 IW3-T1909 Verify that user redirect back to detail page post killing/closing the player.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with **valid user** credentials.
4. Navigate to the **Content Details** page of any playable content.
5. Click the **Play** button to start playback.
6. Close or exit the player.
7. Observe the navigation.
   - **Expect:** The user should be redirected back to the **Content Details** page of the same content after closing the player.

### 6.5 IW3-T1913 Verify on tapping "Share" icon "Share link copied to clipboard" message is displayed.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Content Details** page of any playable content.
5. Click the **Share** icon.
6. Observe the confirmation message.
   - **Expect:** A **"Share link copied to clipboard" popup** confirmation message should be displayed.

### 6.6 IW3-T1914 Verify episodes lists are divided and displayed by respective seasons

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to **shows** tab from homepage.
5. Navigate to the **Content Details** page of any show in **shows tab**.
6. Observe the **Episodes** section.
   - **Expect:** The episode list should be grouped and displayed under their respective **Seasons**.
   - **Expect:** Users should be able to distinguish episodes based on the selected season.

### 6.7 IW3-T1915 Verify detail page and All episodes list is scrollable till the end for show contents

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Click on **shows** tab.
5. Navigate to the **Content Details** page of a show with an episode list.
6. Scroll down to the **Episodes** section until the end.
7. Continue scrolling until the last episode is displayed.
9. Observe the episode list.
   - **Expect:** The episode list should be smoothly scrollable until the end.

### 6.8 IW3-T1916 Verify episodes are displayed/listed in ascending order for all the show content.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Content Details** page of an off-air show with episodes.
5. Observe the **Episodes** list.
   - **Expect:** Episodes should be displayed in **ascending order**.
   - **Expect:** The episode sequence should start from the earliest episode and continue sequentially to the latest episode.

### 6.9 IW3-T1921 Verify that respective episode playback starts post tapping on episode cards in detail page

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Click on **shows** tab.
4. Navigate to the **Content Details** page of a show with an episode list.
5. Select any episode from the **Episodes** section.
6. Observe the navigation and playback.
   - **Expect:** The user should be redirected to the **Player** screen.
   - **Expect:** Playback of the selected episode should start successfully.

### 6.10 IW3-T1906 Verify subscription instruction pop up is displayed post tapping on Subscribe CTA for GMA contents

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **GMA** tab.
5. Select any premium GMA content to open its **Content Details** page.
6. Click the **Subscribe to watch** button.
7. Observe the subscription prompt.
   - **Expect:** The user should not be able to watch the selected GMA content.
   - **Expect:** A subscription instruction popup should be displayed after clicking the **Subscribe** button.
   - **Expect:** The popup should prompt the user to subscribe before accessing the content.

### 6.11 IW3-T1899 Verify premium icon is displayed on Detail page for premium contents.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to **GMA** tab.
5. Click on any premium content.
6. Observe the premium indicator.
   - **Expect:** A **Premium** icon should be clearly visible on the selected premium content.
   - **Expect:** The **Premium** icon should be consistently displayed on all premium content.

### 6.12 IW3-T1903 Verify Subscribe CTA is displayed on detail page for Non premium users.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to **GMA** tab.
5. Click on any premium content.
6. Observe the primary action button.
   - **Expect:** A **"Subscribe to Watch"** button should be displayed on the **Content Details** page for free users.

### 6.13 IW3-T1905 Verify that Free users navigate to plans page post tapping on Subscribe CTA

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to **GMA** tab.
5. Click on any premium content.
6. Click the **Subscribe to watch** button.
7. Click the **Subscribe to watch** button in player screen.
8. Observe the navigation.
   - **Expect:** The free user should not be able to play the premium content.
   - **Expect:** The user should be redirected to the **Plans** page after clicking the **Subscribe** button.
### 10.18. IW3-T3672 VeVerify the message displayed on tapping the "Early Access" content as a free or basic plan user.
**File:** `tests/home/early-access-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Login with a valid **Free** user Email and Password.
5. Wait until the **Loading...** indicator disappears.
   *expect:* The **Home** tab should be displayed.
6. Wait for the GraphQL operation **Collection** to complete.
7. Capture the GraphQL response for the **Collection** operation.
8. Create a `CollectionParser` instance using the captured response.
9. Search the parsed collection for an asset whose label is **"Early Access"**.
10. If a matching asset is found:
    - Store the asset details.
    - Retrieve the **Rail Title** containing the asset.
    - Retrieve the **Asset Title**.
    - Retrieve the **Asset ID**.
11. Navigate to the retrieved rail on the **Home** page.
12. Locate the content thumbnail using the retrieved **Asset Title** or **Asset ID**.
    *expect:* The content thumbnail should be visible in the identified rail.
13. Verify that the content thumbnail displays the **"Early Access"** tag.
    *expect:* The **"Early Access"** tag should be displayed on the corresponding content thumbnail.
14. Click on the **Early Access** content thumbnail.
    *expect:* The content **Details** page should be displayed, and the title should match the **Asset Title** retrieved from the GraphQL response.
15. Locate the latest (last) episode that displays the **"Early Access"** tag.
    *expect:* The latest episode should display the **"Early Access"** tag.
16. Click the **Play** button for the latest **Early Access** episode.
    *expect:* The **Unlock Early Access** upgrade prompt should be displayed.
17. Verify the upgrade prompt contains the following:
    *expect* **Upgrade** arrow icon.
    *expect* **"Unlock Early Access"**. title should be displayed
    *expect* **"Upgrade to Premium for exclusive early viewing and be the first to watch the new content."** description should be displayed
    *expect* **"Maybe later"** CTA should be displayed.
    *expect* **"Upgrade to watch now"** CTA should be displayed.

### 10.19. IW3-T3670 Verify the popup displayed when free/basic plan users taps on "Early Access" content..
**File:** `tests/home/early-access-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Login with a valid **Free** user Email and Password.
5. Wait until the **Loading...** indicator disappears.
   *expect:* The **Home** tab should be displayed.
6. Wait for the GraphQL operation **Collection** to complete.
7. Capture the GraphQL response for the **Collection** operation.
8. Create a `CollectionParser` instance using the captured response.
9. Search the parsed collection for an asset whose label is **"Early Access"**.
10. If a matching asset is found:
    - Store the asset details.
    - Retrieve the **Rail Title** containing the asset.
    - Retrieve the **Asset Title**.
    - Retrieve the **Asset ID**.
11. Navigate to the retrieved rail on the **Home** page.
12. Locate the content thumbnail using the retrieved **Asset Title** or **Asset ID**.
    *expect:* The content thumbnail should be visible in the identified rail.
13. Verify that the content thumbnail displays the **"Early Access"** tag.
    *expect:* The **"Early Access"** tag should be displayed on the corresponding content thumbnail.
14. Click on the **Early Access** content thumbnail.
    *expect:* The content **Details** page should be displayed, and the title should match the **Asset Title** retrieved from the GraphQL response.
15. Locate the latest (last) episode that displays the **"Early Access"** tag.
    *expect:* The latest episode should display the **"Early Access"** tag.
16. Click the **Play** button for the latest **Early Access** episode.
    *expect:* The **Unlock Early Access** upgrade prompt should be displayed.

### 10.20. IW3-T3675 Verify the "Early access" tag displayed on the episode thumbnail inside the content details screen.
**File:** `tests/home/early-access-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Login with a valid **Free** user Email and Password.
5. Wait until the **Loading...** indicator disappears.
   *expect:* The **Home** tab should be displayed.
6. Wait for the GraphQL operation **Collection** to complete.
7. Capture the GraphQL response for the **Collection** operation.
8. Create a `CollectionParser` instance using the captured response.
9. Search the parsed collection for an asset whose label is **"Early Access"**.
10. If a matching asset is found:
    - Store the asset details.
    - Retrieve the **Rail Title** containing the asset.
    - Retrieve the **Asset Title**.
    - Retrieve the **Asset ID**.
11. Navigate to the retrieved rail on the **Home** page.
12. Locate the content thumbnail using the retrieved **Asset Title** or **Asset ID**.
    *expect:* The content thumbnail should be visible in the identified rail.
13. Verify that the content thumbnail displays the **"Early Access"** tag.
    *expect:* The **"Early Access"** tag should be displayed on the corresponding content thumbnail.
14. Click on the **Early Access** content thumbnail.
    *expect:* The content **Details** page should be displayed, and the title should match the **Asset Title** retrieved from the GraphQL response.
15. Locate the latest (last) episode that displays the **"Early Access"** tag.
    *expect:* The latest episode should display the **"Early Access"** tag.

### 10.21. IW3-T3679 Verify that "Early Access" content with the tag is not displayed on "Continue Watching" tray upon partially watching.
**File:** `tests/home/early-access-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Login with a valid **Free** user Email and Password.
5. Wait until the **Loading...** indicator disappears.
   *expect:* The **Home** tab should be displayed.
6. Wait for the GraphQL operation **Collection** to complete.
7. Capture the GraphQL response for the **Collection** operation.
8. Create a `CollectionParser` instance using the captured response.
9. Search the parsed collection for an asset whose label is **"Early Access"**.
10. If a matching asset is found:
    - Store the asset details.
    - Retrieve the **Rail Title** containing the asset.
    - Retrieve the **Asset Title**.
    - Retrieve the **Asset ID**.
11. Navigate to the retrieved rail on the **Home** page.
12. Locate the content thumbnail using the retrieved **Asset Title** or **Asset ID**.
    *expect:* The content thumbnail should be visible in the identified rail.
13. Verify that the content thumbnail displays the **"Early Access"** tag.
    *expect:* The **"Early Access"** tag should be displayed on the corresponding content thumbnail.
14. Click on the **Early Access** content thumbnail.
    *expect:* The content **Details** page should be displayed, and the title should match the **Asset Title** retrieved from the GraphQL response.
15. Locate the latest (last) episode that displays the **"Early Access"** tag.
    *expect:* The latest episode should display the **"Early Access"** tag.
16. Click the **Play** button for the latest **Early Access** episode.
    *expect* Video should start playing
17. Watch for 30 secs
18. Click on browser back button
19. Refresh the page and and look for "Continue Watching" qraphql operation
20. In "Conitunue Watching" operation based on my early access **Asset Title** find the "title" and store in a            variable
21. Look for the returnes **Asset Title** in Continue watching tray
   *expect* thumbnail has does not contain "Early Access" tag in continue watching tray

### 10.22. IW3-T3660 Verify user is able to see partially watched content in the Continue Watching (CW) tray
**File:** `tests/home/synacor-page-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL 
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Login with a valid **TV Provider** user Email and Password.
5. Wait until the **Loading...** indicator disappears.
   *expect:* The **Home** tab should be displayed.
6. Wait for the GraphQL operation **Collection** to complete.
7. Capture the **Collection** GraphQL response.
8. Create a `CollectionParser` instance using the captured response.
9. Retrieve a playable **movie** from the parsed collection and store the following details:
   - Movie Title
   - Asset ID
10. Search for the stored movie using the search bar.
    *expect:* The search results should contain the previously stored movie title.
11. Open the searched movie.
    *expect:* The movie **Details** page should be displayed, and the title should match the previously stored movie title.
12. Play the movie for approximately **one minute**.
    *expect:* Video playback should start successfully.
13. Navigate back to the **Home** page.
14. Locate the **Continue Watching** tray.
    *expect:* The **Continue Watching** tray should be visible.
15. Verify that the partially watched movie is displayed in the **Continue Watching** tray.
    *expect:* The movie title should match the previously stored movie title.

#### 10.23. IW3-T3666 Verify that all landing pages will be properly displayed when the user logs in with any  Synacor credentials.
**File:** `tests/home/synacor-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. When user is on "Home" tab
      * expect "Continue Watching" rail should be displayed
   6. When user is on "Movies" tab
      * expect "Trending Movies Worldwide" rail should be displayed
   7. When user is on "Shows" tab
      * expect "Trending Shows Worldwide" rail should be displayed
   8. When user is on "My Watchlist" tab
      * expect "My Watchlist" rail should be displayed
   9. When user is on "GMA" tab
      * expect "Top Streamed" rail should be displayed
   10. Click on Search bar
      * expect the search bar should display inner text as "Search by title, actor, genre..."
   11.  Click on Account icon
      * expect "Sign Out" option should be displayed

### 10.25. IW3-T1852 Verify the navigation on entering a valid email and password on the "Let's Get Started" screen
**File:** `tests/home/registration-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Click on the **Create Account** option.
   *expect:* User should be navigated to the **Create an Account** screen.
5. Click on the **Email Address** field.
6. Enter a valid email address (e.g., `abcde@gmail.com`).
7. Click on the **Password** field.
8. Enter a valid password (e.g., `Abcd@1234`).
9. Click on the **Confirm Password** field.
10. Enter the same password (e.g., `Abcd@1234`) in the **Confirm Password** field.
11. Select the **"I agree to the Terms and Conditions and Privacy Policy."** checkbox.
12. Select the **"I agree to receive marketing communications."** checkbox.
13. Click the **Continue** button.
    *expect:* User should be navigated to the **Verify OTP** screen.

### 10.26. IW3-T1853 Verify the UI/UX of the "Verify Your Email" screen.
**File:** `tests/home/registration-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL 
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Click on the **Create Account** option.
   *expect:* User should be navigated to the **Create an Account** screen.
5. Click on the **Email Address** field.
6. Enter a valid email address (e.g., `abcde@gmail.com`) and store the email address in a variable.
7. Click on the **Password** field.
8. Enter a valid password (e.g., `Abcd@1234`).
9. Click on the **Confirm Password** field.
10. Enter the same password (e.g., `Abcd@1234`) in the **Confirm Password** field.
11. Select the **"I agree to the Terms and Conditions and Privacy Policy."** checkbox.
12. Select the **"I agree to receive marketing communications."** checkbox.
13. Click the **Continue** button.
    *expect:* User should be navigated to the **Verify OTP** screen.
14. Verify the **"A verification OTP was sent to"** message is displayed.
    *expect:* The verification message should be visible.
15. Verify the email address displayed on the **Verify OTP** screen.
    *expect:* The displayed email address should match the email address entered during registration.
16. Verify the **"Input the code below to proceed"** text is displayed.
    *expect:* The instruction text should be visible.
17. Verify the **Verify** button is displayed.
    *expect:* The **Verify** button should be visible.
18. Verify the **Back to Login** link is displayed.
    *expect:* The **Back to Login** link should be visible.

### 10.27. IW3-T1854 Verify the navigation on entering a valid email and password on the "Let's Get Started" screen
**File:** `tests/home/registration-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Click on the **Create Account** option.
   *expect:* User should be navigated to the **Create an Account** screen.
5. Click on the **Email Address** field.
6. Enter a valid email address (e.g., `abcde@gmail.com`).
7. Click on the **Password** field.
8. Enter a valid password (e.g., `Abcd@1234`).
9. Click on the **Confirm Password** field.
10. Enter the same password (e.g., `Abcd@1234`) in the **Confirm Password** field.
11. Select the **"I agree to the Terms and Conditions and Privacy Policy."** checkbox.
12. Select the **"I agree to receive marketing communications."** checkbox.
13. Click the **Continue** button.
    *expect:* User should be navigated to the **Verify OTP** screen.
14. Enter the OTP captured.
15. Click on Verify button
    *expect:* User should be navigated to "Home" screen

### 6.14 IW3-T1910 Verify that user auto redirect back to detail page post completion of movie/last Episode from last Season playback.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **valid user** credentials.
4. Navigate to **Movies** tab.
5. Navigate to the **Content Details** page of any playable content.
6. Click the **Play** button and drag the seekbar to the end.
7. Observe the post-playback behavior.
   - **Expect:** After the video finishes playing, the user should be automatically redirected back to the corresponding **Content Details** page.

### 6.15 IW3-T1897 Verify the redirection to the Detail Page via shared Deeplink URL

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **valid user** credentials.
4. Extract asset's first content ID, Name, ShortDescription from graphQL API collection.
5. Append content ID with details URL (https://iwanttfc.com/details/).
    - **Expect:** The URL should navigate to the details page.
    - **Expect:** Asset name and shortDescription should be reflected as same from the API.

### 6.16 IW3-T1900 Verfiy auto playback of preview/trailer on detail page.

**File:** `tests/home/details-page.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/)
3. Log in with valid user credentials.
4. Using collection parser collect list of contents that has trailers
5. search and Navigate to the Content Details page of a content that has a preview/trailer.
6. Verify the content details page is displayed successfully.
7. Wait for 1–3 seconds without interacting with the page.
8. Observe the preview area.
    - **Expect:** The Preview/Trailer should start playing automatically without any user interaction.
    - **Expect:** The preview/video element should be visible and playback should begin automatically.

### 10.1 IW3-T4702 Verify that contents are played for the VPN whitelisted countries.

**File:** `tests/home/playback.spec.ts`

**Steps**

1. **Precondition:** Connect the test device/system to a VPN endpoint located in a **whitelisted country**.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Search and Navigate to any show content from the graphQL collection API.
6. Click the **Play** button to start playback.
7. Observe the player behavior.
   - **Expect:** The content should start playing successfully.
   - **Expect:** Playback should be allowed while the user is connected to a VPN from a **whitelisted country**.

### 11.1 IW3-T5810 Verify iWant Originals Rail displayed on the "Home" page.

**File:** `tests/home/iwant-originals.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Home** page.
5. Scroll down until the **"iWant Originals"** rail is visible.
6. Observe the **"iWant Originals"** rail.
   - **Expect:** The **"iWant Originals"** rail should be displayed on the **Home** page.
   - **Expect:** The rail should contain content cards associated with **iWant Originals**.

### 11.2 IW3-T5814 Verify that "iWant Originals" tray contents are scrollable on tapping right or left arrow mark.

**File:** `tests/home/iwant-originals.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Home** page.
5. Scroll down until the **"iWant Originals"** rail is visible.
6. Click the **Right** arrow on the **"iWant Originals"** rail.
7. Verify that the content thumbnails vertical scroll to the right.
8. Click the **Left** arrow on the **"iWant Originals"** rail.
9. Verify that the content thumbnails vertical scroll to the left.
   - **Expect:** The **"iWant Originals"** rail should scroll smoothly in both directions when the **Left** or **Right** arrow is clicked.
   - **Expect:** The user should be able to browse all content available in the **"iWant Originals"** rail.

### 11.3 IW3-T5812 Verify preview playback starts on Mouse hover on the content thumbnail under iWant Originals content

**File:** `tests/home/iwant-originals.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Home** page.
5. Scroll down until the **"iWant Originals"** rail is visible.
6. Hover the mouse over the first content thumbnail in the **"iWant Originals"** rail.
7. Observe the content thumbnail.
   - **Expect:** The content preview should start playing automatically when the mouse is hovered over the thumbnail.

### 11.4 IW3-T5813 Verify preview playback on Content Detail Page when user selects the content from the  iWant Originals tray.

**File:** `tests/home/iwant-originals.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Home** page.
5. Scroll down until the **"iWant Originals"** rail is visible.
6. Hover the mouse over first content thumbnail in the **"iWant Originals"** rail.
7. Click the content thumbnail to open the **Content Details** page.
8. Observe the preview area on the **Content Details** page.
   - **Expect:** The user should be navigated to the **Content Details** page successfully.
   - **Expect:** The **Preview/Trailer** should start playing automatically on the **Content Details** page without any user interaction.

### 7.1 IW3-T2129 Verify Mid rail banner ads are from GAM.

**File:** `tests/home/landing-page.spec.ts`

**Steps**

1. **Precondition:** Mid-rail banner ads are configured and enabled in the test environment.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Catch API through network logs which has this URL (https://securepubads.g.doubleclick.net/gampad/ads)
6. Navigate to the **Home**.
7. Scroll through each page until the mid-rail banner ad is displayed.
8. Navigate to the **Movies**.
9. Scroll through each page until the mid-rail banner ad is displayed.
10. Navigate to the **Shows**.
11. Scroll through each page until the mid-rail banner ad is displayed.
12. Observe the network requests generated for the banner ad.
   - **Expect:** The mid-rail banner advertisements displayed across all landing pages should be from this URL https://securepubads.g.doubleclick.net/gampad/ads.

### 7.2 IW3-T2133 Verify Mid rail Ad banner auto refreshes after every 30 sec

**File:** `tests/home/landing-page.spec.ts`

**Steps**

1. **Precondition:** Mid-rail banner ads are configured and enabled in the test environment.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate through the **Home**, **Shows**, **Movies**, **GMA**, and **Search** pages.
6. Scroll until a **Mid-rail Banner Ad** is displayed.
7. Open **Charles Proxy** and monitor the **Google Publisher Ads (pubads)** API requests.
8. Observe the ad for at least **30 seconds**.
9. Verify the network requests in Charles Proxy.
   - **Expect:** The **Mid-rail Banner Ad** should automatically refresh every **30 seconds**.
   - **Expect:** A new **Google Publisher Ads (pubads)** API request should be triggered for each ad refresh.

#### Landing_page IW3-T1890 [WEB] - Verify that the details page is displayed upon clicking the "info" icon in the carousel.

**File:** `tests/home/landing_page.spec.ts`

**Steps**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Tap on the **Info** icon for any content in the carousel.
   - expect: The content title is displayed.
   - expect: The content metadata is displayed.



#### Landing_page IW3-T1894 Verify that the subscription page is displayed when a logged-in free user taps the "Subscribe to Watch" CTA from the carousel.

**File:** `tests/home/landing_page.spec.ts`

**Steps**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Click on the Search icon.
6. Search for **"Everybody Sing"** and press Enter.
7. Click on the first content from the first rail.
8. Click on Play Button.
- expect subscription blocker page should be displayed.



#### Landing_page IW3-T1887 Verify that the user is Navigated to the content detail screen when selecting any content from various screens.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Navigate to the **Movies** tab
6. Click on the first content in the **Trending Movies Worldwide** section.
   - expect: The user is navigated to the content details page.
   - expect: The content title and metadata are displayed.
7. Navigate to the **Shows** tab
   - expect: The user is navigated to the content details page.
   - expect: The content title and metadata are displayed.
8. Navigate to the **GMA** tab
   - expect: The user is navigated to the content details page.
   - expect: The content title and metadata are displayed.


#### Landing_page IW3-T1883 Verify that the user can scroll through the entire carousel from left to right and vice versa on all landing pages.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Hover over the home page banner.
6. Click on the **Right** arrow.
   - expect: The carousel contents scroll to the right.
   - expect: All carousel contents are visible.
7. Hover over the home page banner.
8. Click on the **Left** arrow.
   - expect: The carousel contents scroll to the left.
   - expect: All carousel contents are visible.

#### Landing_page IW3-T4340 Verify Next and Previous page will be displayed when user click on Previous/Next link in Welcome / Introduction page

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the Term and Condition link
3. Click on arrow.
- Assert the text "For customers in the Philippines".
4. Click on Next page arrow button.
- Next page with title "For customers in the Philippines" should be displayd.



#### Landing_page IW3-T4705 Vertify that "Top 10" tag displayed on the content thumbnail on searching the top 10 rail content.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**

1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Click on the Search icon.
6. Search for **"Alibi"** and press Enter.
- expect: In first rail **"Top 10"** tag should be displayed on the content thumbnial.

#### Landing_page IW3-T4706 Verify that "Top 10" tag displayed on the content thumbnail on adding the  top 10 rail content to "Watchlist"

**File:** `tests/home/landing_page.spec.ts`

**Steps:**

1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Scroll to **"Top 10 Shows"** tray.
6. Select first content from the rail.
7. Cilck on the wathlist icon.
8. Navigate to watchlist tab.
- expect: In first rail **"Top 10"** tag should be displayed on the content thumbnial.

#### Landing_page IW3-T1886 Verify that related content and trays are displayed under Shows, Movies, and GMA (only outside the Philippines).

**File:** `tests/home/landing_page.spec.ts`

**Steps:**

1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Navigate to "Movies tab.
- expect: **Trending Movies Worldwide** tray should be present.
6. Navigate to "Shows" tab.
- expect: **Trending Shows Worldwide** tray should be present
7. Navigate to **GMA** tab.
- expect: **Subscribe to GMA Pinoy Bundle to Watch** metadata should be visible.


#### Landing_page IW3-T1888 Verify that user Navigates back to previous page on tapping back button from details page. 

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Navigate to the **Movies** tab
6. Click on the first content in the **Trending Movies Worldwide** section.
   - expect: The user is navigated to the content details page.
   - expect: The content title and metadata are displayed.
7. Navigate back.
   - expect: Navigated back to the **Movies** page.
8. Navigate to the **Shows** tab
   - expect: The user is navigated to the content details page.
   - expect: The content title and metadata are displayed.
9. Navigate back.
   - expect: Navigated back to the **Shows** page.
10. Navigate to the **GMA** tab
   - expect: The user is navigated to the content details page.
   - expect: The content title and metadata are displayed.
11. Navigate back.
   - expect: Navigated back to the **GMA** page.


#### Landing_page IW3-T4659 Verify that the “Because You Watched {Movie Title/Show Title}” rail displays movies/shows belonging to the same genre as the watched content.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Navigate to "movies" tab.
6. Click on any contnet in the page.
- assert the meta data of the content.
7. Click on play button.
8. Drag seek bar upto 95%.
9. Navigate to home page.
10. Scroll till "Beacause you watched this" tray.
11. Clik on first content.
- assert the meta data.
- compare both meta data contains display movies that belong to the same genre as the watched movie.


#### Landing_page IW3-T4660 Verify that the “Because You Watched {Movie Title/Show title}” rail updates dyNFmically when the user watches a movie from a different genre.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter fvalid email and password credentials.
4. Click on the Continue CTA.
5. Return a "Action" gern content from the GraphQL collection API.
6. Click on search icon
7. Search/Type content returned
8. Click on first content of the search list.
- expect: Meta data should be visible.
9. Clcik on play button.
10. Scroll till the end of the seek bar.
11. Scroll till **Because you watched** tray.
12. Click on first content.
- expect: The metadata genre should match the genre of the watched content.
13. Return a "Comedy" gern content from the GraphQL collection API.
14. Repeat the step6 to step 12.
- assert that the tray contents are updated based on the genre of the watched content.

#### Landing_page IW3-T2127 Verify Mid rail banner Adl is Displayed on Home, Shows, Movies, GMA, Search pages. 

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Navigate to **Home** tab.
6. Scroll till mid rail ad banner.
- Asset if the ad is visible.
7. Navigate to **Movies** tab.
- Asset if the ad is visible.
8. Navigate to **Shows** tab.
- Asset if the ad is visible.

#### Landing_page IW3-T2128 Verify Mid rail banner ad loads without any issues on page refresh.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Navigate to **Home** tab.
6. Scroll till mid rail ad banner.
- Asset if the ad is visible.
7. Navigate to **Movies** tab.
- Asset if the ad is visible.
8. Navigate to **Shows** tab.
- Asset if the ad is visible.
9. Refresh the page
10. Navigate to **Home** tab.
11. Scroll till mid rail ad banner.
- Asset if the ad is visible.
12. Navigate to **Movies** tab.
- Asset if the ad is visible.
13. Navigate to **Shows** tab.
- Asset if the ad is visible.

#### Landing_page IW3-T2130 Verify that Mid rail Ad banner displayed for free users.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Navigate to **Home** tab.
6. Scroll till mid rail ad banner.
- Asset if the ad is visible.
7. Navigate to **Movies** tab.
- Asset if the ad is visible.
8. Navigate to **Shows** tab.
- Asset if the ad is visible.

#### Ad IW3-T3980 Verfiy that billboard ad banner displays for only Guest users, Free users and Basic Plan users.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Click on first "Free" tag content.
6. Wait till the ad completes.
7. Tap on playback screen.
- expect: the ad banner should be visible.


#### Ads IW3-T3648 Verify Mid rail banner Ad is displayed on Home, Shows, Movies, GMA, Search pages.

**File:** `tests/home/landing_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Navigate to **Home** tab.
6. Scroll till mid rail ad banner.
- Asset if the ad is visible.
7. Navigate to **Movies** tab.
- Asset if the ad is visible.
8. Navigate to **Shows** tab.
- Asset if the ad is visible.

#### Ads Verify pause ads are displayed on pausing the live content as guest or free or basic user.
**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Navigate to the **Live Channels** tray.
6. Click on **DZMM Teleradyo** live content.
   - expect: The **Live** icon is visible in the playback.
7. Click on the playback screen.
8. Wait for 5 seconds
- expect: Pause Ads should be displayed.


#### IW3-T3991 Verify that pause ads NOT displayed for Premium or GMA plan users. 

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid email and password credentials.
4. Click on the Continue CTA.
5. Clik on first content.
6. Play for 10 seconds.
7. Resume the player.
- expect: The pause add banner should not be visible.

#### Ads IW3-T3978 Verify that pause ad appears on player screen for all type of contents during pause state

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Navigate to the **Live Channels** tray.
6. Click on first free channel.
7. Tap on playback screen.
- expect: Pause ad should be displayed.
8. Click on back button.
9. Navgate to "Movies" tab.
10. Click on first free tag content.
11. Tap on playback screen.
- expect: Pause ad should  be displayed.
12. Click on back button.
13. Navigate to Shows tab.
14. Clcik on first free content.
15. Tap on playback screen.
- expect: Pause ad should be displayed.

#### Landing_page IW3-T3669 Verify that subscribed users with "Premium Monthly, Premium Annual, GMA Pinoy Bundle Monthly, GMA Pinoy Bundle Annual" plans can watch "Early Access"  episodes.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a Early access tag content from collection graphQL API.
6. Click on search icon.
7. Search/Type Early access tag content returned
- except Thumbnails should show correct 'Early access' tags on search page (Use   search graphql api response to validate field name : type, should be equal to Early access)
8. Click on the first content searched.
9. Scroll the content details page till early access tag is visible on the episode thumbnail.
10. Click on the episode which has the early access tag.
- expect: The content should be played.



#### Ad IW3-T3985 Verify pause ad disappears on player screen when playback resumes.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Click on first "Free" tag content.
6. Wait till the ad completes.
7. Tap on playback screen.
- expect: the ad banner should be visible.
8. Click on back button.
- expect: the ad banner should not be visible.

#### Ad IW3-T4017 Verify "Pause Ads" are not displayed when the video is playing. 

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Click on first "Free" tag content.
6. Wait till the ad completes.
- expect: the pause ad should not be visible.

#### Ad IW3-T3992 Verify user should not be able to seek the content when the pause ad is displayed.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
8. Wait till the ad completes.
9. Tap on playback screen.
- expect: the ad banner should be visible.
- expect: the seek bar should not be visible.


#### Ad IW3-T3997 Verify that the "Dismiss Ad" CTA is displayed on the "Pause Ad" screen.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
8. Wait till the ad completes.
9. Tap on playback screen.
- expect: the ad banner should be visible.
10. Click on "Press any button to return to content".
- expect: The playerscreen should be displayed with title and the seek bar.

#### Ad IW3-T3988 Verify pause ad appears on repeated pauses during playback

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
8. Wait till the ad completes.
9. Tap on playback screen.
- expect: the ad banner should be visible.
10. Click on "Press any button to return to content".
- expect: The playerscreen should be displayed with title and the seek bar.
11. Wait for 5 seconds.
12. Repeat the step 10 and 11 three times.
- The ad banner should be displayed every time the playback is paused.

#### Ad IW3-T4014 Verify "Pause Screen" is displayed for all type of contents on pausing the content as a premium or GMA user.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid user email and password credentials.
4. Click on the Continue CTA.
5. Navigate to **Movies** tab.
6. Click on the first content in the rail.
7. Click on search icon
8. Tap on playback screen.
9. Wait for 5 seconds.
- expect: The pause screen should be displayed and the playback timestamp should remain unchanged.
- expect: the ad banner should not be visible.
11. Navigate to **Shows** tab.
12. Click on the first content in the rail.
13. Click on search icon
14. Tap on playback screen.
15. Wait for 5 seconds.
- expect: The pause screen should be displayed and the playback timestamp should remain unchanged.
- expect: the ad banner should not be visible.

#### Ad IW3-T3995 Verify that on tapping back button from the pause ads screen user Navigated to previous screen.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
9. Wait till the ad completes.
10. Tap on playback screen.
- expect: the ad banner should be visible.
11. Click on back button.
- expect: Navigated to previous screen on tapping back button from the
pause ads screen.

#### Ad IW3-T4018 Verify all the player controls gets dismissed when the "Pause Ad" is displayed.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Click on "Search" icon.
6. Search for "Can't buy me love".
7. Click on first content of the search list.
8. Scroll and click on episode 4.
9. Wait till the ad completes.
10. Verify that the "Skip recap" button is visible
11. Tap on playback screen.
- expect: Pause ad screen visible.
- expect: "Skip recap" button not visible.
12. Tap on playback screen.
13. Click on "skip recap" button.
- expect: "Skip intro" button visible.
14. Tap on playback screen.
- expect: Pause ad screen visible.
- expect: "Skip intro" button not visible.
15. Hover over the playback screen.
16. Click on the subtitle button.
- expect: "Subtiitles" are visible.
17. Tap on playback screen.
- expect: Pause ad screen visible.
- expect: "Subtitles" are not visible.

#### Ad IW3-T3981 Verfiy that pause ad is clickable by user intercations.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
8. Wait till the ad completes.
9. Tap on playback screen.
- expect: the Pause ad banner should be visible.
- expect: the Pause ad banner should be clickable.

#### Ad IW3-T3990 Verify that pause ads are displayed in the "Full" screen.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
9. Wait till the ad completes.
10. Click on "Full screen" button.
11. Tap on the playback screen.
- expect: Pause ad is visible. 
12. Return to the playback screen.
13. Clcik on "Full screen" button.
14. Tap on playback screen
- expect: Pause ad should be visible.
- expect: Pause ad is visible in both "Maximize" and "Minimize" screen.

#### Ad IW3-T4019 Verify that "Mid-roll" ads are displayed on playing the content in full screen.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
9. Wait till the ad completes.
10. Click on the "Full screen" button.
11. Drag till 75% of the progress bar.
- expect: Mid roll ad is displayed in Full screen.

#### Ad IW3-T4013 Verify "Next Episode" plays in full screen.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter valid user email and password credentials.
4. Click on the Continue CTA.
6. Navigate to "Shows" tab.
7. Click first tvshow content.
8. Clcik on play button.
10. Wait till the ad completes.
11. Click on the "Full screen" button.
12. Drag till 99% of the progress bar.
13. Click on "Up next" binge.
- expect: New episode should be played in "Full screen" mode.

#### Ad IW3-T4009 Verify that Pause Ads are displayed for Basic users when Micro Drama content is paused.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Retrieve a free content item from the "Quick Feels" tilte using the Collection GraphQL API.
6. Click on search icon
7. Search/Type free content returned.
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
9. Wait till the ad completes.
10. Tap on playback screen.
- expect: the ad banner should be visible.


#### Ad IW3-T4003 Verify that pause ads do not reappear on re pausing the content within 3 sec after resuming.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
8. Wait till the ad completes.
9. Tap on playback screen.
- expect: the ad banner should be visible.
10. Click on "Press any button to return to content".
11. Tap on playback screen.
- expect: Pause ad should not visible within 3 seconds.

#### Watchlist IW3-T2054 Verify that user is able to add Movie/Show content with tags: "Recently Added", "New Episode",etc.. and tags are displayed correctly on my watchlist page

**File:** `tests/home/watchlist-management.spec.ts`

**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Return a "Recently Added" content , "Top 10","Early Access" and "New Episode" content from collection graphQL API
   6. Click on search icon
   7. Search/Type "Recently Added" content returned
   - except Thumbnails should show correct "Recently Added" tags on search page (Use search graphql api response to validate field name : type, should be equal to Free)
   8. Click on first content of the search list.
   9. Clcik on watchlist icon.
   - expect: "Added to Watchlist" toast message is displayed.
   10. Navigate to **My watchlist** tab.
   - expecet: First thumbnail should show correct "Recently Added" tag on watchlist page (Use search graphql api response to validate field name : type, should be equal to "Recently Added")
   11. Navigate back to **Home** tab. 
   12. Repeat the same steps for all "Top 10", "Early Access" and  "New Episode" contents.

#### Ad IW3-T4011 Verify that Pause Ads are not getting overlapped with the dismiss ad button and content title on player screen

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
8. Wait till the ad completes.
9. Tap on playback screen.
- expect: The ad banner should not be overlap the "Press any button to return to content".


#### Ad IW3-T4015 Verify pause ads are not overlapped on the "Up Next" binge marker.

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free content content from collection graphQL API
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
8. Wait till the ad completes.
10. Drag till 99% of the seek bar.
- expect: Up next binge marker is visible.
11. Tap on playback screen.
- expect: The ad banner should not be overlap the "Up next" thumbnail.


#### Ad IW3-T4010 Verify that Pause Ads are not displayed on Skip Intro / Skip Recap/ Go Live CTA when the user pauses the content

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free show from the GraphQL collection API that has more than two free episodes. Exclude content from the "Quick Feels" and "Live" categories.
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
9. Scroll till the "second" free episode content.
10. Click on "Second" episode.
11. Wait till the ad completes.
- Expect: "Skip into" button is visible.
12. Tap on playback screen
- expect: "Skip intro" button should not overlap the "pause ad".
13. Click on "Skip intro" button.
- expect: "Skip recap" button should be visible.
14. Tap on playback screen.
- expect: "Skip recap" button should not overlap the "pause ad".
15. Click on back button.
16. Select free live content.
17. Tap on playback scree.
- expect: "Go live" button should be visible.
- expect: "Pause ad" should not overlap the "Go live" button.


#### Ads IW3-T3986 Verify that pause ad displays for the differnet region, users 

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter free user email and password credentials.
4. Click on the Continue CTA.
5. Return a free show content from the GraphQL collection API.Exclude content from the "Quick Feels" and "Live" categories.
6. Click on search icon
7. Search/Type free content returned
- except Thumbnails should show correct 'Free' tags on search page (Use search  graphql api response to validate field name : type, should be equal to Free)
8. Click on first content of the search list.
9. Click on play button.
10. Pause the palyback screen.
- expect: The pause ad banner should be visible.
11. Clcik on back button. 
12. Click on Account and select sigh out.
13. Login with "tvUser" credentials.
14. Repeat step5 to step11.


#### Ads IW3-T2135 Verify Sponsored Rail is Displayed on Home, Shows, Movies, GMA pages. mWeb 

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate .
2. Click on "Menu".
3. Select "Home" tab.
4. Scroll till "Sponsed Rail"
- expect:sponsed rail should be visible.


#### Ads IW3-T2146 Verfiy that Sponsered rail is non clickable/tappable except the content cards. mWeb  
**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate .
2. Click on "Menu".
3. Select "Home" tab.
4. Scroll till "Sponsed Rail"
- expect:sponsed rail should be visible.
5. Click on rail except contnet cards.
- expect:Clcik action should not redirect to any page.

 #### Ads IW3-T2137 Verify Advertiser logo is displayed on Sponsored Rails which is configured by CMS. mWeb 

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate .
2. Click on "Menu".
3. Select "Home" tab.
4. Scroll till "Sponsed Rail"
- expect:Advertisement logo should be visible in sponserd rail.


#### Ads IW3-T2149 Verify user redirects to respective detail page post tapping content cards in sponsered rail. mWeb 

**File:** `tests/home/ads.spec.ts`

**Steps:**
1. Open the browser and navigate .
2. Click on "Menu".
3. Select "Home" tab.
4. Scroll till "Sponsed Rail".
5. Click on any content.
6. Assert the Title of the content card.
- expect:By clciking it should redirect to same details page.