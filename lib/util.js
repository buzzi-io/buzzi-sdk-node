'use strict';
const { Readable,  Duplex, Transform } = require('stream');
exports = module.exports = {
  tryConvertToJson,
  isJwt,
  isString,
  isArray,
  isFunction,
  isEmptyOrNull,
  descBy,
  isBuffer,
  isReadable,
};


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

function isJwt(value) {
  return isString(value) && (value.split('.').length === 3);
}

function isString(value) {
  return (typeof value === 'string');
}

function isArray(value) {
  return value && Object.prototype.toString.call(value) === '[object Array]';
}

function isFunction(value) {
  return value && (typeof value === 'function');
}

function isEmptyOrNull(value) {
  return value == null || value === '';
}

function isBuffer(value) {
  return value instanceof Buffer;
}

function isReadable(value) {
  let result = false;
  [Readable,  Duplex, Transform].forEach((streamClass) => {
    if (result) {
      return result;
    }
    result = value instanceof streamClass
  });
  return result;
}

function descBy(field) {
  return (a, b) => (b[field] - a[field]);
}
