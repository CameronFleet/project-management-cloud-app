import {Redirect, Route} from "react-router-dom";
import React from "react";

export default ({props: cProps, component: C, ...rest}) => {

    return <Route {...rest} render={
        props =>
            (cProps.isProjectManager || cProps.isAdmin)
                ? <C {...props} {...cProps} />
                : <Redirect
                    to={"/"}
                />}/>;
}