import React from 'react';
import {Tabs, Tab, Table, FormControl, Glyphicon, Button, Modal} from 'react-bootstrap';
import AttributeBadges from "../containers/AttributeBadges";
import UserModal from "../containers/UserModal";
import "./Admin.css";

export default class Admin extends React.Component {

    constructor(props) {
        super(props);

        this.state = {users: [], currentUser: null, show: false}
    }

    componentDidMount() {
        this.syncWithCloud();
    }

    handleUserEdit = user => {
        console.log(user);
        this.setState({currentUser: user, show: true});
    }

    syncWithCloud = () => {
        var users = []

        for (var i = 0; i < 30; i++) {
            var userProps = {id: "eu-west-2:7af3b1b1-5bc5-4d1d-bcb3-ab40cea00456",
                             displayName: "Test user: "+ i,
                             pitch: "My pitch is better than Test user:" + (i > 0 ? i - 1 : i),
                             attributes: ["java", "css"],
                             role: "developer" }
            users.push(userProps);
        }

        var userRows = [];

        users.forEach(userProps => {userRows.push( <tr onClick={() => {this.handleUserEdit(userProps)}}>
                                                        <td>{userProps.id}</td>
                                                        <td>{userProps.displayName}</td>
                                                        <td>{userProps.pitch}</td>
                                                        <td>{AttributeBadges.getBadges(userProps.attributes)}</td>
                                                        <td>{userProps.role}</td>
                                                     </tr>)});

        this.setState({users: userRows});
    }

    render() {
        return (
            <div className="Admin">
                <Tabs defaultActiveKey={1}>
                    <Tab eventKey={1} title="Users">
                        <div className="Controls">
                            <FormControl placeholder="Search display name" className="search"/>
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
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.users}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>

                <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                    <UserModal {...this.state.currentUser} />
                </Modal>

            </div>);
    }
}