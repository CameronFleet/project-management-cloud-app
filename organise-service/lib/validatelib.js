
const validationString = "Invalid input: ";

const restrictions = {
    title: 50,
    description: 250
}

const error = {
    invalidTitle: validationString + "Title is more than " + restrictions.title + " characters",
    invalidDescription: validationString + "Description is more than " + restrictions.description + " characters",
    invalidDate: validationString + "End date is before your start date",
    userDoesNotExist: (user) => validationString + "The following user does not exist: " + user,
    userAlreadyExists: (user) => validationString + "The display name: [" + user + "] already exists" ,
    invalidStatus: validationString + "The project status does not exist"

}

async function getUsers() {
    const users = require('../users');
    const response = await users.getAllDisplayNames();
    const data = JSON.parse(response.body);
    const existingUsers = [];
    data.forEach(user => existingUsers.push(user.displayName.toLowerCase()));

    return existingUsers;
}

module.exports.validateUser = async ({  displayName: displayName,
                                        ...props }) => {

    var errors = [];

    if(displayName) {
        const existingUsers = await getUsers();

        if (existingUsers.includes(displayName.toLowerCase())) {
            errors.push(error.userAlreadyExists(displayName));
        }

    }

    return errors;

}

module.exports.validateProject = async ({ title: title,
                                    description: description,
                                    members: members,
                                    startDate: startDate,
                                    endDate: endDate,
                                    projectManager: projectManager,
                                    projectStatus: projectStatus,
                                    ...props}) => {

    //Get all existing users
    const existingUsers = await getUsers();

    //The valid states
    const validStates = ["inProgress", "notStarted", "finished"];

    var errors = [];

    if(title.length > restrictions.title) {
       errors.push(error.invalidTitle);
    }

    if(description.length > restrictions.description) {
        errors.push(error.invalidDescription);
    }

    members.forEach(member => {
        if(!existingUsers.includes(member.toLowerCase())) {
            errors.push(error.userDoesNotExist(member));
        }
    });


    var sDate = Date.parse(startDate);
    var eDate = Date.parse(endDate);

    if(eDate < sDate) {
        errors.push(error.invalidDate);
    }

    if(!existingUsers.includes(projectManager.toLowerCase())) {
        errors.push(error.userDoesNotExist(projectManager));
    }

    if(!validStates.includes(projectStatus)) {
        errors.push(error.invalidStatus);
    }

    return errors;

}