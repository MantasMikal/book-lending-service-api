const AccessControl = require('role-acl');
const ac = new AccessControl();

// controls for specific CRUD operations on book records
// don't let users update a book ID or the ownerID

const isParticipantInRequest = ({ requester, request }) => {
  console.log("🚀 ~ file: requests.js ~ line 13 ~ isParticipantInRequest ~ request", request)
console.log("🚀 ~ file: requests.js ~ line 13 ~ isParticipantInRequest ~ requester", requester)

  const { bookOwnerID, requesterID } = request; 
  return (
    requester === parseInt(bookOwnerID) || requester === parseInt(requesterID)
  );
}

ac
  .grant('user')
  .condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
  .execute('read')
  .on('request');
ac
  .grant('user')
  .condition(isParticipantInRequest)
  .execute('readByRequestId')
  .on('request')

exports.read = (requester, requesterID) => {
  return ac
    .can(requester.role)
    .context({requester:requester.ID, owner: requesterID})
    .execute('read')
    .sync()
    .on('request');
}

exports.readByRequestId = (requester, request) => {
  return ac
    .can(requester.role)
    .context({ requester: requester.ID, request: request })
    .execute("readByRequestId")
    .sync()
    .on("request");
};

