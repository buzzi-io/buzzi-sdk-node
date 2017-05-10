'use strict';

const Promise = require('bluebird');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');

describe('Service', function () {

  const SDK = require('../');
  const service = new SDK.Service(
    '000000c1-1111-2222-3333-000000000000',
    '1234567812345678123456781234567812345678123456781234567812345678',
    'http://localhost:3000'
  );

  it ('ping', function () {
    return service.ping();
  });

  it ('isAuthorized', function () {
    return service.isAuthorized()
      .then(isAuthd => {
        assert(isAuthd === true, 'is authorized');
      });
  });

  it ('send event', function () {
    return service.send('buzzi.ecommerce.test', {
      message: 'Hello, World!',
      timestamp: (new Date()).toISOString(),
    })
    .then(body => {
      expect(body).to.have.property('event');
    });
  });

  it ('fetch event', function () {
    return service.fetch()
      .then(response => {
        assert(response instanceof SDK.Delivery, 'is Delivery');
      });
  });

  it ('remove event', function () {
    return service.send('buzzi.ecommerce.test', {
      message: 'Hello, World!',
      timestamp: (new Date()).toISOString(),
    })
    .then(() => service.fetch())
    .then(response => service.remove(response.receipt));
  });

  describe('uploadFiles', () => {
    it('should be a function', () => {
      expect(service.uploadFiles).to.be.a('function');
    });

    it('should send files when it is only one Readable', () => {
      const stub = sinon.stub(service, 'request');
      const fixturePath = path.join(__dirname, 'fixtures/files/hello.txt');
      const fsStream = fs.createReadStream(fixturePath);
      service.uploadFiles(fsStream);
      sinon.assert.calledOnce(stub);
      stub.restore();
    });

    it('should send files when it is Readable and(or) Buffer', () => {
      const stub = sinon.stub(service, 'request');
      const fixturePath1 = path.join(__dirname, 'fixtures/files/hello.txt');
      const fixturePath2 = path.join(__dirname, 'fixtures/files/image.jpg');
      const fsStream1 = fs.createReadStream(fixturePath1);
      const fsStream2 = fs.createReadStream(fixturePath2);
      const fsStream3 = new Buffer('asfasfas');
      service.uploadFiles([fsStream1, fsStream2, fsStream3]);
      sinon.assert.calledOnce(stub);
      stub.restore();
    });

    it('should throw error when item isn\'t provide Readable or Buffer', () => {
      const stub = sinon.stub(service, 'request');
      const typesArr = ['str', 1, true, [], {}, null, undefined, () => {}];
      const throwsError = [];
      typesArr.forEach((typeToCheck) => {
        throwsError.push(() => {service.uploadFiles(typeToCheck)});
      });
      throwsError.forEach((throwErr) => {
        expect(throwErr).to.throw(Error);
      });
      stub.restore();
    });

    it('should send file and return correct result when item Readable stream', async function() { // TODO integration test
      this.timeout(6000);
      const fixturePath = path.join(__dirname, 'fixtures/files/hello.txt');
      const fsStream = fs.createReadStream(fixturePath);
      const result = await service.uploadFiles(fsStream);
      expect(JSON.parse(result)).to.be.an('object')
        .that.haveOwnProperty('files');
    });

    it.skip('should send file and return correct result when item Buffer', async function() { // TODO where i can get file name in buffer
      const readFile = Promise.promisify(fs.readFile);
      this.timeout(6000);
      const fixturePath = path.join(__dirname, 'fixtures/files/hello.txt');
      const fileBuf = await readFile(fixturePath);
      const result = await service.uploadFiles(fileBuf);
      console.log(result);
      // expect(JSON.parse(result)).to.be.an('object')
      //   .that.haveOwnProperty('files');
    });
  });
});
