'use strict';

const Promise = require('bluebird');
const sinon = require('sinon');

describe ('Consumer', function () {

  const Service = require('../lib/service');
  const Consumer = require('../lib/consumer');

  describe ('constructor', function () {

    it ('requires new operator', function () {
      expect(() => Consumer(new Service())).to.throw(Error);
    });

    it ('requires a Service instance as an argument', function () {
      expect(new Consumer(new Service())).to.be.an.instanceof(Consumer);
      expect(() => new Consumer()).to.throw(Error);
      expect(() => new Consumer({ host: '', ip: '', secret: '', fetch: () => {}, remove: () => {} })).to.throw(Error);
    });

    it ('allows options to pass in "max" and "min" interval values', function () {
      expect(new Consumer(new Service(), { max: 100, min: 10 })).to.be.an.instanceof(Consumer);
    });

  });

  describe ('Timing Scenarios', function () {

    it ('#1', function () {

      let spies = {};
      let stubs = {};

      let service = new Service();
      let consumer = new Consumer(service, { max: 1000, min: 100 });

      spies.onError = sinon.spy();
      spies.onAnyEvent = sinon.spy();

      stubs.fetch = sinon.stub(service, 'fetch').callsFake(() => Promise.resolve(null));
      stubs.remove = sinon.stub(service, 'remove').callsFake(() => Promise.resolve(null));

      consumer.onerror(spies.onError);
      consumer.on('*', spies.onAnyEvent);

      this.timeout(10000);
      let delays = [100, 200, 300, 500, 800, 1300];

      let initialPromise = Promise
        .delay(150)
        .then(() => {
          assert(consumer.status === 'initial', 'not started yet');
          assert(spies.onError.notCalled, 'not started yet - hence no errors yet');
          assert(spies.onAnyEvent.notCalled, 'not started yet - hence no events yet');
          assert(stubs.fetch.notCalled, 'not started yet - hence fetch was not called');
        })
        .then(() => {
          consumer.start();
          assert(consumer.status === 'running', 'started the consumer - status is "running"');
          assert(stubs.fetch.notCalled, 'started, but fetch should not be called yet');
        })
        .delay(150);

      return delays
        .reduce((promise, delay, index) => {
          return promise
            .then(() => {
              let iteration = index + 1;
              assert(
                stubs.fetch.callCount === iteration,
                `called ${iteration} times with a delay of ${delay}ms`
              );
            })
            .delay(delay);
        }, initialPromise)
        .then(() => {
          expect(stubs.fetch.callCount).to.be.eql(delays.length + 1);
          consumer.stop();
          assert(consumer.status === 'stopped', 'stopped the consumer - status === "stopped"');
        });
    });

  });

});
