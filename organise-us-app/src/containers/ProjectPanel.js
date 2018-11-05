import React from "react";
import {Panel, Label, Badge} from "react-bootstrap";

import "./ProjectPanel.css";

const statusMapping = new Map();
statusMapping.set("notStarted", "danger");
statusMapping.set("inProgress", "warning");
statusMapping.set("finished", "success");

const java = <Badge className={"javaBadge"}>java</Badge>;
const css = <Badge className={"cssBadge"}>css</Badge>;
const agile = <Badge className={"agileBadge"}>agile</Badge>;

export default class ProjectPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {isClicked: false}
    }


    handleClick = event => {
        this.setState({isClicked: !this.state.isClicked});
    }


    getIsClicked() {
        return this.state.isClicked;
    }

    renderAttributes() {
        var attributes = []

        if(this.props.attributes) {
            if (this.props.attributes.java) {
                attributes.push(java);
            }

            if(this.props.attributes.css) {
                attributes.push(css);
            }

            if(this.props.attributes.agile) {
                attributes.push(agile);
            }
        }

        return attributes;
    }

    renderContent = () =>
        <>
            <Panel.Heading>{this.props.title}</Panel.Heading>
            <Panel.Heading className="project-manager">{this.props.projectManager}</Panel.Heading>
            <Panel.Body>{this.props.description}</Panel.Body>

            {this.props.attributes &&
            <div className="attributes">
                <Panel.Footer>
                    {this.renderAttributes()}
                </Panel.Footer>
            </div>
            }
            <div className="footer">
                <Panel.Footer>
                    <Label className="startDateLabel">{this.props.startDate}</Label>
                    <Label className="endDateLabel">{this.props.endDate}</Label>
                    <p className="members">{this.props.members}</p>
                </Panel.Footer>
            </div>
        </>

    render() {
        return (
            <>
                {this.state.isClicked ?
                    <Panel bsStyle="primary" onClick={this.handleClick}>
                        {this.renderContent()}
                    </Panel>
                    :
                    <Panel bsStyle={statusMapping.get(this.props.status)} onClick={this.handleClick}>
                        {this.renderContent()}
                    </Panel>
                }

            </>
        );
    }
}