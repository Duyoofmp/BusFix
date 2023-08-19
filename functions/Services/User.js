const dataHandling = require("../functions")
const ServiceAccount = require("../config/ServiceAccount.json")
const com=require("../common")

const admin = require('firebase-admin');
const moment = require('moment-timezone')



async function RegisterUser(req, res) {
    try {
        const {Name,Email,Password,PhoneNo}=req.body;
       
        const createUser=await  admin.auth().createUser({email:Email,password: Password,phoneNumber:String(PhoneNo),displayName:Name});
        await dataHandling.Create("Users",{...req.body},createUser.uid)
        console.log(createUser.uid)
        const token=await com.GenerateToken({Role:"User",UserId:createUser.uid})

        return res.json({token:token})
    } catch (error) {
        console.log(error)
        return res.json(error)
    }
   
}
async function LoginUser(req, res) {
    try {
        const {Email,Password}=req.body;
        const createUser=await  admin.auth().getUserByEmail(Email);
        // @ts-ignore
        const manData=await dataHandling.Read("Users",createUser.uid)
         

        if(manData.Password===Password){
            const token=await com.GenerateToken({Role:"User",UserId:createUser.uid})

         return res.json(token)
        
        }else{
            return res.json(false)
        }
    } catch (error) { 
        console.log(error)
        return res.json(false)
    }
}


module.exports = {
    LoginUser,
    RegisterUser
}