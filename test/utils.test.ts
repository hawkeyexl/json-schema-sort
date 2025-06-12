import { expect } from 'chai';
import { isObject, hasCircularReference, sortObjectKeys, getObjectKeys } from '../src/utils';

describe('Utils', () => {
  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).to.be.true;
      expect(isObject({ a: 1 })).to.be.true;
    });

    it('should return false for non-objects', () => {
      expect(isObject(null)).to.be.false;
      expect(isObject(undefined)).to.be.false;
      expect(isObject([])).to.be.false;
      expect(isObject('string')).to.be.false;
      expect(isObject(123)).to.be.false;
    });
  });

  describe('hasCircularReference', () => {
    it('should detect circular references', () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      expect(hasCircularReference(obj)).to.be.true;
    });

    it('should return false for objects without circular references', () => {
      const obj = { a: 1, b: { c: 2 } };
      expect(hasCircularReference(obj)).to.be.false;
    });

    it('should return false for non-objects', () => {
      expect(hasCircularReference(null)).to.be.false;
      expect(hasCircularReference(123)).to.be.false;
      expect(hasCircularReference('string')).to.be.false;
    });
  });

  describe('sortObjectKeys', () => {
    it('should sort object keys according to specified order', () => {
      const obj = { c: 3, a: 1, b: 2 };
      const keyOrder = ['a', 'b', 'c'];
      const result = sortObjectKeys(obj, keyOrder);
      
      expect(Object.keys(result)).to.deep.equal(['a', 'b', 'c']);
      expect(result).to.deep.equal({ a: 1, b: 2, c: 3 });
    });

    it('should place additional keys at the end alphabetically', () => {
      const obj = { z: 26, a: 1, y: 25, b: 2 };
      const keyOrder = ['a', 'b'];
      const result = sortObjectKeys(obj, keyOrder);
      
      expect(Object.keys(result)).to.deep.equal(['a', 'b', 'y', 'z']);
    });
  });

  describe('getObjectKeys', () => {
    it('should return object keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(getObjectKeys(obj)).to.deep.equal(['a', 'b', 'c']);
    });

    it('should return empty array for null/undefined', () => {
      expect(getObjectKeys(null)).to.deep.equal([]);
      expect(getObjectKeys(undefined)).to.deep.equal([]);
    });
  });
});