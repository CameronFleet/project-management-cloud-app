import React from 'react';
import {
    Button,
    FormControl,
    Glyphicon,
    DropdownButton,
    MenuItem,
    Modal
} from 'react-bootstrap'
import "./Projects.css"
import ProjectPanel from "../containers/ProjectPanel";

import ProjectModal from "../containers/ProjectModal";


export default class Projects extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            show: false,
            editing: false,
            filter: 'NONE',
            searchedTitle: "",
            selectedProjects: new Array(),
            currentProject: this.blankProject()
        };
    }

    selectProject = (project) => {
        this.setState({selectedProjects: this.state.selectedProjects.concat([project])});
    }

    unselectProject = (project) => {
        var array = this.state.selectedProjects;
        array.splice(array.indexOf(project), 1);
        this.setState({selectedProjects: array});
    }

    generateProjects = () => {
        var projects = new Array();


        for (var i = 1; i < 10; i++) {

            const projectProps = {
                title: "Cloud Application Development " + i,
                description: "This is a long description, but not really too long",
                members: ["cc", "sasa"],
                startDate: "2018-10-10",
                endDate: "2019-10-10",
                projectManager: "Sasa (#98F3812LRS)",
                status: "finished",
                attributes: ["java", "css", "agile"]
            };

            projects.push(<ProjectPanel {...projectProps} selectProject={this.selectProject}
                                        unselectProject={this.unselectProject}/>);
        }

        for (; i < 20; i++) {
            const projectProps = {
                title: "Jacks Secret Plan " + i,
                description: "This is a long description, but not really too long",
                members: ["cc"],
                startDate: "2018-10-10",
                endDate: "2019-10-10",
                projectManager: "Peter",
                status: "inProgress"
            };

            projects.push(<ProjectPanel {...projectProps} selectProject={this.selectProject}
                                        unselectProject={this.unselectProject}/>);

        }

        for (; i < 30; i++) {
            const projectProps = {
                title: "Plan to kill Peter " + i,
                description: "This is a long description, but not really too long",
                members: ["cc", "sasa", "wasa"],
                startDate: "2018-10-10",
                endDate: "2019-10-10",
                projectManager: "Jack",
                status: "notStarted",
                attributes: ["css", "agile"]
            };

            projects.push(<ProjectPanel {...projectProps} selectProject={this.selectProject}
                                        unselectProject={this.unselectProject}/>);

        }

        return projects;
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

        }

        return newProjects;


    }

    handleSearch = event => {
        this.setState({[event.target.id]: event.target.value});
    }

    handleAdd = () => {
        this.showModal(false);
    }

    handleRemove = () => {
        if (this.state.selectedProjects.length == 0) {
            alert("Please select project(s) to delete.");
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
    }

    blankProject = () => {
        return {
            title: "",
            projectManager: "",
            members: [],
            startDate: "",
            endDate: "",
            status: "",
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

                <Button className="cloudButton">
                    <Glyphicon glyph="cloud-download"/>
                </Button>

                {this.props.isProjectManager &&
                <>
                    <Button className="addButton">
                        <Glyphicon glyph="plus" onClick={this.handleAdd}/>
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
                </DropdownButton>
            </>);
    }




    render() {

        var projects = this.generateProjects();

        return (
            <div className="Projects">
                <div className="Controls">
                    {this.renderControls()}
                </div>
                <div className="Display">
                    {this.renderDisplay(projects)}
                </div>

                <Modal show={this.state.show} onHide={this.hideModal}>
                    <ProjectModal currentProject={this.state.currentProject} editing={this.state.editing} hideModal={this.hideModal}/>
                </Modal>

            </div>
        );
    }
}