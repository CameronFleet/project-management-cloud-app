import React from 'react'
import {Badge} from "react-bootstrap";


export default class UserBadges {

    constructor(users) {
        this.userMapping = new Map();

        users.forEach(user => {this.userMapping.set(user.displayName,
                                                    <Badge style={{color: 'white',
                                                                   marginLeft: 3}}>{user.displayName}</Badge>)})

    }

    getBadgeMap = () => {
        return this.userMapping;
    }
}
