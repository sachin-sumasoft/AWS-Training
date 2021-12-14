var jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');

const jwks = {
  "keys": [
      {
          "alg": "RS256",
          "e": "AQAB",
          "kid": "TjeEPGwFVireW2nV6pWTGDFycbTZ+Mxa7IpwzBpD3OM=",
          "kty": "RSA",
          "n": "7Cy9sa5DOia_q6prbm09VmD0QFjj3JDBDbtC0qTMMtPIjVfl-1zx7x69cqGuy__fouHnLF0210MUTpWBxCDKLajRcKma71gVbFJVstmG7uGIN2O0w3ILyxPBCc_RPITlT1uNhb84VyrMUII0c9Ac-aeYZ-kJz9KZ_MgwIENYQ7TEI1SSu4Pd2n1VA58uzKMp68es_poM7oF5bIZvJV7lcEwGSb7Ba5_OYw6vOZo126I1L554QcCNAhkqojTcGGi0hI1X6fs0BQKQJ1x-XoFmMK31XIkUgowj7ZzeFiG6G2wUZTf_LNptnzAm18pi7DcTzFUvEqo8zUSSH7k7yOV5dw",
          "use": "sig"
      },
      {
          "alg": "RS256",
          "e": "AQAB",
          "kid": "qm8qqI0rjL3nM8mE0kfrjM5+ulV1MMquG11Ln5rcXsk=",
          "kty": "RSA",
          "n": "xdoSPAH-7OmRd66kl-meg0AmDLA8zMsC5VmE51CfkBCoywXbdk0ID3ST47n3VjWHWzsSfTVRw4AvlHUAQTbGuTNHXDcr7aRiT6Vcqil7xKfX4fY2Tx3pIs9IzxcLVIf_ZOQwiJ6a4SIn26c1rHELxXFzjlaQ1YetEw0ek7x8pWo7wDs-FwT8Kp2LrmQEjmJOSXKx3xk_7vA0rFxjbE7uCBmsJnYtS0v38Fd4tzX-nRpLYrhPcLHtjQBUlFMyWDREAnVEA3STZrP8HFCItYxWfgQUzpBc7YKAAddy2M5bT5rYNKdHTsvhiXyLuBtyzv8z2OunP0xf5giIdpsF4vOL9w",
          "use": "sig"
      }
  ]
}
let poolData = {
    UserPoolId: "ap-south-1_TId4HoBF0", // User Pool Id
    ClientId: "3k45ogjaqdugkrlb330ccrhbd6" // Client Id
  }
module.exports.authUser = async (token)=>{
    let jwk = ""
    let stoken = token.split(".");
    let tokenHeadKid = JSON.parse(Buffer.from(stoken[0],"base64")).kid
    jwks.keys.forEach((data,index)=>{
        if(data.kid === tokenHeadKid){
            jwk = data
        }
    })
    var pem = jwkToPem(jwk);
    try {
        let user = await jwt.verify(token, pem, { algorithms: ['RS256'] });
        console.log(user.username);
        if(user.client_id !== poolData.ClientId){
            throw {message:"invalid token"}
        }
        return user  
    } catch (error) {
        console.log(error)
       throw error 
    }
}