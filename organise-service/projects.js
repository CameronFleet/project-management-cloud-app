const uuidv4 = require('uuid/v4');

var db = require('./lib/dblib');

const TABLE_NAME = "Projects";

module.exports.createProject = async (event, context) => {

    const data = JSON.parse(event.body);
    data.id = uuidv4();
    data.pendingMembers = [];
    return await db.putItem(data, TABLE_NAME);

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

    return await db.updateItem(params);
}

module.exports.getAllProjects = async (event, context) => {

    return await db.getAllItems("projects", TABLE_NAME);
}

module.exports.deleteProject = async (event, context) => {

    const data = JSON.parse(event.body);
    return await db.deleteItem({id: data.id}, TABLE_NAME);
}


module.exports.joinProject = async (event, context) => {

    const data = JSON.parse(event.body);

    const userData = await db.getItem({id: data.userId}, "User");

    const user = JSON.parse(userData.body);

    console.log(data);

    const params = {
        TableName: "Projects",
        Key: {
          id: data.projectId
        },
        UpdateExpression: "SET pendingMembers = list_append(pendingMembers, :member)",
        ExpressionAttributeValues: {
            ":member": [user.profile.Item.displayName]
        }
    }

    return await db.updateItem(params);
}