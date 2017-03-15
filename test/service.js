'use strict';

describe('Service', function () {

  const SDK = require('../');
  const service = new SDK.Service();

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

});
