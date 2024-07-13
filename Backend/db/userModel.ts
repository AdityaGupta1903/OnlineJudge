import mongoose from "mongoose";
const ProblemStatusSchema = new mongoose.Schema({
    ProblemId : {
       type : Number,
       required : true
    },
    Virdict : {
       type : String,
       required : true,
       default : 'UnAttempted'
    }
  })
 
 const UserSchema = new mongoose.Schema({
    username : {
     type : String,
     required : true
    },
    password : {
      type : String,
      required : true
    },
   ProblemVirdict : {
    type : [ProblemStatusSchema]    //// Need to Add User Authentication Also
   }
 })

 const UserModel = mongoose.model('UserModel',UserSchema);

 export default UserModel;