/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@mui/material";
import { useNavigate } from "react-router-dom";
import IQuestion from "../models/IQuestion";

// eslint-disable-next-line react-refresh/only-export-components
const Problem: React.FC = () => {
  const navigate = useNavigate();
  const [Problems, setProblems] = useState<IQuestion[]>([]);
  useEffect(() => {
    axios.get("http://localhost:3000/GetAllProblems").then((resp) => {
      const QuestionArray = resp.data;
      console.log(QuestionArray);
      for (let i = 0; i < QuestionArray?.length; i++) {
        setProblems((prev) => [
          ...prev,
          { Question: QuestionArray[i]?.Description, ID: QuestionArray[i]?.ID },
        ]);
      }
    });
  }, []);
  console.log(Problems);
  return (
    <div>
      {Problems.map((Element, _key) => {
        return (
          <div
            className="m-4"
            onClick={() => {
              navigate(`/Problem/${Element.ID}`);
            }}
          >
            <Card className="p-3" style={{ backgroundColor: "#FFFAE6" }}>
              {Element.Question}
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default Problem;
