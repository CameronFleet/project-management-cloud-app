import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import Amplify from 'aws-amplify';
import config from "./config";

Amplify.configure({
    Auth: {
        mandatorySignIn: true,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID

    },
    API: {
        iam_region: 'eu-west-2',
        endpoints: [
            {
                name: "users",
                endpoint: config.apiGateway.USERS_URL,
                region: config.apiGateway.REGION
            },
            {
                name: "projects",
                endpoint: config.apiGateway.PROJECTS_URL,
                region: config.apiGateway.REGION
            },
            {
                name: "email",
                endpoint: config.apiGateway.EMAIL_URL,
                region: config.apiGateway.REGION
            }
        ]
    }
});

ReactDOM.render(<BrowserRouter>
                    <App />
                </BrowserRouter>, document.getElementById('root'));

