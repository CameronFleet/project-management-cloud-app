import React from 'react';
import { Auth, API } from 'aws-amplify';
import FormField from "../containers/FormField";

import "./SignUp.css";
import {Button, Checkbox} from "react-bootstrap";

export default class SignUp extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            repeatPassword: "",
            displayName: "",
            isSignedUp: false,
            acceptedTerms: false,
            confirmation: ""
        }
    }

    validateForm() {
        return (this.state.email.length > 0 &&
            this.state.password.length > 0 &&
            this.state.password === this.state.repeatPassword) &&
            this.state.acceptedTerms &&
            this.state.displayName.length > 0;
    }

    handleSubmit = async event => {
        event.preventDefault();

        try {
            var response = await API.post("users", "/validate", {body: {displayName: this.state.displayName}});

            if(response.error) {
                alert(response.error);
                return;
            }

            await Auth.signUp({
                username: this.state.email,
                password: this.state.password
            });

            this.setState({isSignedUp: true});
            alert("Signed Up!");

        } catch(e) {
            if(e.code === "UsernameExistsException") {
                this.setState({isSignedUp: true});
            } else {
                alert(e.message);
            }
        }

    }

    handleConfirmation = async event => {
        event.preventDefault();

        try {
            await Auth.confirmSignUp(this.state.email, this.state.confirmation);

            alert("Account Confirmed");

            var response = await Auth.signIn(this.state.email, this.state.password);

            console.log(response);

            alert("Signed in");

            //Probably a massive security flaw
            await API.post("users","/create/dev", { body: {id: response.username, displayName: this.state.displayName, email: this.state.email} });

            this.props.setAuthenticated(true);
            await this.props.authorize(response.signInUserSession.accessToken.jwtToken);

            this.props.history.push("/");
        } catch (e) {
            alert(e.message);
        }
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    renderConfirmation() {
        return (
            <div className="Confirmation">
                <form onSubmit={this.handleConfirmation}>
                    <FormField label="Confirmation Code" type="text" id="confirmation" placeholder="Enter Code"
                               value={this.state.confirmation} onChange={this.handleChange}/>

                    <Button block
                            bsStyle="primary"
                            bsSize="large"
                            disabled={!(this.state.confirmation > 0)}
                            type="submit"
                    >
                        Confirm
                    </Button>
                </form>
            </div>
        );
    }

    renderSignUp() {
        return (
            <div className="Register">
                <form onSubmit={this.handleSubmit}>
                    <FormField label="Email" type="email" id="email" placeholder="Enter email" value={this.state.email}
                               onChange={this.handleChange}/>
                    <FormField label="Choose Password" type="password" id="password" placeholder="Enter password"
                               value={this.state.password} onChange={this.handleChange}/>

                    <FormField label="Confirm Password" type="password" id="repeatPassword" placeholder="Enter password"
                               value={this.state.repeatPassword} onChange={this.handleChange}/>

                    <FormField label="Display name" type="text" id="displayName" placeholder="Enter display name"
                               value={this.state.displayName} onChange={this.handleChange}/>

                    <Checkbox onChange={() => this.setState({acceptedTerms: !this.state.acceptedTerms})}>
                        Do you accept the <a href="https://www.google.com">T&C?</a>
                    </Checkbox>

                    <Button
                        block
                        bsStyle="primary"
                        bsSize="large"
                        disabled={!this.validateForm()}
                        type="submit"
                    >Register </Button>
                </form>
            </div>
        );
    }

    render() {
        return (
            <div className="Signup">
                {this.state.isSignedUp ?
                    this.renderConfirmation() :
                    this.renderSignUp()}
            </div>
        );
    }
}