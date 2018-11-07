var AWS = require('aws-sdk');
var response = require('./lib/response');

var ddb = new AWS.DynamoDB.DocumentClient();

module.exports.authorize = async (event, context) => {

    var data = JSON.parse(event.body);

    const params = {
        TableName: "User",
        Key: {
            id: data.id
        }
    };

    try {
        const dbResponse = await ddb.get(params).promise();

        if(dbResponse.Item) {

            const userAccessLevel = dbResponse.Item.role;

            if(userAccessLevel === data.accessLevel) {
                return response.respondSuccess({allowed: true});
            } else {
                return response.respondFailure({allowed: false, error: "Not Authorized", accessLevel: userAccessLevel});
            }

        } else {
            return response.respondFailure({allowed: false, error: "Username not found"});
        }
    } catch(e) {
        return response.respondFailure({allowed: false, error: e.message});
    }

}