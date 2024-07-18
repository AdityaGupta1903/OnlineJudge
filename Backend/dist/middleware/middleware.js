"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Secret = "S3CRET";
function middleware(req, res, next) {
    try {
        const headers = req.headers['authorization'];
        const token = headers.split(" ")[1];
        const resp = jsonwebtoken_1.default.verify(token, Secret);
        if (typeof (resp) !== 'string') {
            next();
        }
        else {
            res.send("Token is Expired");
        }
    }
    catch (err) {
        console.log("ERROR");
        res.send("Not Authorised");
    }
}
exports.middleware = middleware;
