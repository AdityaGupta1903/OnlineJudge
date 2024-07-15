import { Request, Response, NextFunction } from 'express';
import  Jwt  from 'jsonwebtoken';
const Secret = "S3CRET"
function middleware(req:Request,res:Response,next:NextFunction){
    try{
        const headers = req.headers['authorization'];
        const token = headers.split(" ")[1];
        const resp = Jwt.verify(token,Secret);
        if(typeof(resp)!=='string'){
           next();
        }
        else{
            res.send("Token is Expired");
        }
    }
    catch(err){
         console.log("ERROR")
         res.send("Not Authorised")
    }   
}

export {middleware};