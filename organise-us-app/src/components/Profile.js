
import React from 'react';
import {Panel, Button, ControlLabel, Well, Alert} from 'react-bootstrap';

import "./Profile.css";
import FormField from "../containers/FormField";
import BadgeForm from "../containers/BadgeForm";
import AttributeBadges from "../containers/AttributeBadges";
import { API, Auth} from 'aws-amplify';


export default class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.state = Object.assign({} , {showSuccess: false,
            showFailure: false}, this.props.authorizedUser);


    }

    loadFromCloud = async() =>  {
        try {
            const response = await API.post("users", "/profile", {body: {id: this.props.authorizedUser.id}});
            this.setState(response.profile.Item);

        } catch (e) {
            alert(e.message);
        }
    }

    removeAttribute = attribute => {
        var array = this.state.attributes;
        array.splice(array.indexOf(attribute), 1);
        this.setState({attributes: array});
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});

    }

    handleSubmit = async () => {
        if(this.id !== null) {
            try {
                await API.post("users", "/update/profile", {body: {id: this.state.id, displayName: this.state.displayName,
                                                            pitch: this.state.pitch, attributes: this.state.attributes}});
                await this.loadFromCloud();
                await this.props.authorize();
                this.setState({showSuccess: true});
            } catch(e) {
                this.setState({showFailure: true});
                console.log(e.message);
            }
        }
    }

    render() {
        return (
            <div>
                {this.state.showSuccess &&
                <Alert bsStyle="success" onDismiss={() => this.setState({showSuccess: false})}>
                    <strong>Successfully Updated!</strong> your profile changes have been made.
                </Alert>}

                {this.state.showFailure &&
                <Alert bsStyle="danger" onDismiss={() => this.setState({showFailure: false})}>
                    <strong>Ooops!</strong> unable to update your profile!
                </Alert>}

                <Panel className="Profile">
                    <Panel.Heading>
                        Profile
                    </Panel.Heading>
                    <Panel.Body>
                        <ControlLabel>Role</ControlLabel>
                        <Well>{this.state.userRole}</Well>
                        <FormField label="Display Name" type="text" id="displayName" placeholder="Enter display name"
                                   value={this.state.displayName} onChange={this.handleChange}/>
                        <FormField label="Pitch" type="text" id="pitch" placeholder="Enter pitch"
                                   value={this.state.pitch} onChange={this.handleChange} componentClass="textarea"/>
                        <BadgeForm label={"Attributes"} badgeMap={AttributeBadges.getBadgeMap()}
                                   items={this.state.attributes}
                                   addItem={attribute => this.setState({attributes: this.state.attributes.concat([attribute])})}
                                   removeItem={this.removeAttribute} />

                    </Panel.Body>

                    <Panel.Footer className="footer">
                        <Button bsStyle="primary" bsSize="large" onClick={this.handleSubmit} className="save">Save</Button>
                    </Panel.Footer>
                </Panel>
            </div>
        );
    }
}