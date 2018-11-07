import React from 'react';
import {ButtonToolbar, Modal, ToggleButton, ToggleButtonGroup, Well, Button} from 'react-bootstrap';
import FormField from "./FormField";
import AttributeBadges from "./AttributeBadges";
import BadgeForm from "./BadgeForm";

export default class UserModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = this.props;
    }

    removeAttribute = attribute => {
        var array = this.state.attributes;
        array.splice(array.indexOf(attribute), 1);
        this.setState({attributes: array});
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    render() {
        return(
            <>
                <Modal.Header>
                    <h4>Editing User</h4>
                </Modal.Header>

                <Modal.Body>
                    <Well><b>ID: </b>{this.props.id}</Well>

                    <FormField label="Display name" type="text" id="displayName" placeholder="Enter display name"
                               value={this.state.displayName} onChange={this.handleChange}/>

                    <FormField label="Pitch" type="text" id="pitch" placeholder="Enter pitch"
                               value={this.state.pitch} onChange={this.handleChange} componentClass="textarea"/>

                    <BadgeForm label={"Attributes"} badgeMap={AttributeBadges.getBadgeMap()}
                               items={this.state.attributes}
                               addItem={attribute => this.setState({attributes: this.state.attributes.concat([attribute])})}
                               removeItem={this.removeAttribute}/>

                    <ButtonToolbar>
                        <ToggleButtonGroup type="radio" name="statusOptions"
                                           defaultValue={this.state.role}
                                           onChange={value => this.setState({role: value})}>
                            <ToggleButton value="developer">Developer</ToggleButton>
                            <ToggleButton value="project-manager">Project Manager</ToggleButton>
                            <ToggleButton value="admin">Admin</ToggleButton>
                        </ToggleButtonGroup>
                    </ButtonToolbar>

                </Modal.Body>

                <Modal.Footer>
                    <Button bsStyle="primary">Save</Button>
                </Modal.Footer>
            </>
        );
    }
}