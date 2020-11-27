const Router = require('koa-router');

const books = require('../models/books');

const prefix = '/api/v1/search';
const router = Router({prefix: prefix});

// book routes
router.get('/books', searchBooks);

async function searchBooks(ctx) {
  const {q, userId, page=1, limit=100} = ctx.request.query;
  
  let resultLimit = parseInt(limit);
  let resultPage = parseInt(page);

  resultLimit = resultLimit > 100 ? 100 : resultLimit;
  resultLimit = resultLimit < 1 ? 10 : resultLimit;
  resultPage = resultPage < 1 ? 1 : resultPage;

  let result = []
  if(userId) {
    result = await books.searchUserBooks(q, userId, resultPage, resultLimit)
  } else {
    result = await books.search(q, resultPage, resultLimit)
  }

  const isNextPageAvailable = result && result.length > resultLimit
  const isPrevPageAvailable =  resultPage - 1 > 1

  if (result.length) {
    const body = result.map(book => {
      const {ID, title, summary, author, yearPublished, ISBN, images, ownerID, requestID, status} = book;
      return {ID, title, summary, author, yearPublished, ISBN, images, ownerID, requestID, status};
    });

    ctx.body = {
      books: body,
      next: isNextPageAvailable && `${ctx.request.path}?page=${resultPage + 1}`,
      prev: isPrevPageAvailable && `${ctx.request.path}?page=${resultPage}`,
    };
  } else {
    ctx.body = []
  }
}


module.exports = router;
