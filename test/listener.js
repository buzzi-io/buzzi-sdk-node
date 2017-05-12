'use strict';
const noop = () => {};
describe('Listener', function () {

  const Listener = require('../lib/consumer/listener');

  describe('constructor', function () {

    it('requires new operator', function () {
      expect(() => Listener('', () => {}))
        .to.throw(Error);
    });

    it('throws if 1st arg not a string', function () {
      expect(() => new Listener()).to.throw(Error);
    });

    it('throws if 2nd arg not a function', function () {
      expect(() => new Listener('')).to.throw(Error);
    });

    it('valid arguments results in a Listener', function () {
      expect(new Listener('', () => {}))
        .to.be.an.instanceof(Listener);
    });

  });

  describe('schema', function () {

    const listener = new Listener(' ', noop);

    it('has static parseVersion method', function () {
      expect(Listener.parseVersion).to.be.a('function');
    });

    it('has isMatchingEvent method', function () {
      expect(listener.isMatchingEvent).to.be.a('function');
    });

    it('has isMatchingVersion method', function () {
      expect(listener.isMatchingVersion).to.be.a('function');
    });

    it('"original" property is string passed in to constructor', function () {
      const event = 'buzzi.ecommerce.test';
      const listener = new Listener(event, () => {
      });
      expect(listener.original).to.be.equal(event);
    });

    it('"handler" property is callback passed in to constructor', function () {
      const callback = function callback() {
      };
      const listener = new Listener('', callback);
      expect(listener.handler).to.be.equal(callback);
    });

  });

  describe('parse version', function () {

    it('empty version', function () {
      let result = Listener.parseVersion('');
      expect(result).to.be.eql({ version: '', major: '', minor: '' });
    });

    it('major version', function () {
      expect(Listener.parseVersion('120')).to.be.eql({
        version: '120',
        major: '120',
        minor: undefined,
      });
    });

    it('major and minor version', function () {
      expect(Listener.parseVersion('120.230')).to.be.eql({
        version: '120.230',
        major: '120',
        minor: '230',
      });
    });

    it('with "v" prefix', function () {
      expect(Listener.parseVersion('v120.230')).to.be.eql({
        version: '120.230',
        major: '120',
        minor: '230',
      });
    });

  });

  describe('matching events', function () {

    it('"*" matches everything', function () {
      const listener = new Listener('*', () => {
      });
      assert.isTrue(listener.isMatchingEvent('buzzi.ecommerce.test'));
      assert.isTrue(listener.isMatchingEvent('company.industry.event'));
      assert.isTrue(listener.isMatchingEvent('company.industry'));
      assert.isTrue(listener.isMatchingEvent('industry.event'));
      assert.isTrue(listener.isMatchingEvent('company'));
      assert.isTrue(listener.isMatchingEvent('event'));
      assert.isTrue(listener.isMatchingEvent(''));
    });

    it('"*.*.*" matches everything with all three parts', function () {
      const listener = new Listener('*.*.*', () => {
      });
      assert.isTrue(listener.isMatchingEvent('buzzi.ecommerce.test'));
      assert.isTrue(listener.isMatchingEvent('company.industry.event'));
      assert.isFalse(listener.isMatchingEvent('industry.event'));
      assert.isFalse(listener.isMatchingEvent('event'));
      assert.isFalse(listener.isMatchingEvent('company-industry-event'));
      assert.isFalse(listener.isMatchingEvent('companyindustryevent'));
      assert.isFalse(listener.isMatchingEvent('company industry event'));
    });

    it('"buzzi.*" matches', function () {
      const listener = new Listener('buzzi.*', () => {
      });
      assert.isTrue(listener.isMatchingEvent('buzzi.ecommerce.test'));
      assert.isTrue(listener.isMatchingEvent('buzzi.industry.event'));
      assert.isTrue(listener.isMatchingEvent('buzzi.industry'));
      assert.isTrue(listener.isMatchingEvent('buzzi.event'));
      assert.isFalse(listener.isMatchingEvent('buzzi'));
      assert.isFalse(listener.isMatchingEvent('company.industry.event'));
    });

    it('"*.test" matches', function () {
      const listener = new Listener('*.test', () => {
      });
      assert.isTrue(listener.isMatchingEvent('buzzi.ecommerce.test'));
      assert.isTrue(listener.isMatchingEvent('company.industry.test'));
      assert.isTrue(listener.isMatchingEvent('company.test'));
      assert.isTrue(listener.isMatchingEvent('industry.test'));
      assert.isFalse(listener.isMatchingEvent('test'));
      assert.isFalse(listener.isMatchingEvent('company.industry.event'));
    });

    it('"*.ecommerce.*" matches', function () {
      const listener = new Listener('*.ecommerce.*', () => {
      });
      assert.isTrue(listener.isMatchingEvent('buzzi.ecommerce.test'));
      assert.isTrue(listener.isMatchingEvent('company.ecommerce.test'));
      assert.isFalse(listener.isMatchingEvent('company.ecommerce'));
      assert.isFalse(listener.isMatchingEvent('ecommerce.test'));
      assert.isFalse(listener.isMatchingEvent('ecommerce'));
      assert.isFalse(listener.isMatchingEvent('company.industry.event'));
    });

  });

  describe('matching version', function () {

    it('"" matches everything', function () {
      const listener = new Listener('buzzi.ecommerce.test', () => {
      });
      assert.isTrue(listener.isMatchingVersion('v12.10'));
      assert.isTrue(listener.isMatchingVersion('12.10'));
      assert.isTrue(listener.isMatchingVersion('v12'));
      assert.isTrue(listener.isMatchingVersion('12'));
      assert.isTrue(listener.isMatchingVersion(''));
    });

    it('"v12" matches', function () {
      const listener = new Listener('buzzi.ecommerce.test@v12', () => {
      });
      assert.isTrue(listener.isMatchingVersion('v12.10'));
      assert.isTrue(listener.isMatchingVersion('12.10'));
      assert.isTrue(listener.isMatchingVersion('v12'));
      assert.isTrue(listener.isMatchingVersion('12'));
      assert.isFalse(listener.isMatchingVersion(''));
    });

    it('"v12.10" matches', function () {
      const listener = new Listener('buzzi.ecommerce.test@v12.10', () => {
      });
      assert.isTrue(listener.isMatchingVersion('v12.10'));
      assert.isTrue(listener.isMatchingVersion('12.10'));
      assert.isFalse(listener.isMatchingVersion('v12'));
      assert.isFalse(listener.isMatchingVersion('12'));
      assert.isFalse(listener.isMatchingVersion(''));
    });

    it('"12" matches', function () {
      const listener = new Listener('buzzi.ecommerce.test@12', () => {
      });
      assert.isTrue(listener.isMatchingVersion('v12.10'));
      assert.isTrue(listener.isMatchingVersion('12.10'));
      assert.isTrue(listener.isMatchingVersion('v12'));
      assert.isTrue(listener.isMatchingVersion('12'));
      assert.isFalse(listener.isMatchingVersion(''));
    });

    it('"12.10" matches', function () {
      const listener = new Listener('buzzi.ecommerce.test@12.10', () => {
      });
      assert.isTrue(listener.isMatchingVersion('v12.10'));
      assert.isTrue(listener.isMatchingVersion('12.10'));
      assert.isFalse(listener.isMatchingVersion('v12'));
      assert.isFalse(listener.isMatchingVersion('12'));
      assert.isFalse(listener.isMatchingVersion(''));
    });
  });

});
