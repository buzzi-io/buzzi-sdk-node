'use strict';

const assert = require('assert');
const Promise = require('bluebird');
const interval = require('fibonacci-backoff-interval');
const ListenerManager = require('./listener-manager');

const DEFAULT_MAX = process.env.BUZZI_CONSUMER_MAX_INTERVAL || 10000;
const DEFAULT_MIN = process.env.BUZZI_CONSUMER_MIN_INTERVAL || 100;

const NO_EVENTS = Symbol('NO_EVENTS');

class Consumer {

  constructor (service, options = {}) {

    const self = this;

    this.service = service;
    this.listeners = new ListenerManager();

    this.ctx = interval(Promise.coroutine(function *consumer(ctx) {

      let delivery = yield self.service.fetch();
      if (!delivery) throw NO_EVENTS;

      let handlers = self.listeners.findAllMatchingHandlers({
        event: delivery.event_type,
        version: delivery.event_version,
      });

      yield Promise.map(handlers, (handler) => handler(delivery, self));

      yield self.service
        .remove(delivery)
        .catch((err) => {
          // @todo: send error to buzzi.
          throw err;
        });

    }), {
      start: false,
      max: options.max || DEFAULT_MAX,
      min: options.min || DEFAULT_MIN,
    })
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
