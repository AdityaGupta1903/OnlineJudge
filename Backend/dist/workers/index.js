"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const function_1 = require("./Tests/function");
const vm_1 = __importDefault(require("vm"));
const client = (0, redis_1.createClient)();
const ProcessSubmission = (SubmittedCode) => __awaiter(void 0, void 0, void 0, function* () {
    const { problemId, code, language } = JSON.parse(SubmittedCode);
    const TestCases = (0, function_1.Tests)(["number", "number"]);
    const script = new vm_1.default.Script(`${code} addNumbers(args1,args2)`);
    for (let i = 0; i < TestCases.length; i++) {
        let context = {};
        for (let j = 0; j < 2; j++) {
            context[`args${j + 1}`] = TestCases[i][j];
        }
        console.log("ADI");
        console.log(context);
        const result = script.runInNewContext(context);
        console.log(result);
    }
});
const StartWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        console.log("Worker connected to Redis.");
        while (true) {
            const SubmittedCode = yield client.brPop("Submission", 0);
            ProcessSubmission(SubmittedCode === null || SubmittedCode === void 0 ? void 0 : SubmittedCode.element);
        }
    }
    catch (err) {
        console.error(err);
    }
});
StartWorker();
