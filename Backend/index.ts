import express, { json } from "express";
import { createClient } from "redis";
import vm from "vm";
import cors from "cors";
import mongoose from "mongoose";
import ProblemModel from "./db/model";

const app = express();
app.use(express.json());
app.use(cors());

const clinet = createClient();


clinet
  .connect()
  .then()
  .catch((err) => {
    console.error("connection Failed with err", err);
  });

mongoose
  .connect(
    "mongodb+srv://guptaditya19:aditya1452@cluster0.fju6wwd.mongodb.net/"
  )
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("Error in Connecting DBBBB");
  });

app.get("/Run", async (req, res) => {
  const Id = req.body.Id;
  const code = req.body.code;
  const IsAdmin = false;
  const sign = req.body.sign;
  const args = req.body.args;

  try {
    await clinet.lPush(
      "Submission",
      JSON.stringify({ Id, code, IsAdmin, sign, args })
    );
    res.send("Problem Recieved and Stored");
  } catch (err) {
    console.error(err);
  }
});

app.post("/CreateProblem", async (req, res) => {
  try {
    const args = req.body.args;
    const code = req.body.code;
    const sign = req.body.Signature;
    const Id = req.body.id;
    const IsAdmin = true;
    const Description = req.body.Description;
    // await clinet.lPush(
    //   "Submission",
    //   JSON.stringify({ args, code, sign, IsAdmin, Id, Description })
    // );
    console.log(JSON.stringify({ args, code, sign, IsAdmin, Id, Description }))
    res.send("Problem Recieved and Stored");
  } catch (err) {
    console.error(err);
  }
});
app.post("/SubmitProblem", async (req, res) => {
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
    await clinet.lPush(
      "Submission",
      JSON.stringify({ args, code, sign, IsAdmin, Id })
    );
    res.send("Problem Submitted Successfully");
  } catch (err) {
    console.error(err);
  }
});
// app.post("/execute", (req, res) => {
//   const { code } = req.body;
//   console.log(code);

//   const script = new vm.Script(`${code} addNumbers(x,y)`);

//   const context = {
//     x: 5,
//     y: 10,
//   };

//   try {
//     const result = script.runInNewContext(context);
//     console.log(result);
//     res.json({ result });
//   } catch (error: any) {
//     res.status(400).send({
//       error: {
//         message: error.message,
//         stack: error.stack,
//       },
//     });
//   }
// });

app.get("/GetAllProblems", async (req, res) => {
  try {
    const AllProblems = await ProblemModel.find({});
    res.send(JSON.stringify(AllProblems));
  } catch (err) {
    res.send("Error in Fetching the Data");
  }
});
app.get("/GetProblem/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const Problem = await ProblemModel.findOne({ ID: id });
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
    } else {
      res.send({
        Desription: "",
        Sign: "",
        args: "",
        SampleInput: "",
        SampleOutput: "",
        ID: "",
      });
    }
  } catch (err) {
    res.send("Error Loading The Data");
  }
});


app.listen(3000, () => {
  console.log("Connectedddd sdksdvvsvavdvs");
});
