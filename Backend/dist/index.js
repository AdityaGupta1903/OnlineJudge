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
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const model_1 = __importDefault(require("./db/model"));
const userModel_1 = __importDefault(require("./db/userModel"));
// Initialize Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Initialize Redis clients
const client = (0, redis_1.createClient)(
//   {
//   socket:{
//     host : 'redis', /// for the Container of redis
//     port : 6379
//   }
// }
);
// Connect to Redis clients
client.connect().catch(err => {
    console.error("Connection failed with error", err);
});
// Connect to MongoDB
mongoose_1.default.connect("mongodb+srv://guptaditya19:aditya1452@cluster0.fju6wwd.mongodb.net/")
    .then(() => {
    console.log("DB Connected");
})
    .catch(err => {
    console.log("Error in connecting to DB", err);
});
// Define routes
app.get("/Run", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id, code, sign, args } = req.body;
    const IsAdmin = false;
    try {
        yield client.lPush("Submission", JSON.stringify({ Id, code, IsAdmin, sign, args }));
        res.send("Problem received and stored");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error storing problem");
    }
}));
app.post("/CreateProblem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { args, code, Signature: sign, id: Id, Description } = req.body;
    const IsAdmin = true;
    try {
        yield client.lPush("Submission", JSON.stringify({ args, code, sign, IsAdmin, Id, Description }));
        res.send("Problem received and stored");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error storing problem");
    }
}));
app.post("/SubmitProblem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: Id, args, code, Signature: sign } = req.body;
    const IsAdmin = false;
    try {
        console.log(JSON.stringify({ args, code, sign, IsAdmin, Id }));
        yield client.lPush("Submissions", JSON.stringify({ args, code, sign, IsAdmin, Id }));
        res.send("Problem submitted successfully");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error submitting problem");
    }
}));
// Additional routes
app.get("/GetAllProblems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AllProblems = yield model_1.default.find({});
        res.json(AllProblems);
    }
    catch (err) {
        res.status(500).send("Error fetching data");
    }
}));
app.get("/GetProblem/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const Problem = yield model_1.default.findOne({ ID: id });
        if (Problem !== null) {
            const SampleInput = JSON.parse(Problem.TestCase)[0];
            const SampleOutput = JSON.parse(Problem.TestCaseResults)[0];
            res.json({
                Description: Problem.Description,
                Sign: Problem.sign,
                args: Problem.args,
                SampleInput: SampleInput,
                SampleOutput: SampleOutput,
                ID: Problem.ID,
            });
        }
        else {
            res.json({
                Description: "",
                Sign: "",
                args: "",
                SampleInput: "",
                SampleOutput: "",
                ID: "",
            });
        }
    }
    catch (err) {
        res.status(500).send("Error loading the data");
    }
}));
app.get('/GetAllProblemStatus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let UserProblemArray = yield userModel_1.default.findOne({ Id: 1 }); /// change Id to the User Id 
        if (UserProblemArray) {
            res.status(200).send(JSON.stringify(UserProblemArray.ProblemVirdict));
        }
        else {
            res.status(200).send(JSON.stringify([]));
        }
    }
    catch (err) {
        console.log(err);
    }
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
