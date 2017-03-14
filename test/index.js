'use strict';

describe('Service', function () {

  const SDK = require('../');

  it ('isAuthorized', function () {
    let service = new SDK.Service();
    return service.isAuthorized()
      .then(isAuthd => {
        if (isAuthd !== true) {
          throw new Error('Unauthorized');
        }
      });
  });

});
