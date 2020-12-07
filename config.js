/*
INSTRUCTIONS: copy this file as 'config.js' and ensure the
filename 'config.js' is in your '.gitignore' file.
Then remove this header and put the actual DB connection
details in to the newly created 'config.js' file.

Why? We should NEVER commit config files to version
control if they contain passwords or other sensitive
information. Since this will be pushed to our repository.

Instead, provide a template file like this one for other
developers who might need to use the code. They will
probably use different configuration settings anyway.
*/


// Export database connection information.
// Use the environment settings or given defaults.
exports.config = {
  host: process.env.DB_HOST || "j5zntocs2dn6c3fj.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "wkcwsczwn39de47j",
  password: process.env.DB_PASSWORD || "elyw3tvhiwqytl82",
  database: process.env.DB_DATABASE || "a0zjackh0qxp6cmd",
  connection_limit: 100
}
