/**
 * User routes
 * Handles user specific routes
 * @module routes/Users
 */

const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const model = require("../models/users");
const auth = require("../controllers/auth");
const can = require("../permissions/users");
const {
  validateUser,
  validateUserUpdate,
} = require("../controllers/validation");

const prefix = "/api/v1/users";
const router = Router({ prefix: prefix });

router.post("/", bodyParser(), validateUser, createUser);
router.post("/login", auth, login);
router.get("/:id([0-9]{1,})", auth, getById);
router.put(
  "/:id([0-9]{1,})",
  auth,
  bodyParser(),
  validateUserUpdate,
  updateUser
);
router.del("/:id([0-9]{1,})", auth, deleteUser);

/**
 * Logs the user in
 * @headerparam authorization user authentication token for Basic Auth
 * @route {POST} /login
 */
async function login(ctx) {
  // return any details needed by the client
  const { ID, username, email } = ctx.state.user;
  const links = {
    self: `${ctx.protocol}://${ctx.host}${prefix}/${ID}`,
  };
  ctx.body = { ID, username, email, links };
}

/**
 * Gets user by its ID
 * @queryparam {Number} id id of the user
 * @route {GET} /users/:id
 */
async function getById(ctx) {
  const id = ctx.params.id;
  const userById = await model.getById(id);
  const user = userById[0];
  if (!user) {
    ctx.body = 404;
    return;
  }

  const {
    ID,
    username,
    fullName,
    email,
    country,
    city,
    postcode,
    address,
  } = user;
  ctx.body = {
    ID,
    username,
    fullName,
    email,
    country,
    city,
    postcode,
    address,
  };
}

/**
 * Creates a new user account
 * @bodyparam {String} email user email
 * @bodyparam {String} username user username
 * @bodyparam {String} fullName user full name
 * @bodyparam {String} password user password
 * @bodyparam {Sting} country user country
 * @bodyparam {Object} city user city
 * @bodyparam {String} postcode user postcode
 * @bodyparam {String} address user address
 * @route {POST} /login
 */
async function createUser(ctx) {
  const body = ctx.request.body;
  const result = await model.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
  }
}

/**
 * Updates a user
 * @headerparam authorization user authentication token for Basic Auth
 * @bodyparam {String} email user email
 * @bodyparam {String} username user username
 * @bodyparam {String} fullName user full name
 * @bodyparam {Sting} country user country
 * @bodyparam {Object} city user city
 * @bodyparam {String} postcode user postcode
 * @bodyparam {String} address user address
 * @route {PUT} /users/:id
 */
async function updateUser(ctx) {
  const id = ctx.params.id;
  let result = await model.getById(id); // check it exists
  if (result.length) {
    let data = result[0];
    const permission = can.update(ctx.state.user, data);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      // exclude fields that should not be updated
      const newData = permission.filter(ctx.request.body);
      Object.assign(newData, { ID: id }); // overwrite updatable fields with body data
      result = await model.update(newData);
      if (result.affectedRows) {
        ctx.body = { ID: id, updated: true, link: ctx.request.path };
      }
    }
  }
}

/**
 * Deletes a user
 * @headerparam authorization user authentication token for Basic Auth
 * @route {DELETE} /users/:id
 */
async function deleteUser(ctx) {
  const id = ctx.params.id;
  let result = await model.getById(id);
  if (result.length) {
    const data = result[0];
    const permission = can.delete(ctx.state.user, data);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      result = await model.delById(id);
      if (result.affectedRows) {
        ctx.body = { ID: id, deleted: true };
      }
    }
  }
}

module.exports = router;
