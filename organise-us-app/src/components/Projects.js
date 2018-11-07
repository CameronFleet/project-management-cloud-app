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
import {API} from 'aws-amplify'

import "./Projects.css"
import ProjectPanel from "../containers/ProjectPanel";

import ProjectModal from "../containers/ProjectModal";


export default class Projects extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            show: false,
            editing: false,
            isDeleting: false,
            filter: 'NONE',
            searchedTitle: "",
            selectedProjects: [],
            projects: [],
            currentProject: this.blankProject()
        };


    }

    componentDidMount() {
        this.syncWithCloud();
    }

    selectProject = (project) => {
        this.setState({selectedProjects: this.state.selectedProjects.concat([project])});
    }

    unselectProject = (project) => {
        var array = this.state.selectedProjects;
        array.splice(array.indexOf(project), 1);
        this.setState({selectedProjects: array});
    }

    syncWithCloud = async () => {
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

    handleSearch = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleAdd = () => {
        this.showModal(false);
    }

    handleRemove = async () => {


        if (this.state.selectedProjects.length == 1) {
            this.setState({isDeleting: true});
        } else if (this.state.selectedProjects.length == 0) {
            alert("Please select project(s) to delete.");
        } else if (this.state.selectedProjects.length > 1) {
            alert("Only one project may be deleted at a time");
        }
    }

    handleDelete = async () => {
        try {
            var params = {body: {id: this.state.selectedProjects[0].props.id}};
            await API.post("projects", "/delete", params)
            this.syncWithCloud();
            this.setState({isDeleting: false});
        } catch (e) {
            alert(e);
        }
    }

    handleEdit = () => {
        if (this.state.selectedProjects.length > 1) {
            alert("Please select just one project to edit.");
        }
        else if (this.state.selectedProjects.length == 0) {
            alert("Please select project(s) to edit.")
        } else {
            this.setState({
                currentProject: this.state.selectedProjects[0].props
            })
            this.showModal(true);
        }
    }

    showModal = editing => {
        this.setState({show: true, editing: editing});
    }

    hideModal = () => {
        this.setState({show: false, currentProject: this.blankProject()});
        this.syncWithCloud();
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

                <Button className="cloudButton" onClick={this.syncWithCloud}>
                    <Glyphicon glyph="cloud-download"/>
                </Button>

                {this.props.isProjectManager &&
                <>
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
                <div className="Display">
                    {this.renderDisplay(projects)}
                </div>

                <Modal show={this.state.show} onHide={this.hideModal}>
                    <ProjectModal currentProject={this.state.currentProject} editing={this.state.editing}
                                  hideModal={this.hideModal}/>
                </Modal>

                <Modal show={this.state.isDeleting} onHide={() => this.setState({isDeleting: false})} bsSize="sm">
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