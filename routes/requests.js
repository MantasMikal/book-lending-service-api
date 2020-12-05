/**
 * Requests routes
 * Handles request specific routes
 * @module routes/Requests
 */

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
router.del("/:requestID([0-9]{1,})", auth, delByRequestId);

/**
 * Creates a new request
 * @headerparam authorization user authentication token for Basic Auth
 * @bodyparam {String} title request title
 * @bodyparam {Number} requesterID user ID of the requester
 * @bodyparam {Number} bookID book ID
 * @route {POST} /requests
 */
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
    ctx.body = { created: false, info: "Can't request your own books" };
    return;
  }

  if (requestID) {
    ctx.status = 200;
    ctx.body = { created: false, info: "Book already requested" };
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

/**
 * Gets all user requests by its ID
 * @headerparam authorization user authentication token for Basic Auth
 * @queryparam {Number} userID id of the user
 * @queryparam {Number} page page to retrieve
 * @queryparam {Number} limit amount of results to retrieve
 * @queryparam {String} order field to order results by
 * @queryparam {String} direction direction to order results by
 * @route {GET} /requests/:userID
 */
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

  let resultLimit = parseInt(limit);
  let resultPage = parseInt(page);

  resultLimit = resultLimit > 100 ? 100 : resultLimit;
  resultLimit = resultLimit < 1 ? 10 : resultLimit;
  resultPage = resultPage < 1 ? 1 : resultPage;

  const result = await requests.getByUserId(
    userID,
    resultPage,
    resultLimit,
    order,
    direction
  );

  const isNextPageAvailable = result && result.length > resultLimit;
  const isPrevPageAvailable = resultPage - 1 > 1;

  if (result.length) {
    ctx.body = {
      requests: result,
      next: isNextPageAvailable && `${ctx.request.path}?page=${resultPage + 1}`,
      prev: isPrevPageAvailable && `${ctx.request.path}?page=${resultPage}`,
    };
  } else {
    ctx.body = {requests: []};
  }
}

/**
 * Gets request by its ID
 * @headerparam authorization user authentication token for Basic Auth
 * @queryparam {Number} requestID id of the request
 * @route {GET} /requests/:requestID
 */
async function getByRequestId(ctx) {
  const { requestID } = ctx.params;
  const requestByID = await requests.getById(requestID);
  const request = requestByID[0];

  if (!request) {
    ctx.body = {};
    return;
  }

  const { bookID } = request;

  const permission = can.readByRequestId(ctx.state.user, request);

  if (!permission.granted) {
    ctx.status = 401;
    return;
  }

  const book = await books.getById(bookID);
  const result = await requests.getById(requestID);
  if (result.length && result[0]) {
    ctx.body = { ...result[0], bookStatus: book[0].status };
  } else {
    ctx.body = {};
  }
}

/**
 * Archives already completed request for a user
 * @headerparam authorization user authentication token for Basic Auth
 * @queryparam {Number} requestID id of the request
 * @route {POST} /requests/archive/:requestID
 */
async function archiveRequest(ctx) {
  const { requestID } = ctx.params;
  const requestByID = await requests.getById(requestID); // check it exists
  const request = requestByID[0];
  const { requesterID, bookOwnerID, status } = request;
  const { user } = ctx.state;
  let updateResult;

  if (!request) {
    ctx.status = 404;
    return;
  }

  const permission = can.update(user, request);
  if (!permission.granted) {
    ctx.status = 401;
    return;
  }


  // Only allow archiving of completed requests
  if (status !== "Completed") {
    ctx.body = { ID: requestID, updated: false, link: ctx.request.path };
    return
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

/**
 * Deletes a request and its associated messages.
 * Used to cancel a book request. Makes the book available to loan
 * @headerparam authorization user authentication token for Basic Auth
 * @queryparam {Number} requestID id of the request
 * @route {DELETE} /requests/:requestID
 */
async function delByRequestId(ctx) {
  const { requestID } = ctx.params;
  const requestByID = await requests.getById(requestID);
  const request = requestByID[0];
  const { requesterID, bookID } = request;
  const bookByID = await books.getById(bookID);
  const book = bookByID[0];

  if (!request || !book) {
    ctx.status = 404;
    return;
  }

  const permission = can.delete(ctx.state.user, requesterID);
  if (!permission.granted) {
    ctx.status = 401;
    return;
  }

  const bookUpdate = await books.update({
    ...book,
    status: "Available",
    requestID: null,
  });
  const deleteResult = await requests.delById(requestID);

  if (bookUpdate.affectedRows && deleteResult.affectedRows) {
    ctx.body = { ID: requestID, deleted: true };
  }
}

module.exports = router;
