'use strict';

const assert = require('assert');
const Promise = require('bluebird');
const interval = require('fibonacci-backoff-interval');
const Listeners = require('./listeners');

class Consumer {

  constructor (service, options = {}) {

    const self = this;

    this.service = service;
    this.listeners = new Listeners();

    this.ctx = interval(Promise.coroutine(function *consumer(ctx) {

      let delivery = yield service.fetch();
      if (!delivery) throw NO_EVENTS;

      let handlers = listeners.findAllMatchingHandlers({
        event: delivery.event_type,
        version: delivery.event_version,
      });

      yield Promise.map(handlers, (handler) => handler(delivery, self));

      yield service
        .remove(delivery)
        .catch((err) => {
          // @todo: send error to buzzi.
          throw err;
        });

    }, {
      start: false,
      max: options.max || DEFAULT_MAX,
      min: options.min || DEFAULT_MIN,
    }))
    .on('rejected', (error, ctx) => {
      if (error === NO_EVENTS) return;
      throw error; // elevate to the 'error' listener, which the user should subscriber for.
    });
  }

  onerror(fn) {
    assert(typeof fn === 'function', 'Invalid Callback');
    this.ctx.on('error', (error) => fn(error, this));
    return this;
  }

  on (name, fn) {
    this.listeners.add(name, fn);
    return this;
  }

  start () {
    this.ctx.start();
    return this;
  }

  stop () {
    this.ctx.stop();
    return this;
  }

  get status () {
    return this.ctx.status();
  }

}

exports = module.exports = Consumer;
