'use strict';
const { CognitoUserPool, CognitoUser, AuthenticationDetails} = require('amazon-cognito-identity-js')
const {authUser} = require('./utilities/AuthUser')

let poolData = {
  UserPoolId: "ap-south-1_TId4HoBF0", // User Pool Id
  ClientId: "3k45ogjaqdugkrlb330ccrhbd6" // Client Id
}

let userPool = new CognitoUserPool(poolData);


const aws = require('aws-sdk');
const { signUpUser } = require('./utilities/signUp');
const { passwordReset } = require('./utilities/passwordReset')
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
  accessKeyId: "AKIAZFNKWJXY5AQXTQH4",
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        data: createTable,
        message: "successful",
        input: events,
      })
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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

function confirmNewPassword(otp, password,email) {
  return new Promise((resolve, reject) => {
    
    let user = new CognitoUser({
      Username: email,
      Pool: userPool // User Pool
    })

    console.log("otp:"+otp);
    console.log(password);

    user.confirmPassword(otp, password, {
      onSuccess() {
        // After password is reset
        console.log("passwaord reset");
        resolve("password changed successfully")
      },
      onFailure(err) {
        console.log(err);
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
  console.log(userData);
  try {
      let logindata = await handleLogIn(userData.email, userData.password);
      return {
          statusCode: 200 ,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
              data: logindata,
              message:"successful",
              input: events,
          })
      }  
  } catch (error) {
      console.log(error);
      return{
          statusCode: error.statusCode || 500 ,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
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
      "user_name": userData.user_name,
      "email" : userData.email,
    },
    TableName: "UserData"
  }

  try {
    let user = await signUpUser(userData.email, userData.password)
    params.Item["cognitoSubUser"] = user.userSub
    try {
      let result = await dynamodbClient.put(params).promise()
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          data: [user,result],
          other : result,
          message: "user Inserted Successfully"
        })
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          error: error.name,
          errorDetail: error
        })
      }
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
              message: "code send"
          })
      }
  } catch (error) {
      return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
              message: "code send"
          })
      }
  }
}


module.exports.newPassWord = async (events) => {
  const userData = JSON.parse(events.body);
  try {
    let code = await confirmNewPassword(userData.otp, userData.password,userData.email);
    console.log(code);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: "password change succfully"
      })
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: "code send",
        error:error
      })
    }
  }
}



module.exports.resetPassword = async (events) =>{
  const userData = JSON.parse(events.body);
  try {
    let resData = await passwordReset(userData.email,userData.oldPassword,userData.newPassWord);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        data : resData,
        message: "Password Changed Successfully"
      })
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: error.statusCode || 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error : error,
        errorMessage: error.message
      })
    }
  }
}

module.exports.assets = async (event) =>{
  const clientData = JSON.parse(event.body)
  let token  = event.headers.Authorization
  if(token == undefined){
    return {
      statusCode : 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message:"token missing"
      })
    }
  }
  try {
    let user = await authUser(token);
    const params = {
      Item: {
        "id": uuid.v1(),
        "assetName":clientData.assetName,
        "Telematics_Serial_Number":clientData.Telematics_Serial_Number,
        "Serial_Number":clientData.Serial_Number,
        "Description":clientData.Description,
        "Owner":clientData.Owner,
        "Distributor":clientData.Distributor,
        "Make":clientData.Make,
        "Model":clientData.Model,
        "Security_Group":clientData.Security_Group,
        "DWG":clientData.DWG,
        "Product_Video_Link":clientData.Product_Video_Link
      },
      TableName: "AssetsData"
    }
    let result = await dynamodbClient.put(params).promise()
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          data : params,
          message: "Asset Inserted Successfully"
        })
      }
  } catch (error) {
    if(error.message == "invalid token" || error.message == "jwt expired")
    {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          error: error
        })
      }
    }
    else{
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          error: error.name,
          errorDetail: error
        })
      }
    }
  }
}


module.exports.getassetModel =async (event)=>{
  let token  = event.headers.Authorization
  if(token == undefined){
    return {
      statusCode : 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message:"token missing"
      })
    }
  }
  let params = {
    ExpressionAttributeNames: {
      "#s":"status"
    },
    ExpressionAttributeValues:{
      ":sv":"active"
    },
    FilterExpression:"#s = :sv",
    TableName : 'AssetModel'
  };
try {
  let user = await authUser(token);
  let result = await dynamodbClient.scan(params).promise()
  return {
    statusCode : 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      data: result,
      message : "Asset model insertion successful"
    })
  }
} catch (error) {
  console.log(error);
  return {
    statusCode : error.statusCode || 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      error: error.name,
      message : error.message
    })
  }
}
}


module.exports.createAssetModel = async (event)=>{
  const userData = JSON.parse(event.body)
  let token  = event.headers.Authorization
  if(token == undefined){
    return {
      statusCode : 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message:"token missing"
      })
    }
  }
  let createAssetModelId = uuid.v1()
  let assetId = userData.assetId;
  let params = {
    Item:{
      "id" : createAssetModelId,
      "name":userData.name,
      "status":userData.status,
      "description":userData.description
    },
    TableName: "AssetModel"
  }
  // update Asset Model Update Params
  let assetModelParams = {
    TableName: 'AssetsData',
    Key : {id : assetId},
    UpdateExpression:'set #aModelId = :assetModelId', 
    ConditionExpression : '#id = :aid',
    ExpressionAttributeNames: {'#aModelId' : 'assetModelId','#id':'id'},
    ExpressionAttributeValues: {
      ':assetModelId' : createAssetModelId,
      ':aid' : assetId
    }
  }
  try {
    let user = await authUser(token);
    let result = await dynamodbClient.put(params).promise()
    // console.log(result);
    let updateAssetData = await dynamodbClient.update(assetModelParams).promise();
    console.log(updateAssetData);
    return {
      statusCode : 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        data: userData,
        message : "Asset model insertion successful"
      })
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode : error.statusCode || 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: error.name,
        message: error.message
      })
    }
  }
}
// ======================================================Sensor ====================================================
module.exports.sensors = async (event)=>{
  // User Auth 
  let token  = event.headers.Authorization
  if(token == undefined){
    return {
      statusCode : 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message:"token missing"
      })
    }
  }
  try {
    let user = await authUser(token);
  } catch (error) {
    console.log(error);
    return {
      statusCode : 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error:error,
        message: error.message
      })
    }
  }
  let userData = JSON.parse(event.body)
  let key = userData.key
  let sensorId = uuid.v1()
  let assetId = userData.assetId;

  // params for AssetData Table
  let params = {
    Item:{
      "id" : sensorId,
      "name":userData.name,
      "status":userData.status,
      "description":userData.description
    },
  }
  // update Asset Table Update Params
  let assetDataParams = {
    TableName: 'AssetsData',
    Key : {id : assetId},
    ConditionExpression : '#id = :aid',
    ExpressionAttributeNames: {'#id':'id'},
    ExpressionAttributeValues: {
      ':sensorId' : [sensorId],
      ':aid' : assetId
    }
  }
  try {
    let getAssetDataparams = {
      TableName : 'AssetsData',
      Key: {
        id: assetId
      },
    };
    if(key == 'sensorParts'){
      getAssetDataparams['AttributesToGet'] = ["sensorPartId"]
    }else if(key == "sensor"){
      getAssetDataparams['AttributesToGet'] = ["sensorId"]
    }else{
      throw "invalid key"
    }
    var assetData = await dynamodbClient.get(getAssetDataparams).promise()
    console.log(getAssetDataparams);
  } catch (error) {
    console.log(error);
  }
  switch (key) {
    // Sensor Parts
    case 'sensorParts':
      params['TableName'] = 'sensorParts'
      assetDataParams.ExpressionAttributeNames['#sensorPartId'] = 'sensorPartId'
      console.log(Object.keys(assetData.Item).length);
      if(Object.keys(assetData.Item).length == 0){
        assetDataParams['UpdateExpression'] = 'set #sensorPartId = :sensorId'
      }else{
        assetDataParams['UpdateExpression'] = 'set #sensorPartId = list_append(#sensorPartId, :sensorId)'
      }
      try {
        let result = await dynamodbClient.put(params).promise();
        let updateAssetData = await dynamodbClient.update(assetDataParams).promise();
        return {
          statusCode : 200,
          headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            message: "insertion successful"
          })
        }
      } catch (error) {
        console.log(error);
        return {
          statusCode : error.statusCode || 401,
          headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            error : error,
            message: "insertion unsuccessful"
          })
        }
    }  
    case 'sensor':
      params['TableName'] = 'sensors'
      assetDataParams.ExpressionAttributeNames['#sensorId'] = 'sensorId'
      if(Object.keys(assetData.Item).length == 0){
        assetDataParams['UpdateExpression'] = 'set #sensorId = :sensorId'
      }else{
        assetDataParams['UpdateExpression'] = 'set #sensorId = list_append(#sensorId, :sensorId)'
      }
      try {
        let result = await dynamodbClient.put(params).promise();
        let updateAssetData = await dynamodbClient.update(assetDataParams).promise();
        return {
          statusCode : 200,
          headers : {
            'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            message: "sensor part inserted successfully"
          })
        }
      } catch (error) {
        return {
          statusCode : error.statusCode || 400,
          headers : {
            'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            error: error,
            message: "insertion unsuccessful"
          })
        }
    }
    default:

      return {
        statusCode : 400,
        headers : {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: "Invalid Key"
        })
      }
  }
}

// // test
// module.exports.getAssetData = async (event)=>{
//   let tableName = event.queryStringParameters.tableName
  
//   let params = {
//     TableName : tableName
//   };
//   try {
//     let results = await dynamodbClient.scan(params).promise();
//     return {
//       statusCode : 200,
//       body:JSON.stringify({
//         result : results,
//         message : "Data"
//       })
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
// module.exports.delteAssetData = async (event) =>{
//   let userData = JSON.parse(event.body)

//   var params = {
//     TableName : userData.tableName,
//     Key: {
//       id: userData.id
//     }
//   };
//   try {
//     let result = await dynamodbClient.delete(params).promise();
//     return {
//       statusCode : 200,
//       body:JSON.stringify({
//         result : result,
//         message : "Data"
//       })
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }