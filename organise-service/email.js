var AWS = require('aws-sdk');
var repsonse = require('./lib/response');

module.exports.sendJoinEmail = async (email, memberWhoRequested, projectTitle) => {

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
                    Data: "<p>Hello,</p> " +
                        "<p>The following member: <b>" + memberWhoRequested + "</b> has requested to join the following project: <b>"+ projectTitle + "</b></p>"
                        + "<p>Kind Regards,</p> <p><i>Organise US</i></p>"
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "This is Text"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: memberWhoRequested + ' Has requested to join your project!'
            }
        },
        Source: 'organise-us@outlook.com'
    };

    return new AWS.SES({region: 'eu-west-1'}).sendEmail(params).promise();
}