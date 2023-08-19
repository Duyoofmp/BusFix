const dataHandling = require("../functions")
const ServiceAccount = require("../config/ServiceAccount.json")
const com=require("../common")

const admin = require('firebase-admin');
const moment = require('moment-timezone')



async function RegisterBus(req, res) {
    try {
        const {Name,Email,Password,PhoneNo}=req.body;
   
        const createBus=await  admin.auth().createUser({email:Email,password: Password,phoneNumber:"+91"+String(PhoneNo),displayName:Name});
        req.body.qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="+createBus.uid
        await dataHandling.Create("Buses",{...req.body},createBus.uid)
        console.log(createBus.uid)
        const token=await com.GenerateToken({Role:"Bus",BusId:createBus.uid})
        return res.json({token:token})
    } catch (error) {
        console.log(error)
        return res.json(error)
    }
   
}
async function AddRoutes(req, res) {
    try {
        const routesArray=[];
       const arrObj=req.body;
       arrObj.forEach(obj => {
            routesArray.push(obj.name);
       });
         
        return dataHandling.Update("Buses",{Routesr:arrObj,RoutesArr:routesArray},req.body.BusId);
    
    } catch (error) {
        console.log(error)
        return res.json(error)
    }
   
}


async function LoginBus(req, res) {
    try {
        const {Email,Password}=req.body;
        const createBus=await  admin.auth().getUserByEmail(Email);
        // @ts-ignore
        const manData=await dataHandling.Read("Buses",createBus.uid)
         

        if(manData.Password===Password){
            const token=await com.GenerateToken({Role:"User",UserId:createBus.uid})

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
    LoginBus,
    RegisterBus
}