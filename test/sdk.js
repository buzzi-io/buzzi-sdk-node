/* eslint global-require:0 */
'use strict';

describe('SDK', function () {

  const SDK = require('../');
  const Service = require('../lib/service');
  const Consumer = require('../lib/consumer');
  const Events = require('../lib/events');
  const Delivery = require('../lib/delivery');

  it('Service', function () {
    expect(SDK.Service).to.be.equal(Service);
  });

  it('Consumer', function () {
    expect(SDK.Consumer).to.be.equal(Consumer);
  });

  it('Events', function () {
    expect(SDK.Events).to.be.equal(Events);
  });

  it('Delivery', function () {
    expect(SDK.Delivery).to.be.equal(Delivery);
  });

});
