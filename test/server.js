const fs = require('fs');
const http = require('http');
const path = require('path');
const { IncomingMessage, OutgoingMessage } = require('../lib');

module.exports = http.createServer(async (request, response) => {
  const incoming = new IncomingMessage(request);
  if (incoming.url.startsWith('/proxy')) {
    const rawBody = await incoming.rawBody;
    const headers = { ...incoming.headers };
    delete headers['accept'];
    delete headers['accept-encoding'];
    delete headers['connection'];
    delete headers['host'];
    const outgoing = new OutgoingMessage({
      status: 200,
      content: {
        url: incoming.url,
        query: incoming.query,
        method: incoming.method,
        headers,
        body: rawBody && rawBody.toString()
      }
    });
    outgoing.sendBy(response);
    return;
  }
  if (incoming.url === '/write-string') {
    const outgoing = new OutgoingMessage({
      status: 200,
      content: 'text'
    });
    outgoing.sendBy(response);
    return;
  }
  if (incoming.url === '/write-buffer') {
    const outgoing = new OutgoingMessage({
      status: 200,
      content: Buffer.from('buffer'),
      headers: {
        'content-type': incoming.headers['x-content-type']
      }
    });
    outgoing.sendBy(response);
    return;
  }
  if (incoming.url === '/write-binary') {
    const outgoing = new OutgoingMessage({
      status: 200,
      content: fs.createReadStream(path.join(__dirname, 'fixtures/binary'))
    });
    outgoing.sendBy(response);
    return;
  }
});
