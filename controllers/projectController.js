const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');


const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createProject = async (req, res) => {
    try {
        const project = req.body;
        project.name = project.name.toUpperCase();
        let project_name = project.name;

        Project.findOne({project_name: project_name})
        .then((resul) => {
            if (resul === null || resul === undefined) {
                const newProject = new Project(project);
                newProject.save()
                .then((projectStored) => {
                    res.status(200).send({project: projectStored});
                })
            } else {
                res.status(400).send({message:'Project already exists'});
            }
        })
        .catch((err) => {
            if(err.code == 11000) {
                res.status(400).send({message:'Error in project search'});
            }
        })

    } catch (err) {
        return res.status(500).send({message: 'Server error create project', err})
    }
}

const updateProject = async (req, res) => {}

const getProject = async (req, res) => {
    try {
        const project_id = req.params.id;
        if (project_id == null || undefined) return res.send({message:'no ID provided by URL.'});
        if (mongoose.Types.ObjectId.isValid(project_id)) {
            const projects = await Project.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(project_id)
                    }
                },
                {
                    $lookup: {
                        from: 'users', 
                        localField: 'team', 
                        foreignField: '_id', 
                        as: 'teamMembers' 
                    }
                },
                {
                    $project: {
                        project_name: 1,
                        description: 1,
                        github_url: 1,
                        website_url: 1,
                        status: 1,
                        image_url: 1,
                        createdAt: 1,
                        updateAt: 1,
                        teamMembers: {
                        _id: 1,
                        name: 1,
                        githubId: 1,
                        avatarUrl: 1,
                        isAdmin: 1,
                        createdAt: 1,
                        updateAt: 1
                        }
                    }
                }
            ]);
            if (projects.length === 0) {
                return res.status(404).send({ message: 'Project Not found.' });
              }
              res.send(projects[0]); 

        } else {
            res.status(400).send({message: 'Invalid ID.'});
        }
        
    } catch (err) {
        res.status(500).json({ message: 'Server error get projects', error: err.message });
    }

}

const getProjects = async (req, res) => {
    try {
        const projects = await Project.aggregate([
            {
                $lookup: {
                    from: 'users', 
                    localField: 'team', 
                    foreignField: '_id', 
                    as: 'teamMembers' 
                }
            },
            {
                $project: {
                    project_name: 1,
                    description: 1,
                    github_url: 1,
                    website_url: 1,
                    status: 1,
                    image_url: 1,
                    createdAt: 1,
                    updateAt: 1,
                    teamMembers: {
                    _id: 1,
                    name: 1,
                    githubId: 1,
                    avatarUrl: 1,
                    isAdmin: 1,
                    createdAt: 1,
                    updateAt: 1
                    }
                }
            }
        ]);
  
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error get projects', error: err.message });
    }
};

const deleteProject = async (req, res) => {}


module.exports = {
    testHttp,
    createProject,
    updateProject,
    getProject,
    getProjects,
    deleteProject
}