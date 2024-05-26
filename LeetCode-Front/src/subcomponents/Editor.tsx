/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from "@mui/material/Button";
import axios from "axios";
import { useState } from "react";
import MonacoEditor from "react-monaco-editor";
const Editor: React.FC<{ Sign: string; args: String; ID: number }> = (
  props
) => {
  const DefaultString = `function ${props.Sign}( arg1 ){

 // Write Your Code Here
   
};`;
  const [Value, setValue] = useState<string>(DefaultString);
  const handleEditorChange = (e: any) => {
    setValue(e);
  };
  const HandleSubmit = () => {
    fetch("http://localhost:3000/SubmitProblem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Signature: props.Sign,
        code: Value,
        args: props.Sign,
        id: props.ID,
      }),
    }).then((resp) => {
      console.log(resp);
    });
  };

  return (
    <div>
      {" "}
      <MonacoEditor
        height="70vh"
        width={`100%`}
        language={"javascript"}
        value={DefaultString}
        theme="vs-dark"
        onChange={(e) => handleEditorChange(e)}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginRight: "7%",
          marginTop: "1%",
        }}
      >
        <Button
          variant="contained"
          style={{ background: "#455A64" }}
          onClick={() => {
            HandleSubmit();
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Editor;
