const btoa = function(str){ return Buffer.from(str).toString('base64'); }
module.exports = btoa