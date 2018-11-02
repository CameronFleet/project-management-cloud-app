import React, {Component} from 'react';
import './App.css';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Routes from "./Routes";
import { Auth } from 'aws-amplify';


function LinkItem ({to, text, ...props}) {
    return(
    <LinkContainer to={to} {...props}>
        <NavItem>{text}</NavItem>
    </LinkContainer>
    );
}

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {isAuthenticated: false}
    }

    async componentDidMount() {
        try {
            await Auth.currentSession();
            this.setAuthenticated(true);
        }
        catch(e) {
            if(e !== 'No current user') {
                alert(e);
            }
        }

        this.setState({ isAuthenticating: false} )
    }

    setAuthenticated = (authenticated) => {
        this.setState({isAuthenticated: authenticated});
    }


    handleLogout = async event => {
        try {
            await Auth.signOut();
            alert("Logged out!");
            this.setAuthenticated(false);
        } catch (e) {
            alert(e.message)
        }

    }

    render() {

        const cProps = {isAuthenticated: this.state.isAuthenticated,
                        setAuthenticated: this.setAuthenticated};

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
                                    <LinkItem to="/signup" text="Signup" />
                                    <LinkItem to="/login" text="Login" />
                                </>
                                :
                                <>
                                    <NavItem onClick={this.handleLogout}>Logout </NavItem>
                                </>
                            }

                        </Nav>

                        <Nav pullLeft>
                            {this.state.isAuthenticated ?
                                <>
                                    <LinkItem to="/projects" text="Projects" />
                                </>
                                :
                                <>
                                </>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Routes childProps={cProps} />
            </div>
        );
    }
}

export default withRouter(App);