"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ProblemSchema = new mongoose_1.default.Schema({
    ID: {
        type: Number,
        required: true
    },
    TestCase: {
        type: String,
        required: true
    },
    args: {
        type: String,
        required: true
    },
    sign: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    TestCaseResults: {
        type: String,
        required: true
    }
});
var ProblemModel = mongoose_1.default.model('ProblemModel', ProblemSchema);
exports.default = ProblemModel;
