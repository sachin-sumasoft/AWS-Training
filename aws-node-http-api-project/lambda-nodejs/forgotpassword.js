const { CognitoUserPool, CognitoUser } = require('amazon-cognito-identity-js')

let poolData = {
    UserPoolId: "ap-south-1_IBopTt4z4", // User Pool Id
    ClientId: "4m5nid09grkk37m4lb0bmbfm69" // Client Id
}

let userPool = new CognitoUserPool(poolData);

let user = new CognitoUser({
    Username: "charan.tatu@sumasoft.net",
    Pool: userPool // User Pool
})



//............................ forgot password.................................

// var params = {
//     ClientId: 'STRING_VALUE', 
//     Username: 'STRING_VALUE', 
//     AnalyticsMetadata: {
//       AnalyticsEndpointId: 'STRING_VALUE'
//     },
//     ClientMetadata: {
//       '<StringType>': 'STRING_VALUE',
//     },
//     SecretHash: 'STRING_VALUE',
//     UserContextData: {
//       EncodedData: 'STRING_VALUE'
//     }
//   };
//   cognitoidentityserviceprovider.forgotPassword(params, function(err, data) {
//     if
//      (err) console.log("an error occurred",err, err.stack); 
//      // an error occurred
//     else    
//      console.log("successful response",data);         
//        // successful response
//   });


// //   .........................confirm password code......................

// var params = {
//     AccessToken: 'STRING_VALUE',
//     DeviceKey: 'STRING_VALUE', 
//     DeviceName: 'STRING_VALUE',
//     DeviceSecretVerifierConfig: {
//       PasswordVerifier: 'STRING_VALUE',
//       Salt: 'STRING_VALUE'
//     }
//   };
//   cognitoidentityserviceprovider.confirmDevice(params, function(err, data) {
//     if (err) console.log("an error occurred",err, err.stack);
//      // an error occurred
//     else     
//     console.log("successful response",data);          
//      // successful response
//   });
  

