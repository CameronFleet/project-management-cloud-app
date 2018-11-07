var AWS = require('aws-sdk');
var response = require('./lib/response');
const uuidv4 = require('uuid/v4');

var ddb = new AWS.DynamoDB.DocumentClient();


module.exports.createProject = async (event, context) => {

    const data = JSON.parse(event.body);

    data.id = uuidv4();
    //Probably should validate the input data;

    const params = {
        TableName: "Projects",
        Item: data
    };

    console.log(params);

    try {
        await ddb.put(params).promise();
        return response.respondSuccess({success: true});
    } catch (e) {
        console.log(e);
        return response.respondFailure({status: false});
    }

}

module.exports.updateProject = async (event, context) => {

    const data = JSON.parse(event.body);

    const params = {
        TableName: "Projects",
        Key: {id: data.id},
        UpdateExpression: "SET title = :title, description = :description, " +
            "members = :members, startDate = :startDate, endDate = :endDate, " +
            "projectManager = :projectManager, projectStatus = :projectStatus, attributes = :attributes",
        ExpressionAttributeValues: {
            ":title": data.title || null,
            ":description": data.description || null,
            ":members": data.members || null,
            ":startDate": data.startDate || null,
            ":endDate": data.endDate || null,
            ":projectManager": data.projectManager || null,
            ":projectStatus": data.projectStatus || null,
            ":attributes": data.attributes || null
        },

        ReturnValues: "ALL_NEW"
    };

    try {
        await ddb.update(params).promise();
        return response.respondSuccess({success: true});
    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }

}

module.exports.getAllProjects = async (event, context) => {

    const params = {
        TableName: "Projects"
    }

    try {
        const result = await ddb.scan(params).promise();
        console.log(result);
        return response.respondSuccess({projects: result.Items});

    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}

module.exports.deleteProject = async (event, context) => {

    const data = JSON.parse(event.body);

    console.log(data);

    const params = {
        TableName: "Projects",
        Key: {
          id: data.id
        }
    }

    try {
        await ddb.delete(params).promise();
        return response.respondSuccess({success: true});
    } catch (e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}