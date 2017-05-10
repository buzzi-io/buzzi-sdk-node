'use strict';

const debug = require('debug')('buzzi-sdk-node:listener-manager');
const util = require('../util');
const Listener = require('./listener');

class ListenerManager {

  constructor() {
    this.config = [];
  }

  add(name, fn) {
    if (!util.isFunction(fn)) throw new Error('Invalid Listener Callback');
    if (util.isArray(name)) return name.forEach(name => this.add(name, fn));
    if (!util.isString(name)) throw new Error('Invalid Listener Name');

    debug('Adding Listener', name);
    this.config.push(new Listener(name, fn));
  }

  findAllMatchingHandlers({ event, version }) {

    let found = this.config.filter(listener => (
      listener.isMatchingEvent(event) &&
      listener.isMatchingVersion(version)
    ));

    if (found.length === 0) {
      debug('No Event Handlers for Event', { event, version });
      throw new Error('No Event Handlers for Event');
    } else {
      debug('Found Event Handlers', found.map(listener => listener.original));
      return found.map(listener => listener.handler);
    }
  }

  listeners() {
    return this.config.map(listener => listener.original);
  }

}

exports = module.exports = ListenerManager;
