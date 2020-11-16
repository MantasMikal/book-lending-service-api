const db = require('../helpers/database');

//get a single book by its id
exports.getById = async function getById (id) {
  const query = "SELECT * FROM books WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

//list all the books in the database
exports.getAll = async function getAll (page, limit, order, direction) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === 'DESC') {
    query = "SELECT * FROM books ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query = "SELECT * FROM books ORDER BY ?? ASC LIMIT ? OFFSET ?;";    
  }
  const values = [order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
}

//create a new book in the database
exports.add = async function add (book) {
  const query = "INSERT INTO books SET ?";
  const data = await db.run_query(query, book);
  return data;
}

//delete a book by its id
exports.delById = async function delById (id) {
  const query = "DELETE FROM books WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

//update an existing book
exports.update = async function update (book) {
  const query = "UPDATE books SET ? WHERE ID = ?;";
  const values = [book, book.ID];
  const data = await db.run_query(query, values);
  return data;
}