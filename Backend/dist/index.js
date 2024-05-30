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
const vm_1 = __importDefault(require("vm"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const model_1 = __importDefault(require("./db/model"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const clinet = (0, redis_1.createClient)();
clinet
    .connect()
    .then()
    .catch((err) => {
    console.error("connection Failed with err", err);
});
mongoose_1.default
    .connect("mongodb+srv://guptaditya19:aditya1452@cluster0.fju6wwd.mongodb.net/")
    .then(() => {
    console.log("DB Connected");
})
    .catch((err) => {
    console.log("Error in Connecting DBBBB");
});
app.get("/Run", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.body.Id;
    const code = req.body.code;
    const IsAdmin = false;
    const sign = req.body.sign;
    const args = req.body.args;
    try {
        yield clinet.lPush("Submission", JSON.stringify({ Id, code, IsAdmin, sign, args }));
        res.send("Problem Recieved and Stored");
    }
    catch (err) {
        console.error(err);
    }
}));
app.post("/CreateProblem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const args = req.body.args;
        const code = req.body.code;
        const sign = req.body.Signature;
        const Id = req.body.id;
        const IsAdmin = true;
        const Description = req.body.Description;
        yield clinet.lPush("Submission", JSON.stringify({ args, code, sign, IsAdmin, Id, Description }));
        res.send("Problem Recieved and Stored");
    }
    catch (err) {
        console.error(err);
    }
}));
app.post("/SubmitProblem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const Body = req.body.id;
        console.log(Body);
        const args = req.body.args;
        const code = req.body.code;
        const sign = req.body.Signature;
        const Id = req.body.id;
        const IsAdmin = false;
        console.log(JSON.stringify({ args, code, sign, IsAdmin, Id }));
        yield clinet.lPush("Submission", JSON.stringify({ args, code, sign, IsAdmin, Id }));
        res.send("Problem Submitted Successfully");
    }
    catch (err) {
        console.error(err);
    }
}));
app.post("/execute", (req, res) => {
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
                stack: error.stack,
            },
        });
    }
});
app.get("/GetAllProblems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AllProblems = yield model_1.default.find({});
        res.send(JSON.stringify(AllProblems));
    }
    catch (err) {
        res.send("Error in Fetching the Data");
    }
}));
app.get("/GetProblem/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const Problem = yield model_1.default.findOne({ ID: id });
        if (Problem !== null) {
            const SampleInput = JSON.parse(Problem.TestCase)[0];
            const SampleOutput = JSON.parse(Problem.TestCaseResults)[0];
            res.send({
                Description: Problem.Description,
                Sign: Problem.sign,
                args: Problem.args,
                SampleInput: SampleInput,
                SampleOutput: SampleOutput,
                ID: Problem.ID,
            });
        }
        else {
            res.send({
                Desription: "",
                Sign: "",
                args: "",
                SampleInput: "",
                SampleOutput: "",
                ID: "",
            });
        }
    }
    catch (err) {
        res.send("Error Loading The Data");
    }
}));
app.listen(3000, () => {
    console.log("Connectedddd sdksdvdv");
});
