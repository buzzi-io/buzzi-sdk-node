'use strict';

const debug = require('buzzi-sdk-node:listeners');
const util = require('../util');

const LISTENER_REGEX = /^([a-z\-]*)\.([a-z\-]*)\.([a-z\-]*)(?:@v?(\d+\.\d+|\d+))?$/;
const EVENT_REGEX = /^([a-z\-]*)\.([a-z\-]*)\.([a-z\-]*)$/;
const VERSION_REGEX = /^v?((\d+)(?:\.(\d+))?)$/;
const RANKING = [
  ['name',       4 ],
  ['industry',   2 ],
  ['namespace',  1 ],
  ['major',      0.5 ],
  ['minor',      0.25 ],
];

class Listener {

  constructor (original, handler) {
    var namespace, industry, name, version, major, minor;

    [ , namespace, industry, name, version ] = LISTENER_REGEX.exec(original) || ['', '', '', '', ''];
    [ , version, major, minor] = VERSION_REGEX.exec(version) || ['', '', '', ''];

    Object.assign(this, {
      namespace,
      industry,
      name,
      version,
      major,
      minor,
      original,
      handler,
    });

    this.specificity = Listener.calculateSpecificity(this);
  }

  static calculateSpecificity (listener) {
    return RANKING.reduce((result, [key, value]) => {
      return (!isEmptyOrNull(listener[key])) ? (result + value) : result;
    }, 0);
  }
}

class Listeners {

  constructor () {
    this.config = [];
  }

  add (name, fn) {
    if (!util.isFunction(fn)) throw new Error('Invalid Listener Callback');
    if (util.isArray(name)) return name.forEach((name) => this.add(name, fn));
    if (!util.isString(name)) throw new Error('Invalid Listener Name');

    this.config.push(new Listener(name, fn));
    this.config.sort(util.descBy('specificity'));
  }

  findBestFitHandler ({ event, version }) {

    let parsed = Listeners.parseEventAndVersion({ event, version });
    let found = this.config.find(Listeners.isMatchingListener(parsed);

    if (!found) {
      debug('No Event Handler for Event', { event, version });
      throw new Error('No Event Handler for Event');
    } else {
      debug('Found Event Handler', { listener: found.original, specificity: found.specificity });
      return found.handler;
    }
  }

  findAllMatchingHandlers ({ event, version }) {

    let parsed = Listeners.parseEventAndVersion({ event, version });
    let found = this.config.filter(Listeners.isMatchingListener(parsed));

    if (found.length === 0) {
      debug('No Event Handler for Event', { event, version });
      throw new Error('No Event Handler for Event');
    } else {
      debug('Found Event Handler', found.map(listener => listener.original));
      return found.map(listener => listener.handler);
    }
  }

  static isMatchingListener ({ namespace, industry, name, major, minor }) {
    return function isMatch(listener) {
      return (
        (util.isFunction(listener.handler)) &&
        (util.isEmptyOrNull(listener.namespace) || (listener.namespace === namespace)) &&
        (util.isEmptyOrNull(listener.industry) || (listener.industry === industry)) &&
        (util.isEmptyOrNull(listener.name) || (listener.name === name)) &&
        (util.isEmptyOrNull(listener.major) || (listener.major === major)) &&
        (util.isEmptyOrNull(listener.minor) || (listener.minor === minor))
      );
    };
  }

  static parseEventAndVersion({ event, version }) {
    var namespace, industry, name, major, minor;

    try {
      [ , namespace, industry, name ] = EVENT_REGEX.exec(event);
      [ , , major, minor ] = VERSION_REGEX.exec(version);
    } catch (err) {
      debug('Invalid Event or Version Syntax', err);
      throw new Error('Invalid Event or Version Syntax');
    }

    return {
      namespace,
      industry,
      name,
      major,
      minor,
    };
  }

}

exports = module.exports = Listeners;
