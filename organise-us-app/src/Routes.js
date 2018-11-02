import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from "./components/Home";
import Default from "./components/Default";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

export default () =>
    <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/login" exact component={Login} />
        <Route path="/signup" exact component={SignUp} />
        <Route component={Default} />
    </Switch>

