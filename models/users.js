/**
 * Users model
 * Handles database CRUD operations
 * @module models/Users
 */

const db = require('../helpers/database');
const bcrypt = require('bcrypt');

/**
 * Gets a single user by ID
 * @param {Number} id ID of the user
 * @returns {Array} array with a single user
 */
exports.getById = async function getById (id) {
  const query = "SELECT * FROM users WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Gets a single user by username
 * @param {String} username username of the user
 * @returns {Array} array with a single user
 */
exports.findByUsername = async function getByUsername(username) {
  const query = "SELECT * FROM users WHERE username = ?;";
  const user = await db.run_query(query, username);
  return user;
}

/**
 * Gets all users from the database
 * @param {Number} page page to retrieve
 * @param {Number} limit amount of results to retrieve
 * @param {String} order field to order results by
 * @returns {Array} array containing all users
 */
exports.getAll = async function getAll (page, limit, order) {
  const offset = (page - 1) * limit;
  const values = [order, parseInt(limit), parseInt(offset)];
  const query = "SELECT * FROM users ORDER BY ?? LIMIT ? OFFSET ?;";
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Creates a new user
 * @param {String} user.email user email
 * @param {String} user.username user username
 * @param {String} user.fullName user full name
 * @param {String} user.password user password
 * @param {Sting} user.country user country
 * @param {Object} user.city user city
 * @param {String} user.postcode user postcode
 * @param {String} user.address user address
 * @returns {Object} operation status
 */
exports.add = async function add (user) {
  const query = "INSERT INTO users SET ?";
  const password = user.password;
  const hash = bcrypt.hashSync(password, 10);
  user.password = hash;
  const data = await db.run_query(query, user);
  return data;
}

/**
 * Deletes a single user by ID
 * @param {Number} id ID of the user
 * @returns {Object} operation status
 */
exports.delById = async function delById (id) {
  const query = "DELETE FROM users WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

/**
 * Updates an existing user
 * @param {String} user.email user email
 * @param {String} user.username user username
 * @param {String} user.fullName user full name
 * @param {String} user.password user password
 * @param {Sting} user.country user country
 * @param {Object} user.city user city
 * @param {String} user.postcode user postcode
 * @param {String} user.address user address
 * @returns {Object} operation status
 */
exports.update = async function update (user) {
  const query = "UPDATE users SET ? WHERE ID = ?;";
  if (user.password) {
    const password = user.password;
    const hash = bcrypt.hashSync(password, 10);
    user.password = hash;  
  }
  const values = [user, user.ID];
  const data = await db.run_query(query, values);
  return data;
}