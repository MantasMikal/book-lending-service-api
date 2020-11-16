const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const auth = require('../controllers/auth');

const comments = require('../models/comments');

const router = Router({prefix: '/api/v1/comments'});
router.get('/:id([0-9]{1,})', getById);
router.del('/:id([0-9]{1,})', auth, deleteById);

async function deleteById(ctx) {
  const id = ctx.params.id;
  const result = await comments.deleteById(id);
  if (result.affectedRows) {
    ctx.body = {ID: id, deleted: true}
  }
}

async function getById(ctx) {
  const id = ctx.params.id;
  const result = await comments.getById(id);
  if (result.length) {
    ctx.body = result[0];
  }
}

module.exports = router;