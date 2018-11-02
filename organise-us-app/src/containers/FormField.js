import {ControlLabel, FormControl, FormGroup} from "react-bootstrap";
import React from "react";

export default ({label, id, ...props}) => {
    return( <FormGroup controlId={id} bsSize="large">
                <ControlLabel>{label}</ControlLabel>
                <FormControl {...props} />
            </FormGroup>);
}