const app = require('./app');
let port = process.env.PORT || 3030;
app.listen(port);
console.log(`API server running on port ${port}`)