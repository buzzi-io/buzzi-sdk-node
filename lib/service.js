'use strict';

const ServiceValidator = require('./validators/service.validator');
const request = require('request-promise');
const Delivery = require('./delivery');
const {
  isJwt,
  isArray,
} = require('./util');
const fs = require('fs');

const DEFAULT_VERSION = 'v1.0';

class Service {

  constructor (id, secret, host) {
    this.host = host || process.env.BUZZI_HOST || 'https://core.buzzi.io';
    this.id = id || process.env.BUZZI_API_ID;
    this.secret = secret || process.env.BUZZI_API_SECRET;
    const validator = new ServiceValidator();
    const proxy = new Proxy(this, {
      get(target, key) {
        return validator[key] ? validator[key](target, key) : target[key];
      }
    });
    return proxy;
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

  fetch () {
    return this.request({
      method: 'GET',
      url: '/event',
      resolveWithFullResponse: true,
    })
    .then(response => {
      if (response.statusCode === 204) return null;
      return Delivery.fromResponse(response);
    });
  }

  remove (receipt) {
    if (receipt instanceof Delivery) receipt = receipt.receipt;
    if (!isJwt(receipt)) throw new Error('Invalid Delivery Receipt');

    return this.request({
      method: 'DELETE',
      url: '/event',
      qs: { receipt },
    });
  }

  /**
   *
   * @param {string|string[]} files
   * @returns {Promise}
   */
  uploadFiles(files) {
    const formData = { attachments: [] };

    for(const file of files) {
      const stream = fs.createReadStream(file);
      formData.attachments.push(stream);
    }

    return this.request({
      method: 'POST',
      url: '/files',
      formData,
    });
  }

}

exports = module.exports = Service;
