
var response = require('./lib/response');
var AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.createDev = async (event, context) => {
    return createUser(event, context, "dev");
};

module.exports.createProjectManager = async(event, context) => {
    return createUser(event, context, "project-manager");
}

module.exports.createAdmin = async(event, context) => {
    return createUser(event, context, "admin");
}

async function createUser(event, context, role) {

    const data = JSON.parse(event.body);

    const params = {
        TableName: "User",
        Item: {
            id: data.id,
            role: role
        }
    }

    try {
        await ddb.put(params).promise();
        return response.respondSuccess(params.Item);

    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}