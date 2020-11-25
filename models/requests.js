const db = require("../helpers/database");

//get a single book request by its id
exports.getById = async function getById(id) {
  const query = "SELECT * FROM requests WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

//get all the request by user id
exports.getByUserId = async function getByUserId(
  userId,
  page,
  limit,
  order, 
  direction
) {
  const offset = (page - 1) * limit;
  let query
  if (direction === 'DESC') {
    query = "SELECT * FROM requests WHERE (requesterID = ? OR bookOwnerID = ?) ORDER BY ?? DESC LIMIT ? OFFSET ?;";
  } else {
    query = "SELECT * FROM requests WHERE (requesterID = ? OR bookOwnerID = ?) ORDER BY ?? ASC LIMIT ? OFFSET ?;";    
  }
  const values = [userId, userId, order, parseInt(limit), parseInt(offset)];
  const data = await db.run_query(query, values);
  return data;
};

//create a new request in the database
exports.add = async function add(request) {
  const query = "INSERT INTO requests SET ?";
  const data = await db.run_query(query, request);
  return data;
};

//delete a request by its id
exports.delById = async function delById(id) {
  const query = "DELETE FROM requests WHERE ID = ?;";
  const values = [id];
  const data = await db.run_query(query, values);
  return data;
};

//update an existing request
exports.update = async function update(request) {
  const query = "UPDATE requests SET ? WHERE ID = ?;";
  const values = [request, request.ID];
  const data = await db.run_query(query, values);
  return data;
};