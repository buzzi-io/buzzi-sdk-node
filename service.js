'use strict';

const request = require('request-promise');

const DEFAULT_VERSION = 'v1.0';

class Service {

  constructor (id, secret, host) {
    this.host = host || process.env.BUZZI_HOST || 'https://core.buzzi.io';
    this.id = id || process.env.BUZZI_API_ID;
    this.secret = secret || process.env.BUZZI_API_SECRET;
  }

  request (config) {
    return request(Object.assign({
      baseUrl: this.host,
      auth: {
        user: this.id,
        pass: this.secret,
      },
    }, config));
  }

  ping () {
    return this.request({
      method: 'GET',
      url: '/ping',
    });
  }

  isAuthorized () {
    return this.request({
      method: 'GET',
      url: '/authorized',
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

    return this.request({
      method: 'POST',
      url: `/event/${type}/${version}`,
      body: payload,
      json: true,
    });
  }



}

exports = module.exports = Service;