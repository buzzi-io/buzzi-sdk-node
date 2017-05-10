'use strict';

const { isEmpty } = require('lodash');
const request = require('request-promise');
const Delivery = require('./delivery');
const {
  isJwt,
  isArray,
  isBuffer,
  isReadable,

} = require('./util');
const fs = require('fs');

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

  static _checItemsForDownload(items) {
    const result = items.every((item) => {
      return isBuffer(item) || isReadable(item);
    });

    if (!result) {
      throw new Error('Should be one of Buffer, Readable stream or Array of one of them');
    }
  }
  /**
   *
   * @param {Buffer|ReadableStream|Buffer[]|ReadableStream[]} files
   * @returns {Promise}
   */
  uploadFiles(files) {
    if (isEmpty(files)) {
      throw new Error('Can\'t be empty');
    }

    if (!isArray(files)) {
      files = [files];
    }
    Service._checItemsForDownload(files);

    const formData = {
      attachments: []
    };

    for(const file of files) {
      formData.attachments.push(file);
    }
    // TODO add possibility to send Buffer, ( where get fileName )
    return this.request({
      method: 'POST',
      url: '/files',
      formData,
    });
  }


}

exports = module.exports = Service;
