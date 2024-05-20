/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react"


function App() {
 const [id,setId] = useState<string>();
 const [args,setArgs] = useState<string>("");
 const [Signature,setSignature] = useState<string>("");
 const [code,setCode] = useState<string>("");
 const [Description,setDescription] = useState<string>("");



  return (
    <>
     <input placeholder="id" onChange={(e)=>{
         setId(e.target.value);
     }}></input>
      <input placeholder="Description" onChange={(e)=>{
          setDescription(e.target.value);
     }}></input>
     <input placeholder="agrs"  onChange={(e)=>{
         setArgs(e.target.value);
     }}></input>
     <input placeholder="Signature"  onChange={(e)=>{
         setSignature(e.target.value);
     }}></input>
     <input placeholder="code"  onChange={(e)=>{
         setCode(e.target.value);
     }}></input>
     <button onClick={()=>{
      const obj = {id:id,args:args,Signature:Signature,code:code,Description:Description}
      console.log(typeof(JSON.stringify(obj)));
        fetch("http://localhost:3000/CreateProblem",
          {
            method:'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
          }
        ).then((resp)=>{
          console.log(resp);
        })
     }}>Submit</button>
    </>
  )
}

export default App
