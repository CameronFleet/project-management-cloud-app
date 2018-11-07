import React, {Component} from 'react';
import './App.css';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import {Link, withRouter} from 'react-router-dom';
import {LinkContainer} from 'react-router-bootstrap';
import Routes from "./Routes";
import {Auth, API} from 'aws-amplify';


function LinkItem({to, text, ...props}) {
    return (
        <LinkContainer to={to} {...props}>
            <NavItem>{text}</NavItem>
        </LinkContainer>
    );
}

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {isAuthenticated: false, isProjectManager: false, isAdmin: false}
    }

    authorize = async () => {
        const id = await Auth.currentUserInfo().then(currentUser => currentUser.id).catch(e => null);

        if (id !== null) {
            this.setState({

                isProjectManager: await API.post("users", "/authorize", {
                    body: {
                        id: id,
                        accessLevel: "project-manager"
                    }
                }).then(response => true).catch(e => false),

                isAdmin: await API.post("users", "/authorize", {
                    body: {
                        id: id,
                        accessLevel: "admin"
                    }
                }).then(response => true).catch(e => false)


            });
        } else {
            this.unauthorize();
        }


    }

    unauthorize = () => {
        this.setState({isProjectManager: false, isAdmin: false});
    }

    async componentDidMount() {
        try {
            await Auth.currentSession();
            this.setAuthenticated(true);
            await this.authorize();
        }
        catch (e) {
            if (e !== 'No current user') {
                alert(e);
            }
        }

        this.setState({isAuthenticating: false})
    }

    setAuthenticated = (authenticated) => {
        this.setState({isAuthenticated: authenticated});
    }


    handleLogout = async event => {
        try {
            await Auth.signOut();
            this.setAuthenticated(false);
            this.unauthorize();
        } catch (e) {
            alert(e.message)
        }

    }

    render() {

        const cProps = {
            isAuthenticated: this.state.isAuthenticated,
            setAuthenticated: this.setAuthenticated,
            authorize: this.authorize,
            isProjectManager: this.state.isProjectManager || this.state.isAdmin,
            isAdmin: this.state.isAdmin
        };

        return (
            <div className="App">
                <Navbar fluid collapseOnSelect>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <Link to="/">Organise Us</Link>
                        </Navbar.Brand>
                        <Navbar.Toggle/>
                    </Navbar.Header>

                    <Navbar.Collapse>

                        <Nav pullRight>
                            {!this.state.isAuthenticated ?
                                <>
                                    <LinkItem to="/signup" text="Signup"/>
                                    <LinkItem to="/login" text="Login"/>
                                </>
                                :
                                <>
                                    <LinkItem to="/profile" text="Profile" />
                                    <NavItem onClick={this.handleLogout}>Logout </NavItem>
                                </>
                            }

                        </Nav>

                        <Nav pullLeft>
                            {this.state.isAuthenticated &&
                                <>
                                    <LinkItem to="/projects" text="Projects" />
                                </>
                            }

                            {this.state.isAdmin &&
                                <>
                                    <LinkItem to="/admin" text="Admin" />
                                </> }

                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Routes childProps={cProps}/>
            </div>
        );
    }
}

export default withRouter(App);