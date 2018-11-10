var db = require('./lib/dblib');
var validate = require('./lib/validatelib');
var response = require('./lib/response');

const TABLE_NAME = "User";

module.exports.createDev = async (event, context) => {
    return createUser(event, context, "dev");
};

module.exports.createProjectManager = async (event, context) => {
    return createUser(event, context, "project-manager");
}

module.exports.createAdmin = async (event, context) => {
    return createUser(event, context, "admin");
}

module.exports.validateUser = async event => {

    const data = JSON.parse(event.body);

    var errors = await validate.validateUser(data);

    if(errors.length !== 0) {
        return response.respondError(["That Display Name already exists!"]);
    } else {
        return response.respondSuccess({success: true});
    }
}

async function createUser(event, context, role) {

    const data = JSON.parse(event.body);

    //validate data
    var errors = await validate.validateUser(data);

    if(errors.length !== 0) {
        return response.respondError(["That Display Name already exists!"]);
    } else {
        return await db.putItem({
            id: data.id,
            userRole: role,
            displayName: data.displayName,
            email: data.email
        }, TABLE_NAME);
    }
}

module.exports.getProfile = async (event, context) => {

    const data = JSON.parse(event.body);
    return await db.getItem({id: data.id}, TABLE_NAME, "profile");
}

module.exports.getAllUsers = async () => {

    return await db.getAllItems("users", TABLE_NAME);
}

module.exports.getAllDisplayNames = async () => {

    return await db.getAll(["displayName"], TABLE_NAME);
}

module.exports.updateProfile = async (event, context) => {

    const data = JSON.parse(event.body);
    var errors = await validate.validateUser(data);

    if(errors.length !== 0){
        return response.respondError(errors);
    } else {

        const params = {
            TableName: "User",
            Key: {
                id: data.id
            },
            UpdateExpression: "SET pitch = :pitch, attributes = :attributes",
            ExpressionAttributeValues: {
                ":pitch": data.pitch || null,
                ":attributes": data.attributes || null
            },

            ReturnValues: "ALL_NEW"
        }

        return await db.updateItem(params);
    }
}

module.exports.updateUser = async (event, context) => {

    const data = JSON.parse(event.body);

    console.log(data);

    const params = {
        TableName: "User",
        Key: {
            id: data.id
        },
        UpdateExpression: "SET displayName = :displayName, pitch = :pitch, attributes = :attributes, userRole = :userRole",
        ExpressionAttributeValues: {
            ":displayName": data.displayName || null,
            ":pitch": data.pitch || null,
            ":attributes": data.attributes || null,
            ":userRole": data.userRole || null
        },

        ReturnValues: "ALL_NEW"
    }

    return await db.updateItem(params);
}