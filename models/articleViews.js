const db = require('../helpers/database');

//add a new view record (done every time an article is viewed)
exports.add = async function add (id) {
  let query = "INSERT INTO articleViews SET articleId=?; ";
  await db.run_query(query, [id]);
}

//count the views for an article
exports.count = async function count (id) {
  let query = "SELECT count(1) as views FROM articleViews WHERE articleId=?;";
  const result = await db.run_query(query, [id]);
  return result;
}
