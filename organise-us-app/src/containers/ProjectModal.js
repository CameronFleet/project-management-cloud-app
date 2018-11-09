import UserBadges from "./UserBadges";
import Modal from "react-bootstrap/es/Modal";
import FormField from "./FormField";
import BadgeForm from "./BadgeForm";
import AttributeBadges from "./AttributeBadges";
import {Button, ButtonToolbar, ControlLabel, ToggleButton, ToggleButtonGroup, Well} from "react-bootstrap";
import React from "react";
import {API} from "aws-amplify";


export default class ProjectModal extends React.Component {

    constructor(props) {
        super(props);
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
        this.setState({members: array});
    }

    handleStatus = value => {
        this.setState({projectStatus: value});
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});

    }

    handleAddSubmit = async () => {
        console.log(this.state);

        try {
            var response = await API.post("projects", "/createProject", {body: this.state});

            if(response.error) {
                alert(response.error);
            } else {
                this.props.hideModal();
            }
        } catch (e) {
            alert(e.message);
        }

    }

    handleEditSubmit = async () => {
        console.log(this.state);

        try {
            await API.post("projects", "/updateProject", {body: this.state});
            this.props.hideModal();
        } catch(e) {
            alert(e.message);
        }
    }

    render() {

        return (
            <>
                <Modal.Header>
                    {this.props.editing
                        ? <h4>Editing project</h4>
                        : <h4>Adding project</h4>}
                </Modal.Header>
                <Modal.Body>
                    <FormField label="Project Title" type="text" id="title" placeholder="Enter title"
                               value={this.state.title} onChange={this.handleChange}/>

                    {this.props.isAdmin ?
                    <FormField label="Project Manager" type="text" id="projectManager" placeholder="Enter title"
                               value={this.state.projectManager} onChange={this.handleChange}/>
                    :   <>
                            <ControlLabel>Project Manager</ControlLabel>
                            <Well>{this.state.projectManager}</Well>
                        </>}

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

                    <BadgeForm label={"Members"} badgeMap={this.props.userBadgeMap}
                               items={this.state.members}
                               addItem={member => this.setState({members: this.state.members.concat([member])})}
                               removeItem={this.removeMember}/>

                    <ControlLabel>Status</ControlLabel>
                    <ButtonToolbar>
                        <ToggleButtonGroup type="radio" name="statusOptions"
                                           defaultValue={this.state.projectStatus}
                                           onChange={this.handleStatus}>
                            <ToggleButton value="notStarted">Not Started</ToggleButton>
                            <ToggleButton value="inProgress">In Progress</ToggleButton>
                            <ToggleButton value="finished">Finished</ToggleButton>
                        </ToggleButtonGroup>
                    </ButtonToolbar>

                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary"
                            onClick={this.props.editing ? this.handleEditSubmit : this.handleAddSubmit}>Save</Button>
                    <Button onClick={this.props.hideModal}>Close</Button>
                </Modal.Footer>
            </>
        );
    }
}