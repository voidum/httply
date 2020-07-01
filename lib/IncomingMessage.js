const querystring = require('querystring');
const { BufferListStream } = require('bl');
const { isReadableStream, lowerCaseHeaderKeys } = require('./shared');

function readRawBody(request) {
  return new Promise((resolve, reject) => {
    const bl = new BufferListStream();
    request.on('data', (chunk) => bl.append(chunk));
    request.on('error', (error) => reject(error));
    request.on('end', () => resolve(bl));
  });
}

class IncomingMessage {
  constructor(message = { url: '/', method: 'GET', headers: {} }) {
    this.url = message.url;
    this.method = message.method.toUpperCase();
    this.headers = lowerCaseHeaderKeys(message.headers);
    if (isReadableStream(message)) {
      Object.defineProperty(this, '$request', {
        configurable: false, writable: false, enumerable: false, value: message
      });
      if (message.method === 'POST' || message.method === 'PUT') {
        this.$rawBody = readRawBody(message);
      }
    }
  }

  get query() {
    const url = new URL(this.url, 'http://localhost');
    return querystring.parse(url.search.slice(1));
  }

  get rawBody() {
    if (!this.$rawBody) {
      return Promise.resolve();
    }
    return this.$rawBody.then(bufferList => {
      if (bufferList.length > 0) {
        return bufferList.slice(0);
      }
      return undefined;
    });
  }
}

module.exports = IncomingMessage;
