/**
 * A module to run JSON Schema based validation on request/response data.
 * @module controllers/validation
 * @author Colin Stephen
 * @see schemas/* for JSON Schema definition files
 */

const {Validator, ValidationError} = require('jsonschema');

const bookSchema = require('../schemas/book.json').definitions.book;
const bookStatusSchema = require('../schemas/book.json').definitions.status;
const requestSchema = require('../schemas/request.json').definitions.request;
const messageSchema = require('../schemas/message.json').definitions.message;
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
/** Validate data against book status schema */
exports.validateBookStatus = makeKoaValidator(bookStatusSchema, 'status');
/** Validate data against message schema */
exports.validateMessage = makeKoaValidator(messageSchema, 'message');
/** Validate data against book schema */
exports.validateRequest = makeKoaValidator(requestSchema, 'request');
/** Validate data against user schema for creating new users */
exports.validateUser = makeKoaValidator(userSchema, 'user');
exports.validateUserUpdate = makeKoaValidator(userUpdateSchema, 'userUpdate');
