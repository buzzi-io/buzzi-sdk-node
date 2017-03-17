'use strict';

const debug = require('debug')('buzzi-sdk-node:listener');
const globToRegExp = require('glob-to-regexp');
const util = require('../util');

const VERSION_REGEX = /^v?((\d+)(?:\.(\d+))?)$/;

class Listener {

  constructor (original, handler) {

    if (!util.isString(original)) throw new Error('Invalid Listener String');
    if (!util.isFunction(handler)) throw new Error('Invalid Listener Handler Function');

    let event, version, major, minor;
    ([ event, version ] = original.split('@'));
    ({ version, major, minor } = Listener.parseVersion(version));

    Object.assign(this, {
      regex: globToRegExp(event),
      event,
      version,
      major,
      minor,
      original,
      handler,
    });
  }

  isMatchingEvent(event) {
    return this.regex.test(event);
  }

  isMatchingVersion(version) {
    let { major, minor } = Listener.parseVersion(version);
    return (
      (util.isEmptyOrNull(this.major) || (this.major === major)) &&
      (util.isEmptyOrNull(this.minor) || (this.minor === minor))
    );
  }

  static parseVersion(version) {
    var major, minor;
    [ , version, major, minor] = (
      VERSION_REGEX.exec(version) ||
      ['', '', '', '']
    );
    return {
      version,
      major,
      minor,
    };
  }
}

exports = module.exports = Listener;
