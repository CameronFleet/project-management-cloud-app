exports.respondSuccess = (body) => {
    return buildResponse(200, body);
}

exports.respondError = (body) => {
    return buildResponse(200, {error: body});
}

exports.respondFailure = (body) => {
    return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(body)
    }
}