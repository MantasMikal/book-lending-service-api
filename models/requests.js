/**
 * Requests model
 * Handles database CRUD operations
 * @module models/Requests
 */

const db = require("../helpers/database");

/**
 * Gets a single request
 * @param {Number} id ID of the request
 * @returns {Array} array with a single request
 */
exports.getById = async function getById(id) {
  const query = "SELECT * FROM requests WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Gets all requests by user ID from the database
 * @param {Number} userID user ID
 * @param {Number} page page to retrieve
 * @param {Number} limit amount of results to retrieve
 * @param {String} order field to order results by
 * @param {String} direction direction to order results by
 * @returns {Array} array containing all user requests
 */
exports.getByUserId = async function getByUserId(
  userId,
  page,
  limit,
  order,
  direction
) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === "DESC") {
    query =
      "SELECT * FROM requests WHERE (requesterID = ? OR bookOwnerID = ?) ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query =
      "SELECT * FROM requests WHERE (requesterID = ? OR bookOwnerID = ?) ORDER BY ?? ASC LIMIT ? OFFSET ?;";
  }
  const values = [userId, userId, order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Creates a new request
 * @param {String} request.title request title
 * @param {Number} request.requesterID user ID of the requester
 * @param {Number} request.bookOwnerID user ID of the book owner
 * @param {String} request.status request status
 * @param {Boolean} request.isArchivedByRequester is archived by requester
 * @param {Boolean} request.isArchivedByReceiver is archived by receiver
 * @param {Number} request.bookID book ID
 * @returns {Object} operation status
 */
exports.add = async function add(request) {
  const query = "INSERT INTO requests SET ?";
  const data = await db.run_query(query, request);
  return data;
};

/**
 * Deletes a single request by ID
 * @param {Number} id ID of the request
 * @returns {Object} operation status
 */
exports.delById = async function delById(id) {
  const query = "DELETE FROM requests WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Creates a new request
 * @param {String} request.title request title
 * @param {Number} request.requesterID user ID of the requester
 * @param {Number} request.bookOwnerID user ID of the book owner
 * @param {String} request.status request status
 * @param {Boolean} request.isArchivedByRequester is archived by requester
 * @param {Boolean} request.isArchivedByReceiver is archived by receiver
 * @param {Number} request.bookID book ID
 * @returns {Object} operation status
 */
exports.update = async function update(request) {
  const query = "UPDATE requests SET ? WHERE ID = ?;";
  const values = [request, request.ID];
  const data = await db.run_query(query, values);
  return data;
};
