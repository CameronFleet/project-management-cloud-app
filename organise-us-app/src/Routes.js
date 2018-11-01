import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from "./components/Home";
import Default from "./components/Default";

export default () =>
    <Switch>
        <Route path="/" exact component={Home} />
        <Route component={Default} />
    </Switch>

