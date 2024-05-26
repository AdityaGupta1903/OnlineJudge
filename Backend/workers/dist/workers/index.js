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
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const model_1 = __importDefault(require("./../db/model"));
const client = (0, redis_1.createClient)();
const ResultMap = new Map();
const TestCaseMap = new Map();
mongoose_1.default
    .connect("mongodb+srv://guptaditya19:aditya1452@cluster0.fju6wwd.mongodb.net/")
    .then((resp) => {
    console.log("DB Connected");
})
    .catch((err) => {
    console.log(err);
});
const GetRapidApiResponse = (script) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const options = {
            method: "POST",
            url: "https://judge0-ce.p.rapidapi.com/submissions",
            params: { fields: "*" },
            headers: {
                "content-type": "application/json",
                "Content-Type": "application/json",
                "X-RapidAPI-Key": "dd6755071cmsh62bb48f4db2347ep10a9c1jsn74f1922a4902",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
            data: {
                language_id: 63,
                source_code: `${script}`,
            },
        };
        // Making the first request to get the token
        const response = yield axios_1.default.request(options);
        const authToken = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.token;
        if (authToken) {
            // Making the second request to get the result
            const resultOptions = {
                method: "GET",
                url: `https://judge0-ce.p.rapidapi.com/submissions/${authToken}`,
                params: { fields: "*" },
                headers: {
                    "X-RapidAPI-Key": "dd6755071cmsh62bb48f4db2347ep10a9c1jsn74f1922a4902",
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                },
            };
            const resultResponse = yield axios_1.default.request(resultOptions);
            const result = resultResponse.data;
            if (Promise.resolve(result) === result) {
            }
            else {
                return result;
            }
        }
        else {
            throw new Error("Auth token not found");
        }
    }
    catch (error) {
        return {
            status: { id: 19 },
        };
    }
});
const GetResultbyStatusCode = (object) => {
    var _a, _b;
    if (((_a = object === null || object === void 0 ? void 0 : object.status) === null || _a === void 0 ? void 0 : _a.id) == 3) {
        return { error: null, output: object === null || object === void 0 ? void 0 : object.stdout };
    }
    else if (((_b = object === null || object === void 0 ? void 0 : object.status) === null || _b === void 0 ? void 0 : _b.id) === 19) {
        return {
            error: "Submission Limit Reached For the Day Try Next Day",
            output: null,
        };
    }
    else {
        return { error: object === null || object === void 0 ? void 0 : object.stderr, output: null };
    }
};
const UseJudgeApi = (SubmittedCode) => __awaiter(void 0, void 0, void 0, function* () {
    const Params = JSON.parse(SubmittedCode);
    if (Params.IsAdmin === true) {
        /// Process for Admin for Submitting the Question
        const { args, code, sign, IsAdmin, Id, Description } = JSON.parse(SubmittedCode);
        const ArgumentArray = args.split(",");
        const TestCases = (0, function_1.Tests)(ArgumentArray);
        TestCaseMap.set(Id, TestCases);
        const ArgsLen = ArgumentArray.length;
        let ArgParam = "";
        for (let i = 0; i < ArgsLen; i++) {
            i === ArgsLen - 1
                ? (ArgParam += `args${i + 1}`)
                : (ArgParam += `args${i + 1},`);
        }
        try {
            const Result = [];
            let IsError = false;
            for (let i = 0; i < TestCases.length; i++) {
                let context = "";
                for (let j = 0; j < ArgsLen; j++) {
                    if (j != ArgsLen - 1) {
                        if (typeof TestCases[i][j] === "object") {
                            context += `[${TestCases[i][j]}]` + ",";
                        }
                        else if (typeof TestCases[i][j] === "string") {
                            context += `"${TestCases[i][j]}"` + ",";
                        }
                        else {
                            context += `${TestCases[i][j]}` + ",";
                        }
                    }
                    else {
                        if (typeof TestCases[i][j] === "object") {
                            context += `[${TestCases[i][j]}]`;
                        }
                        else if (typeof TestCases[i][j] === "string") {
                            context += `"${TestCases[i][j]}"`;
                        }
                        else {
                            context += `${TestCases[i][j]}`;
                        }
                    }
                }
                const paramstr = `(${context})`;
                const log = `console.log(${sign}${paramstr})`;
                const script = `${code} ${log}`;
                const result = yield GetRapidApiResponse(script);
                const ResultByStatusCode = GetResultbyStatusCode(result);
                console.log(ResultByStatusCode);
                if (ResultByStatusCode.error === null) {
                    Result.push(ResultByStatusCode.output);
                }
                else {
                    /// display Error to the User or Admin
                    IsError = true;
                }
            }
            if (IsError === false) {
                ResultMap.set(Id, Result);
                if ((yield model_1.default.findOne({ ID: Id })) === null) {
                    let Problem = new model_1.default({
                        ID: Id,
                        args: args,
                        TestCase: JSON.stringify(TestCases),
                        sign: sign,
                        code: code,
                        Description: Description,
                        TestCaseResults: JSON.stringify(Result)
                    });
                    Problem.save();
                }
                else {
                    console.log("Problem Already Exists");
                    console.log(yield model_1.default.findOne({ ID: Id }));
                }
            }
            else {
                console.log("There is Some Error in Your Code");
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        const { args, code, sign, IsAdmin, Id } = JSON.parse(SubmittedCode);
        const TestCasesFromDBQuery = yield model_1.default.findOne({ ID: Id });
        let TestCases = [];
        if (TestCasesFromDBQuery !== null) {
            TestCases = JSON.parse(TestCasesFromDBQuery.TestCase);
        }
        console.log(TestCases);
        const ArgumentArray = [args];
        const ArgsLen = ArgumentArray.length;
        let ArgParam = "";
        for (let i = 0; i < ArgsLen; i++) {
            i === ArgsLen - 1
                ? (ArgParam += `args${i + 1}`)
                : (ArgParam += `args${i + 1},`);
        }
        try {
            // const script = new vm.Script(`${code} ${sign}${paramsstr}`);
            const Result = [];
            for (let i = 0; i < TestCases.length; i++) {
                let context = "";
                for (let j = 0; j < ArgsLen; j++) {
                    if (j != ArgsLen - 1) {
                        if (typeof TestCases[i][j] === "object") {
                            context += `[${TestCases[i][j]}]` + ",";
                        }
                        else if (typeof TestCases[i][j] === "string") {
                            context += `"${TestCases[i][j]}"` + ",";
                        }
                        else {
                            context += `${TestCases[i][j]}` + ",";
                        }
                    }
                    else {
                        if (typeof TestCases[i][j] === "object") {
                            context += `[${TestCases[i][j]}]`;
                        }
                        else if (typeof TestCases[i][j] === "string") {
                            context += `"${TestCases[i][j]}"`;
                        }
                        else {
                            context += `${TestCases[i][j]}`;
                        }
                    }
                }
                const paramstr = `(${context})`;
                const log = `console.log(${sign}${paramstr})`;
                const script = `${code} ${log}`;
                const result = yield GetRapidApiResponse(script);
                const ResultByStatusCode = GetResultbyStatusCode(result);
                console.log(ResultByStatusCode);
                if (ResultByStatusCode.error === null) {
                    Result.push(ResultByStatusCode.output);
                }
                else {
                    /// display Error to the User or Admin
                }
            }
            const Problem = yield model_1.default.findOne({ ID: Id });
            if (Problem !== null) {
                const Virdict = Verify(Result, JSON.parse(Problem.TestCaseResults), Id, TestCases);
                if (Virdict.virdict === true) {
                    console.log("Accepted");
                }
                else {
                    console.log("Failed On TestCase", Virdict === null || Virdict === void 0 ? void 0 : Virdict.FailedCase, `expected : ${Virdict.expected} Received : ${Virdict.Received}`);
                }
            }
            // ResultMap.set(Id, Result);
        }
        catch (err) {
            console.log(err);
        }
    }
});
const Verify = (Array1, Array2, Id, TestCase) => {
    for (let i = 0; i < Array1.length; i++) {
        if (Array1[i] !== Array2[i])
            return {
                virdict: false,
                FailedCase: i + 1,
                expected: Array2[i],
                Received: Array1[i],
                TestCase: TestCase[i]
            };
    }
    return { virdict: true };
};
const StartWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        console.log("Worker connected to Redis.");
        while (true) {
            const SubmittedCode = yield client.brPop("Submission", 0);
            // ProcessSubmission(SubmittedCode?.element);
            UseJudgeApi(SubmittedCode === null || SubmittedCode === void 0 ? void 0 : SubmittedCode.element);
        }
    }
    catch (err) {
        console.error(err);
    }
});
StartWorker(); /// Starts Processing the Submission
