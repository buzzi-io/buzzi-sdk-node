'use strict';

const request = require('request-promise');

const DEFAULT_VERSION = 'v1.0';

class Service {

  constructor (id, secret, host) {
    this.host = host || process.env.BUZZI_HOST || 'https://core.buzzi.io';
    this.id = id || process.env.BUZZI_API_ID;
    this.secret = secret || process.env.BUZZI_API_SECRET;
  }

  isAuthorized() {
    return request({
      method: 'GET',
      url: '/authorized',
      baseUrl: this.host,
      auth: {
        user: this.id,
        pass: this.secret,
      }
    })
    .then(() => true)
    .catch(reason => {
      if (reason.statusCode == 401) return false;
      else throw reason;
    });
  }

  send (...args) {
    let type, payload, version = DEFAULT_VERSION;

    if (args.length === 3) [type, version, payload] = args;
    else if (args.length === 2) [type, payload] = args;
    else throw new Error('Invalid Arguments');

    return request({
      method: 'POST'
      url: `/event/${type}/${version}`,
      baseUrl: this.host,
      // headers: {},
      auth: {
        user: this.id,
        pass: this.secret,
      },
      body: payload,
      json: true,
    });
  }



}

exports = module.exports = Service;
