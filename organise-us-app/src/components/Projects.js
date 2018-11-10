import React from 'react';
import {
    Button,
    FormControl,
    Glyphicon,
    DropdownButton,
    MenuItem,
    Modal,
    Alert,
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
    OverlayTrigger
} from 'react-bootstrap'
import {API} from 'aws-amplify'

import "./Projects.css"
import ProjectPanel from "../containers/ProjectPanel";

import ProjectModal from "../containers/ProjectModal";
import ApproveModal from "../containers/ApproveModal";
import UserBadges from "../containers/UserBadges";
import DynamicAlert from "../containers/DynamicAlert";

function GlyphButton({glyph: glyph, radio: radio, tooltip: tooltip, ...props}) {

    const button = radio ?

        (<ToggleButton {...props}>
            <Glyphicon glyph={glyph}/>
        </ToggleButton>)

        : (<Button {...props}>
            <Glyphicon glyph={glyph}/>
        </Button>)

    const tip = tooltip ?   <Tooltip id="controlTooltip">
                                <strong>{tooltip.heading}</strong>
                                {tooltip.info &&
                                <p>{tooltip.info}</p>
                                }
                            </Tooltip>
                        : <></>


    return (<OverlayTrigger placement="top" overlay={tip}>
                {button}
            </OverlayTrigger>);

}


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

    compareMembersDsc = (project1, project2) => {
        if (project1.props.members.length > project2.props.members.length)
            return -1;
        if (project1.props.members.length < project2.props.members.length)
            return 1;
        return 0;
    }

    compareMembersAsc = (project1, project2) => {
        if (project1.props.members.length < project2.props.members.length)
            return -1;
        if (project1.props.members.length > project2.props.members.length)
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

        var newProjects = Object.create(projects);

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

            case "ALT_MEMBERS":
                newProjects = newProjects.sort(this.compareMembersDsc);
                break;

            case "MEMBERS":
                newProjects = newProjects.sort(this.compareMembersAsc);
                break;

            case "NONE":
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
                    this.showAlert(true, "Requested to join project, the project manager has been emailed. ");
                }

                this.syncWithCloud(true);

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

                <GlyphButton glyph="search" className="searchButton"/>
                <GlyphButton glyph="cloud-download" className="cloudButton" onClick={() => this.syncWithCloud(false)}
                             tooltip={{heading: "Sync with database"}}/>

                {this.props.isProjectManager &&
                <>
                    <GlyphButton glyph="ok-circle" className="approveButton" onClick={this.handleApprove}
                                 tooltip={{heading: "Approve members"}}/>
                    <GlyphButton glyph="plus" className="addButton" onClick={this.handleAdd}
                                 tooltip={{heading: "Add project"}}/>
                    <GlyphButton glyph="minus" className="removeButton" onClick={this.handleRemove}
                                 tooltip={{heading: "Remove project"}}/>
                    <GlyphButton glyph="pencil" className="editButton" onClick={this.handleEdit}
                                 tooltip={{heading: "Edit project"}}/>
                </>}

                <GlyphButton glyph="log-in" className="joinButton" onClick={this.handleJoin}
                             tooltip={{heading: "Join project"}}/>

                <ToggleButtonGroup type="radio" name="options" defaultValue={"NONE"} className="sortButtonGroup"
                                   onChange={value => this.setSort(value)}>
                    <GlyphButton radio glyph="sort-by-alphabet" value="ALPHABETICALLY"
                                 tooltip={{heading: "Sort by Title", info: "Lexicographical ordering on title"}}/>
                    <GlyphButton radio glyph="sort-by-alphabet-alt"  value="ALT_ALPHABETICALLY"
                                 tooltip={{heading: "Sort by Title", info: "Reverse Lexicographical ordering on title"}}/>
                    <GlyphButton radio glyph="sort-by-attributes-alt"  value="ALT_MEMBERS"
                                 tooltip={{heading: "Sort by No. Members", info: "Descending sort on number of members"}}/>
                    <GlyphButton radio glyph="sort-by-attributes"  value="MEMBERS"
                                 tooltip={{heading: "Sort by No. Members", info: "Ascending sort on number of members"}}/>
                    <GlyphButton radio glyph="sort" className="controlButton" value="NONE"
                                 tooltip={{heading: "No sorting"}}/>
                </ToggleButtonGroup>

                <DropdownButton title={this.state.filter.toLowerCase()} bsStyle="primary" className="filterButton"
                                className="filterButton">
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
                              hideAlert={() => this.setState({
                                  alert: false,
                                  alertMessage: {success: false, message: ""}
                              })}
                              timeout={3000}>
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

                <Modal show={this.state.isDeleting} onHide={() => this.setState({isDeleting: false})}
                       className="deleteModal">
                    <Alert bsStyle="danger" onDismiss={() => this.setState({isDeleting: false})}
                           className="deleteAlert">
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