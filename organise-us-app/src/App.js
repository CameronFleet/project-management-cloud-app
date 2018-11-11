import React, {Component} from 'react';
import {Navbar, Nav, NavItem, Glyphicon} from 'react-bootstrap';
import {Link, withRouter} from 'react-router-dom';
import {LinkContainer} from 'react-router-bootstrap';
import Routes from "./Routes";
import {Auth, API} from 'aws-amplify';

import './App.css';

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
        this.state = {isAuthenticated: false, isAuthenticating: true, isProjectManager: false, isAdmin: false, authorizedUser: null}
    }

    async componentDidMount() {
        try {
            var response = await Auth.currentSession();

            await this.authorize(response.accessToken.jwtToken);
            this.setAuthenticated(true);

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


    authorize = async (token) => {

        try {
            var response = await API.post("users", "/authorize", {body: {token: token}});
            console.log(response);


            const user = await API.post("users", "/profile", {
                body: {
                    id: response.id
                }
            }).then(response => response.profile.Item).catch(e => null);


            this.setState({
                isProjectManager: response.isProjectManager,
                isAdmin: response.isAdmin,
                authorizedUser: user
            });

            return;

        } catch (e) {
            this.unauthorize();
            alert(e);
        }
    }

    unauthorize = () => {
        this.setState({isProjectManager: false, isAdmin: false, authorizedUser: null});
    }



    handleLogout = async event => {
        try {
            await Auth.signOut();
            this.setAuthenticated(false);
            this.unauthorize();
            this.props.history.push("/login");
        } catch (e) {
            alert(e.message)
        }

    }

    render() {

        return (
            (!this.state.isAuthenticating &&
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
                                    <LinkContainer to="/profile">
                                        <NavItem className="profile-nav">
                                            <Glyphicon glyph="user" className="profile"/>
                                        </NavItem>
                                    </LinkContainer>
                                    <NavItem onClick={this.handleLogout}>Logout </NavItem>
                                </>
                            }

                        </Nav>

                        <Nav pullLeft>
                            {this.state.isAuthenticated &&
                            <>
                                <LinkItem to="/projects" text="Projects"/>
                            </>
                            }

                            {this.state.isAdmin &&
                            <>
                                <LinkItem to="/admin" text="Admin"/>
                            </>}

                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Routes childProps={{
                    isAuthenticated: this.state.isAuthenticated,
                    setAuthenticated: this.setAuthenticated,
                    authorize: this.authorize,
                    isProjectManager: this.state.isProjectManager || this.state.isAdmin,
                    isAdmin: this.state.isAdmin,
                    authorizedUser: this.state.authorizedUser
                }}/>
            </div>)
        );
    }
}

export default withRouter(App);