const AccessControl = require("role-acl");
const ac = new AccessControl();


// Book owner and request owner can access message
const isParticipantInRequest = ({ requester, request }) => {
  const { bookOwnerID, requesterID } = request; 
  return (
    requester === parseInt(bookOwnerID) || requester === parseInt(requesterID)
  );
}

ac.grant("user")
  .condition(isParticipantInRequest)
  .execute("read")
  .on("message");
ac.grant("user")
  .condition(isParticipantInRequest)
  .execute("write")
  .on("message");

exports.read = (requester, request) => {
  return ac
    .can(requester.role)
    .context({ requester: requester.ID, request: request })
    .execute("read")
    .sync()
    .on("message");
};

exports.write = (requester, request) => {
  return ac
    .can(requester.role)
    .context({ requester: requester.ID, request: request })
    .execute("write")
    .sync()
    .on("message");
};
