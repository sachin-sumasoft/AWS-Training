'use strict';


const { CognitoUserPool, CognitoUser } = require('amazon-cognito-identity-js')

let poolData = {
    UserPoolId: "ap-south-1_IBopTt4z4", // User Pool Id
    ClientId: "4m5nid09grkk37m4lb0bmbfm69" // Client Id
}

let userPool = new CognitoUserPool(poolData);







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









