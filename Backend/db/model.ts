import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
   ID : {
    type : Number,
    required : true
   },
   TestCase : {
    type : String,
    required : true
   },
   args : {
    type : String,
    required : true
   },
   sign : {
    type : String,
    required : true
   },
   code : {
    type : String,
    required : true
   },
   Description : {
      type : String,
      required : true
   },
   TestCaseResults : {
      type : String,
      required : true
   }

  });

 

const ProblemModel = mongoose.model('ProblemModel',ProblemSchema);


export default ProblemModel