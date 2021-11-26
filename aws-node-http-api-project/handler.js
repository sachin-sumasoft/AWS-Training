'use strict';
const { CognitoUserPool, CognitoUser } = require('amazon-cognito-identity-js')

let poolData = {
  UserPoolId: "ap-south-1_IBopTt4z4", // User Pool Id
  ClientId: "4m5nid09grkk37m4lb0bmbfm69" // Client Id
}

let userPool = new CognitoUserPool(poolData);


const aws = require('aws-sdk');
const { signUpUser } = require('./utilities/signUp');
const uuid = require('uuid')

// Create Table Params
var params = {
  TableName: "UserData",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" }
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
}
// DynamoDB Config
aws.config.update({
  region: "us-west-2",
  endpoint: "http://DynamoDB.us-west-2.amazonaws.com",
  accessKeyId: "AKIAZFNKWJXYYBSQCPVF",
  secretAccessKey: "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"

});


var dynamodb = new aws.DynamoDB();
var dynamodbClient = new aws.DynamoDB.DocumentClient();

// CreateTable In DynamoDb Table
module.exports.create = async (events) => {

  try {
    let createTable = await dynamodb.createTable(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: createTable,
        message: "successful",
        input: events,
      })
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        data: {},
        message: "Unsuccessful",
        input: events,
        errorName: error.name,
        errorDetails: error
      })
    }
  }
}
//charan

function otp(userName) {
  return new Promise((resolve, reject) => {

    let user = new CognitoUser({
      Username: userName,
      Pool: userPool // User Pool
    })
    user.forgotPassword({
      onSuccess: function (data) {
        // successfully initiated reset password request
        console.log('CodeDeliveryData from forgotPassword: ');
        console.log(data);
        resolve(data)
      },
      onFailure: function (err) {
        console.log(err);
        reject(err);
      }
    })
  })
}

function confirmNewPassword(otp, password) {
  return new Promise((resolve, reject) => {
    user.confirmPassword(otp, password, {
      onSuccess(data) {
        // After password is reset
        console.log("passwaord reset");
        resolve("password changed successfully")
      },
      onFailure(err) {
        reject(err)
      },
    });
  })
}
function handleLogIn(email,password){
  return new Promise((resolve,reject)=>{
    let user = new CognitoUser({
      Username: email,
      Pool: userPool // User Pool
  })
    let authDetails = new AuthenticationDetails(
      {
        Username : email,
        Password : password,
      }
    )

    user.authenticateUser(authDetails,{
      onSuccess: (data)=>{
        console.log("login successful",data);
        resolve( data )
         
         
      },
      onFailure: (err)=>{
        console.log(err);
        reject( err )
        
      },
      
    })
  })
}



module.exports.login = async (events)=>{
  const userData = JSON.parse(events.body);
  try {
      let logindata = await handleLogIn(userData.email, userData.password);
      return {
          statusCode: 200 ,
          body: JSON.stringify({
              data: logindata,
              message:"successful",
              input: events,
          })
      }  
  } catch (error) {
      return{
          statusCode: error.statusCode || 500 ,
          body: JSON.stringify({
              data: {},
              message:"Unsuccessful",
              input: events,
              errorName : error.name,
              errorDetails : error
          })
      }
  }
}


// SignUp Function
module.exports.createUser = async function (event, context, callback) {
  const userData = JSON.parse(event.body);
  const params = {
    Item: {
      "id": uuid.v1(),
      "name": userData.name,
      "last_name": userData.last_name,
      "user_name": userData.user_name
    },
    TableName: "UserData"
  }
  console.log(userData);
  try {
    let user = await signUpUser(userData.email, userData.password)
    console.log(user);
    try {
      let result = await dynamodbClient.put(params).promise()
      console.log(result);
      return {
        statusCode: 200,
        body: JSON.stringify({
          data: userData,
          message: "user Inserted Successfully"
        })
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: error.name,
          errorDetail: error
        })
      }
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 400,
      body: JSON.stringify({
        error: error
      })
    }
  }

};



module.exports.getOtp = async (events)=>{
  const userData = JSON.parse(events.body);
  
  try {
      let code = await otp(userData.email);
      console.log(code);
      return {
          statusCode: 200,
          body: JSON.stringify({
              message: "code send"
          })
      }
  } catch (error) {
      return {
          statusCode: 400,
          body: JSON.stringify({
              message: "code send"
          })
      }
  }
}


module.exports.newPassWord = async (events) => {
  const userData = JSON.parse(events.body);
  try {
    let code = await confirmNewPassword(userData.otp, userData.password);
    console.log(code);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "password change succfully"
      })
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "code send"
      })
    }
  }
}