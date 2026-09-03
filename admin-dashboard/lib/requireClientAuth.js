const { verifyClientSessionCookie } = require('./clientSession');

/** Guards the client-view routes. 401s on a missing/invalid/expired client session cookie. */
function requireClientAuth(req, res, next) {
  const secret = process.env.SESSION_SECRET;
  const session = secret && verifyClientSessionCookie(req.headers.cookie, secret);
  if (session) {
    req.clientId = session.clientId;
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

module.exports = { requireClientAuth };
