const {
  isArray,
  isString,
} = require('../util');

class ServiceValidator {
  uploadFiles(terget, key) {

    return (files) => {
      if (!isString(files) && !isArray(files)) {
        throw new Error('Should be string or array of strings');
      }

      if (!isArray(files)) {
        files = [files];
      }

      return terget[key](files);
    };
  }
}

module.exports = ServiceValidator;