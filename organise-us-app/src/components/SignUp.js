import React from 'react';
import FormField from "../containers/FormField";

import "./SignUp.css";
import {Button} from "react-bootstrap";

export default class SignUp extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            repeatPassword: "",
            isSignedUp: false
        }
    }

    validateForm() {
        return (this.state.email.length > 0 &&
               this.state.password.length > 0 &&
               this.state.password === this.state.repeatPassword);
    }

    handleSubmit = event => {
        event.preventDefault();
        this.setState({isSignedUp: true});
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    renderConfirmation() {

    }

    renderSignUp() {
        return (
            <div className="Register" >
                <form onSubmit={this.handleSubmit}>
                    <FormField label="Email" type="email" id="email" placeholder="Enter email" value={this.state.email}
                               onChange={this.handleChange}/>
                    <FormField label="Password" type="password" id="password" placeholder="Enter password"
                               value={this.state.password} onChange={this.handleChange}/>

                    <FormField label="Repeat Password" type="password" id="repeatPassword" placeholder="Repeat password"
                               value={this.state.repeatPassword} onChange={this.handleChange}/>

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