/**
 * Search routes
 * Handles Search specific routes
 * @module routes/Search
 */

const Router = require("koa-router");
const books = require("../models/books");

const prefix = "/api/v1/search";
const router = Router({ prefix: prefix });

// book routes
router.get("/books", searchBooks);

/**
 * Searches for books. Looks for only user books if userID is
 * supplied as a query parameter. Searches all books otherwise
 * @headerparam authorization user authentication token for Basic Auth (Optional)
 * @queryparam {Number} userID id of the user (Optional)
 * @queryparam {String} q search term to run against database
 * @queryparam {Number} page page to retrieve
 * @queryparam {Number} limit amount of results to retrieve
 * @queryparam {String} order field to order results by
 * @queryparam {String} direction direction to order results by
 * @route {GET} /books/user/:userID
 */
async function searchBooks(ctx) {
  const {
    q,
    userID,
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

  let result = [];
  if (userID) {
    result = await books.searchUserBooks(q, userID, resultPage, resultLimit, order, direction);
  } else {
    result = await books.search(q, resultPage, resultLimit, order, direction);
  }

  const isNextPageAvailable = result && result.length > resultLimit;
  const isPrevPageAvailable = resultPage - 1 > 1;

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
        requestID,
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
        requestID,
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

module.exports = router;
