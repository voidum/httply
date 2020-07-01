const { isReadableStream, lowerCaseHeaderKeys } = require('./shared');

class OutgoingMessage {
  constructor(message = { status: 200, content: '', headers: {} }) {
    if (typeof message.status !== 'number' || message.status < 0) {
      throw new Error('illegal status');
    }
    this.status = message.status;
    this.headers = lowerCaseHeaderKeys(message.headers);
    if (!message.content) {
      this.contentType = 'text/plain';
      this.content = '';
    } else if (Buffer.isBuffer(message.content) || isReadableStream(message.content)) {
      if (!this.contentType) {
        this.contentType = 'application/octet-stream';
      }
      this.content = message.content;
    } else if (typeof message.content === 'object') {
      this.contentType = 'application/json';
      this.content = JSON.stringify(message.content);
    } else {
      this.contentType = 'text/plain';
      this.content = message.content.toString();
    }
  }

  get contentType() {
    return this.headers['content-type'];
  }

  set contentType(value) {
    this.headers['content-type'] = value;
  }

  sendBy(response) {
    response.writeHead(this.status, this.headers);
    if (isReadableStream(this.content)) {
      this.content.pipe(response);
    } else {
      response.write(this.content);
      response.end();
    }
  }
}

module.exports = OutgoingMessage;
