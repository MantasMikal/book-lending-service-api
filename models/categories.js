const db = require('../helpers/database');

//list all the categories in the database
exports.getAll = async function getAll () {
  const query = "SELECT * FROM categories;";
  const data = await db.run_query(query);
  return data;
}

//get a single category by its id  
exports.getById = async function getById (id) {
  const query = "SELECT * FROM categories WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}

//create a new category in the database
exports.add = async function add (category) {
  const query = "INSERT INTO categories SET ?;";
  const data = await db.run_query(query, category);
  return data;
}

// update a category in the database
exports.update = async function add (category) {
  const query = "UPDATE categories SET ? WHERE ID=?;";
  const data = await db.run_query(query, [category, category.ID]);
  return data;
}

//delete a category by its id
exports.delById = async function delById (id) {
  const query = "DELETE FROM categories WHERE ID = ?;";
  const data = await db.run_query(query, [id]);
  return data;
}
