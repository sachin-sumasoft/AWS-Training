'use strict';
const { CognitoUserPool, CognitoUser } = require('amazon-cognito-identity-js')

let poolData = {
    UserPoolId: "ap-south-1_IBopTt4z4", // User Pool Id
    ClientId: "4m5nid09grkk37m4lb0bmbfm69" // Client Id
}

let userPool = new CognitoUserPool(poolData);


module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};



const aws = require('aws-sdk')

var params = {
  TableName : "UserData",
  KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }
  ],
  AttributeDefinitions: [
      { AttributeName: "id", AttributeType:"S"}
          ],
  ProvisionedThroughput: {
      ReadCapacityUnits: 5, 
      WriteCapacityUnits: 5
  }
}
aws.config.update({
  region: "us-west-2",
  endpoint: "http://DynamoDB.us-west-2.amazonaws.com",
  accessKeyId: "AKIAZFNKWJXYYBSQCPVF",
  secretAccessKey: "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"

});


var dynamodb = new aws.DynamoDB();
module.exports.create = async (events)=>{
  
    try {
        let createTable = await dynamodb.createTable(params).promise();
        return {
            statusCode: 200 ,
            body: JSON.stringify({
                data: createTable,
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
//charan

function otp(userName){
  return new Promise((resolve,reject)=>{
    
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

function confirmNewPassword(otp,password){
  return new Promise((resolve,reject)=>{
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
              message: "code send error"
          })
      }
  }
}

module.exports.newPassWord = async (events)=>{
  const userData = JSON.parse(events.body);
  try {
      let code = await confirmNewPassword(userData.otp,userData.password);
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