const { Readable } = require('stream');

function isReadableStream(o) {
  return o instanceof Readable;
}

function lowerCaseHeaderKeys(headers) {
  const result = {};
  if (headers && typeof headers === 'object') {
    Object.keys(headers).forEach((key) => {
      result[key.toLowerCase()] = headers[key];
    });
  }
  return result;
}

module.exports = {
  isReadableStream,
  lowerCaseHeaderKeys
};
