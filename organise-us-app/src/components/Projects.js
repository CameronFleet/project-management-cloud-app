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
import { API, Auth } from 'aws-amplify'

import "./Projects.css"
import ProjectPanel from "../containers/ProjectPanel";

import ProjectModal from "../containers/ProjectModal";
import ApproveModal from "../containers/ApproveModal";
import UserBadges from "../containers/UserBadges";


export default class Projects extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            show: false,
            showApprove: false,
            editing: false,
            isDeleting: false,
            filter: 'NONE',
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

            if(!silent)
                this.showAlert(true, "Synced successfully");

        } catch (e) {
            alert(e);
        }
    }

    compareTitle = (project1, project2) => {
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

    renderDisplay(projects) {

        var newProjects = projects;

        if (this.state.searchedTitle !== "") {
            newProjects = projects.filter(project => (project.props.title.toLowerCase().includes(this.state.searchedTitle.toLowerCase())));
        }

        switch (this.state.filter) {

            case "NONE":
                break;

            case "TITLE":
                newProjects = newProjects.sort(this.compareTitle);
                break;

            case "MEMBERS":
                newProjects = newProjects.sort(this.compareMembers);
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
        } catch(e) {
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
            if((this.props.authorizedUser.displayName === this.state.selectedProjects[0].props.projectManager) || this.props.isAdmin) {
                this.setState({isDeleting: true});
            } else {
                this.showAlert(false, "You cannot delete projects you are not manager of.")
            }
        } else if (this.state.selectedProjects.length == 0) {
            this.showAlert(false,"Please select project(s) to delete.");
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
            this.showAlert(false,"Please select just one project to edit.");
        }
        else if (this.state.selectedProjects.length == 0) {
            this.showAlert(false,"Please select project(s) to edit.")
        } else {

            if((this.props.authorizedUser.displayName === this.state.selectedProjects[0].props.projectManager) || this.props.isAdmin) {
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
        if(this.state.selectedProjects.length == 1) {
            try {
                await API.post("projects", "/join", {body: {userId: this.props.authorizedUser.id, projectId: this.state.selectedProjects[0].props.id}});
                this.syncWithCloud(true);
                this.showAlert(true, "Requested to join project, the project manager has been emailed. ");
            } catch(e) {
                this.showAlert(false, e.message);
            }
        }
        else {
            this.showAlert(false,"Please select just one project to join.");
        }
    }

    handleApprove = async () => {
        if (this.state.selectedProjects.length > 1) {
            this.showAlert(false,"Please select just one project to approve.");
        }
        else if (this.state.selectedProjects.length == 0) {
            this.showAlert(false,"Please select project(s) to approve.")
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
                    <Glyphicon glyph="log-in" />
                </Button>

                <DropdownButton title={this.state.filter.toLowerCase()} bsStyle="primary" className="filterButton">
                    <MenuItem onClick={() => this.setFilter("NONE")}>None</MenuItem>
                    <MenuItem onClick={() => this.setFilter("TITLE")}>Title</MenuItem>
                    <MenuItem onClick={() => this.setFilter("MEMBERS")}>Members</MenuItem>
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
                <div className="Controls">
                    {this.renderControls()}
                </div>

                {this.state.alert &&
                <Alert bsStyle={this.state.alertMessage.success ? "success" : "danger"} onDismiss={this.hideAlert}>
                    {this.state.alertMessage.message}
                </Alert>}

                <div className="Display">
                    {this.renderDisplay(projects)}
                </div>

                <Modal show={this.state.show} onHide={this.hideModal}>
                    <ProjectModal currentProject={this.state.currentProject} editing={this.state.editing}
                                  hideModal={this.hideModal} isAdmin={this.props.isAdmin} userBadgeMap={this.state.userBadgeMap}/>
                </Modal>

                <Modal show={this.state.showApprove}  onHide={() => this.setState({showApprove: false})}>
                    <ApproveModal currentProject={this.state.currentProject} hideModal={this.hideApproveModal} authorizedUser={this.props.authorizedUser}/>
                </Modal>

                <Modal show={this.state.isDeleting} onHide={() => this.setState({isDeleting: false})} >
                    <Alert bsStyle="danger" onDismiss={() => this.setState({isDeleting: false})}>
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