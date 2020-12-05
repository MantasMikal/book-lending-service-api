/**
 * Books model
 * Handles database CRUD operations
 * @module models/Books
 */

const db = require("../helpers/database");

/**
 * Gets a single book
 * @param {Number} id ID of the book
 * @returns {Array} array with a single book
 */
exports.getById = async function getById(id) {
  const query = "SELECT * FROM books WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Gets all books from the database
 * @param {Number} page page to retrieve
 * @param {Number} limit amount of results to retrieve
 * @param {String} order field to order results by
 * @param {String} direction direction to order results by
 * @returns {Array} array containing all books
 */
exports.getAll = async function getAll(page, limit, order, direction) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === "DESC") {
    query = "SELECT * FROM books ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query = "SELECT * FROM books ORDER BY ?? ASC LIMIT ? OFFSET ?;";
  }
  const values = [order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Gets all user books from the database
 * @param {Number} userID ID of the user
 * @param {Number} page page to retrieve
 * @param {Number} limit amount of results to retrieve
 * @param {String} order field to order results by
 * @param {String} direction direction to order results by
 * @returns {Array} array with a user books
 */
exports.getByUserId = async function getByUserId(
  userID,
  page,
  limit,
  order,
  direction
) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === "DESC") {
    query =
      "SELECT * FROM books WHERE ownerId = ? ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query =
      "SELECT * FROM books WHERE ownerId = ? ORDER BY ?? ASC LIMIT ? OFFSET ?;";
  }
  const values = [userID, order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Creates a new book
 * @param {String} book.title book title
 * @param {String} book.summary book summary
 * @param {String} book.author book author
 * @param {String} book.yearPublished year book was published
 * @param {Sting} book.ISBN ISBN of the book
 * @param {Number} book.ownerID book owner ID
 * @param {String} book.status status of the book
 * @returns {Object} operation status
 */
exports.add = async function add(book) {
  const query = "INSERT INTO books SET ?";
  const data = await db.run_query(query, book);
  return data;
};

/**
 * Deletes a book and its associated requests and messages
 * @param {Number} id ID of the book
 * @returns {Object} operation status
 */
exports.delById = async function delById(id) {
  const query = "DELETE FROM books WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Updates a book
 * @param {String} book.title book title
 * @param {String} book.summary book summary
 * @param {String} book.author book author
 * @param {String} book.yearPublished year book was published
 * @param {Sting} book.ISBN ISBN of the book
 * @param {Number} book.ownerID book owner ID
 * @param {String} book.status status of the book
 * @returns {Object} operation status
 */
exports.update = async function update(book) {
  const query = "UPDATE books SET ? WHERE ID = ?;";
  const values = [book, book.ID];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Searches for all books by title, ISBN and author
 * @param {String} keyword search term to run against database
 * @param {Number} page page to retrieve
 * @param {Number} limit amount of results to retrieve
 * @param {String} order field to order results by
 * @param {String} direction direction to order results by
 * @returns {Array} array with found books
 */
exports.search = async function search(keyword, page, limit, order, direction) {
  const offset = (page - 1) * limit;
  let query;

  if (direction === "DESC") {
    query =
      "SELECT * FROM books WHERE\
      title LIKE CONCAT('%', ?, '%')\
      OR ISBN LIKE CONCAT('%', ?, '%')\
      OR author LIKE CONCAT('%', ?, '%')\
      ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query =
      "SELECT * FROM books WHERE\
      title LIKE CONCAT('%', ?, '%')\
      OR ISBN LIKE CONCAT('%', ?, '%')\
      OR author LIKE CONCAT('%', ?, '%')\
      ORDER BY ?? ASC LIMIT ? OFFSET ?;";
  }

  const values = [
    keyword,
    keyword,
    keyword,
    order,
    parseInt(limit),
    parseInt(offset),
  ];
  const data = await db.run_query(query, values);
  return data;
};

/**
 * Searches for all user books by title, ISBN and author
 * @param {String} keyword search term to run against database
 * @param {Number} userID id of the user (Optional)
 * @param {Number} page page to retrieve
 * @param {Number} limit amount of results to retrieve
 * @param {String} order field to order results by
 * @param {String} direction direction to order results by
 * @returns {Array} array with found books
 */
exports.searchUserBooks = async function searchUserBooks(
  keyword,
  userID,
  page,
  limit,
  order,
  direction
) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === "DESC") {
    query =
      "SELECT * FROM books WHERE\
      ownerId = ? AND\
      (title LIKE CONCAT('%', ?, '%')\
      OR ISBN LIKE CONCAT('%', ?, '%')\
      OR author LIKE CONCAT('%', ?, '%'))\
      ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query =
      "SELECT * FROM books WHERE\
      ownerId = ? AND\
      (title LIKE CONCAT('%', ?, '%')\
      OR ISBN LIKE CONCAT('%', ?, '%')\
      OR author LIKE CONCAT('%', ?, '%'))\
      ORDER BY ?? ASC LIMIT ? OFFSET ?;";
  }

  const values = [
    userID,
    keyword,
    keyword,
    keyword,
    order,
    parseInt(limit),
    parseInt(offset),
  ];
  const data = await db.run_query(query, values);
  return data;
};
