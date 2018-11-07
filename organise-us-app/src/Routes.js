import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from "./components/Home";
import Default from "./components/Default";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Projects from "./components/Projects";
import Admin from "./components/Admin";
import Profile from "./components/Profile";
import AuthenticatedRoute from "./containers/AuthenticatedRoute";
import UnathenticatedRoute from "./containers/UnauthenticatedRoute";
import AdminRoute from "./containers/AdminRoute";

export default ({childProps}) =>
    <Switch>
        <Route path="/" exact component={Home}  />
        <AuthenticatedRoute path="/projects" exact component={Projects} props={childProps} />
        <AuthenticatedRoute path="/profile" exact component={Profile} props={childProps} />
        <AdminRoute path="/admin" exact component={Admin} props={childProps} />
        <UnathenticatedRoute path="/login" exact component={Login} props={childProps} />
        <UnathenticatedRoute path="/signup" exact component={SignUp} props={childProps} />

        <Route component={Default} />
    </Switch>

