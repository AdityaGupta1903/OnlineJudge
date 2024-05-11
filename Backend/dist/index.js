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
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const body_parser_1 = __importDefault(require("body-parser"));
const vm_1 = __importDefault(require("vm"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const clinet = (0, redis_1.createClient)();
clinet.connect().then().catch((err) => {
    console.error("connection Failed with err", err);
});
app.get('/Sumbit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("ADI");
    console.log(req.body);
    const problemId = req.body.problemId;
    const code = req.body.code;
    const language = req.body.language;
    try {
        yield clinet.lPush("Submission", JSON.stringify({ problemId, code, language }));
        res.send("Problem Recieved and Stored");
    }
    catch (err) {
        console.error(err);
    }
}));
app.post('/execute', (req, res) => {
    const { code } = req.body;
    console.log(code);
    const script = new vm_1.default.Script(`${code} addNumbers(x,y)`);
    const context = {
        x: 5,
        y: 10,
    };
    try {
        const result = script.runInNewContext(context);
        console.log(result);
        res.json({ result });
    }
    catch (error) {
        res.status(400).send({
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
});
app.listen(3000, () => {
    console.log("Connected");
});
