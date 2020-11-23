/**
 * A module to run JSON Schema based validation on request/response data.
 * @module controllers/validation
 * @author Colin Stephen
 * @see schemas/* for JSON Schema definition files
 */

const {Validator, ValidationError} = require('jsonschema');

const bookSchema = require('../schemas/book.json').definitions.book;
const requestSchema = require('../schemas/request.json').definitions.request;
const messageSchema = require('../schemas/message.json').definitions.message;
const articleSchema = require('../schemas/article.json').definitions.article;
const categorySchema = require('../schemas/category.json').definitions.category;
const commentSchema = require('../schemas/comment.json').definitions.comment;
const userSchema = require('../schemas/user.json').definitions.user;
const userUpdateSchema = require('../schemas/user.json').definitions.userUpdate;

/**
 * Wrapper that returns a Koa middleware validator for a given schema.
 * @param {object} schema - The JSON schema definition of the resource
 * @param {string} resource - The name of the resource e.g. 'article'
 * @returns {function} - A Koa middleware handler taking (ctx, next) params
 */
const makeKoaValidator = (schema, resource) => {

  const v = new Validator();
  const validationOptions = {
    throwError: true,
    propertyName: resource
  };
  
  /**
   * Koa middleware handler function to do validation
   * @param {object} ctx - The Koa request/response context object
   * @param {function} next - The Koa next callback
   * @throws {ValidationError} a jsonschema library exception
   */
  const handler = async (ctx, next) => {
    const body = ctx.request.body;
    try {
      v.validate(body, schema, validationOptions);
      await next();
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(error);
        ctx.status = 400
        ctx.body = error;
      } else {
        throw error;
      }
    }
  }
  return handler;
}


/** Validate data against book schema */
exports.validateBook = makeKoaValidator(bookSchema, 'book');
/** Validate data against message schema */
exports.validateMessage = makeKoaValidator(messageSchema, 'message');
/** Validate data against book schema */
exports.validateRequest = makeKoaValidator(requestSchema, 'request');
/** Validate data against book schema */
exports.validateArticle = makeKoaValidator(articleSchema, 'article');
/** Validate data against category schema */
exports.validateCategory = makeKoaValidator(categorySchema, 'category');
/** Validate data against comment schema */
exports.validateComment = makeKoaValidator(commentSchema, 'comment');
/** Validate data against user schema for creating new users */
exports.validateUser = makeKoaValidator(userSchema, 'user');
/** Validate data against user schema for updating existing users */
exports.validateUserUpdate = makeKoaValidator(userUpdateSchema, 'userUpdate');
