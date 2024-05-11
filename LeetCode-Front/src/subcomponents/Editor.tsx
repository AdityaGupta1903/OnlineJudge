/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import MonacoEditor from 'react-monaco-editor'
const Editor = ()=>{
    const [Value,setValue] = useState<string>("Write code");
    const handleEditorChange = (e: any) =>{
       setValue(e);
    }
   
    return <MonacoEditor
        height="85vh"
        width={`100%`}
        language={"javascript"}
        value={Value}
        defaultValue="write code"
        theme="vs-dark"
        onChange={(e)=>handleEditorChange(e)}/>
}

export default Editor;


