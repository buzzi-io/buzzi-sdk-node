'use strict';

const values = require('object.values');
const toCamelCase = require('lodash.camelcase');
const { tryConvertToJson } = require('./util');

class Delivery {

  constructor(o) {

    Object.assign(this, o);
  }

  static fromResponse(response) {

    return new Delivery({
      ticket_id: response.headers['x-buzzi-ticket-id'],
      account_id: response.headers['x-buzzi-account-id'],
      account_display: response.headers['x-buzzi-account-display'],
      consumer_id: response.headers['x-buzzi-consumer-id'],
      consumer_display: response.headers['x-buzzi-consumer-display'],
      delivery_id: response.headers['x-buzzi-delivery-id'],
      event_id: response.headers['x-buzzi-event-id'],
      event_type: response.headers['x-buzzi-event-type'],
      event_version: response.headers['x-buzzi-event-version'],
      event_display: response.headers['x-buzzi-event-display'],
      producer_id: response.headers['x-buzzi-producer-id'],
      producer_display: response.headers['x-buzzi-producer-display'],
      receipt: response.headers['x-buzzi-receipt'],
      variables: getVariablesFromHeaders(response.headers),
      body: tryConvertToJson(response.body),
    });
  }
}

exports = module.exports = Delivery;

// ---

function getVariablesFromHeaders(headers) {
  const BUZZI_VAR_HEADER_PREFIX = 'x-buzzi-var-';
  return values(headers)
    .filter(header => (typeof header === 'string') && header.includes(BUZZI_VAR_HEADER_PREFIX))
    .reduce((vars, header) => {
      let key = toCamelCase(header.replace(BUZZI_VAR_HEADER_PREFIX, ''));
      let value = headers[header];
      vars[key] = value;
      return vars;
    }, {});
}
