'use strict';

const values = require('object.values');
const toCamelCase = require('lodash.camelcase');

const BUZZI_VAR_HEADER_PREFIX = 'x-buzzi-var-';

class Delivery {

  constructor (o) {

    Object.assign(this, o);
  }

  static fromResponse (response) {

    return new Delivery({
      account_id: response.headers['x-buzzi-account-id'],
      account_display: response.headers['x-buzzi-account-display'],
      consumer_id: response.headers['x-buzzi-consumer-id'],
      consumer_display: response.headers['x-buzzi-consumer-display'],
      delivery_id: response.headers['x-buzzi-delivery-id'],
      event_id: response.headers['x-buzzi-event-id'],
      event_type: response.headers['x-buzzi-event-type'],
      event_version: response.headers['x-buzzi-event-version'],
      event_display: response.headers['x-buzzi-event-display'],
      publisher_id: response.headers['x-buzzi-publisher-id'],
      publisher_display: response.headers['x-buzzi-publisher-display'],
      receipt: response.headers['x-buzzi-receipt'],
      variables: getVariablesFromHeaders(response.headers),
      body: tryConvertToJson(response.body),
    });
  }
}

exports = module.exports = Delivery;

// ---

function tryConvertToJson(value) {

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

function getVariablesFromHeaders(headers) {

  return values(headers)
    .filter(header => (typeof header === 'string') && header.includes(BUZZI_VAR_HEADER_PREFIX))
    .reduce((vars, header) => {
      let key = toCamelCase(header.replace(BUZZI_VAR_HEADER_PREFIX, ''));
      let value = headers[header];
      vars[key] = value;
      return vars;
    }, {})
}
