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


module.exports.getProfile = async(event, context) => {

    const data = JSON.parse(event.body);

    const params = {
        TableName: "User",
        Key : {
            id: data.id
        }
    }

    try {
        const result = await ddb.get(params).promise();
        return response.respondSuccess({profile: result});
    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}

module.exports.updateProfile = async(event, context) => {

    const data = JSON.parse(event.body);

    console.log(data);

    const params = {
        TableName: "User",
        Key : {
            id: data.id
        },
        UpdateExpression: "SET displayName = :displayName, pitch = :pitch, attributes = :attributes",
        ExpressionAttributeValues: {
            ":displayName": data.displayName || null,
            ":pitch": data.pitch || null,
            ":attributes": data.attributes || null
        },

        ReturnValues: "ALL_NEW"
    }

    try {
        await ddb.update(params).promise();
        return response.respondSuccess({success: true});
    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}