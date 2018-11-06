import UserBadges from "./UserBadges";
import Modal from "react-bootstrap/es/Modal";
import FormField from "./FormField";
import BadgeForm from "./BadgeForm";
import AttributeBadges from "./AttributeBadges";
import {Button, ButtonToolbar, ControlLabel, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import React from "react";


export default class ProjectModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            projectManager: "",
            members: [],
            startDate: "",
            endDate: "",
            status: "",
            attributes: []
        }


        this.state = props.currentProject;
    }

    removeAttribute = attribute => {
        var array = this.state.attributes;
        array.splice(array.indexOf(attribute), 1);
        this.setState({attributes: array});
    }

    removeMember = member => {

        var array = this.state.members;
        array.splice(array.indexOf(member), 1);
        this.setState( {members: array});
    }

    handleStatus = value => {
        this.setState({status: value});
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});

    }

    handleAddSubmit = () => {

    }

    render() {

        const userBadges = new UserBadges([{displayName: "sasa"}, {displayName: "cc"}, {displayName: "peter"}]);

        return (
            <>
                <Modal.Header>
                    {this.props.editing
                        ? <b>Editing project</b>
                        : <b>Adding project</b>}
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={this.props.editing ? this.handleEditSubmit : this.handleAddSubmit}>
                        <FormField label="Project Title" type="text" id="title" placeholder="Enter title"
                                   value={this.state.title} onChange={this.handleChange}/>

                        <FormField label="Project Manager" type="text" id="projectManager" placeholder="Enter title"
                                   value={this.state.projectManager} onChange={this.handleChange}/>

                        <FormField label="Description" type="text" id="description" placeholder="Enter description"
                                   value={this.state.description} onChange={this.handleChange}
                                   componentClass="textarea"/>

                        <FormField label="Start Date" type="date" id="startDate" placeholder="Enter start date"
                                   value={this.state.startDate} onChange={this.handleChange}/>

                        <FormField label="End Date" type="date" id="endDate" placeholder="Enter end date"
                                   value={this.state.endDate} onChange={this.handleChange}/>

                        <BadgeForm label={"Attributes"} badgeMap={AttributeBadges.getBadgeMap()}
                                   items={this.state.attributes}
                                   addItem={attribute => this.setState({attributes: this.state.attributes.concat([attribute])})}
                                   removeItem={this.removeAttribute}/>

                        <BadgeForm label={"Members"} badgeMap={userBadges.getBadgeMap()}
                                   items={this.state.members}
                                   addItem={member => this.setState({members: this.state.members.concat([member])})}
                                   removeItem={this.removeMember}/>

                        <ControlLabel>Status</ControlLabel>
                        <ButtonToolbar>
                            <ToggleButtonGroup type="radio" name="statusOptions"
                                               defaultValue={this.state.status}
                                               onChange={this.handleStatus}>
                                <ToggleButton value="notStarted">Not Started</ToggleButton>
                                <ToggleButton value="inProgress">In Progress</ToggleButton>
                                <ToggleButton value="finished">Finished</ToggleButton>
                            </ToggleButtonGroup>
                        </ButtonToolbar>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" type="submit">Save</Button>
                    <Button onClick={this.props.hideModal}>Close</Button>
                </Modal.Footer>
            </>
        );
    }
}