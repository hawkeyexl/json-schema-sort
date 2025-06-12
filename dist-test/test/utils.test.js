"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("../src/utils");
describe('Utils', () => {
    describe('isObject', () => {
        it('should return true for plain objects', () => {
            (0, chai_1.expect)((0, utils_1.isObject)({})).to.be.true;
            (0, chai_1.expect)((0, utils_1.isObject)({ a: 1 })).to.be.true;
        });
        it('should return false for non-objects', () => {
            (0, chai_1.expect)((0, utils_1.isObject)(null)).to.be.false;
            (0, chai_1.expect)((0, utils_1.isObject)(undefined)).to.be.false;
            (0, chai_1.expect)((0, utils_1.isObject)([])).to.be.false;
            (0, chai_1.expect)((0, utils_1.isObject)('string')).to.be.false;
            (0, chai_1.expect)((0, utils_1.isObject)(123)).to.be.false;
        });
    });
    describe('hasCircularReference', () => {
        it('should detect circular references', () => {
            const obj = { a: 1 };
            obj.self = obj;
            (0, chai_1.expect)((0, utils_1.hasCircularReference)(obj)).to.be.true;
        });
        it('should return false for objects without circular references', () => {
            const obj = { a: 1, b: { c: 2 } };
            (0, chai_1.expect)((0, utils_1.hasCircularReference)(obj)).to.be.false;
        });
        it('should return false for non-objects', () => {
            (0, chai_1.expect)((0, utils_1.hasCircularReference)(null)).to.be.false;
            (0, chai_1.expect)((0, utils_1.hasCircularReference)(123)).to.be.false;
            (0, chai_1.expect)((0, utils_1.hasCircularReference)('string')).to.be.false;
        });
    });
    describe('sortObjectKeys', () => {
        it('should sort object keys according to specified order', () => {
            const obj = { c: 3, a: 1, b: 2 };
            const keyOrder = ['a', 'b', 'c'];
            const result = (0, utils_1.sortObjectKeys)(obj, keyOrder);
            (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['a', 'b', 'c']);
            (0, chai_1.expect)(result).to.deep.equal({ a: 1, b: 2, c: 3 });
        });
        it('should place additional keys at the end alphabetically', () => {
            const obj = { z: 26, a: 1, y: 25, b: 2 };
            const keyOrder = ['a', 'b'];
            const result = (0, utils_1.sortObjectKeys)(obj, keyOrder);
            (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['a', 'b', 'y', 'z']);
        });
    });
    describe('getObjectKeys', () => {
        it('should return object keys', () => {
            const obj = { a: 1, b: 2, c: 3 };
            (0, chai_1.expect)((0, utils_1.getObjectKeys)(obj)).to.deep.equal(['a', 'b', 'c']);
        });
        it('should return empty array for null/undefined', () => {
            (0, chai_1.expect)((0, utils_1.getObjectKeys)(null)).to.deep.equal([]);
            (0, chai_1.expect)((0, utils_1.getObjectKeys)(undefined)).to.deep.equal([]);
        });
    });
});
//# sourceMappingURL=utils.test.js.map