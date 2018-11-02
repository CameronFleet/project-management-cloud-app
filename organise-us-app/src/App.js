import React, {Component} from 'react';
import './App.css';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Routes from "./Routes";


function LinkItem ({to, text, ...props}) {
    return(
    <LinkContainer to={to} {...props}>
        <NavItem>{text}</NavItem>
    </LinkContainer>
    );
}

class App extends Component {
    render() {
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
                            <LinkItem to="/signup" text="Signup" />
                            <LinkItem to="/login" text="Login" />
                        </Nav>
                        <Nav pullLeft>
                            <LinkItem to="/projects" text="Projects" />
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Routes/>
            </div>
        );
    }
}

export default withRouter(App);