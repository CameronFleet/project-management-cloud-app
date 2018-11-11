var AWS = require('aws-sdk');
var response = require('./lib/response');
var https = require('https');

var ddb = new AWS.DynamoDB.DocumentClient();

var jose = require('node-jose');


/*** ADAPTED FROM https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.js ***/
verifyToken = (token, callback) => {

    const JWK_URL = "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_X1bTVjc7l/.well-known/jwks.json";

    var sections = token.split('.');

    // get the kid from the headers prior to verification
    var header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    var kid = header.kid;
    console.log(kid);

    // download the public keys
    https.get(JWK_URL, function (result) {

        if (result.statusCode == 200) {

            console.log("Response", result);

            result.on('data', function (body) {
                var keys = JSON.parse(body)['keys'];
                console.log("Keys", keys);

                // search for the kid in the downloaded public keys
                var key_index = -1;
                for (var i = 0; i < keys.length; i++) {
                    if (kid == keys[i].kid) {
                        key_index = i;
                        break;
                    }
                }

                if (key_index == -1) {
                    console.log('Public key not found in jwks.json');
                    callback('Public key not found in jwks.json', null);

                }

                // construct the public key
                jose.JWK.asKey(keys[key_index]).then(function (result) {

                    // verify the signature
                    jose.JWS.createVerify(result).verify(token).then(function (result) {

                        // now we can use the claims
                        var payload = JSON.parse(result.payload);
                        console.log("PAYLOAD", payload);
                        callback(null, payload.sub);

                        // // additionally we can verify the token expiration
                        // current_ts = Math.floor(new Date() / 1000);
                        // if (current_ts > claims.exp) {
                        //     console.log('Token Expired');
                        //     callback(null, response.respondFailure({error: 'Token Expired'}));
                        // }

                    }).catch(function () {
                        console.log('Signature verification failed');
                        callback('Signature verification failed', null);
                    });
                });
            });
        }
    });
}


module.exports.authorize = (event, context, callback) => {

    var data = JSON.parse(event.body);
    console.log(data.token);

    verifyToken(data.token, (err, sub) => {

        if(err) {
            callback(null, response.respondError([err]));
            return;
        }
        else {
            console.log("HERE IS SUB", sub);
            const params = {
                TableName: "User",
                Key: {
                    id: sub
                }
            };

            ddb.get(params, (err, data) => {

                if(err || data === {}) {
                    console.log("Username not found");
                    callback(null, response.respondFailure({allowed: false, error: "Username not found"}));
                    return;
                }

                console.log(data);

                const userAccessLevel = data.Item.userRole;
                console.log(userAccessLevel);

                const isAdmin = userAccessLevel === "admin" ? true : false;
                const isProjectManager = userAccessLevel === "project-manager" ? true : false;

                callback(null, response.respondSuccess({isAdmin: isAdmin, isProjectManager: isProjectManager, id: sub}));

            });
        }
    })

}

