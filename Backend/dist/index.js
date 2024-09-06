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
const middleware_1 = require("./middleware/middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const PrismaClient_1 = __importDefault(require("./db/PrismaClient"));
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
// Define routes
app.get("/Run", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.post("/CreateProblem", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.post("/SubmitProblem", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: Id, args, code, Signature: sign } = req.body;
    const IsAdmin = false;
    const header = req.headers['authorization'];
    const token = header.split(" ")[1];
    try {
        yield client.lPush("Submissions", JSON.stringify({ args, code, sign, IsAdmin, Id, token }));
        res.send("Problem submitted successfully");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error submitting problem");
    }
}));
// Additional routes
app.get("/GetAllProblems", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AllProblems = yield PrismaClient_1.default.problem.findMany({});
        res.json(AllProblems);
    }
    catch (err) {
        res.status(500).send("Error fetching data");
    }
}));
app.get("/GetProblem/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const Problem = yield PrismaClient_1.default.problem.findUnique({
            where: {
                pId: Number(id)
            }
        });
        if (Problem !== null) {
            const SampleInput = JSON.parse(Problem.TestCase)[0];
            const SampleOutput = JSON.parse(Problem.TestCaseResults)[0];
            res.json({
                Description: Problem.Description,
                Sign: Problem.sign,
                args: Problem.args,
                SampleInput: SampleInput,
                SampleOutput: SampleOutput,
                ID: Problem.pId,
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
app.get('/GetAllProblemStatus', middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const header = req.headers['authorization'];
        const token = header.split(" ")[1];
        const UserDetails = jsonwebtoken_1.default.verify(token, "S3CRET");
        if (typeof (UserDetails) !== 'string') {
            const Username = UserDetails.username;
            let UserProblemArray = yield PrismaClient_1.default.user.findUnique({
                where: {
                    username: Username
                },
                include: {
                    Submission: true
                }
            }); /// change Id to the User Id 
            if (UserProblemArray) {
                res.status(200).send(JSON.stringify(UserProblemArray.Submission));
            }
            else {
                res.status(200).send(JSON.stringify([]));
            }
        }
        else {
            res.send(400).send({ message: "Error Fetching the data" });
        }
    }
    catch (err) {
        console.log(err);
    }
}));
app.post('/Signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        let chechIfUserAlreayExists = yield PrismaClient_1.default.user.findUnique({
            where: {
                username: username
            }
        });
        if (chechIfUserAlreayExists) {
            res.status(200).send({ message: 'User Already There' });
        }
        else {
            let CreateUser = yield PrismaClient_1.default.user.create({
                data: {
                    username: username,
                    password: password,
                }
            });
            if (CreateUser) {
                const token = jsonwebtoken_1.default.sign({ username: username, password: password, id: CreateUser.id }, 'S3CRET');
                res.status(200).send({ message: 'SignUp Successfull', token: token });
            }
            else {
                res.send(200).send({ message: 'Some Error Has Occured', token: null });
            }
        }
    }
    catch (err) {
        console.log("RESET Password");
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        let chechIfUserAlreayExists = yield PrismaClient_1.default.user.findUnique({
            where: {
                username: username,
                password: password
            }
        });
        console.log(chechIfUserAlreayExists);
        if (chechIfUserAlreayExists) {
            const token = jsonwebtoken_1.default.sign({ username: username, password: password, id: chechIfUserAlreayExists.id }, 'S3CRET');
            if (token) {
                // localStorage.setItem('token',token);
                res.status(200).send({ message: 'login Successfull', token: token });
            }
            else {
                res.status(200).send({ message: 'Some Error Has Occured', token: null });
            }
        }
        else {
            res.status(200).send({ message: 'Invalid Credentials', token: null });
        }
    }
    catch (err) {
        console.log("RESET Login");
    }
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
