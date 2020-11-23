const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const auth = require('../controllers/auth');
const can = require('../permissions/messages');

const messages = require('../models/messages');
const requests = require('../models/requests');

const books = require('../models/books');

const {validateMessage} = require('../controllers/validation');

const prefix = '/api/v1/messages';
const router = Router({prefix: prefix});

// request routes
router.post('/', auth, bodyParser(), validateMessage, createMessage);
router.get('/:requestID([0-9]{1,})', auth, getByRequestId);

async function createMessage(ctx) {
  const { body } = ctx.request;
  const { requestID } = body
  const requestByID = await requests.getById(requestID);
  const request = requestByID[0];
  if (!request) {
    ctx.status = 404;
    return;
  }

  const permission = can.write(ctx.state.user, request)

  if(!permission.granted) {
    ctx.status = 401
    return
  }
  const result = await messages.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created: true, link: `${ctx.request.path}${id}`};
  }
}

async function getByRequestId(ctx) {
  const { requestID } = ctx.params;
  const requestById = await requests.getById(requestID)
  const request = requestById[0]

  if(!request) {
    ctx.status = 404
    return
  }
  const permission = can.read(ctx.state.user, request)
  if(!permission.granted) {
    ctx.status = 401
    return
  }

  const {page=1, limit=100, order="dateCreated", direction='ASC'} = ctx.request.query;
  const result = await messages.getByRequestId(requestID, page, limit, order, direction);
  if (result.length) {
    const body = result.map(msg => {
      const {ID, message, senderID, receiverID} = msg;
      return {ID, message, senderID, receiverID};
    });
    ctx.body = body;
  } else {
    ctx.body = []
  }
}


// router.get('/:id([0-9]{1,})', getById);
// router.put('/:id([0-9]{1,})', formidable(), auth, bodyParser(), convertBookData, validateBook, updateBook);
// router.del('/:id([0-9]{1,})', auth, deleteBook);
// router.get('/user/:userId([0-9]{1,})', getByUserId);

// async function getAll(ctx) {
//   const {page=1, limit=100, order="dateCreated", direction='ASC'} = ctx.request.query;
//   const result = await books.getAll(page, limit, order, direction);
//   if (result.length) {
//     const body = result.map(book => {
//       const {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId} = book;
//       return {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId};
//     });

//     ctx.body = body;
//   } else {
//     ctx.body = []
//   }
// }

// async function getByUserId(ctx) {
//   const { userId } = ctx.params;
//   const {page=1, limit=100, order="dateCreated", direction='ASC'} = ctx.request.query;
//   const result = await books.getByUserId(userId, page, limit, order, direction);
//   if (result.length) {
//     const body = result.map(book => {
//       const {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId} = book;
//       return {ID, title, summary, author, yearPublished, ISBN, images, ownerID, borrowerId, requesterId};
//     });

//     ctx.body = body;
//   } else {
//     ctx.body = []
//   }
// }

// async function getById(ctx) {
//   const id = ctx.params.id;
//   const result = await books.getById(id);
//   if (result.length) {
//     const article = result[0];
//     ctx.body = article;
//   } else {
//     ctx.body = []
//   }
// }

// async function createBook(ctx) {
//   const {body, files} = ctx.request;
//   const urls = files && await handleImageUpload(files)
//   body.images = urls.join(';') // Join all the image names
//   const result = await books.add(body);
//   if (result.affectedRows) {
//     const id = result.insertId;
//     ctx.status = 201;
//     ctx.body = {ID: id, created: true, link: `${ctx.request.path}/${id}`};
//   }
// }

// async function updateBook(ctx) {
//   const id = ctx.params.id;
//   let result = await books.getById(id);  // check it exists
//   if (result.length) {
//     let book = result[0];
//     const permission = can.update(ctx.state.user, book);
//     if (!permission.granted) {
//       ctx.status = 403;
//     } else {
//       const { files } = ctx.request
//       const urls = files && await handleImageUpload(files)
      
//       // exclude fields that should not be updated
//       const {ID, dateCreated, dateModified, ownerID, ...body} = ctx.request.body;
//       body.images = urls.join(';') // Join all the image names
//       // overwrite updatable fields with remaining body data
//       Object.assign(book, body);

//       result = await books.update(book);
//       if (result.affectedRows) {
//         ctx.body = {ID: id, updated: true, link: ctx.request.path};
//       }
//     }
//   }
// }

// async function deleteBook(ctx) {
//   const id = ctx.params.id;
//   let result = await books.getById(id);  // check it exists
//   if(result.length) {
//     let book = result[0];
//     const permission = can.delete(ctx.state.user, book);
//     if (!permission.granted) {
//       ctx.status = 403;
//     } else {
//       const result = await books.delById(id);
//       if (result.affectedRows) {
//         ctx.body = {ID: id, deleted: true}
//       }
//     }
//   }
// }

module.exports = router;
