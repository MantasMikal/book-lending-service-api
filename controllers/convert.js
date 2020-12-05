/**
 * A module to convert data coming from request as multipart/formdata.
 * Required because multipart/formdata does not support types.
 * @module controllers/convert
 */

/**
 * Middleware function to convert book data
 * @param {object} ctx - The Koa request/response context object
 * @param {function} next - The Koa next callback
 */
const convertBookData = async (ctx, next) => {
  const body = ctx.request.body
  body.ownerID = parseInt(body.ownerID)
  await next()
}

exports.convertBookData = convertBookData