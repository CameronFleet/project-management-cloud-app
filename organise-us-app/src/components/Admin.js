import React from 'react';
import {Tabs, Tab, Table, FormControl, Glyphicon, Button, Modal, Alert} from 'react-bootstrap';
import AttributeBadges from "../containers/AttributeBadges";
import UserModal from "../containers/UserModal";

import { API } from 'aws-amplify';

import "./Admin.css";


class UserRow extends React.Component {

    render() {
        return (<tr onClick={() => this.props.handleClick(this.props)}>
                    <td>{this.props.id}</td>
                    <td>{this.props.displayName}</td>
                    <td>{this.props.pitch}</td>
                    <td>{AttributeBadges.getBadges(this.props.attributes)}</td>
                    <td>{this.props.userRole}</td>
                    <td>{this.props.email}</td>
                </tr>);
    }

}

export default class Admin extends React.Component {

    constructor(props) {
        super(props);

        this.state = {users: [], currentUser: null, show: false, searchedName: "", showSuccess: false, showFailure: false}
    }

    componentDidMount() {
        this.syncWithCloud();
    }

    handleUserEdit = user => {
        console.log(user);
        this.setState({currentUser: user, show: true});
    }

    handleChange = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleSave = () => {
        this.syncWithCloud();
        this.setState({show: false});
    }

    syncWithCloud = async () => {
        try{
            var result = await API.get("users", "/getAll", {});

            const users = result.users;

            console.log(users);
            var userRows = [];


            for(var i = 0; i < users.length; i++) {
                var userProps = users[i];
                var cleanedProps = Object.assign({displayName: "", pitch: "", attributes: []}, userProps);

                userRows.push(<UserRow {...cleanedProps} handleClick={this.handleUserEdit} />);
            }

            this.setState({users: userRows});
        } catch (e) {
            alert(e.message);
        }
    }

    renderUsers(users) {
        var newUsers = users;

        if(this.state.searchedName !== "") {
            newUsers = newUsers.filter(user => user.props.displayName.toLowerCase().includes(this.state.searchedName.toLowerCase()))
        }
        return newUsers;
    }

    render() {
        return (
            <div className="Admin">

                {this.state.showSuccess &&
                <Alert bsStyle="success" onDismiss={() => this.setState({showSuccess: false})}>
                    <strong>Successfully Updated!</strong> user has been updated
                </Alert>}

                {this.state.showFailure &&
                <Alert bsStyle="danger" onDismiss={() => this.setState({showFailure: false})}>
                    <strong>Ooops!</strong> unable to update
                </Alert>}

                <Tabs defaultActiveKey={1}>
                    <Tab eventKey={1} title="Users">
                        <div className="Controls">
                            <FormControl placeholder="Search display name" id="searchedName" className="search"
                                         value={this.state.searchedName} onChange={this.handleChange}/>
                            <Button className="searchButton">
                                <Glyphicon glyph="search"/>
                            </Button>
                            <Button className="cloudButton" onClick={this.syncWithCloud}>
                                <Glyphicon glyph="cloud-download"/>
                            </Button>
                        </div>
                        <Table striped bordered condensed hover>
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Display Name</th>
                                <th>Pitch</th>
                                <th>Attributes</th>
                                <th>Role</th>
                                <th>Email</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.renderUsers(this.state.users)}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>

                <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                    <UserModal {...this.state.currentUser}
                               handleSave={this.handleSave}
                               showSuccess={() => this.setState({showSuccess: true})}
                               showFailure={() => this.setState({showFailure: true})} />
                </Modal>

            </div>);
    }
}