/* eslint global-require:0 */
'use strict';

const noop = () => {};

describe('ListenerManager', function () {

  const ListenerManager = require('../lib/consumer/listener-manager');

  describe('constructor', function () {

    it('requires new operator', function () {
      expect(() => ListenerManager()).to.throw(Error);
    });

    it('requires no arguments', function () {
      expect(new ListenerManager()).to.be.an.instanceof(ListenerManager);
    });

  });

  describe('add(name, callback)', function () {

    const manager = new ListenerManager();

    it('is a method', function () {
      expect(manager.add).to.be.a('function');
    });

    it('can register a callback for an event type', function () {
      expect(manager.add('event', () => {
      })).to.be.undefined;
    });

    it('can add a callback for many event types ', function () {
      expect(manager.add(['event', 'event2'], () => {})).to.be.undefined;
    });

    it('throws error if invalid arguments', function () {
      expect(() => manager.add('event')).to.throw(Error);
      expect(() => manager.add(3, () => {
      })).to.throw(Error);
      expect(() => manager.add(['event', 3], () => {
      })).to.throw(Error);
    });

  });

  describe('findAllMatchingHandlers({ event, version })', function () {

    const manager = new ListenerManager();
    const event = 'buzzi.ecommerce.test';
    const version = 'v1.0';

    it('throws error if no matching event', function () {
      expect(() => manager.findAllMatchingHandlers({ event, version })).to.throw(/No Event Handlers/);
    });

    it('returns only matches', function () {

      const matches = new Map([
        ['*', noop],
        ['*.*', noop],
        ['*.*.*', noop],
        ['buzzi.*', noop],
        ['*.test', noop],
        ['*.ecommerce.*', noop],
        ['buzzi.ecommerce.*', noop],
        ['*.ecommerce.test', noop],
        ['buzzi.*.test', noop],
        ['buzzi.ecommerce.test', noop],
        ['buzzi.ecommerce.test@v1', noop],
        ['buzzi.ecommerce.test@1', noop],
        ['buzzi.ecommerce.test@v1.0', noop],
        ['buzzi.ecommerce.test@1.0', noop],
        ['*@v1.0', noop],
        ['*.test@v1.0', noop],
        ['*.test@v1', noop],
        ['*.test@1.0', noop],
        ['*.test@1', noop],
        ['buzzi.*@v1.0', noop],
      ]);

      const nonMatches = new Map([
        ['company.*', noop],
        ['*.industry.*', noop],
        ['*.event', noop],
        ['*.*.event', noop],
        ['*@v2.0', noop],
        ['*@v2', noop],
        ['*@v1.1', noop],
        ['*.*.*@v1.1', noop],
        ['buzzi.ecommerce.test@v2.0', noop],
        ['buzzi.ecommerce.test@v2', noop],
        ['buzzi.ecommerce.test@v1.1', noop],
        ['buzzi.*@v1.1', noop],
        ['*.test@v1.1', noop],
        ['buzzi.industry.test', noop],
        ['buzzi.ecommerce.event', noop],
        ['company.ecommerce.test', noop],
        ['buzzi.*.event', noop],
      ]);

      matches.forEach((value, key) => manager.add(key, value));
      nonMatches.forEach((value, key) => manager.add(key, value));

      let found = manager.findAllMatchingHandlers({ event, version });

      matches.forEach((value, key) => {
        assert.include(found, value, `should find match for "${key}"`);
      });

      nonMatches.forEach((value, key) => {
        assert.notInclude(found, value, `should not find match for "${key}"`);
      });

    });
  });

});
