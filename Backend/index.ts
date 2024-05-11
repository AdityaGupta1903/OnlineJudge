
import express from 'express';
import { createClient } from 'redis';
import bodyParser from 'body-parser';
import { runInNewContext } from 'vm';
import vm from 'vm'
const app = express();
app.use(bodyParser.json())


const clinet = createClient();

clinet.connect().then().catch((err)=>{
    console.error("connection Failed with err", err)
})
    
app.get('/Run',async(req,res)=>{


    const Id = req.body.Id;
    const code = req.body.code;
    const IsAdmin = false
    const sign = req.body.sign;
    const args = req.body.args;
    
    try{
         await clinet.lPush("Submission",JSON.stringify({Id,code,IsAdmin,sign,args}));
         res.send("Problem Recieved and Stored");
    }
    catch(err){
        console.error(err)
    }
})

app.get('/CreateProblem',async(req,res)=>{
    const args = req.body.args
    const code = req.body.code;
    const sign = req.body.sign
    const Id = req.body.Id
    const IsAdmin = true;
    
    try{
         await clinet.lPush("Submission",JSON.stringify({args,code,sign,IsAdmin,Id}));
         res.send("Problem Recieved and Stored");
    }
    catch(err){
        console.error(err)
    }
})
app.post('/execute', (req, res) => {
    const { code } = req.body;
    console.log(code);
    
    const script = new vm.Script(`${code} addNumbers(x,y)`);

    const context = {
        x: 5,
        y: 10,
    };

    try {
        const result = script.runInNewContext(context);
        console.log(result);
        res.json({ result });
    } catch (error : any) {
        res.status(400).send({
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
});





app.listen(3000,()=>{
    console.log("Connected")
})


