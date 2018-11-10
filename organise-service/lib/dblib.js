var AWS = require('aws-sdk');
var response = require('./response');


const ddb = new AWS.DynamoDB.DocumentClient();


module.exports.getItem = async (key, table, resultantStructure) => {


    const params = {
        TableName: table,
        Key : key
    }

    try {
        const result = await ddb.get(params).promise();
        return response.respondSuccess({[resultantStructure]: result});
    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }

}

module.exports.putItem = async (item, table) => {


    const params = {
        TableName: table,
        Item: item
    }

    try {
        await ddb.put(params).promise();
        return response.respondSuccess(params.Item);

    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}

module.exports.getAllItems = async (resultantStructure, table) => {


    const params = {
        TableName: table
    }

    try {
        const result = await ddb.scan(params).promise();
        console.log(result);
        return response.respondSuccess({[resultantStructure]: result.Items});

    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}

module.exports.getAll = async (attributes, table) => {
    const params = {
        TableName: table,
        AttributesToGet: attributes
    }

    try {
        const result = await ddb.scan(params).promise();
        console.log(result);
        return response.respondSuccess(result.Items);

    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}


module.exports.updateItem = async (params) => {


    try {
        await ddb.update(params).promise();
        return response.respondSuccess({success: true});
    } catch(e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}


module.exports.deleteItem = async (key, table) => {


    const params = {
        TableName: table,
        Key: key
    }

    try {
        await ddb.delete(params).promise();
        return response.respondSuccess({success: true});
    } catch (e) {
        console.log(e);
        return response.respondFailure({status: false});
    }
}