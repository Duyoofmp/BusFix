const admin = require('firebase-admin');

const ServiceAccount = require("./config/ServiceAccount.json")
admin.initializeApp({
  // @ts-ignore
  credential: admin.credential.cert(ServiceAccount)
});


const LoginForBus = require("./Apis/BusOwner");
exports.LoginForBus = LoginForBus.LoginForBus;

const LoginForUser = require("./Apis/User");
exports.LoginForUser = LoginForUser.LoginForUser;