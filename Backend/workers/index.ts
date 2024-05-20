import { createClient } from "redis";
import { Tests } from "./Tests/function";
import vm, { Script } from "vm";
import axios from "axios";
import mongoose from "mongoose";
import ProblemModel from "./../db/model";
import { json } from "express";
const client = createClient();
const ResultMap = new Map();
const TestCaseMap = new Map();
mongoose
  .connect(
    "mongodb+srv://guptaditya19:aditya1452@cluster0.fju6wwd.mongodb.net/"
  )
  .then((resp) => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });
const ProcessSubmission = async (SubmittedCode: any) => {
  const Params = JSON.parse(SubmittedCode);
  if (Params.IsAdmin === true) {
    /// Process for Admin for Submitting the Question
    const { args, code, sign, IsAdmin, Id } = JSON.parse(SubmittedCode);
    const ArgumentArray = args.split(",");
    const TestCases = Tests(ArgumentArray);
    TestCaseMap.set(Id, TestCases);
    const ArgsLen = ArgumentArray.length;
    let ArgParam = "";
    for (let i = 0; i < ArgsLen; i++) {
      i === ArgsLen - 1
        ? (ArgParam += `args${i + 1}`)
        : (ArgParam += `args${i + 1},`);
    }
    const paramsstr = `(${ArgParam})`;
    try {
      const script = new vm.Script(`${code} ${sign}${paramsstr}`);
      const Result = [];
      for (let i = 0; i < TestCases.length; i++) {
        let context: any = {};
        for (let j = 0; j < ArgsLen; j++) {
          context[`args${j + 1}`] = TestCases[i][j];
        }
        const result = await ExecuteWithContexAndTimeout(
          `${code} ${sign}${paramsstr}`,
          context,
          2000
        );
        console.log(result);

        Result.push(result);
      }
      ResultMap.set(Id, Result);
    } catch (err) {
      console.log(err);
    }
  } else {
    /// Process for User to Process the code
    const { Id, code, IsAdmin, sign, args } = JSON.parse(SubmittedCode);
    const TestCases = TestCaseMap.get(Id);
    const ArgsLen = args.length;
    let ArgParam = "";
    for (let i = 0; i < ArgsLen; i++) {
      i === ArgsLen - 1
        ? (ArgParam += `args${i + 1}`)
        : (ArgParam += `args${i + 1},`);
    }
    const paramsstr = `(${ArgParam})`;
    try {
      const script = new vm.Script(`${code} ${sign}${paramsstr}`);
      const Result = [];
      for (let i = 0; i < TestCases.length; i++) {
        let context: any = {};
        for (let j = 0; j < ArgsLen; j++) {
          context[`args${j + 1}`] = TestCases[i][j];
        }
        const result = await ExecuteWithContexAndTimeout(
          `${code} ${sign}${paramsstr}`,
          context,
          2000
        );
        console.log(result);

        Result.push(result);
      }
      const Virdict = Verify(Result, ResultMap.get(Id), Id);
      if (Virdict.virdict === true) {
        console.log("Accepted");
      } else {
        console.log(
          "Failed On TestCase",
          Virdict?.FailedCase,
          `expected : ${Virdict.expected} Received : ${Virdict.Received}`
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
};
const GetRapidApiResponse = async (script: string) => {
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

    const response = await axios.request(options);
    const authToken = response?.data?.token;

    if (authToken) {
      // Making the second request to get the result
      const resultOptions = {
        method: "GET",
        url: `https://judge0-ce.p.rapidapi.com/submissions/${authToken}`,
        params: { fields: "*" },
        headers: {
          "X-RapidAPI-Key":
            "dd6755071cmsh62bb48f4db2347ep10a9c1jsn74f1922a4902",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      };

      const resultResponse = await axios.request(resultOptions);
      const result = resultResponse.data;
      if (Promise.resolve(result) === result) {
      } else {
        return result;
      }
    } else {
      throw new Error("Auth token not found");
    }
  } catch (error) {
    return {
      status: { id: 19 },
    };
  }
};
const GetResultbyStatusCode = (object: any) => {
  if (object?.status?.id == 3) {
    return { error: null, output: object?.stdout };
  } else if (object?.status?.id === 19) {
    return {
      error: "Submission Limit Reached For the Day Try Next Day",
      output: null,
    };
  } else {
    return { error: object?.stderr, output: null };
  }
};
const UseJudgeApi = async (SubmittedCode: any) => {
  const Params = JSON.parse(SubmittedCode);
  if (Params.IsAdmin === true) {
    /// Process for Admin for Submitting the Question
    const { args, code, sign, IsAdmin, Id , Description } = JSON.parse(SubmittedCode);
    const ArgumentArray = args.split(",");

    const TestCases = Tests(ArgumentArray);
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
        let context: string = "";
        for (let j = 0; j < ArgsLen; j++) {
          if (j != ArgsLen - 1) {
            if (typeof TestCases[i][j] === "object") {
              context += `[${TestCases[i][j]}]` + ",";
            } else if (typeof TestCases[i][j] === "string") {
              context += `"${TestCases[i][j]}"` + ",";
            } else {
              context += `${TestCases[i][j]}` + ",";
            }
          } else {
            if (typeof TestCases[i][j] === "object") {
              context += `[${TestCases[i][j]}]`;
            } else if (typeof TestCases[i][j] === "string") {
              context += `"${TestCases[i][j]}"`;
            } else {
              context += `${TestCases[i][j]}`;
            }
          }
        }

        const paramstr = `(${context})`;
        const log = `console.log(${sign}${paramstr})`;
        const script = `${code} ${log}`;
        const result = await GetRapidApiResponse(script);

        const ResultByStatusCode = GetResultbyStatusCode(result);
        console.log(ResultByStatusCode);
        if (ResultByStatusCode.error === null) {
          Result.push(ResultByStatusCode.output);
        } else {
          /// display Error to the User or Admin
          IsError = true;
        }
      }
      if (IsError === false) {
        ResultMap.set(Id, Result);

        if ((await ProblemModel.findOne({ ID: Id })) === null) {
          let Problem = new ProblemModel({
            ID: Id,
            args: args,
            TestCase: JSON.stringify(TestCases),
            sign: sign,
            code: code,
            Description : Description,
            TestCaseResults : JSON.stringify(Result)
          });
          Problem.save();
        } else {
          console.log("Problem Already Exists");
          console.log(await ProblemModel.findOne({ ID: Id }));
        }
      } else {
        console.log("There is Some Error in Your Code");
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    const { Id, code, IsAdmin, sign, args } = JSON.parse(SubmittedCode);

    const TestCasesFromDBQuery = await ProblemModel.findOne({ ID: Id });
    let TestCases = [];
    if (TestCasesFromDBQuery !== null) {
      TestCases = JSON.parse(TestCasesFromDBQuery.TestCase);
    }

    const ArgumentArray = args.split(",");
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
        let context: string = "";
        for (let j = 0; j < ArgsLen; j++) {
          if (j != ArgsLen - 1) {
            if (typeof TestCases[i][j] === "object") {
              context += `[${TestCases[i][j]}]` + ",";
            } else if (typeof TestCases[i][j] === "string") {
              context += `"${TestCases[i][j]}"` + ",";
            } else {
              context += `${TestCases[i][j]}` + ",";
            }
          } else {
            if (typeof TestCases[i][j] === "object") {
              context += `[${TestCases[i][j]}]`;
            } else if (typeof TestCases[i][j] === "string") {
              context += `"${TestCases[i][j]}"`;
            } else {
              context += `${TestCases[i][j]}`;
            }
          }
        }

        const paramstr = `(${context})`;
        const log = `console.log(${sign}${paramstr})`;
        const script = `${code} ${log}`;
        const result = await GetRapidApiResponse(script);

        const ResultByStatusCode = GetResultbyStatusCode(result);

        if (ResultByStatusCode.error === null) {
          Result.push(ResultByStatusCode.output);
        } else {
          /// display Error to the User or Admin
        }
      }
      const Problem = await ProblemModel.findOne({ID:Id});
      if(Problem!==null){
        const Virdict = Verify(Result, JSON.parse(Problem.TestCaseResults), Id);
        if (Virdict.virdict === true) {
          console.log("Accepted");
        } else {
          console.log(
            "Failed On TestCase",
            Virdict?.FailedCase,
            `expected : ${Virdict.expected} Received : ${Virdict.Received}`
          );
        }
      }
      
      // ResultMap.set(Id, Result);
    } catch (err) {
      console.log(err);
    }
  }
};
const Verify = (Array1: any, Array2: any, Id: number) => {
  for (let i = 0; i < Array1.length; i++) {
    if (Array1[i] !== Array2[i])
      return {
        virdict: false,
        FailedCase: i + 1,
        expected: Array2[i],
        Received: Array1[i],
        TestCase: TestCaseMap.get(Id)[i],
      };
  }
  return { virdict: true };
};
const StartWorker = async () => {
  try {
    await client.connect();
    console.log("Worker connected to Redis.");
    while (true) {
      const SubmittedCode = await client.brPop("Submission", 0);
      // ProcessSubmission(SubmittedCode?.element);
      UseJudgeApi(SubmittedCode?.element);
    }
  } catch (err) {
    console.error(err);
  }
};

StartWorker(); /// Starts Processing the Submission

const ExecuteWithContexAndTimeout = (
  code: string,
  Context: any,
  Timeout: number | undefined
) => {
  const Result = new Promise((resolve, reject) => {
    const script = new vm.Script(code);
    const sandbox = { ...Context };
    sandbox.console = console;
    try {
      const result = script.runInNewContext(sandbox);
      console.log(result);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });

  return Promise.race([Result]);
};
