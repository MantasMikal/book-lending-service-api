const AccessControl = require('role-acl');
const ac = new AccessControl();

// controls for specific CRUD operations on book records
// don't let users update a book ID or the ownerID
ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('update')
  .on('book');

ac
  .grant('admin')
  .execute('delete')
  .on('book');

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('delete')
  .on('book')


exports.update = (requester, data) => {
  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.ownerID})
    .execute('update')
    .sync()
    .on('book');
}

exports.delete = (requester, data) => {
  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner:data.ownerID})
    .execute('delete')
    .sync()
    .on('book');
}
