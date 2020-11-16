const AccessControl = require('role-acl');
const ac = new AccessControl();

// controls for specific CRUD operations on article records
// don't let users update an article ID or the authorID
ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('update')
  .on('article');

ac
  .grant('admin')
  .execute('delete')
  .on('article');


exports.update = (requester, data) => {
    console.log(requester)
    console.log(data)
  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.authorID})
    .execute('update')
    .sync()
    .on('article');
}

exports.delete = (requester) => {
  return ac
    .can(requester.role)
    .execute('delete')
    .sync()
    .on('article');
}
