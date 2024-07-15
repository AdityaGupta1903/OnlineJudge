import express, { json } from "express";
import { createClient } from "redis";
import cors from "cors";
import mongoose from "mongoose";
import ProblemModel from "./db/model";
import UserModel from './db/userModel'
import { middleware } from "./middleware/middleware";
import Jwt from 'jsonwebtoken'


// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Redis clients
const client = createClient(
    {
    socket:{
      host : 'redis', /// for the Container of redis
      port : 6379
    }
  }
);

// Connect to Redis clients
client.connect().catch(err => {
  console.error("Connection failed with error", err);
});


// Connect to MongoDB
mongoose.connect("mongodb+srv://guptaditya19:aditya1452@cluster0.fju6wwd.mongodb.net/")
  .then(() => {
    console.log("DB Connected");
  })
  .catch(err => {
    console.log("Error in connecting to DB", err);
  });

// Define routes
app.get("/Run",middleware, async (req, res) => {
  const { Id, code, sign, args } = req.body;
  const IsAdmin = false;

  try {
    await client.lPush("Submission", JSON.stringify({ Id, code, IsAdmin, sign, args }));
    res.send("Problem received and stored");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error storing problem");
  }
});

app.post("/CreateProblem",middleware, async (req, res) => {
  const { args, code, Signature: sign, id: Id, Description } = req.body;
  const IsAdmin = true;

  try {
    await client.lPush("Submission", JSON.stringify({ args, code, sign, IsAdmin, Id, Description }));

    res.send("Problem received and stored");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error storing problem");
  }
});

app.post("/SubmitProblem",middleware, async (req, res) => {
  const { id: Id, args, code, Signature: sign } = req.body;
  const IsAdmin = false;
  const header = req.headers['authorization'];
  const token = header.split(" ")[1];
  try {
   console.log({ args, code, sign, IsAdmin, Id});
    await client.lPush("Submissions", JSON.stringify({ args, code, sign, IsAdmin, Id,token}));
    res.send("Problem submitted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting problem");
  }
});

// Additional routes
app.get("/GetAllProblems",middleware, async (req, res) => {
  try {
    const AllProblems = await ProblemModel.find({});
    res.json(AllProblems);
  } catch (err) {
    res.status(500).send("Error fetching data");
  }
});

app.get("/GetProblem/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Problem = await ProblemModel.findOne({ ID: id });
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
    } else {
      res.json({
        Description: "",
        Sign: "",
        args: "",
        SampleInput: "",
        SampleOutput: "",
        ID: "",
      });
    }
  } catch (err) {
    res.status(500).send("Error loading the data");
  }
});

app.get('/GetAllProblemStatus',middleware,async(req,res)=>{
  try{
    const header = req.headers['authorization'];
    const token = header.split(" ")[1];
    const UserDetails = Jwt.verify(token,"S3CRET");
    if(typeof(UserDetails)!=='string'){
      const Username = UserDetails.username;
      let UserProblemArray = await UserModel.findOne({ username: Username }); /// change Id to the User Id 
      if(UserProblemArray){
        res.status(200).send(JSON.stringify(UserProblemArray.ProblemVirdict));
      }
      else{
         res.status(200).send(JSON.stringify([]));
      }
    }
    else{
      res.send(400).send({message:"Error Fetching the data"})
    }
   
  }
  catch(err){
    console.log(err)
  }
  
})

app.post('/Signup',async(req,res)=>{
  try{
    const {username,password} = req.body;
  
   let chechIfUserAlreayExists = await UserModel.findOne({username:username});
   if(chechIfUserAlreayExists){
    res.status(200).send({message:'User Already There'})
   }
   else{
     const token = Jwt.sign({username : username,password:password},'S3CRET');

     if(token){
       let User = new UserModel({
        username : username,
        password : password,
        ProblemVirdict : []
       })
       User.save();   
       res.status(200).send({message:'SignUp Successfull',token : token})
     }
     else{
      res.send(200).send({message : 'Some Error Has Occured',token : null})
     }
   }
  }
  catch(err){
    console.log("RESET Password");
  }
  
})
app.post('/login',async(req,res)=>{
  try{
    const {username,password} = req.body;
    let chechIfUserAlreayExists = await UserModel.findOne({username:username,password : password});
    console.log(chechIfUserAlreayExists)
    if(chechIfUserAlreayExists){
      const token = Jwt.sign({username : username,password:password},'S3CRET');
      if(token){
        // localStorage.setItem('token',token);
        res.status(200).send({message:'login Successfull',token:token})
      }
      else{
       res.status(200).send({message : 'Some Error Has Occured',token : null})
      }
    }
    else{
      res.status(200).send({message:'Invalid Credentials',token : null})
    }
  }
  catch(err){
   console.log("RESET Login");
  }
  
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
