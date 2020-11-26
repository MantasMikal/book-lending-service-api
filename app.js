const Koa = require('koa');
const cors = require('@koa/cors');
const serve = require('koa-static');
const mount = require('koa-mount')
const app = new Koa();

const corsOptions = {
  origin: [
    '*'
  ]
}

app.use(cors(corsOptions));

const special = require('./routes/special.js')
const articles = require('./routes/articles.js');
const messages = require('./routes/messages.js')
const users = require('./routes/users.js');
const categories = require('./routes/categories.js');
const comments = require('./routes/comments.js');
const books = require('./routes/books.js');
const search = require('./routes/search.js');
const requests = require('./routes/requests.js');

app.use(special.routes());
app.use(articles.routes());
app.use(users.routes());
app.use(categories.routes());
app.use(comments.routes());
app.use(books.routes());
app.use(search.routes())
app.use(requests.routes())
app.use(messages.routes())
app.use(mount('/uploads', serve('./uploads')))

module.exports = app
