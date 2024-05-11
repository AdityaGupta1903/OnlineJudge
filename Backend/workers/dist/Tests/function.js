"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tests = void 0;
function Tests(arr) {
    /// generate 10 tcs
    let cases = [];
    let t = 10;
    while (t-- > 0) {
        let list = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === 'Array') {
                list.push(generate('Array', 10));
            }
            else if (arr[i] === 'string') {
                list.push(generate('string', 10));
            }
            else if (arr[i] === 'number') {
                list.push(generate('number', 10));
            }
        }
        cases.push(list);
    }
    return cases;
}
exports.Tests = Tests;
function generate(type, length) {
    if (type === 'Array') {
        let list = [];
        for (let i = 0; i < length; i++) {
            list.push(Math.floor(Math.random() * 100));
        }
        return list;
    }
    else if (type === 'string') {
        function createRandomString(len) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let result = "";
            for (let i = 0; i < len; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
        return createRandomString(length);
    }
    else {
        return Math.floor(Math.random() * 100);
    }
}
