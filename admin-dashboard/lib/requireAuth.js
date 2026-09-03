const { verifySessionCookie } = require('./auth');

/** Guards every route except /api/login and /api/setup. 401s on a missing/invalid/expired session cookie. */
function requireAuth(req, res, next) {
  const secret = process.env.SESSION_SECRET;
  const session = secret && verifySessionCookie(req.headers.cookie, secret);
  if (session) {
    req.adminUsername = session.username;
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

module.exports = { requireAuth };
