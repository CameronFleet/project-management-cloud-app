import {Badge} from "react-bootstrap";
import React from "react";
import "./AttributeBadges.css";

const java = <Badge className={"javaBadge"}>java</Badge>;
const css = <Badge className={"cssBadge"}>css</Badge>;
const agile = <Badge className={"agileBadge"}>agile</Badge>;

const attributeMapping = new Map();
attributeMapping.set("java", java);
attributeMapping.set("css", css);
attributeMapping.set("agile", agile);

export default class AttributeBadges {

    static getBadge(identifier) {
        return attributeMapping.get(identifier);
    }

    static getBadgeMap() {
        return attributeMapping;
    }

}