'use strict';

const utils = require('../lib/util');
const fs = require('fs');
const path = require('path');
const { Writable, Readable,  Duplex, Transform } = require('stream');

describe('Service', () => {
  describe('#isBuffer', () => {
    it('should return true if item is Buffer instance', () => {
      const buf = new Buffer('afasdgsadf');
      expect(utils.isBuffer(buf)).to.be.eql(true);
    });
    it('should return false if item isn\'t Buffer instance', () => {
      const typesArr = ['str', 1, true, [], {}, null, undefined, () => {}];
      typesArr.forEach((typyToCheck) => {
        expect(utils.isBuffer(typyToCheck)).to.be.eql(false);
      });
    });
  });
  describe('#isStream', () => {
    it('should return true if item provide read from stream', () => {
      const fixturePath = path.join(__dirname, 'fixtures/files/hello.txt');
      const streamsToCheck =  [
        fs.createReadStream(fixturePath),
        new Readable(),
        new Duplex(),
        new Transform(),
      ];

      streamsToCheck.forEach((streamInstance) => {
        expect(utils.isReadableStream(streamInstance)).to.be.eql(true);
      });
    });

    it('should return false if item is Writable stream', () => {
      const writableStream = new Writable();
      expect(utils.isReadableStream(writableStream)).to.be.eql(false);
    });

    it('should return false if item is not stream', () => {
      const typesArr = ['str', 1, true, [], {}, null, undefined, () => {}];
      typesArr.forEach((typeToCheck) => {
        expect(utils.isReadableStream(typeToCheck)).to.be.eql(false);
      });
    });
  });
});
