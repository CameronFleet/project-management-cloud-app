import React from 'react';
import {FormGroup, FormControl, InputGroup, Glyphicon, ControlLabel, Button, Badge} from 'react-bootstrap';

import "./BadgeForm.css";

export default class BadgeForm extends React.Component {

    constructor(props) {
        super(props);

        if (props.items) {
            var existingBadges = [];

            for (var i = 0; i < props.items.length; i++) {

                var badgeId = props.items[i].toLowerCase();
                var badge = props.badgeMap.get(badgeId);

                if(badge !== undefined) {
                    existingBadges.push({id: badgeId, badge: this.formatBadge(badgeId, badge)});
                } else {
                    existingBadges.push({id: badgeId, badge: this.formatBadge(badgeId, <Badge style={{color: 'white', backgroundColor: 'red',
                                                                                marginLeft: 3}}>unknown</Badge>)})
                }
            }

        }

        this.state = {identifier: "", badges: existingBadges};
    }


    formatBadge(badgeId, badge) {
        return (
            <>
                {badge}
                <Glyphicon glyph="remove-circle" className="tinyRemove" onClick={() => this.handleRemove(badgeId)}/>
            </>
        );
    }

    handleRemove(badgeId) {
        console.log(badgeId);

        var array = this.state.badges;
        array = array.filter(item => {return item.id !== badgeId});
        this.setState({badges: array});

        this.props.removeItem(badgeId);
    }

    validateForm = () => {
        var it = this.props.badgeMap.keys();
        var badgeId = it.next();

        while (!badgeId.done) {
            if (badgeId.value.toLowerCase() === this.state.identifier.toLowerCase()) {
                return true;
            }
            badgeId = it.next();
        }

        return false;
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleSubmit = event => {
        if (event.key === "Enter" && this.validateForm()) {

            const itemId = this.state.identifier.toLowerCase();

            var isDuplicated = false;

            this.state.badges.forEach(item => {if(item.id === itemId) isDuplicated = true});

            if (!isDuplicated) {

                this.props.addItem(itemId);

                const relatedBadge = this.props.badgeMap.get(itemId);

                this.setState({
                    badges: this.state.badges.concat({id: itemId, badge: [this.formatBadge(itemId, relatedBadge)]}),
                    identifier: ""
                });

            } else {
                this.setState({identifier: ""})
            }

        }
    }

    renderBadges() {
        var badges = []

        this.state.badges.forEach(item => badges.push(item.badge));

        return badges;
    }

    render() {

        const isFormValidated = this.validateForm();

        return (
            <>
                <ControlLabel>{this.props.label}</ControlLabel>
                <div className="Badges">
                    {this.renderBadges()}
                </div>
                <FormGroup controlId="identifier" validate={isFormValidated}>
                    <InputGroup>
                        <FormControl type="text" value={this.state.identifier} onChange={this.handleChange}
                                     onKeyPress={this.handleSubmit}/>
                        <InputGroup.Addon className={isFormValidated ? "addon-good" : "addon-bad"}>
                            {isFormValidated
                                ? <Glyphicon glyph="ok" className="ok"/>
                                : <Glyphicon glyph="remove" className="remove"/>}
                        </InputGroup.Addon>
                    </InputGroup>
                </FormGroup>
            </>
        );
    }
}