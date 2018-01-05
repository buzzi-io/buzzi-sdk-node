/* eslint global-require:0 */
'use strict';

const Promise = require('bluebird');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');

describe('Service', function () {

  before(function () {
    process.env.INTEGRATION_TESTS || this.skip();
  });

  const SDK = require('../');
  const service = new SDK.Service(
    '00000000-0000-0000-0000-000000000000',
    '1234567812345678123456781234567812345678123456781234567812345678',
    'https://core.buzzi.io'
  );

  it('ping', function () {
    return service.ping();
  });

  it('isAuthorized', function () {
    return service.isAuthorized()
      .then(isAuthd => {
        assert(isAuthd === true, 'is authorized');
      });
  });

  it('send event', function () {
    return service.send('buzzi.generic.test', {
      message: 'Hello, World!',
      timestamp: (new Date()).toISOString(),
    })
    .then(body => {
      expect(body).to.have.property('event');
    });
  });

  it('fetch event', function () {
    return service.fetch()
      .then(response => {
        assert(response instanceof SDK.Delivery, 'is Delivery');
      });
  });

  it('confirm event', function () {
    return service.send('buzzi.ecommerce.test', {
      message: 'Hello, World!',
      timestamp: (new Date()).toISOString(),
    })
    .then(() => service.fetch())
    .then(response => service.confirm(response));
  });

  describe('upload', () => {

    before(function () {
      process.env.INTEGRATION_TESTS || this.skip();
    });

    it('should be a function', () => {
      expect(service.upload).to.be.a('function');
    });

    it('should send files when it is only one Readable', () => {
      const stub = sinon.stub(service, 'request');
      const fixturePath = path.join(__dirname, 'fixtures/files/hello.txt');
      const formData = {
        attachments: [fs.createReadStream(fixturePath)],
      };
      service.upload(formData);
      sinon.assert.calledOnce(stub);
      stub.restore();
    });

    it('should send files when it is Readable and(or) Buffer', () => {
      const stub = sinon.stub(service, 'request');
      const fixturePath1 = path.join(__dirname, 'fixtures/files/hello.txt');
      const fixturePath2 = path.join(__dirname, 'fixtures/files/buzzi.png');
      const formData = {
        attachments: [
          fs.createReadStream(fixturePath1),
          fs.createReadStream(fixturePath2),
        ],
        bufFile: Buffer.from('asfasfas'),
      };
      service.upload(formData);
      sinon.assert.calledOnce(stub);
      stub.restore();
    });

    it('should send file and return correct result when item Readable stream', async function () {
      this.timeout(6000);
      const fixturePath = path.join(__dirname, 'fixtures/files/hello.txt');
      const fsStream = fs.createReadStream(fixturePath);
      const result = await service.upload({ attachments: fsStream });
      expect(JSON.parse(result)).to.be.an('object')
        .that.haveOwnProperty('files');
    });

    it('should send file and return correct result when item Buffer', async function () {
      const readFile = Promise.promisify(fs.readFile);
      this.timeout(20000);
      const fixturePath = path.join(__dirname, 'fixtures/files/buzzi.png');
      const fileBuf = await readFile(fixturePath);
      await service.upload({
        custom_file: {
          value: fileBuf,
          options: {
            filename: 'buzzi.png',
            contentType: 'image/png',
          },
        },
      });
    });
  });
});
