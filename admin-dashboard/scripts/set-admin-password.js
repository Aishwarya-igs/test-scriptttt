#!/usr/bin/env node
/**
 * Recovery path: (re)sets the admin account directly on disk, for someone
 * with filesystem access to this machine who forgot the password or needs
 * to bootstrap without the browser's first-run "Create account" form.
 * Unlike that form, this always succeeds — it will happily overwrite an
 * existing account, which is exactly what a password reset needs to do.
 *
 * Usage: node admin-dashboard/scripts/set-admin-password.js <username> <password>
 */
const { writeAccount } = require('../lib/adminAccount');

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('Usage: node scripts/set-admin-password.js <username> <password>');
  process.exit(1);
}

try {
  writeAccount({ username, password });
  console.log(`Admin account set for "${username}". You can sign in now.`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
