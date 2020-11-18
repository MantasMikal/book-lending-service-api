const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const formidable = require('koa2-formidable');

const auth = require('../controllers/auth');
const can = require('../permissions/books');

const books = require('../models/books');
const {validateBook} = require('../controllers/validation');
const { convertBookData } = require('../controllers/convert')
const {handleImageUpload} = require('../helpers/handleImageUpload')

const prefix = '/api/v1/books';
const router = Router({prefix: prefix});

// book routes
router.get('/', getAll);
router.post('/', auth, formidable(), bodyParser(), convertBookData, validateBook, createBook);
router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', formidable(), auth, bodyParser(), convertBookData, validateBook, updateBook);
router.del('/:id([0-9]{1,})', auth, deleteBook);
router.get('/user/:userId([0-9]{1,})', getByUserId);

async function getAll(ctx) {
  const {page=1, limit=100, order="dateCreated", direction='ASC'} = ctx.request.query;
  const result = await books.getAll(page, limit, order, direction);
  if (result.length) {
    const body = result.map(book => {
      const {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId} = book;
      return {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId};
    });

    ctx.body = body;
  }
}

async function getByUserId(ctx) {
  const { userId } = ctx.params;
  const {page=1, limit=100, order="dateCreated", direction='ASC'} = ctx.request.query;
  const result = await books.getByUserId(userId, page, limit, order, direction);
  if (result.length) {
    const body = result.map(book => {
      const {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId} = book;
      return {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId};
    });

    ctx.body = body;
  }
}

async function getById(ctx) {
  const id = ctx.params.id;
  const result = await books.getById(id);
  if (result.length) {
    const article = result[0];
    ctx.body = article;
  }
}

async function createBook(ctx) {
  const {body, files} = ctx.request;
  const urls = files && await handleImageUpload(files)
  body.images = urls.join(';') // Join all the image names
  const result = await books.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
  }
}

async function updateBook(ctx) {
  const id = ctx.params.id;
  let result = await books.getById(id);  // check it exists
  if (result.length) {
    let book = result[0];
    const permission = can.update(ctx.state.user, book);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      const { files } = ctx.request
      const urls = files && await handleImageUpload(files)
      
      // exclude fields that should not be updated
      const {ID, dateCreated, dateModified, ownerID, ...body} = ctx.request.body;
      body.images = urls.join(';') // Join all the image names
      // overwrite updatable fields with remaining body data
      Object.assign(book, body);

      result = await books.update(book);
      if (result.affectedRows) {
        ctx.body = {ID: id, updated: true, link: ctx.request.path};
      }
    }
  }
}

async function deleteBook(ctx) {
  const id = ctx.params.id;
  let result = await books.getById(id);  // check it exists
  if(result.length) {
    let book = result[0];
    const permission = can.delete(ctx.state.user, book);
    if (!permission.granted) {
      ctx.status = 403;
    } else {
      const result = await books.delById(id);
      if (result.affectedRows) {
        ctx.body = {ID: id, deleted: true}
      }
    }
  }
}

module.exports = router;
