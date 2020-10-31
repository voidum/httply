const assert = require('assert');
const fetch = require('node-fetch');
const server = require('./server');
const { OutgoingMessage, IncomingMessage } = require('../lib');

function request(url, options = {}) {
  if (!options.headers) options.headers = {};
  if (!options.headers['user-agent']) {
    options.headers['user-agent'] = 'httply-test';
  }
  return fetch('http://localhost:8080' + url, options);
}

describe('httply', () => {
  it('create server', () => {
    return new Promise((resolve) => {
      server.listen(8080, resolve);
    });
  });

  it('new incoming with protocol', () => {
    const incoming1 = new IncomingMessage({ url: '/', method: 'DELETE', protocol: 'https' });
    const incoming2 = new IncomingMessage({ url: '/', method: 'DELETE', protocol: 'HTTPS' });
    assert.strictEqual(incoming1.protocol, 'https');
    assert.strictEqual(incoming2.protocol, 'http');
  });

  it('incoming get', () => {
    return request('/proxy')
      .then(response => response.json())
      .then(json => {
        assert.deepStrictEqual(json, {
          url: '/proxy',
          query: {},
          method: 'GET',
          headers: {
            'user-agent': 'httply-test'
          }
        });
      });
  });

  it('incoming get with query', () => {
    return request('/proxy?a=1&b=2&c=%E4%B8%AD%E5%9B%BD')
      .then(response => response.json())
      .then(json => {
        assert.deepStrictEqual(json, {
          url: '/proxy?a=1&b=2&c=%E4%B8%AD%E5%9B%BD',
          query: { a: '1', b: '2', c: '中国' },
          method: 'GET',
          headers: {
            'user-agent': 'httply-test'
          }
        });
      });
  });

  it('incoming post', () => {
    return request('/proxy', {
      method: 'POST',
      body: JSON.stringify({ a: 1, b: 2 })
    })
      .then(response => response.json())
      .then(json => {
        assert.deepStrictEqual(json, {
          url: '/proxy',
          query: {},
          method: 'POST',
          headers: {
            'user-agent': 'httply-test',
            'content-length': '13',
            'content-type': 'text/plain;charset=UTF-8'
          },
          body: JSON.stringify({ a: 1, b: 2 })
        });
      });
  });

  it('outgoing content string', () => {
    return request('/write-string')
      .then(response => response.text())
      .then(text => {
        assert.strictEqual(text, 'text');
      });
  });

  it('outgoing status non number', () => {
    assert.throws(() => {
      new OutgoingMessage({ status: '200', content: '' });
    });
  });

  it('outgoing content empty', () => {
    const outgoing = new OutgoingMessage({ status: 200, content: null });
    assert.strictEqual(outgoing.content, '');
    assert.strictEqual(outgoing.headers['content-type'], 'text/plain');
  });

  it('outgoing content buffer with content-type = text', () => {
    return request('/write-buffer', {
      method: 'GET',
      headers: {
        'x-content-type': 'text/plain'
      }
    })
      .then(response => {
        assert.strictEqual(response.headers.get('content-type'), 'text/plain');
      });
  });

  it('outgoing content buffer without content-type', () => {
    return request('/write-buffer')
      .then(response => {
        assert.strictEqual(response.headers.get('content-type'), 'application/octet-stream');
      });
  });

  it('outgoing content binary', () => {
    return request('/write-binary')
      .then(response => {
        assert.strictEqual(response.headers.get('content-type'), 'application/octet-stream');
        return response.buffer();
      })
      .then(buffer => {
        assert.strictEqual(buffer.toString(), 'nothing here');
      });
  });
});
