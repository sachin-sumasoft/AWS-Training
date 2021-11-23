// import boto3

// import key_config as keys

// dynamodb = boto3.resource('dynamodb',
//                     aws_access_key_id=AKIAZFNKWJXY67TEJQ65.ACCESS_KEY_ID,
//                     aws_secret_access_key=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.ACCESS_KEY_ID)


// table = dynamodb.create_table(
//     TableName='userdata' ,
//     KeySchema=[
//         {
//             'AttributeName' : 'email',
//             'KeyType' : 'HASH'
//         }
//     ],
//     AttributeDefinitions=[
//         {
//             'AttributeName' : 'email',
//             'AttributeType' : 'S'
//         }
//     ],
//     ProvisionedThroughput={
//         'ReadCapacityUnits' : 5,
//         'WriteCapacityUnits' : 5
//     }
// )

// table.meta.client.get_waiter('table_exists').

aws.config.update({
    region: "ap-south-1",
    endpoint: "http://DynamoDB.ap-south-1.amazonaws.com",
    accessKeyId: "AKIAZFNKWJXY3UMYAGVU",
    secretAccessKey: "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"

});
module.exports.create = async (events)=>{
    try {
        let createTable = await dynamodb.createTable(params).promise();
        return {
            statusCode: 200 ,
            body: JSON.stringify({
                data: createTable,
                message:"Unsuccessful"
            })
        }  
    } catch (error) {
        return{
            statusCode: error.statusCode || 500 ,
            body: JSON.stringify({
                data: {},
                message:"Unsuccessful",
                errorName : error.name,
                errorDetails : error
            })
        }
    }
}

