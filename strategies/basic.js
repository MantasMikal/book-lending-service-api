/**
 * Basic Auth strategy
 * Handles user authentication
 * @module strategies/Basic
 */

const BasicStrategy = require("passport-http").BasicStrategy;
const users = require("../models/users");
const bcrypt = require("bcrypt");

/**
 * compare hash of password with the stored hash in the DB
 * @param {Object} user user object
 * @param {String} password password hash 
 */
const verifyPassword = function (user, password) {
  const isMatch = bcrypt.compareSync(password, user.password);
  return isMatch;
};

/**
 * looks up the user and checks the password if the user exists
 * @param {String} username user username 
 * @param {String} password password hash 
 * @param {Function} done callback when function is done
 */
const checkUserAndPass = async (username, password, done) => {
  let result;

  try {
    result = await users.findByUsername(username);
  } catch (error) {
    console.error(`Error during authentication for user ${username}`);
    return done(error);
  }

  if (result.length) {
    const user = result[0];
    if (verifyPassword(user, password)) {
      return done(null, user);
    }
  }
  return done(null, false);
};

const strategy = new BasicStrategy(checkUserAndPass);
module.exports = strategy;
