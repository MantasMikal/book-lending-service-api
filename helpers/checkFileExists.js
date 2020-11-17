const fs = require('fs-extra')

/**
 * Checks if file exists
 * @param {String} file path to file with filename
 * @returns {Boolean} 
 */
async function checkFileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

exports.checkFileExists = checkFileExists;
