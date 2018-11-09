import React from 'react';
import {
    Button,
    FormControl,
    Glyphicon,
    DropdownButton,
    MenuItem,
    Modal,
    Alert
} from 'react-bootstrap'
import {API, Auth} from 'aws-amplify'

import "./Projects.css"
import ProjectPanel from "../containers/ProjectPanel";

import ProjectModal from "../containers/ProjectModal";
import ApproveModal from "../containers/ApproveModal";
import UserBadges from "../containers/UserBadges";
import DynamicAlert from "../containers/DynamicAlert";

export default class Projects extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            show: false,
            showApprove: false,
            editing: false,
            isDeleting: false,
            filter: 'NONE',
            sort: 'ALPHABETICALLY',
            searchedTitle: "",
            selectedProjects: [],
            projects: [],
            currentProject: this.blankProject(),
            alert: false,
            userBadgeMap: undefined,
            alertMessage: {success: false, message: ""}
        };


    }

    componentDidMount() {
        this.syncWithCloud(true);
    }

    selectProject = (project) => {
        this.setState({selectedProjects: this.state.selectedProjects.concat([project])});
    }

    unselectProject = (project) => {
        var array = this.state.selectedProjects;
        array.splice(array.indexOf(project), 1);
        this.setState({selectedProjects: array});
    }

    showAlert = (success, message) => {
        this.setState({alert: true, alertMessage: {success: success, message: message}});
    }

    hideAlert = () => {
        this.setState({alert: false, alertMessage: {success: false, message: ""}});

    }

    syncWithCloud = async (silent) => {
        try {
            const result = await API.get("projects", "/getAll", {});

            console.log(result);

            const projects = result.projects;
            console.log(projects);

            var projectPanels = [];

            for (var i = 0; i < projects.length; i++) {
                projectPanels.push(<ProjectPanel {...projects[i]} selectProject={this.selectProject}
                                                 unselectProject={this.unselectProject}/>)
            }
            this.setState({projects: projectPanels});

            if (!silent)
                this.showAlert(true, "Synced successfully");

        } catch (e) {
            alert(e);
        }
    }

    compareTitleAsc = (project1, project2) => {
        if (project1.props.title > project2.props.title)
            return 1;

        if (project1.props.title < project2.props.title)
            return -1;

        return 0;
    }

    compareTitleDsc = (project1, project2) => {
        if (project1.props.title > project2.props.title)
            return -1;

        if (project1.props.title < project2.props.title)
            return 1;

        return 0;
    }

    compareMembers = (project1, project2) => {
        if (project1.props.members.length > project2.props.members.length)
            return -1;
        if (project1.props.members.length < project2.props.members.length)
            return 1;
        return 0;
    }

    setFilter = filter => {
        this.setState({filter: filter});
    }

    setSort = sort => {
        this.setState({sort: sort});
    }

    renderDisplay(projects) {

        var newProjects = projects;

        if (this.state.searchedTitle !== "") {
            newProjects = projects.filter(project => (project.props.title.toLowerCase().includes(this.state.searchedTitle.toLowerCase())));
        }

        switch (this.state.sort) {
            case "ALPHABETICALLY":
                newProjects = newProjects.sort(this.compareTitleAsc);
                break;

            case "ALT_ALPHABETICALLY":
                newProjects = newProjects.sort(this.compareTitleDsc);
                break;

            case "MEMBERS":
                newProjects = newProjects.sort(this.compareMembers);
                break;

        }

        switch (this.state.filter) {

            case "NONE":
                break;

            case "FINISHED":
                newProjects = newProjects.filter(project => (project.props.projectStatus === "finished"));
                break;

            case "IN PROGRESS":
                newProjects = newProjects.filter(project => (project.props.projectStatus === "inProgress"));
                break;

            case "NOT STARTED":
                newProjects = newProjects.filter(project => (project.props.projectStatus === "notStarted"));
                break;

        }

        return newProjects;


    }

    getUserBadgeMap = async () => {
        try {
            const userBadges = new UserBadges();
            var userBadgeMap = await userBadges.getBadgeMap();
            return userBadgeMap;
        } catch (e) {
            console.log(e.message);
            return null;
        }
    }


    handleSearch = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleAdd = async () => {
        var newProject = this.blankProject();

        if (this.props.isProjectManager && !this.props.isAdmin) {
            newProject.projectManager = this.props.authorizedUser.displayName;
        }

        var userBadgeMap = await this.getUserBadgeMap();


        this.setState({
            currentProject: newProject,
            userBadgeMap: userBadgeMap
        });

        this.showModal(false);
    }

    handleRemove = async () => {


        if (this.state.selectedProjects.length == 1) {
            if ((this.props.authorizedUser.displayName === this.state.selectedProjects[0].props.projectManager) || this.props.isAdmin) {
                this.setState({isDeleting: true});
            } else {
                this.showAlert(false, "You cannot delete projects you are not manager of.")
            }
        } else if (this.state.selectedProjects.length == 0) {
            this.showAlert(false, "Please select project(s) to delete.");
        } else if (this.state.selectedProjects.length > 1) {
            this.showAlert(false, "Only one project may be deleted at a time.");
        }
    }

    handleDelete = async () => {
        try {
            var params = {body: {id: this.state.selectedProjects[0].props.id}};
            await API.post("projects", "/delete", params)
            this.syncWithCloud(true);
            this.setState({isDeleting: false, selectedProjects: []});
        } catch (e) {
            this.showAlert(false, e.message);
        }
    }

    handleEdit = async () => {

        if (this.state.selectedProjects.length > 1) {
            this.showAlert(false, "Please select just one project to edit.");
        }
        else if (this.state.selectedProjects.length == 0) {
            this.showAlert(false, "Please select project(s) to edit.")
        } else {

            if ((this.props.authorizedUser.displayName === this.state.selectedProjects[0].props.projectManager) || this.props.isAdmin) {
                var userBadgeMap = await this.getUserBadgeMap();

                this.setState({
                    currentProject: this.state.selectedProjects[0].props,
                    userBadgeMap: userBadgeMap
                });

                this.showModal(true);
            } else {
                this.showAlert(false, "You can only edit projects you are manager of");
            }
        }
    }

    handleJoin = async () => {
        if (this.state.selectedProjects.length == 1) {
            try {
                var response = await API.post("projects", "/join", {
                    body: {
                        userId: this.props.authorizedUser.id,
                        projectId: this.state.selectedProjects[0].props.id
                    }
                });

                if (response.error) {
                    this.showAlert(false, response.error);
                } else {
                    this.syncWithCloud(true);
                    this.showAlert(true, "Requested to join project, the project manager has been emailed. ");
                }
            } catch (e) {
                this.showAlert(false, e.message);
            }
        }
        else {
            this.showAlert(false, "Please select just one project to join.");
        }
    }

    handleApprove = async () => {
        if (this.state.selectedProjects.length > 1) {
            this.showAlert(false, "Please select just one project to approve.");
        }
        else if (this.state.selectedProjects.length == 0) {
            this.showAlert(false, "Please select project(s) to approve.")
        } else {
            this.setState({currentProject: this.state.selectedProjects[0].props})
            this.setState({showApprove: true});
        }
    }

    showModal = editing => {
        this.setState({show: true, editing: editing});
    }

    hideModal = () => {
        this.setState({show: false, currentProject: this.blankProject()});
        this.syncWithCloud(true);
    }

    hideApproveModal = () => {
        this.setState({showApprove: false, currentProject: this.blankProject()});
        this.syncWithCloud(true);

    }

    blankProject = () => {
        return {
            id: "",
            title: "",
            projectManager: "",
            members: [],
            startDate: "",
            endDate: "",
            projectStatus: "",
            attributes: []
        };
    }

    renderControls() {
        return (
            <>
                <FormControl id="searchedTitle" className="search" placeHolder="Search title"
                             value={this.state.searchedTitle} onChange={this.handleSearch}/>

                <Button className="searchButton">
                    <Glyphicon glyph="search"/>
                </Button>

                <Button className="cloudButton" onClick={() => this.syncWithCloud(false)}>
                    <Glyphicon glyph="cloud-download"/>
                </Button>


                {this.props.isProjectManager &&
                <>
                    <Button className="approveButton" onClick={this.handleApprove}>
                        <Glyphicon glyph="ok-circle"/>
                    </Button>

                    <Button className="addButton" onClick={this.handleAdd}>
                        <Glyphicon glyph="plus"/>
                    </Button>

                    <Button className="removeButton" onClick={this.handleRemove}>
                        <Glyphicon glyph="minus"/>
                    </Button>

                    <Button className="editButton" onClick={this.handleEdit}>
                        <Glyphicon glyph="pencil"/>
                    </Button>


                </>}

                <Button className="joinButton" onClick={this.handleJoin}>
                    <Glyphicon glyph="log-in"/>
                </Button>

                <Button className="controlButton" onClick={() => this.setSort("ALPHABETICALLY")} >
                    <Glyphicon glyph="sort-by-alphabet"/>
                </Button>

                <Button className="controlButton" onClick={() => this.setSort("ALT_ALPHABETICALLY")} >
                    <Glyphicon glyph="sort-by-alphabet-alt"/>
                </Button>

                <Button className="controlButton" onClick={() => this.setSort("MEMBERS")} >
                    <Glyphicon glyph="sort-by-attributes-alt"/>
                </Button>

                <DropdownButton title={this.state.filter.toLowerCase()} bsStyle="primary" className="filterButton" className="filterButton">
                    <MenuItem onClick={() => this.setFilter("NONE")}>None</MenuItem>
                    <MenuItem onClick={() => this.setFilter("FINISHED")}>Finished</MenuItem>
                    <MenuItem onClick={() => this.setFilter("IN PROGRESS")}>In Progress</MenuItem>
                    <MenuItem onClick={() => this.setFilter("NOT STARTED")}>Not Started</MenuItem>
                </DropdownButton>
            </>);
    }


    render() {

        var projects = this.state.projects;

        return (
            <div className="Projects">

                {this.state.alert &&
                <DynamicAlert success={this.state.alertMessage.success}
                              hideAlert={() => this.setState({alert: false, alertMessage: {success: false, message: ""}})}
                              timeout={3000} >
                    {this.state.alertMessage.message}
                </DynamicAlert>}

                <div className="Controls">
                    {this.renderControls()}
                </div>

                <div className="Display">
                    {this.renderDisplay(projects)}
                </div>

                <Modal show={this.state.show} onHide={this.hideModal}>
                    <ProjectModal currentProject={this.state.currentProject} editing={this.state.editing}
                                  hideModal={this.hideModal} isAdmin={this.props.isAdmin}
                                  userBadgeMap={this.state.userBadgeMap}/>
                </Modal>

                <Modal show={this.state.showApprove} onHide={() => this.setState({showApprove: false})}>
                    <ApproveModal currentProject={this.state.currentProject} hideModal={this.hideApproveModal}
                                  authorizedUser={this.props.authorizedUser}/>
                </Modal>

                <Modal show={this.state.isDeleting} onHide={() => this.setState({isDeleting: false})} className="deleteModal">
                    <Alert bsStyle="danger" onDismiss={() => this.setState({isDeleting: false})} className="deleteAlert">
                        <h4>Are you sure you want to delete this project?</h4>
                        <p>
                            If you continue with this action there is no way of recovering the project.
                        </p>
                        <p>
                            <Button bsStyle="danger" onClick={this.handleDelete}>DELETE</Button>
                        </p>
                    </Alert>
                </Modal>


            </div>
        );
    }
}