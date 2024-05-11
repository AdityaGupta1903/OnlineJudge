import { createClient } from "redis";
import { Tests } from "./Tests/function";
import vm, { Script } from "vm";
const client = createClient();
const ResultMap = new Map();
const TestCaseMap = new Map();
const ProcessSubmission = async (SubmittedCode: any) => {
  const Params = JSON.parse(SubmittedCode);
  if (Params.IsAdmin === true) {
    /// Process for Admin for Submitting the Question
    const { args, code, sign, IsAdmin, Id } = JSON.parse(SubmittedCode);

    const TestCases = Tests(args);
    TestCaseMap.set(Id, TestCases);
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
      ProcessSubmission(SubmittedCode?.element);
    }
  } catch (err) {
    console.error(err);
  }
};

StartWorker();

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
      console.log(result)
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
  
  return Promise.race([Result]);
};
