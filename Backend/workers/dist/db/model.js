"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemSchema = new mongoose_1.default.Schema({
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
const ProblemModel = mongoose_1.default.model('ProblemModel', ProblemSchema);
exports.default = ProblemModel;
