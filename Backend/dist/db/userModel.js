"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemStatusSchema = new mongoose_1.default.Schema({
    ProblemId: {
        type: Number,
        required: true
    },
    Virdict: {
        type: String,
        required: true,
        default: 'UnAttempted'
    }
});
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    ProblemVirdict: {
        type: [ProblemStatusSchema] //// Need to Add User Authentication Also
    }
});
const UserModel = mongoose_1.default.model('UserModel', UserSchema);
exports.default = UserModel;
