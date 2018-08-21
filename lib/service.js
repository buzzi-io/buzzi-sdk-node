'use strict';

const request = require('request-promise');
const Delivery = require('./delivery');
const { isJwt, isUuid } = require('./util');

const DEFAULT_VERSION = 'v1.0';
const DEFAULT_HOST = 'https://core.buzzi.io';

class Service {

  constructor(...args) {
    let id, secret, host;

    if (args.length === 1) {
      // Usage:  new Service({ id, secret, host });
      const [config] = args;
      if (!config || (typeof config === 'string')) {
        throw new Error('Invalid Constructor Arguments');
      } else {
        id = config.id;
        secret = config.secret;
        host = config.host;
      }
    } else {
      // Usage:  new Service(id, secret, host);
      [id, secret, host] = args;
    }

    // id XOR secret. (must have both or neither).
    if ((id && !secret) || (!id && secret)) {
      throw new Error('Invalid Constructor Arguments');
    }

    this.host = host || process.env.BUZZI_HOST || DEFAULT_HOST;
    this.id = id || process.env.BUZZI_API_ID;
    this.secret = secret || process.env.BUZZI_API_SECRET;
  }

  request(config) {
    return request(Object.assign({
      baseUrl: this.host,
      auth: {
        user: this.id,
        pass: this.secret,
      },
    }, config));
  }

  ping() {
    return this.request({
      method: 'GET',
      url: '/ping',
    });
  }

  isAuthorized() {
    return this.request({
      method: 'GET',
      url: '/authorized',
    })
    .then(() => true)
    .catch(reason => {
      if (reason.statusCode === 401) return false;
      else throw reason;
    });
  }

  send(...args) {
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

  fetch() {
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

  error(ticket, data) {
    if (ticket instanceof Delivery) ticket = ticket.ticket_id;
    if (!isUuid(ticket)) throw new Error('Invalid Ticket ID');

    return this.request({
      method: 'POST',
      url: `/ticket/${ticket}/error`,
      body: data,
      json: true,
      resolveWithFullResponse: true,
    })
    .then(response => response.statusCode === 200);
  }

  confirm(ticket) {
    if (ticket instanceof Delivery) ticket = ticket.ticket_id;
    if (!isUuid(ticket)) throw new Error('Invalid Ticket ID');

    return this.request({
      method: 'GET',
      url: `/ticket/${ticket}/confirm`,
      resolveWithFullResponse: true,
    })
    .then(response => response.statusCode === 200);
  }

  remove(receipt) {
    if (receipt instanceof Delivery) receipt = receipt.receipt;
    if (!isJwt(receipt)) throw new Error('Invalid Delivery Receipt');

    return this.request({
      method: 'DELETE',
      url: '/event',
      qs: { receipt },
      resolveWithFullResponse: true,
    })
    .then(response => response.statusCode === 200);
  }

  /**
   *
   * @param {object} formData
   * @param {string} eventType
   * @param {string} eventVersion
   * [Request formData]{@link https://github.com/request/request#forms}
   * @returns {Promise}
   */
  upload(formData, eventType, eventVersion) {
    let url = '/files';

    if (eventType) {
      url = `${url}/${eventType}`;
    }

    if (eventVersion) {
      url = `${url}/${eventVersion}`;
    }

    return this.request({
      method: 'POST',
      url,
      formData,
    });
  }

}

exports = module.exports = Service;
