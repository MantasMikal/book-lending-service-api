const db = require('../helpers/database');

//get all comments on a given article
exports.getAll = async function getAll (articleID) {
  const query = "SELECT * FROM comments WHERE articleID = ?;";
  const data = await db.run_query(query, [articleID]);
  return data;
}

//create a new comment (must contain articleID in comment)
exports.add = async function add (comment) {
  const query = "INSERT INTO comments SET ?";
  const data = await db.run_query(query, comment);
  return data;
}

//delete a specific comment
exports.deleteById = async function deleteById (id) {
  const query = "DELETE FROM comments WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}

//get an individual comment
exports.getById = async function getById (id) {
  const query = "SELECT * FROM comments WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}
