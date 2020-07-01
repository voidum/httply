# Httply

[![Build Status](https://travis-ci.org/voidum/httply.svg?branch=master)](https://travis-ci.org/voidum/httply)
[![Coverage Status](https://coveralls.io/repos/github/voidum/httply/badge.svg?branch=master)](https://coveralls.io/github/voidum/httply?branch=master)

A wrapper for incoming and outgoing HTTP message.

## Usage

```sh
npm install --save httply
```

```javascript
const http = require('http');
const { IncomingMessage, OutgoingMessage } = require('httply');

const server = http.createServer(async (request, response) => {
  const incoming = new IncomingMessage(request);
  const { url, method, headers } = incoming;
  const query = incoming.query;
  const rawBody = await incoming.rawBody;

  const outgoing = new OutgoingMessage({
    status: 200,
    headers: {},
    content: { hello: 'world' }
  });
  outgoing.sendBy(response);
});
```
