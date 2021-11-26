'use strict';
const aws = require('aws-sdk');
const { signUpUser } = require('./utilities/signUp');
const uuid = require('uuid')

const { CognitoUserPool, CognitoUser } = require('amazon-cognito-identity-js')

let poolData = {
  UserPoolId: "ap-south-1_IBopTt4z4", // User Pool Id
  ClientId: "4m5nid09grkk37m4lb0bmbfm69" // Client Id
}

let userPool = new CognitoUserPool(poolData);


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



