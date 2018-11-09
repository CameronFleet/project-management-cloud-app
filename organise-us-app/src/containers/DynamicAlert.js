import {Alert} from "react-bootstrap";
import React from "react";

import "./DynamicAlert.css";

export default class DynamicAlert extends React.Component{

    constructor(props) {
        super(props);

        this.state = {show: true}

        setTimeout(this.timeout, props.timeout);
    }

    timeout = () =>  {
        this.setState({show: false});
        this.props.hideAlert();
    }

    render() {
        return (
            <>
            {this.state.show &&
            <Alert bsStyle={this.props.success ? "success" : "danger"} onDismiss={this.props.hideAlert} className="alert">
                {this.props.children}
            </Alert>
            }
            </>
        );
    }

}