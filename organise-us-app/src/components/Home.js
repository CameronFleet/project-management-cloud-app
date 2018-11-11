import React from 'react';
import {Panel} from 'react-bootstrap';
import ProjectPanel from "../containers/ProjectPanel";
import {API} from 'aws-amplify';

import "./Home.css";


export default class Home extends React.Component {


    constructor(props) {
        super(props);
        this.state = {currentProjects: [], pendingProjects: [], ownedProjects: [], authorized: false}
    }

    async componentDidMount() {
        await this.syncWithCloud(this.props);
    }

    async componentWillReceiveProps(props) {
        await this.syncWithCloud(props);
    }

    syncWithCloud = async (props) => {
        console.log(props);

        if (props.authorizedUser) {
            try {
                const result = await API.get("projects", "/getAll", {});
                const projects = result.projects;

                var currentProjects = [];
                var pendingProjects = [];
                var ownedProjects = [];

                const displayName = props.authorizedUser.displayName;

                for (var i = 0; i < projects.length; i++) {
                    var projectPanel = <ProjectPanel {...projects[i]} displayOnly className="projectPanel"/>;

                    if (projects[i].members.includes(displayName) || projects[i].members.includes(displayName.toLowerCase())) {
                        currentProjects.push(projectPanel);
                    }

                    if (projects[i].pendingMembers.includes(displayName) || projects[i].pendingMembers.includes(displayName.toLowerCase())) {
                        pendingProjects.push(projectPanel);
                    }

                    if (projects[i].projectManager === displayName || projects[i].projectManager === displayName.toLowerCase()) {
                        ownedProjects.push(projectPanel);
                    }
                }
                this.setState({
                    currentProjects: currentProjects,
                    pendingProjects: pendingProjects,
                    ownedProjects: ownedProjects,
                    authorized: true
                });
            } catch (e) {
                alert(e);
            }
        }
    }


    render() {
        return (
            <div className="Home">

                {this.state.authorized &&
                <div className="MyProjects">

                    <Panel bsStyle="info" defaultCollapsed>
                        <Panel.Heading>
                            <Panel.Title toggle>
                                <h1>My Projects ({this.state.currentProjects.length})</h1>
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Collapse>
                            {this.state.currentProjects}
                        </Panel.Collapse>
                    </Panel>

                    <Panel bsStyle="warning" defaultCollapsed>
                        <Panel.Heading>
                            <Panel.Title toggle>
                                <h1>Pending Approval ({this.state.pendingProjects.length})</h1>
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Collapse>
                            {this.state.pendingProjects}
                        </Panel.Collapse>
                    </Panel>

                    {this.props.isProjectManager &&
                    <Panel bsStyle="primary" defaultCollapsed>
                        <Panel.Heading>
                            <Panel.Title toggle>
                                <h1>Managed Projects ({this.state.ownedProjects.length})</h1>
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Collapse>
                            {this.state.ownedProjects}
                        </Panel.Collapse>
                    </Panel>
                    }

                </div>
                }
            </div>

        );
    }
}