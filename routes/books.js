const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const formidable = require("koa2-formidable");

const auth = require("../controllers/auth");
const can = require("../permissions/books");

const books = require("../models/books");
const requests = require("../models/requests");
const {
  validateBook,
  validateBookStatus,
} = require("../controllers/validation");
const { convertBookData } = require("../controllers/convert");
const { handleImageUpload } = require("../helpers/handleImageUpload");

const prefix = "/api/v1/books";
const router = Router({ prefix: prefix });

// book routes
router.get("/", getAll);
router.post(
  "/",
  auth,
  formidable(),
  bodyParser(),
  convertBookData,
  validateBook,
  createBook
);
router.get("/:id([0-9]{1,})", getById);
router.put(
  "/:id([0-9]{1,})",
  formidable(),
  auth,
  bodyParser(),
  convertBookData,
  validateBook,
  updateBook
);
router.del("/:id([0-9]{1,})", auth, deleteBook);
router.get("/user/:userID([0-9]{1,})", getByUserId);
router.post(
  "/status/:bookID([0-9]{1,})",
  auth,
  bodyParser(),
  validateBookStatus,
  updateStatus
);

async function getAll(ctx) {
  const {
    page = 1,
    limit = 14,
    order = "dateCreated",
    direction = "ASC",
  } = ctx.request.query;

  let resultLimit = parseInt(limit);
  let resultPage = parseInt(page);

  resultLimit = resultLimit > 100 ? 100 : resultLimit;
  resultLimit = resultLimit < 1 ? 10 : resultLimit;
  resultPage = resultPage < 1 ? 1 : resultPage;
  const result = await books.getAll(resultPage, resultLimit, order, direction);
  
  const isNextPageAvailable = result && result.length > resultLimit
  const isPrevPageAvailable =  resultPage - 1 > 1

  if (result.length) {
    const body = result.map((book) => {
      const {
        ID,
        title,
        summary,
        author,
        yearPublished,
        ISBN,
        images,
        ownerID,
        borrowerId,
        requesterId,
        status,
      } = book;
      return {
        ID,
        title,
        summary,
        author,
        yearPublished,
        ISBN,
        images,
        ownerID,
        borrowerId,
        requesterId,
        status,
      };
    });

    ctx.body = {
      books: body,
      next: isNextPageAvailable && `${ctx.request.path}?page=${resultPage + 1}`,
      prev: isPrevPageAvailable && `${ctx.request.path}?page=${resultPage}`,
    };
  } else {
    ctx.body = [];
  }
}

async function getByUserId(ctx) {
  const { userID } = ctx.params;
  const {
    page = 1,
    limit = 100,
    order = "dateCreated",
    direction = "ASC",
  } = ctx.request.query;

  let resultLimit = parseInt(limit);
  let resultPage = parseInt(page);

  resultLimit = resultLimit > 100 ? 100 : resultLimit;
  resultLimit = resultLimit < 1 ? 10 : resultLimit;
  resultPage = resultPage < 1 ? 1 : resultPage;

  const result = await books.getByUserId(userID, resultPage, resultLimit, order, direction);
  
  const isNextPageAvailable = result && result.length > resultLimit
  const isPrevPageAvailable =  resultPage - 1 > 1

  if (result.length) {
    const body = result.map((book) => {
      const {
        ID,
        title,
        summary,
        author,
        yearPublished,
        ISBN,
        images,
        ownerID,
        borrowerId,
        requesterId,
        status,
      } = book;
      return {
        ID,
        title,
        summary,
        author,
        yearPublished,
        ISBN,
        images,
        ownerID,
        borrowerId,
        requesterId,
        status,
      };
    });

    ctx.body = {
      books: body,
      next: isNextPageAvailable && `${ctx.request.path}?page=${resultPage + 1}`,
      prev: isPrevPageAvailable && `${ctx.request.path}?page=${resultPage}`,
    };
  } else {
    ctx.body = [];
  }
}

async function getById(ctx) {
  const id = ctx.params.id;
  const result = await books.getById(id);

  if (result.length) {
    const article = result[0];
    ctx.body = article;
  } else {
    ctx.body = [];
  }
}

async function createBook(ctx) {
  const { body, files } = ctx.request;
  const urls = files && (await handleImageUpload(files));
  body.images = urls.join(";"); // Join all the image names
  const result = await books.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
  }
}

async function updateBook(ctx) {
  const id = ctx.params.id;
  let result = await books.getById(id); // check it exists
  if (result.length) {
    let book = result[0];
    const permission = can.update(ctx.state.user, book);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      const { files } = ctx.request;
      const urls = files && (await handleImageUpload(files));

      // exclude fields that should not be updated
      const {
        ID,
        dateCreated,
        dateModified,
        ownerID,
        ...body
      } = ctx.request.body;
      body.images = urls.join(";"); // Join all the image names
      // overwrite updatable fields with remaining body data
      Object.assign(book, body);

      result = await books.update(book);
      if (result.affectedRows) {
        ctx.body = { ID: id, updated: true, link: ctx.request.path };
      }
    }
  }
}

async function updateStatus(ctx) {
  const { bookID } = ctx.params;
  const { status } = ctx.request.body;
  let result = await books.getById(parseInt(bookID));
  let book = result[0];
  const { requestID } = book;

  if (!book) {
    ctx.status = 404;
    return;
  }

  const permission = can.update(ctx.state.user, book);
  if (!permission.granted) {
    ctx.status = 403;
    return;
  }

  // If book had a request associated with it
  // Means the book had an open request
  if (requestID) {
    const requestById = await requests.getById(requestID);
    const request = requestById[0];
    let bookUpdateResult;
    let requestUpdateResult;

    switch (status) {
      case "On Loan":
        // If changing status to on loan
        // Means we're accepting the request
        // Update request to accepted
        bookUpdateResult = await requests.update({
          ...request,
          status: "Accepted",
        });
        requestUpdateResult = await books.update({ ...book, status: status });
        break;

      case "Available":
        // If changing status to available
        // Means the book was returned/no longer on loN
        // Remove associated request from book
        // Set request status to complete
        bookUpdateResult = await requests.update({
          ...request,
          status: "Completed",
        });
        requestUpdateResult = await books.update({
          ...book,
          requestID: null,
          status: status,
        });
        break;

      default:
        break;
    }
    if (bookUpdateResult.affectedRows && requestUpdateResult.affectedRows) {
      ctx.body = { ID: bookID, updated: true, link: ctx.request.path };
    }
    return;
  }

  // If book was not on request
  // Just update the status
  const updateResult = await books.update({ ...book, status: status });
  if (updateResult.affectedRows) {
    ctx.body = { ID: bookID, updated: true, link: ctx.request.path };
  }
}

async function deleteBook(ctx) {
  const id = ctx.params.id;
  let result = await books.getById(id); // check it exists
  if (result.length) {
    let book = result[0];
    const permission = can.delete(ctx.state.user, book);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      const result = await books.delById(id);
      if (result.affectedRows) {
        ctx.body = { ID: id, deleted: true };
      }
    }
  }
}

module.exports = router;
