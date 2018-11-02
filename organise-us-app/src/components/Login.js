import "./Login.css";
import React from 'react';
import {FormControl, ControlLabel, FormGroup, Button} from 'react-bootstrap';
import { Auth } from 'aws-amplify';
import FormField from "../containers/FormField";

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {email: "", password: ""}
    }


    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleSubmit = async event => {
        event.preventDefault();

        try {
            await Auth.signIn(this.state.email, this.state.password);
            alert("Signed in!");
            this.props.setAuthenticated(true);
            this.props.history.push("/");
        } catch(e) {
            alert(e.message);
        }
    }

    validateForm() {
        return this.state.email.length > 0 && this.state.password.length > 0;
    }


    render() {
        return (
            <div className="Login">
                <form onSubmit={this.handleSubmit}>
                    <FormField label="Email" id="email" type="email" placeholder="Enter email"
                               value={this.state.email} onChange={this.handleChange}/>
                    <FormField label="Password" id="password" type="password" placeholder="Enter password"
                               value={this.state.password} onChange={this.handleChange}/>
                    <Button
                        block
                        bsStyle="primary"
                        bsSize="large"
                        disabled={!this.validateForm()}
                        type="submit"
                    >Login </Button>
                </form>
            </div>
        );
    }

}