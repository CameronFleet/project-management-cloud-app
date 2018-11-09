import {Label, Modal, Button, Glyphicon} from "react-bootstrap";
import React from "react";
import {API, Auth} from "aws-amplify";

import "./ApproveModal.css";


class CustomLabel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {isClicked: false};
    }

    handleClick = () => {
        if (this.state.isClicked) {
            this.props.unapproveMember(this.props.member, this.props.index);
        } else {
            this.props.approveMember(this.props.member, this.props.index);
        }

        this.setState({isClicked: !this.state.isClicked});
    }

    render() {
        return (
            <h3>
                <Label className={this.state.isClicked ? "approvedMember" : "unapprovedMember"}
                       onClick={this.handleClick}>
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

        this.state = Object.assign({}, props.currentProject, {membersToApprove: [], selectedIndices: []});

    }


    approveMember = (member, index) => {
        this.setState({ membersToApprove: this.state.membersToApprove.concat([member]),
                        selectedIndices: this.state.selectedIndices.concat([index])});
    }

    unapproveMember = (member, index)=> {
        var members = this.state.membersToApprove;
        var indices = this.state.selectedIndices;

        members.splice(member, 1);
        indices.splice(index, 1)

        this.setState({ membersToApprove: members,
                        selectedIndices: indices});
    }

    handleApprove = async () => {

        try {
            console.log(this.state.selectedIndices);
            console.log(this.state.membersToApprove);
            console.log(this.props.currentProject);
            var response = await API.post("projects", "/approveMembers", {
                body: {
                    userId: this.props.authorizedUser.id,
                    projectId: this.props.currentProject.id,
                    selectedIndices: this.state.selectedIndices,
                    approvedMembers: this.state.membersToApprove
                }
            })

            if(response.error) {
                alert(response.error);
            } else {
                this.props.hideModal();
            }

        } catch (e) {
            console.log(e.message);
        }

    }

    handleReject = async () => {
        try {
            console.log(this.state.selectedIndices);
            console.log(this.props.currentProject);
            var response = await API.post("projects", "/rejectMembers", {
                body: {
                    userId: this.props.authorizedUser.id,
                    projectId: this.props.currentProject.id,
                    selectedIndices: this.state.selectedIndices
                }
            })

            if(response.error) {
                alert(response.error);
            } else {
                this.props.hideModal();
            }

        } catch (e) {
            console.log(e.message);
        }
    }

    renderMembers(members) {

        var memberLabels = [];

        var index = 0;
        members.forEach(member => {memberLabels.push(<CustomLabel member={member}
                                                                  index={index}
                                                                 approveMember={this.approveMember}
                                                                 unapproveMember={this.unapproveMember}/>);
                                                                                                 index++});

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
                    <Button bsStyle="danger" onClick={this.handleReject} className="button">Reject</Button>
                    <Button bsStyle="success" onClick={this.handleApprove} className="button">Approve</Button>
                    <Button onClick={this.props.hideModal} className="button">Close</Button>
                </Modal.Footer>
            </>
        );
    }
}