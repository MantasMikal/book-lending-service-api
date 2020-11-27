const { exec } = require("child_process");

const runPreTest = (done) => {
  const p = exec("npm run pretest", (error, stdout) => {
    if (error) {
      throw Error(error)
    }
  });
  p.on('close', () => {
    done()
  })
}

module.exports = runPreTest