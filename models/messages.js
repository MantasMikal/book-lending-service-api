/**
 * Messages model
 * Handles database CRUD operations
 * @module models/Messages
 */

const db = require("../helpers/database");

/**
 * Gets a single message by ID
 * @param {Number} id ID of the book
 * @returns {Array} array with a single message
 */
exports.getById = async function getById(id) {
  const query = "SELECT * FROM messages WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Gets all messages by request ID from the database
 * @param {Number} requestID request ID
 * @param {Number} page page to retrieve
 * @param {Number} limit amount of results to retrieve
 * @param {String} order field to order results by
 * @param {String} direction direction to order results by
 * @returns {Array} array containing all messages
 */
exports.getByRequestId = async function getByRequestId(
  requestID,
  page,
  limit,
  order,
  direction
) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === "DESC") {
    query =
      "SELECT * FROM messages WHERE requestID = ? ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query =
      "SELECT * FROM messages WHERE requestID = ? ORDER BY ?? ASC LIMIT ? OFFSET ?;";
  }
  const values = [requestID, order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Creates a new message
 * @param {String} message.message message
 * @param {Number} message.senderID user ID of the sender
 * @param {Number} message.receiverID user ID of the receiver
 * @param {Number} message.requestID ID of the request
 * @returns {Object} operation status
 */
exports.add = async function add(message) {
  const query = "INSERT INTO messages SET ?";
  const data = await db.run_query(query, message);
  return data;
};

/**
 * Deletes a single message by ID
 * @param {Number} id ID of the book
 * @returns {Object} operation status
 */
exports.delById = async function delById(id) {
  const query = "DELETE FROM messages WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};
