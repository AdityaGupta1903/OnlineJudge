"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tests = void 0;
function Tests(arr) {
    /// generate 10 tcs
    var cases = [];
    var t = 3;
    while (t-- > 0) {
        var list = [];
        for (var i = 0; i < arr.length; i++) {
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
        var list = [];
        for (var i = 0; i < length; i++) {
            list.push(Math.floor(Math.random() * 100));
        }
        return list;
    }
    else if (type === 'string') {
        function createRandomString(len) {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var result = "";
            for (var i = 0; i < len; i++) {
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
