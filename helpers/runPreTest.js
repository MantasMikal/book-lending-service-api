const { exec } = require("child_process");

/**
 * Runs pretest command to set up the database
 * @param {Function} done callback when command finished execution
 */
const runPreTest = (done) => {
  const p = exec("npm run pretest", (error, stdout) => {
    if (error) {
      throw Error(error);
    }
  });
  p.on("close", () => {
    done();
  });
};

module.exports = runPreTest;
