const aws = require('aws-sdk');
const uuid = require('uuid')
const { CognitoUserPool } = require('amazon-cognito-identity-js')

let poolData = {
    UserPoolId: "ap-south-1_IBopTt4z4", // User Pool Id
    ClientId: "4m5nid09grkk37m4lb0bmbfm69" // Client Id
}

let userPool = new CognitoUserPool(poolData);

// aws.config.update({
// region:"us-west-2",
// endpoint: "http://localhost:8000"
// })

aws.config.update({
    region: "us-west-2",
    endpoint: "http://DynamoDB.us-west-2.amazonaws.com",
    accessKeyId: "AKIAZFNKWJXY3UMYAGVU",
    secretAccessKey: "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"

});



module.exports.signUpUser = async (email, password) => {
    return new Promise((resolve, reject) => {
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