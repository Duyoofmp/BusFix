// @ts-nocheck
const dataHandling = require("./functions")

const jwt = require("jsonwebtoken");
const config = require("./config/jwt-secert.json");


const GenerateToken = async (SignObject) => {
  const Token = jwt.sign(SignObject, config.TOKEN_KEY, { expiresIn: "2h", });
  const RefreshToken = await dataHandling.Create("RefreshTokens", { SignObject, "Token": Token, "Valid": true });
  return { "Token": Token, "RefreshToken": RefreshToken };
}
const decodeIDToken = (

  req,

  res,

  next
) => {
  // Bearer <token>>
  const authHeader = req.headers.authorization || " ";
  const token = authHeader.split(" ")[1];
  console.log(token)
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    // @ts-ignore
    const user = jwt.verify(token, config.TOKEN_KEY);
    console.log(user)
    // @ts-ignore
    req.body = {...req.body,...user};
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

const createKeywords = (name, resultArr) => {
  function containsNonLatinCodepoints(s) {
    return /[^\u0000-\u00ff]/.test(s);
  }
  if (name === undefined || name === null) { name = "" }
  name = String(name);
  let curName = '';
  let temp = name;
  let len = name.split(' ').length;
  for (let i = 0; i < len; i++) {
    for (let k = 0; k < temp.split('').length; k++) {
      letter = temp[k]
      curName += letter.toLowerCase();
      if (!resultArr.includes(curName) && !containsNonLatinCodepoints(curName)) {
        resultArr.push(curName);
      }
    }
    temp = temp.split(' ')
    temp.splice(0, 1);
    temp = temp.join(" ")
    curName = '';
  }
}

module.exports = {
  GenerateToken,
  decodeIDToken,
  createKeywords
}