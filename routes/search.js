const Router = require('koa-router');

const books = require('../models/books');

const prefix = '/api/v1/search';
const router = Router({prefix: prefix});

// book routes
router.get('/books', searchBooks);

async function searchBooks(ctx) {
  const {q, userId, page=1, limit=100} = ctx.request.query;
  let result = []
  if(userId) {
    result = await books.searchUserBooks(q, userId, page, limit)
  } else {
    result = await books.search(q, page, limit)
  }
  if (result.length) {
    const body = result.map(book => {
      const {ID, title, summary, author, yearPublished, ISBN, images, ownerID, requestID, status} = book;
      return {ID, title, summary, author, yearPublished, ISBN, images, ownerID, requestID, status};
    });
    ctx.body = body;
  } else {
    ctx.body = []
  }
}


module.exports = router;
