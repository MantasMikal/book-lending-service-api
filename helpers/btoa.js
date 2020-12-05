/**
 * Encodes string to base64
 * @param {String} str to be encoded 
 */
const btoa = function(str){ return Buffer.from(str).toString('base64'); }
module.exports = btoa