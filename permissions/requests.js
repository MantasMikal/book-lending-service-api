const AccessControl = require('role-acl');
const ac = new AccessControl();

const isParticipantInRequest = ({ requester, request }) => {
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
ac
  .grant('user')
  .condition(isParticipantInRequest)
  .execute('update')
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

exports.update = (requester, request) => {
  return ac
    .can(requester.role)
    .context({ requester: requester.ID, request: request })
    .execute("update")
    .sync()
    .on("request");
};
