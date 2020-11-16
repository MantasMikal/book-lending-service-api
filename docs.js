/**
 * @file 304CEM Blog OpenAPI Docs Server
 * @author Colin Stephen
 * @version v1
 * @description This file initialises the docs server and mounts its static paths.
 */

const Koa = require('koa');
const serve = require('koa-static');
const mount = require('koa-mount');
const app = new Koa();

app.use(mount('/', serve('./docs/jsdocs')))  // serve JSDocs
app.use(mount('/openapi', serve('./docs/openapi')))  // serve OpenAPI
app.use(mount('/schemas', serve('./schemas')))  // serve schemas

let port = process.env.PORT || 3030;

app.listen(port);
console.log(`OpenAPI server running on port ${port}`)
