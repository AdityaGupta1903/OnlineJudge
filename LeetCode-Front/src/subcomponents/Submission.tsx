/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import Editor from "./Editor";
import { useParams } from "react-router-dom";
import axios from "axios";
import IQuestionInEditor from "../models/IQuestionInEditor";
import Card from "@mui/material/Card/Card";

function Submission() {
  const [ProblemDescriptionAndSign, setProblemDescriptionAndSign] =
    useState<IQuestionInEditor>();
  const { id } = useParams();
  console.log(id);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    axios.get(`http://localhost:3000/GetProblem/${id}`).then((resp: any) => {
      console.log(resp);
      setProblemDescriptionAndSign({
        Description: resp.data.Description,
        Sign: resp.data.Sign,
        args: resp.data.args,
        SampleInput: resp.data.SampleInput,
        SampleOutput: resp.data.SampleOutput,
        ID: resp.data.ID,
      });
    });
  }, []);
  console.log(ProblemDescriptionAndSign);

  return (
    <div className="h-screen grid" style={{ gridTemplateColumns: "40% 60%" }}>
      <div className="relative" style={{ left: "5%" }}>
        <div className="m-2 font-bold">Question :-</div>
        <div
          className="m-2  mt-6 text-3xl"
          style={{ wordWrap: "break-word", maxWidth: "90%" }}
        >
          {ProblemDescriptionAndSign?.Description ?? ""}
        </div>
        <div className="m-2 mt-4">
          Given Inputs -{" "}
          {ProblemDescriptionAndSign?.args === "Array"
            ? `An ${ProblemDescriptionAndSign.args}`
            : `A ${ProblemDescriptionAndSign?.args}`}{" "}
        </div>
        <Card className="mt-4 p-3 w-2/3 ">
          <div className="m-2">
            <div className="font-bold mb-1">Example:-</div>
            <div>Sample Input - </div>
            <div className="m-1">{ProblemDescriptionAndSign?.SampleInput}</div>
          </div>
          <div className="m-2">
            <div>Sample Output</div>
            <div className="m-1">{ProblemDescriptionAndSign?.SampleOutput}</div>
          </div>
        </Card>
        <div className="mt-2 ml-1" style={{ fontWeight: "600" }}>
          Time Limit - 1s
        </div>
      </div>

      <div className="w-full">
        <Editor
          Sign={ProblemDescriptionAndSign?.Sign ?? ""}
          args={ProblemDescriptionAndSign?.args ?? ""}
          ID={ProblemDescriptionAndSign?.ID ?? 0}
        />
      </div>
    </div>
  );
}

export default Submission;
