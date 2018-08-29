const path = require('path');

exports.getApiDocs = (req, res, next) => {
  res.status(200).sendFile('views/apiDocs.html', { root: path.resolve(__dirname, '../') });
};