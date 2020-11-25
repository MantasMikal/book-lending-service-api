const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

const auth = require("../controllers/auth");
const can = require("../permissions/requests");

const requests = require("../models/requests");
const books = require("../models/books");

const { validateRequest } = require("../controllers/validation");

const prefix = "/api/v1/requests";
const router = Router({ prefix: prefix });

// request routes
router.post("/", auth, bodyParser(), validateRequest, createRequest);
router.get("/user/:userID([0-9]{1,})", auth, getByUserId);
router.get("/:requestID([0-9]{1,})", auth, getByRequestId);
router.post("/archive/:requestID([0-9]{1,})", auth, archiveRequest);
// router.del("/:requestID([0-9]{1,})", auth, delByRequestId);

async function createRequest(ctx) {
  const { body } = ctx.request;
  const { requesterID, bookID } = body;
  const booksById = await books.getById(bookID);
  const book = booksById[0];

  if (!book) {
    ctx.status = 404;
    return;
  }

  // Check if it's possible to request a book
  const { requestID, ownerID } = book;
  if (requesterID === ownerID) {
    ctx.status = 200;
    ctx.body = { rejected: true, info: "Can't request your own books" };
    return;
  }

  if (requestID) {
    ctx.status = 200;
    ctx.body = { rejected: true, info: "Book already requested" };
    return;
  }

  body.bookOwnerID = ownerID;
  const result = await requests.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    // Update the book with requestID
    // Indicating that the book is on request
    const bookUpdate = { ...book, requestID: id, status: "Requested" };
    const bookResult = await books.update(bookUpdate);
    if (bookResult.affectedRows) {
      ctx.status = 201;
      ctx.body = { ID: id, created: true, link: `${ctx.request.path}${id}` };
    }
  }
}

async function getByUserId(ctx) {
  const { userID } = ctx.params;
  const permission = can.read(ctx.state.user, parseInt(userID));
  if (!permission.granted) {
    ctx.status = 401;
    return;
  }

  const {
    page = 1,
    limit = 100,
    order = "dateCreated",
    direction = "DESC",
  } = ctx.request.query;
  const result = await requests.getByUserId(
    userID,
    page,
    limit,
    order,
    direction
  );
  if (result.length) {
    ctx.body = result;
  } else {
    ctx.body = [];
  }
}

async function getByRequestId(ctx) {
  const { requestID } = ctx.params;
  const requestByID = await requests.getById(requestID);
  const request = requestByID[0];
  const {bookID} = request
  if (!request) {
    ctx.status = 404;
    return;
  }

  const permission = can.readByRequestId(ctx.state.user, request);

  if (!permission.granted) {
    ctx.status = 401;
    return;
  }
  const book = await books.getById(bookID)
  const result = await requests.getById(requestID);
  if (result.length && result[0]) {
    ctx.body = {...result[0], bookStatus: book[0].status};
  } else {
    ctx.body = [];
  }
}

async function archiveRequest(ctx) {
  const { requestID } = ctx.params;
  const requestByID = await requests.getById(requestID); // check it exists
  const request = requestByID[0];
  const { requesterID, bookOwnerID } = request;
  const { user } = ctx.state;
  let updateResult;

  if (!request) {
    ctx.status = 404;
    return;
  }

  const permission = can.update(user, request);
  if (!permission.granted) {
    ctx.status = 403;
    return;
  }

  // Archive for requester
  if (requesterID === user.ID) {
    updateResult = await requests.update({
      ...request,
      isArchivedByRequester: 1,
    });
  }

  // Archive for receiver
  if (bookOwnerID === user.ID) {
    updateResult = await requests.update({
      ...request,
      isArchivedByReceiver: 1,
    });
  }

  if (updateResult.affectedRows) {
    ctx.body = { ID: requestID, updated: true, link: ctx.request.path };
  }
}

// async function delByRequestId(ctx) {
//   const { requestID } = ctx.params;
//   const requestByID = await requests.getById(requestID);
//   const request = requestByID[0];
//   if (!request) {
//     ctx.status = 404;
//     return;
//   }

//   const permission = can.readByRequestId(ctx.state.user, request);

//   if (!permission.granted) {
//     ctx.status = 401;
//     return;
//   }

//   const result = await requests.getById(requestID);
//   if (result.length) {
//     const body = result.map((request) => {
//       const {
//         ID,
//         title,
//         requesterID,
//         bookID,
//         bookOwnerID,
//         dateCreated,
//       } = request;
//       return { ID, title, requesterID, bookID, bookOwnerID, dateCreated };
//     });

//     ctx.body = body;
//   } else {
//     ctx.body = [];
//   }
// }

module.exports = router;
