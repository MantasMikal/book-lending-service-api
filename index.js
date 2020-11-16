const Koa = require('koa');
const cors = require('@koa/cors');
const app = new Koa();

app.use(cors());

const special = require('./routes/special.js')
const articles = require('./routes/articles.js');
const users = require('./routes/users.js');
const categories = require('./routes/categories.js');
const comments = require('./routes/comments.js');

app.use(special.routes());
app.use(articles.routes());
app.use(users.routes());
app.use(categories.routes());
app.use(comments.routes());

let port = process.env.PORT || 3000;

app.listen(port);
console.log(`API server running on port ${port}`)
