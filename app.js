const Koa = require('koa');
const cors = require('@koa/cors');
const serve = require('koa-static');
const mount = require('koa-mount')
const app = new Koa();

app.use(cors());

const messages = require('./routes/messages.js')
const users = require('./routes/users.js');
const books = require('./routes/books.js');
const search = require('./routes/search.js');
const requests = require('./routes/requests.js');


app.use(users.routes());
app.use(books.routes());
app.use(search.routes())
app.use(requests.routes())
app.use(messages.routes())
app.use(mount('/uploads', serve('./uploads')))

module.exports = app
