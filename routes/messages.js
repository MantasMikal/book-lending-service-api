/**
 * Messages routes
 * Handles Messages specific routes
 * @module routes/Messages
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const auth = require('../controllers/auth');
const can = require('../permissions/messages');

const messages = require('../models/messages');
const requests = require('../models/requests');

const {validateMessage} = require('../controllers/validation');

const prefix = '/api/v1/messages';
const router = Router({prefix: prefix});

// message routes
router.post('/', auth, bodyParser(), validateMessage, createMessage);
router.get('/:requestID([0-9]{1,})', auth, getByRequestId);


/**
 * Creates a new message
 * @headerparam authorization user authentication token for Basic Auth
 * @bodyparam {String} message message
 * @bodyparam {Number} senderID user ID of the sender 
 * @bodyparam {Number} receiverID user ID of the receiver 
 * @bodyparam {Number} requestID ID of the request
 * @route {POST} /messages/
 */
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
    ctx.status = 403
    return
  }

  const result = await messages.add(body);
  if (result.affectedRows) {
    const id = result.insertId;
    ctx.status = 201;
    ctx.body = {ID: id, created: true, link: `${ctx.request.path}${id}`};
  }
}

/**
 * Gets all messages by request ID
 * @headerparam authorization user authentication token for Basic Auth
 * @queryparam {Number} requestID id of the request
 * @queryparam {Number} page page to retrieve
 * @queryparam {Number} limit amount of results to retrieve
 * @queryparam {String} order field to order results by
 * @queryparam {String} direction direction to order results by
 * @route {GET} /messages/:requestID
 */
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
    ctx.status = 403
    return
  }

  const {page=1, limit=100, order="dateCreated", direction='ASC'} = ctx.request.query;
  let resultLimit = parseInt(limit);
  let resultPage = parseInt(page);
  resultLimit = resultLimit > 100 ? 100 : resultLimit;
  resultLimit = resultLimit < 1 ? 10 : resultLimit;
  resultPage = resultPage < 1 ? 1 : resultPage;
  const result = await messages.getByRequestId(requestID, resultPage, resultLimit, order, direction);
  
  const isNextPageAvailable = result && result.length > resultLimit
  const isPrevPageAvailable =  resultPage - 1 > 1
  
  if (result.length) {
    const body = result.map(msg => {
      const {ID, message, senderID, receiverID, requestID, dateCreated} = msg;
      return {ID, message, senderID, receiverID, requestID, dateCreated};
    });
    ctx.body = {
      messages: body,
      next: isNextPageAvailable && `${ctx.request.path}?page=${resultPage + 1}`,
      prev: isPrevPageAvailable && `${ctx.request.path}?page=${resultPage}`,
    };
  } else {
    ctx.body = []
  }
}

module.exports = router;
