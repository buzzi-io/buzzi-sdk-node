'use strict';

exports = module.exports = {
  tryConvertToJson,
  isJwt,
  isString,
  isArray,
  isFunction,
  isEmptyOrNull,
  descBy,
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

function descBy(field) {
  return (a, b) => (b[field] - a[field]);
}
