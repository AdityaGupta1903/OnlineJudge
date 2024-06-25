import express, { json } from "express";
import { createClient } from "redis";
import vm from "vm";
import cors from "cors";
import mongoose from "mongoose";
import ProblemModel from "./db/model";
import http from 'http';
import { Server } from 'socket.io';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Redis clients
const client = createClient({socket:{
  host : "localhost",
  port : 6379
}
});
const ResultClient = createClient({socket:{
  host : "localhost",
  port : 6379
}
});

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server);

// Connect to Redis clients
client.connect().catch(err => {
  console.error("Connection failed with error", err);
});
ResultClient.connect().then(() => console.log("Connected to Result Client"));

// Connect to MongoDB
mongoose.connect("mongodb+srv://guptaditya19:aditya1452@cluster0.fju6wwd.mongodb.net/")
  .then(() => {
    console.log("DB Connected");
  })
  .catch(err => {
    console.log("Error in connecting to DB", err);
  });

// Define routes
app.get("/Run", async (req, res) => {
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

app.post("/CreateProblem", async (req, res) => {
  const { args, code, Signature: sign, id: Id, Description } = req.body;
  const IsAdmin = true;

  try {
    await client.lPush("Submission", JSON.stringify({ args, code, sign, IsAdmin, Id, Description }));
    console.log(JSON.stringify({ args, code, sign, IsAdmin, Id, Description }));
    res.send("Problem received and stored");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error storing problem");
  }
});

app.post("/SubmitProblem", async (req, res) => {
  const { id: Id, args, code, Signature: sign } = req.body;
  const IsAdmin = false;

  try {
    console.log(JSON.stringify({ args, code, sign, IsAdmin, Id }));
    await client.lPush("Submission", JSON.stringify({ args, code, sign, IsAdmin, Id }));
    res.send("Problem submitted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting problem");
  }
});

// Set up Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for results and emit to client
    const processSubmission = async()=>{
     try{
      let len = await ResultClient.LLEN('Result');
       while (len-- > 0) {
        const Result = await ResultClient.brPop('Result', 0);
        socket.emit('ResultConnection', JSON.stringify(Result));
      }
     }
     catch{

     }
    }
     setTimeout(()=>{
      processSubmission();
     },2000)
    
   
    
  
  socket.emit('message',"Hello Aditya");

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Additional routes
app.get("/GetAllProblems", async (req, res) => {
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

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
