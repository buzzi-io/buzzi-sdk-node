'use strict';

const request = require('request-promise');
const Delivery = require('./delivery');
const { isJwt, isUuid } = require('./util');

const DEFAULT_VERSION = 'v1.0';

class Service {

  constructor(id, secret, host) {
    if (arguments.length === 1) {
      id = id.id;
      secret = id.secret;
      host = id.host;
    }
    this.host = host || process.env.BUZZI_HOST || 'https://core.buzzi.io';
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
   * [Request formData]{@link https://github.com/request/request#forms}
   * @returns {Promise}
   */
  upload(formData) {
    return this.request({
      method: 'POST',
      url: '/files',
      formData,
    });
  }

}

exports = module.exports = Service;
