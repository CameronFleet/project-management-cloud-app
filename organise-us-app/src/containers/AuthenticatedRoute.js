import React from 'react';
import { Route, Redirect} from 'react-router-dom';
import { API } from 'aws-amplify';


export default ({props: cProps, component: C, ...rest}) =>
    <Route {...rest} render={
        props =>
            cProps.isAuthenticated
                ? <C {...props} {...cProps} />
                : <Redirect
                    to={"/login"}
                />}/>;

