const functions = require('firebase-functions');

const common=require("../common")


//express portion
const express = require('express');
const cors = require('cors');




const app = express();
app.use(cors({ origin: true }));
app.use(common.decodeIDToken)
///---------------------------------------------------------------







const app3 = express();
app3.use(cors({ origin: true }));
app3.post('/CreateUser', async (req, res) => {
  const User = require("../Services/User");
  return User.RegisterUser(req, res);
})
app3.post('/LoginUser', async (req, res) => {
    const User = require("../Services/User");
    return User.LoginUser(req, res);
  })
exports.LoginForUser = functions.runWith({ memory: '128MB' }).region("asia-south1").https.onRequest(app3);