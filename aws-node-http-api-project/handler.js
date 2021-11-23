'use strict';


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






