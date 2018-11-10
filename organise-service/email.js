var AWS = require('aws-sdk');
var repsonse = require('./lib/response');

module.exports.sendJoinEmail = async email => {

    var params = {
        Destination: {
            CcAddresses: [
            ],
            ToAddresses: [
                email,
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: "This is HTML"
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "This is Text"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Test email'
            }
        },
        Source: 'cameron-fleet@hotmail.com'
    };

    return new AWS.SES({region: 'eu-west-1'}).sendEmail(params).promise();
}