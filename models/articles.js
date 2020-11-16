const db = require('../helpers/database');

//get a single article by its id  
exports.getById = async function getById (id) {
  const query = "SELECT * FROM articles WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

//list all the articles in the database
exports.getAll = async function getAll (page, limit, order, direction) {
  const offset = (page - 1) * limit;
  let query;
  if (direction === 'DESC') {
    query = "SELECT * FROM articles ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query = "SELECT * FROM articles ORDER BY ?? ASC LIMIT ? OFFSET ?;";    
  }
  const values = [order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
}

//create a new article in the database
exports.add = async function add (article) {
  const query = "INSERT INTO articles SET ?";
  const data = await db.run_query(query, article);
  return data;
}

//delete an article by its id
exports.delById = async function delById (id) {
  const query = "DELETE FROM articles WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
}

//update an existing article
exports.update = async function update (article) {
  const query = "UPDATE articles SET ? WHERE ID = ?;";
  const values = [article, article.ID];
  const data = await db.run_query(query, values);
  return data;
}