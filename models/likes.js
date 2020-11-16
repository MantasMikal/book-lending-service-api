const db = require('../helpers/database');

//add a new like record
exports.like = async function like (id, uid) {
  let query = "INSERT INTO articleLikes SET articleID=?, userID=? ON DUPLICATE KEY UPDATE articleID=articleID; ";
  const result = await db.run_query(query, [id, uid]);
  return result;
}
  
//remove a like record
exports.dislike = async function dislike (id, uid) {
  let query = "DELETE FROM articleLikes WHERE articleID=? AND userID=?; ";
  const result = await db.run_query(query, [id, uid]);
  return result;
}
  
//count the likes for an article
exports.count = async function count (id) {
  let query = "SELECT count(1) as likes FROM articleLikes WHERE articleID=?;";
  const result = await db.run_query(query, [id]);
  return result[0].likes;
}
