import React from 'react';
import {Button, FormControl, Glyphicon, DropdownButton, MenuItem, Badge} from 'react-bootstrap'
import "./Projects.css"
import ProjectPanel from "../containers/ProjectPanel";

export default class Projects extends React.Component {


    constructor(props) {
        super(props);

        this.state = {filter: 'NONE', searchedTitle: "", projectSelectedCount: 0};
    }

    generateProjects = () => {
        var projects = new Array();


        for (var i = 1; i < 10; i++) {

            const projectProps = {
                title: "Cloud Application Development " + i,
                description: "This is a long description, but not really too long",
                members: "cc + sasa",
                startDate: "10/10/10",
                endDate: "15/10/10",
                projectManager: "Sasa (#98F3812LRS)",
                status: "finished",
                attributes: {
                    java: true,
                    css: true,
                    agile: true
                }
            };

            projects.push(<ProjectPanel {...projectProps}/>);
        }

        for (; i < 20; i++) {
            const projectProps = {
                title: "Jacks Secret Plan " + i,
                description: "This is a long description, but not really too long",
                members: "cc + sasa",
                startDate: "10/10/10",
                endDate: "15/10/10",
                projectManager: "Peter",
                status: "inProgress"
            };

            projects.push(<ProjectPanel {...projectProps}/>);

        }

        for (; i < 30; i++) {
            const projectProps = {
                title: "Plan to kill Peter " + i,
                description: "This is a long description, but not really too long",
                members: "cc + sasa",
                startDate: "10/10/10",
                endDate: "15/10/10",
                projectManager: "Jack",
                status: "notStarted",
                attributes: {
                    agile: true
                }
            };

            projects.push(<ProjectPanel {...projectProps}/>);

        }

        console.log(projects[3].props.title);

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
        if (project1.props.members > project2.props.members)
            return -1;
        if (project1.props.members < project2.props.members)
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

    renderControls() {
        return (
            <>
                <FormControl id="searchedTitle" className="search" placeHolder="Search title"
                             value={this.state.searchedTitle} onChange={this.handleSearch}/>

                <Button className="searchButton">
                    <Glyphicon glyph="search"/>
                </Button>

                <Button className="cloudButton">
                    <Glyphicon glyph="cloud" />
                </Button>

                {this.props.isProjectManager &&
                <>
                    <Button className="addButton">
                        <Glyphicon glyph="plus"/>
                    </Button>

                    <Button className="removeButton">
                        <Glyphicon glyph="minus"/>
                    </Button>

                    <Button className="editButton">
                        <Glyphicon glyph="pencil" />
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
            </div>
        );
    }
}