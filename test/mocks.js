'use strict';

let uuid = require('uuid/v4');

exports = module.exports = {};

class FakeDelivery {

  constructor(hydrate = {}) {

    Object.assign(this, {
      account_id: uuid(),
      account_display: 'Fake Account',
      consumer_id: uuid(),
      consumer_display: 'Fake Consumer',
      delivery_id: uuid(),
      event_id: uuid(),
      event_type: 'buzzi.ecommerce.test',
      event_version: 'v1.0',
      event_display: 'Test Event',
      publisher_id: uuid(),
      publisher_display: 'Fake Publisher',
      receipt: 'json.web.token',
      variables: {},
      body: '{ "message": "Hello, World!" }',
    }, hydrate);

  }

}

exports.FakeDelivery = FakeDelivery;
