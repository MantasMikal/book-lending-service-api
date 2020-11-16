const db = require('../helpers/database');

//add a category to an article
//do nothing if it is already added
exports.add = async function add (id, categoryID) {
  let query = "INSERT INTO articleCategories SET articleID=?, categoryID=?";
      query += " ON DUPLICATE KEY UPDATE articleID=articleID; ";
  const result = await db.run_query(query, [id, categoryID]);
  return result;
}

//remove a category from an article
//do nothing if it does not exist
exports.delete = async function delete_ (id, categoryID) {
  let query = "DELETE FROM articleCategories WHERE articleID=? AND categoryID=?;";
  const result = await db.run_query(query, [id, categoryID]);
  return result;
}

//get the categories for a given article
exports.getAll = async function getAll (id) {
  let query = "SELECT c.ID, c.name FROM articleCategories as ac INNER JOIN categories AS c";
      query += " ON ac.categoryID = c.ID WHERE ac.articleID = ?;";
  const result = await db.run_query(query, id);
  return result;
}
