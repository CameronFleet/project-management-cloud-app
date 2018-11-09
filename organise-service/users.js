var db = require('./lib/dblib');

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

async function createUser(event, context, role) {

    const data = JSON.parse(event.body);
    return await db.putItem({id: data.id, userRole: role}, TABLE_NAME);
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

    console.log(data);

    const params = {
        TableName: "User",
        Key: {
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

    return await db.updateItem(params);
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
            ":userRole": data.role || null
        },

        ReturnValues: "ALL_NEW"
    }

    return await db.updateItem(params);
}