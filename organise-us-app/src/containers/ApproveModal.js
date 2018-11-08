import {Label, Modal, Button, Glyphicon} from "react-bootstrap";
import React from "react";

import "./ApproveModal.css";


class CustomLabel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {isClicked: false};
    }

    handleClick = () => {
        if(this.state.isClicked) {
            this.props.unapproveMember(this.props.member);
        } else {
            this.props.approveMember(this.props.member);
        }

        this.setState({isClicked: !this.state.isClicked});
    }

    render() {
        return (
            <h3>
                <Label className={this.state.isClicked ? "approvedMember" : "unapprovedMember"} onClick={this.handleClick}>
                    {this.props.member}
                    <Glyphicon glyph="ok-circle" className="approveIcon"/>
                </Label>

            </h3>
        );
    }
}

export default class ProjectModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = Object.assign({}, props.currentProject, {membersToApprove: []});

    }


    approveMember = member => {
        this.setState({membersToApprove: this.state.membersToApprove.concat([member])});
    }

    unapproveMember = member => {
        var members = this.state.membersToApprove;

        members.splice(member, 1);

        this.setState({membersToApprove: members});
    }

    handleApprove = () => {
        console.log(this.state.membersToApprove);
    }

    renderMembers(members) {

        var memberLabels = [];

        members.forEach(member => memberLabels.push(<CustomLabel member={member}
                                                                 approveMember={this.approveMember}
                                                                 unapproveMember={this.unapproveMember}/>));

        return memberLabels;
    }

    render() {
        return (
            <>
                <Modal.Header>
                    Approve members
                </Modal.Header>
                <Modal.Body className="members">
                        {this.renderMembers(this.state.pendingMembers)}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" onClick={this.handleApprove}>Approve</Button>
                    <Button onClick={this.props.hideModal}>Close</Button>
                </Modal.Footer>
            </>
        );
    }
}