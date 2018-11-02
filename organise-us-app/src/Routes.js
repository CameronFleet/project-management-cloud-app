import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from "./components/Home";
import Default from "./components/Default";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import PropsRoute from "./containers/PropsRoute";

export default ({childProps}) =>
    <Switch>
        <Route path="/" exact component={Home}  />
        <PropsRoute path="/login" exact component={Login} props={childProps}/>
        <Route path="/signup" exact component={SignUp} />
        <Route component={Default} />
    </Switch>

