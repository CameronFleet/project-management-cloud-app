const uuidv4 = require('uuid/v4');

var db = require('./lib/dblib');
var response = require('./lib/response');
var validate = require('./lib/validatelib');

const TABLE_NAME = "Projects";

module.exports.createProject = async (event, context) => {

    const data = JSON.parse(event.body);
    data.id = uuidv4();
    data.pendingMembers = [];
    const errors = await validate.validateProject(data);

    if(errors.length !== 0) {
        return response.respondError(errors);
    }
    else {
        return await db.putItem(data, TABLE_NAME);
    }

}

module.exports.updateProject = async (event, context) => {

    const data = JSON.parse(event.body);
    const errors = await validate.validateProject(data);

    if(errors.length !== 0) {
        return response.respondError(errors);
    }
    else {
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
    const user = await getUserInformation(data.userId);

    console.log(data);

    const params = {
        TableName: TABLE_NAME,
        Key: {
          id: data.projectId
        },
        UpdateExpression: "SET pendingMembers = list_append(pendingMembers, :member)",
        ExpressionAttributeValues: {
            ":member": [user.displayName]
        }
    }

    return await db.updateItem(params);
}

getUserInformation = async (id) => {
    const userData = await db.getItem({id: id}, "User", "profile");
    const user = JSON.parse(userData.body);
    return user.profile.Item;
}

getProjectInformation = async (id) => {
    const projectData = await db.getItem({id: id}, TABLE_NAME, "info");
    const project = JSON.parse(projectData.body);
    return project.info.Item;
}

addUserToProject = async (user, projId) => {

    const params = {
        TableName: TABLE_NAME,
        Key: {
            id: projId
        },
        UpdateExpression: "SET members = list_append(members, :member)",
        ExpressionAttributeValues: {
            ":member": [user]
        }
    }

    return await db.updateItem(params);

}

module.exports.approveMembers = async (event) => {

    const data = JSON.parse(event.body);

    console.log(data.userId);
    console.log(data.projectId);

    const user = await getUserInformation(data.userId);
    const project = await getProjectInformation(data.projectId);


    console.log(user);
    console.log(project);

    if(user.displayName === project.projectManager || user.userRole === "admin") {

        var expression = "";

        for(var i = 0; i< data.approvalIndices.length; i++) {

            if(i == data.approvalIndices.length - 1) {
                expression += " pendingMembers["+data.approvalIndices[i]+"]";
            } else {
                expression += " pendingMembers["+data.approvalIndices[i]+"],";
            }
        }

        console.log(expression);


        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: data.projectId
            },
            UpdateExpression: "REMOVE" + expression
        }

        var dbResponse = await db.updateItem(params);

        if(dbResponse.statusCode === 200) {


            console.log(data.approvedMembers);

            for(i = 0; i < data.approvedMembers.length; i++) {
                dbResponse = await addUserToProject(data.approvedMembers[i], data.projectId);


                if(dbResponse.statusCode !== 200) {
                    return dbResponse;
                }
            }

            return response.respondSuccess({confirmed: true});
        } else {
            return dbResponse;
        }


    } else {
        return response.respondFailure({status: false, reason: "NO ACCESS"});
    }

}