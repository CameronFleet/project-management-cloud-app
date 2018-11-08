import React from "react";
import {
    Panel,
    Label,
    Tooltip,
    OverlayTrigger

} from "react-bootstrap";
import AttributeBadges from "./AttributeBadges";

import "./ProjectPanel.css";


const statusMapping = new Map();
statusMapping.set("notStarted", "danger");
statusMapping.set("inProgress", "warning");
statusMapping.set("finished", "success");

export default class ProjectPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isClicked: false
        }
    }

    formatMemebers(members) {
        var formattedOutput = "";

        for (var i = 0; i < members.length; i++) {
            if (i === members.length - 1) {
                formattedOutput += members[i];
            } else {
                formattedOutput += members[i] + "+"
            }
        }

        return formattedOutput;
    }


    handleClick = event => {
        this.setState({isClicked: !this.state.isClicked});

        if (!this.state.isClicked) {
            this.props.selectProject(this);
        } else {
            this.props.unselectProject(this);
        }
    }


    renderAttributes() {
        var attributes = []

        if (this.props.attributes) {
            for (var i = 0; i < this.props.attributes.length; i++) {
                attributes.push(AttributeBadges.getBadge(this.props.attributes[i]));
            }
        }

        return attributes;
    }

    renderMembers(members) {
        var labeledMembers = []
        var overflowMembers = []

        if (members) {

            for (var i = 0; i < members.length; i++) {

                if (i < 3) {
                    labeledMembers.push(<Label className="memberLabel">{members[i]}</Label>)
                } else {
                    overflowMembers.push(<Label className="memberLabel">{members[i]}</Label>)
                }
            }

            if (overflowMembers.length !== 0) {

                const tooltip = (
                    <Tooltip id="tooltip" className="overflowTooltip">
                        {overflowMembers}
                    </Tooltip>
                );

                labeledMembers.push(<OverlayTrigger placement="top" overlay={tooltip}>
                    <Label className="overflowLabel">+{overflowMembers.length}</Label>
                </OverlayTrigger>);
            }
        }

        return labeledMembers;

    }

    renderContent = () =>
        <>
            <Panel.Heading>
                {this.props.title}
            </Panel.Heading>
            <Panel.Heading className="projectManager">{this.props.projectManager}</Panel.Heading>
            <Panel.Body className="id">{this.props.id}</Panel.Body>
            <Panel.Body>{this.props.description}</Panel.Body>


            <div className="footer">

                {this.props.attributes &&
                <Panel.Footer>
                    <p>Attributes</p>
                    {this.renderAttributes()}
                </Panel.Footer>
                }

                <Panel.Footer>
                    <p>Members</p>
                    {this.renderMembers(this.props.members)}
                </Panel.Footer>

                {(this.props.pendingMembers.length !== 0) &&
                <Panel.Footer>
                    <p>Pending Members</p>
                    {this.renderMembers(this.props.pendingMembers)}
                </Panel.Footer>
                }

                <Panel.Footer>
                    <Label className="startDateLabel">{this.props.startDate}</Label>
                    <Label className="endDateLabel">{this.props.endDate}</Label>
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
                    <Panel bsStyle={statusMapping.get(this.props.projectStatus)} onClick={this.handleClick}>
                        {this.renderContent()}
                    </Panel>
                }
            </>
        );
    }
}