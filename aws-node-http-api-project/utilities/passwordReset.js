const aws = require('aws-sdk');
const { CognitoUserPool, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js')

let poolData = {
    UserPoolId: "ap-south-1_TId4HoBF0", // User Pool Id
    ClientId: "3k45ogjaqdugkrlb330ccrhbd6" // Client Id
}

let userPool = new CognitoUserPool(poolData);


var user;
var authDetails;

function login(email,password){
    return new Promise((resolve,reject)=>{
        user = new CognitoUser({
            Username: email,
            Pool: userPool // User Pool
          })
        authDetails = new AuthenticationDetails(
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

module.exports.passwordReset = async (email, oldPassword, newPassword) => {
    try {
        let r = await login(email,oldPassword)
        return new Promise((resolve, reject) => {
          user.changePassword(oldPassword, newPassword, function (err, result) {
               if (err) {
                   console.log(err);
                   reject(err)
               } else {
                   console.log(result);
                   resolve(result)
               }
           });
       })
    } catch (error) {
        console.log(error);
        return new Promise((resolve, reject) => {
          reject(error)
        })
    }
}