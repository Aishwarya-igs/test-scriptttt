# Authentication Skill

> Extracted verbatim from NewPromptFile.md

### Test Case: TC_AUTH_001 - Login with Premium User Credentials
- **Feature Area**: Authentication
- **Priority**: P0
- **Subscription Tier**: Premium
- **Test Type**: Functional / Smoke
- **Test Scope**: Happy Path

### Strict Rules
- Load credentials and test data from .env variables (for example VALID_LOGIN_EMAIL, VALID_LOGIN_PASSWORD, MOBILE_LOGIN_*); do not hardcode them in tests, business functions, or JSON.
- If the required .env values are missing or the environment blocks execution, record the testcase as Blocked with evidence.
 
#### Business Functions Required:
1. loginToOTT
   - Input: email, password
   - Output: isLoggedIn, userPlan, username
   - Assertion: isLoggedIn === true, userPlan === 'premium'
 
 
#### Execution Order:
1. Call loginToOTT with premium user credentials
2. Verify isLoggedIn is true
3. Verify userPlan is 'premium'
4. Verify username is displayed
 
#### BF Gap Analysis:
- loginToOTT: EXISTS in manifest (path: businessFunction/ott-auth-bfs, export: loginToOTT)
```

   - Authentication Test Cases:
     * Verify login succeeds with correct credentials
     * Verify logout clears session
     * Verify multi-device login respects device limits
     * Verify session timeout behavior

  * Authentication: loginToOTT, logoutFromOTT, registerUser, validateMultiDeviceLogin
