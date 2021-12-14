const aws = require('aws-sdk');
const uuid = require('uuid')
const { CognitoUserPool, CognitoUser} = require('amazon-cognito-identity-js')

let poolData = {
    UserPoolId: "ap-south-1_TId4HoBF0", // User Pool Id
    ClientId: "3k45ogjaqdugkrlb330ccrhbd6" // Client Id
}

let userPool = new CognitoUserPool(poolData);

// var userData = {
// 	Username: "ashishchoudhari224@gmail.com",
// 	Pool: userPool,
// };

// var cognitoUser = new CognitoUser(userData);
// let deleteFunction = async ()=>{
//     return new Promise((resolve,reject)=>{
//         cognitoUser.deleteUser((err,data)=>{
//             if(err){
//                 console.log(err);
//                 reject(err);
//             }else{
//                 console.log(data);
//                 resolve(data)
//             }
//         })
//     })
// }
// module.exports.deleteUser = async (events) =>{
//     const userData = JSON.parse(events.body);
//     let data = await deleteFunction();
//     console.log(data);
//     return {
//         statusCode: 200,
//         body: JSON.stringify({
//           data: data,
//           message: "User Deleted"
//         })
//     }
// } 

// aws.config.update({
// region:"us-west-2",
// endpoint: "http://localhost:8000"
// })

aws.config.update({
    region: "us-west-2",
    endpoint: "http://DynamoDB.us-west-2.amazonaws.com",
    accessKeyId: "AKIAZFNKWJXY5AQXTQH4",
    secretAccessKey: "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"

});



module.exports.signUpUser = async (email, password) => {
    return new Promise((resolve, reject) => {
        console.log(email);
        console.log(password);
        userPool.signUp(email, password, [], null, (err, data) => {
            if (err) {
                console.error(err);
                console.log('Something Went Wrong With SignUp please Try again');
                reject(err)
            } else {
                console.log(data);
                resolve(data);
            }
        })
    })
}