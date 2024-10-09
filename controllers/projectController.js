const Project = require('../models/Project');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');


const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createProject = async (req, res) => {
    try {
        const project = req.body;
        project.project_name = project.name;
        let project_name = project.project_name;
        const event_id = project.event;

        Project.findOne({project_name: project_name})
        .then((resul) => {
            if (resul === null || resul === undefined) {
                const newProject = new Project(project);
                newProject.save()
                .then((projectStored) => {
                    const project_id  = projectStored._id;
                    if (event_id === null) {
                        res.status(200).send({project: projectStored});
                    } else {
                        saveProjectInEvent(project_id, event_id);
                        res.status(200).send({project: projectStored});
                    }

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

const updateProject = async (req, res) => {
    try {
        const project_id = req.params.id;
        const project_update = req.body;

        if (!project_id || !mongoose.Types.ObjectId.isValid(project_id)) {
            return res.status(400).send({ message: !project_id ? 'No ID provided by URL.' : 'Invalid ID.' });
        }
        const project = await Project.findById(project_id);
        if (!project) {
            return res.status(404).send({ message: 'Project not found.' });
        }

        project_update.updateAt = new Date();
        const ids_team_user = project_update.team_user_add;
        const ids_team_user_quit = project_update.team_user_quit;
        const updateQuery = {};
        const addToSetQuery = {};

        if (ids_team_user && ids_team_user.length > 0) {
            addToSetQuery.team = {$each: ids_team_user};
        }

        for (const key in project_update) {
            if (project_update.hasOwnProperty(key)) {
                if (Project.schema.paths[key] && !key.endsWith('_quit')) {
                    if (!updateQuery.$set) {
                        updateQuery.$set = {}
                      }
                      updateQuery.$set[key] = project_update[key];
                }
            }
        }

        if (Object.keys(addToSetQuery).length > 0) {
            updateQuery.$addToSet = addToSetQuery;
        }
        
        if (ids_team_user_quit && ids_team_user_quit.length > 0) removeIdsTeamUsers(ids_team_user_quit, project_id);

        await Project.updateOne({_id: project_id}, updateQuery);
        return res.status(200).send({message: 'Project updated.'});

    } catch (err) {
        return res.status(500).send({error:err.message, message:'Server error get project.'});
    }
}

const getProject = async (req, res) => {
    try {
        const project_id = req.params.id;

        if (!project_id) return res.send({ message: 'No ID provided by URL.' });

        if (mongoose.Types.ObjectId.isValid(project_id)) {
            const project = await Project.aggregate([
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
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: 'project_id',
                        as: 'eventInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$eventInfo',
                        preserveNullAndEmptyArrays: true 
                    }
                },
                {
                    $project: {
                        project_name: 1,
                        event: 1,
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
                        },
                        'eventInfo.title': 1,
                        'eventInfo.description': 1,
                        'eventInfo.start_date': 1,
                        'eventInfo.end_date': 1,
                        'eventInfo.location': 1,
                        'eventInfo.status': 1,
                        'eventInfo.access': 1,
                        'eventInfo.icon_url': 1,
                        'eventInfo.prizes': 1,
                        'eventInfo.url': 1,
                        'eventInfo.evaluation': 1,
                        'eventInfo.rules': 1
                    }
                }
            ]);

            if (project.length === 0) {
                return res.status(404).send({ message: 'Project Not found.' });
            }

            res.send(project[0]);
        } else {
            res.status(400).send({ message: 'Invalid ID.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error getting project', error: err.message });
    }
};

const getProjects = async (req, res) => {
    try {
        const eventId = req.body.id_event;
        // Pipeline base sin el match
        let pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'team',
                    foreignField: '_id',
                    as: 'teamMembers'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'event',
                    foreignField: '_id',
                    as: 'eventInfo'
                }
            },
            {
                $unwind: {
                    path: '$eventInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    project_name: 1,
                    event: 1,
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
                    },
                    'eventInfo.title': 1,
                    'eventInfo.description': 1,
                    'eventInfo.start_date': 1,
                    'eventInfo.end_date': 1,
                    'eventInfo.location': 1,
                    'eventInfo.status': 1,
                    'eventInfo.access': 1,
                    'eventInfo.icon_url': 1,
                    'eventInfo.prizes': 1,
                    'eventInfo.url': 1,
                    'eventInfo.evaluation': 1,
                    'eventInfo.rules': 1
                }
            }
        ];

        // Si se pasa un _id de evento, se filtra por ese evento
        if (eventId) {
            pipeline.unshift({
                $match: {
                    event: new mongoose.Types.ObjectId(eventId) // Match por el campo "event" en el proyecto
                }
            });
        }

        const projects = await Project.aggregate(pipeline);

        if (projects.length === 0) {
            return res.status(404).json({ message: 'No projects found.' });
        }

        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error getting projects', error: err.message });
    }
};

// const getProjectsInEvent = async (req, res) => {
//     try {
//         const event_id = req.params.id;
//         if (!event_id) return res.status(400).send({ message: 'No event ID provided by URL.' });

//         if (mongoose.Types.ObjectId.isValid(event_id)) {
//             const eventWithProjects = await Event.aggregate([
//                 {
//                     $match: { _id: new mongoose.Types.ObjectId(event_id) }
//                 },
//                 {
//                     $lookup: {
//                         from: 'projects',
//                         localField: 'project_id',
//                         foreignField: '_id',
//                         as: 'projects'
//                     }
//                 },
//                 {
//                     $unwind: "$projects"
//                 },
//                 {
//                     $lookup: {
//                         from: 'users',
//                         localField: 'projects.team',
//                         foreignField: '_id',
//                         as: 'projects.teamMembers'
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 1,
//                         title: 1,
//                         description: 1,
//                         start_date: 1,
//                         end_date: 1,
//                         location: 1,
//                         status: 1,
//                         access: 1,
//                         icon_url: 1,
//                         visibility: 1,
//                         prizes: 1,
//                         url: 1,
//                         evaluation: 1,
//                         rules: 1,
//                         createdAt: 1,
//                         updateAt: 1,
//                         'projects.project_name': 1,
//                         'projects.description': 1,
//                         'projects.github_url': 1,
//                         'projects.website_url': 1,
//                         'projects.status': 1,
//                         'projects.image_url': 1,
//                         'projects.createdAt': 1,
//                         'projects.updateAt': 1,
//                         'projects.teamMembers._id': 1,
//                         'projects.teamMembers.name': 1,
//                         'projects.teamMembers.githubId': 1,
//                         'projects.teamMembers.avatarUrl': 1,
//                         'projects.teamMembers.isAdmin': 1
//                     }
//                 }
//             ]);

//             if (eventWithProjects.length === 0) {
//                 return res.status(404).send({ message: 'Event not found or no projects associated.' });
//             }

//             res.send(eventWithProjects);

//         } else {
//             res.status(400).send({ message: 'Invalid Event ID.' });
//         }
//     } catch (err) {
//         res.status(500).json({ message: 'Server error retrieving event projects', error: err.message });
//     }
// }

const deleteProject = async (req, res) => {
    try {
        const project_id = req.params.id;

        if (!project_id || !mongoose.Types.ObjectId.isValid(project_id)) {
            return res.status(400).send({
                message: !project_id ? 'No ID provided by URL.' : 'Invalid ID.'
            });
        }
        const deletedProject = await Project.findByIdAndDelete(project_id);

        if (!deletedProject) {
            return res.status(404).send({ message: 'Project not found.' });
        }

        res.status(200).send({ message: 'Project deleted successfully.' });
    } catch (err) {
        return res.status(500).send({
            error: err.message,
            message: 'Server error deleting project.'
        });
    }
};

const removeIdsTeamUsers = async (ids_team, id_proj) => {
    if (ids_team.length > 0) {
        try {
            await Project.updateOne({_id: id_proj, team: {$in: ids_team}}, {$pull: {team: {$in: ids_team}}})
            console.log('Team user deleted');
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log('No team user ids provided')
    }
}

const saveProjectInEvent = async(id_proj, id_even) => {
    try {
        const id_project = id_proj;
        if (id_even && id_even.length > 0) {
            await Event.updateOne({_id: {$in: id_even}}, {$push: {project_id: id_project}})
            console.log('Project saved in Event.');
        } else {
            return console.log('Not ID provided.');
        }        
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    testHttp,
    createProject,
    updateProject,
    getProject,
    getProjects,
    // getProjectsInEvent,
    deleteProject
}




// const getProjects = async (req, res) => {
//     try {
//         const projects = await Project.aggregate([
//             {
//                 $lookup: {
//                     from: 'users', 
//                     localField: 'team', 
//                     foreignField: '_id', 
//                     as: 'teamMembers' 
//                 }
//             },
//             {
//                 $project: {
//                     project_name: 1,
//                     description: 1,
//                     github_url: 1,
//                     website_url: 1,
//                     status: 1,
//                     image_url: 1,
//                     createdAt: 1,
//                     updateAt: 1,
//                     teamMembers: {
//                     _id: 1,
//                     name: 1,
//                     githubId: 1,
//                     avatarUrl: 1,
//                     isAdmin: 1,
//                     createdAt: 1,
//                     updateAt: 1
//                     }
//                 }
//             }
//         ]);
  
//         res.status(200).json(projects);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error get projects', error: err.message });
//     }
// };




//const getProject = async (req, res) => {
    //     try {
    //         const project_id = req.params.id;
    //         if (project_id == null || undefined) return res.send({message:'no ID provided by URL.'});
    //         if (mongoose.Types.ObjectId.isValid(project_id)) {
    //             const projects = await Project.aggregate([
    //                 {
    //                     $match: {
    //                         _id: new mongoose.Types.ObjectId(project_id)
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'users', 
    //                         localField: 'team', 
    //                         foreignField: '_id', 
    //                         as: 'teamMembers' 
    //                     }
    //                 },
    //                 {
    //                     $project: {
    //                         project_name: 1,
    //                         description: 1,
    //                         github_url: 1,
    //                         website_url: 1,
    //                         status: 1,
    //                         image_url: 1,
    //                         createdAt: 1,
    //                         updateAt: 1,
    //                         teamMembers: {
    //                         _id: 1,
    //                         name: 1,
    //                         githubId: 1,
    //                         avatarUrl: 1,
    //                         isAdmin: 1,
    //                         createdAt: 1,
    //                         updateAt: 1
    //                         }
    //                     }
    //                 }
    //             ]);
    //             if (projects.length === 0) {
    //                 return res.status(404).send({ message: 'Project Not found.' });
    //               }
    //               res.send(projects[0]); 
    
    //         } else {
    //             res.status(400).send({message: 'Invalid ID.'});
    //         }
            
    //     } catch (err) {
    //         res.status(500).json({ message: 'Server error get projects', error: err.message });
    //     }
    // }

    // const getProjects = async (req, res) => {
//     try {
//         const projects = await Project.aggregate([
//             {
//                 $lookup: {
//                     from: 'users',
//                     localField: 'team',
//                     foreignField: '_id',
//                     as: 'teamMembers'
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'events',
//                     localField: '_id',
//                     foreignField: 'project_id',
//                     as: 'eventInfo'
//                 }
//             },
//             {
//                 $unwind: { // Descompone el array de eventos para mostrar solo un evento por proyecto (si corresponde)
//                     path: '$eventInfo',
//                     preserveNullAndEmptyArrays: true // Permite que los proyectos sin eventos asociados no queden fuera
//                 }
//             },
//             {
//                 $project: {
//                     project_name: 1,
//                     description: 1,
//                     github_url: 1,
//                     website_url: 1,
//                     status: 1,
//                     image_url: 1,
//                     createdAt: 1,
//                     updateAt: 1,
//                     teamMembers: {
//                         _id: 1,
//                         name: 1,
//                         githubId: 1,
//                         avatarUrl: 1,
//                         isAdmin: 1,
//                         createdAt: 1,
//                         updateAt: 1
//                     },
//                     'eventInfo._id': 1,
//                     'eventInfo.title': 1,
//                     'eventInfo.description': 1,
//                     'eventInfo.start_date': 1,
//                     'eventInfo.end_date': 1,
//                     'eventInfo.location': 1,
//                     'eventInfo.status': 1,
//                     'eventInfo.access': 1,
//                     'eventInfo.icon_url': 1,
//                     'eventInfo.prizes': 1,
//                     'eventInfo.url': 1,
//                     'eventInfo.evaluation': 1,
//                     'eventInfo.rules': 1
//                 }
//             }
//         ]);

//         res.status(200).json(projects);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error getting projects', error: err.message });
//     }
// };