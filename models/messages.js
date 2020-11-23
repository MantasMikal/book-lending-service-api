const db = require("../helpers/database");

//get a single message request by its id
exports.getById = async function getById(id) {
  const query = "SELECT * FROM messages WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

//get all the messages by request id
exports.getByRequestId = async function getByRequestId(
  requestID,
  page,
  limit,
  order, 
  direction
) {
  const offset = (page - 1) * limit;
  let query
  if (direction === 'DESC') {
    query = "SELECT * FROM messages WHERE requestID = ? ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query = "SELECT * FROM messages WHERE requestID = ? ORDER BY ?? ASC LIMIT ? OFFSET ?;";    
  }
  const values = [requestID, order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
};

//create a new message in the database
exports.add = async function add(message) {
  const query = "INSERT INTO messages SET ?";
  const data = await db.run_query(query, message);
  return data;
};

//delete a message by its id
exports.delById = async function delById(id) {
  const query = "DELETE FROM messages WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};
