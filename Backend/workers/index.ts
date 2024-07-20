import { createClient } from "redis";
import { Tests } from "./Tests/function";
import axios from "axios";
import {IResult} from '../model/IResult'
import  Jwt  from "jsonwebtoken";
import prisma from './../db/PrismaClient'

export const client = createClient(
//   {
//   socket:{
//     host : 'redis',
//     port : 6379
//   }
// }
);

const ResultMap = new Map();
const TestCaseMap = new Map();
  
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
    console.log(authToken);
    if (authToken) {
     
     const delay = new Promise((resolve,reject)=>{    /// delay for 3 seconds to process the remote machine
      setTimeout(()=>{
        async function process(){
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
              console.log("First Block")
              console.log(result);
          } else {
            console.log("Second Block")
            console.log(result);
            resolve(result);
          }
        }
        process();
      },3000)
     })
     console.log(await delay);
     return await delay;
      
    } else {
      console.log("Auth Token not found")
      throw new Error("Auth token not found");
    }
  } catch (error) {
    return {
      status: { id: 19 },
    };
  }
};
const PushResultToDatabase = async (ResultObject:IResult)=>{
   const token = ResultObject.token;
    try {
        const UserDetails = Jwt.verify(token,"S3CRET");
        if(typeof(UserDetails)!=='string'){
          const UserId = UserDetails.id
          let IsPreSubmitted = await prisma.submission.findFirst({
            where :{
              UserId : UserId,  /// change to the Actual UserId 
              problemId : ResultObject.ID /// change to the Actual ProblemId
            }
          })
          if (IsPreSubmitted !== null) {
            await prisma.submission.update({
              where : {
                subId : IsPreSubmitted.subId
              },
              data:{
                status : ResultObject?.message
              }
            })
          }
          else {
             await prisma.submission.create({
                data : {
                  UserId : UserId,
                  problemId : ResultObject.ID,
                  status : ResultObject?.message
                }
             })
          }
        }
        else{
          console.log("ERROR FETCHING TOKEN")
        }
       
    }
    catch (err) {
      console.log(err)
    }
  }
  
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
export const UseJudgeApi = async (SubmittedCode: any) => {
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
        
        if (ResultByStatusCode.error === null) {
          Result.push(ResultByStatusCode.output);
        } else {
          /// display Error to the User or Admin
          IsError = true;
        }
      }
      if (IsError === false) {
        ResultMap.set(Id, Result);

        if ((await prisma.problem.findUnique({where : {pId : Number(Id)}}) === null)) {
          
          let newProblem = await prisma.problem.create({
             data : {
              pId : Number(Id),
              args : args,
              TestCase : JSON.stringify(TestCases),
              sign : sign,
              code : code,
              Description : Description,
              TestCaseResults : JSON.stringify(Result)
             }
          })
        } else {
          console.log("Problem Already Exists");
          console.log(await prisma.problem.findUnique({where : {pId : Number(Id)}}));
        }
      } else {
        console.log("There is Some Error in Your Code");
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    const { args, code, sign, IsAdmin, Id,token } = JSON.parse(SubmittedCode);
 
    const TestCasesFromDBQuery = await prisma.problem.findUnique({where : {pId : Number(Id)}});
    let TestCases = [];
    if (TestCasesFromDBQuery !== null) {
      TestCases = JSON.parse(TestCasesFromDBQuery.TestCase);
    }
  
      
    const ArgumentArray = [args]
    const ArgsLen = ArgumentArray.length;
    let ArgParam = "";
    for (let i = 0; i < ArgsLen; i++) {
      i === ArgsLen - 1
        ? (ArgParam += `args${i + 1}`)
        : (ArgParam += `args${i + 1},`);
    }
    try {
      
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
          /// display Error to the User or Admin And Handle the case of Submission limit Reached for the day
          //// For now Assume the 
          console.log(ResultByStatusCode.error);
          Result.push(-1);
        }
      }
      const Problem = await prisma.problem.findUnique({
        where :{
          pId : Number(Id)
        }
      })
      // console.log("Problem"+" "+Problem)
      if(Problem!==null){
        const Virdict = Verify(Result, JSON.parse(Problem.TestCaseResults), Id,TestCases);
        console.log(Virdict)
        if (Virdict.virdict === true) {
          PushResultToDatabase({message:"Accepted",ID:Id,token:token});   /// Show the Accepted Virdict to the User 
        } else if(Virdict.virdict === false) {
          // console.log(
          //   "Failed On TestCase",
          //   Virdict?.FailedCase,
          //   `expected : ${Virdict.expected} Received : ${Virdict.Received}`
          // );
           
           PushResultToDatabase({message:"Wrong Answer",ID:Id,token:token});  /// Also show the failed test to the User
        }
        else{
          console.log("Reached");
          PushResultToDatabase({message:"Submission Limit Exceed for the Day ",ID:Id,token:token}); 
        }
      }
    } catch (err) {
      return {message:"Rejected"};
    }
  }
};
const Verify = (Array1: any, Array2: any, Id: number,TestCase:any) => {  //// Verify the Tests 
  for (let i = 0; i < Array1.length; i++) {
    console.log(Array1[i]+" "+Array2[i]);
    if(Array1[i] === -1){
      return {virdit : "Submission Limit Reached"}
    }
   else if (Array1[i] !== Array2[i])
      return {
        virdict: false,
        FailedCase: i + 1,
        expected: Array2[i],
        Received: Array1[i],
        TestCase: TestCase[i]
      };
    
 
}

return {virdict : true}

};
const StartWorker = async () => {   //// Pops the Submission from the Queue and Starts the Process
  try {
    await client.connect();
    console.log("Worker connected to Redis.");
    while (true) {
      const SubmittedCode = await client.brPop("Submissions", 0); 
      console.log(SubmittedCode);
      UseJudgeApi(SubmittedCode?.element);
    }
  } catch (err) {
    console.error(err);
  }
};

StartWorker(); /// Starts Processing the Submission


