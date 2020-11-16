// Set up passport and its authentications strategies.
// Importing this module in a route gives a middleware handler that can be used
// to protect downstream handlers by rejecting unauthenticated requests.

const passport = require('koa-passport');
const basicAuth = require('../strategies/basic');

passport.use(basicAuth);

module.exports = passport.authenticate(['basic'], {session:false});
