import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from "./components/Home";
import Default from "./components/Default";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Projects from "./components/Projects";
import AuthenticatedRoute from "./containers/AuthenticatedRoute";
import UnathenticatedRoute from "./containers/UnauthenticatedRoute";

export default ({childProps}) =>
    <Switch>
        <Route path="/" exact component={Home}  />
        <AuthenticatedRoute path="/projects" exact component={Projects} props={childProps} />
        <UnathenticatedRoute path="/login" exact component={Login} props={childProps} />
        <UnathenticatedRoute path="/signup" exact component={SignUp} props={childProps} />
        <Route component={Default} />
    </Switch>

