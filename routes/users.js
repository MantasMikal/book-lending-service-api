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

router.get("/", auth, getAll);
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

async function login(ctx) {
  // return any details needed by the client
  const { ID, username, email } = ctx.state.user;
  const links = {
    self: `${ctx.protocol}://${ctx.host}${prefix}/${ID}`,
  };
  ctx.body = { ID, username, email, links };
}

async function getAll(ctx) {
  const permission = can.readAll(ctx.state.user);
  if (!permission.granted) {
    ctx.status = 403;
  } else {
    const result = await model.getAll();
    if (result.length) {
      ctx.body = result;
    }
  }
}

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

async function createUser(ctx) {
  const body = ctx.request.body;
  const result = await model.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
  }
}

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

async function deleteUser(ctx) {
  const id = ctx.params.id;
  let result = await model.getById(id);
  if (result.length) {
    const data = result[0];
    console.log("trying to delete", data);
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
