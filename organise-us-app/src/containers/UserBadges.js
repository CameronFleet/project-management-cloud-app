import React from 'react'
import {Badge} from "react-bootstrap";
import { API } from 'aws-amplify';

export default class UserBadges {

    getBadgeMap = async () => {
        try {
            var response = await API.get("users", "/getAll/displayNames", {});

            var userMapping = new Map();

            response.forEach(user => {
                userMapping.set(user.displayName.toLowerCase(),
                    <Badge style={{
                        color: 'white',
                        marginLeft: 3
                    }}>{user.displayName}</Badge>)
            })

            return userMapping;
        } catch(e) {
            console.log(e);
        }
    }
}
