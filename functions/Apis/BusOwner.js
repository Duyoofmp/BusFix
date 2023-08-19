const functions = require('firebase-functions');

const common=require("../common")


//express portion
const express = require('express');
const cors = require('cors');




const app = express();
app.use(cors({ origin: true }));
app.use(common.decodeIDToken)
///---------------------------------------------------------------


app.post('/AddRoutes', async (req, res) => {
    const Bus = require("../Services/BusOwner");
    return Bus.AddRoutes(req, res);
  })








const app3 = express();
app3.use(cors({ origin: true }));
app3.post('/CreateBusOwner', async (req, res) => {
    const Bus = require("../Services/BusOwner");
    return Bus.RegisterBus(req, res);
  })
app3.post('/LoginBusOwner', async (req, res) => {
  const BusOwner = require("../Services/BusOwner");
  return BusOwner.LoginBus(req, res);
})
exports.LoginForBus = functions.runWith({ memory: '128MB',timeoutSeconds:540  }).region("asia-south1").https.onRequest(app3);