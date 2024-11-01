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
        const ids_tracks = project_update.track_add;
        const ids_team_user_quit = project_update.team_user_quit;
        const ids_tracks_quit = project_update.track_quit;
        const updateQuery = {};
        const addToSetQuery = {};

        if (ids_team_user && ids_team_user.length > 0) {
            addToSetQuery.team = {$each: ids_team_user};
        }

        if (ids_tracks && ids_tracks.length > 0) {
            addToSetQuery.tracks = {$each: ids_tracks};
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
        if (ids_tracks_quit && ids_tracks_quit.length > 0) removeIdsTracks(ids_tracks_quit, project_id);

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
                // {
                //     $lookup: {
                //         from: 'tracks',
                //         localField: 'tracks',
                //         foreignField: '_id',
                //         as: 'trackInfo'
                //     }
                // },
                {
                    $project: {
                        project_name: 1,
                        event: 1,
                        tracks: 1,
                        description: 1,
                        comment: 1,
                        github_url: 1,
                        website_url: 1,
                        video_url: 1,
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
                        'eventInfo.rules': 1,
                        // trackInfo: {
                        //     _id: 1,
                        //     track_name: 1,
                        //     description: 1
                        // }
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

// const getProject = async (req, res) => {
//     try {
//         const project_id = req.params.id;

//         if (!project_id) return res.send({ message: 'No ID provided by URL.' });

//         if (mongoose.Types.ObjectId.isValid(project_id)) {
//             const project = await Project.aggregate([
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
//                     $lookup: {
//                         from: 'events',
//                         localField: '_id',
//                         foreignField: 'project_id',
//                         as: 'eventInfo'
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: '$eventInfo',
//                         preserveNullAndEmptyArrays: true 
//                     }
//                 },
//                 {
//                     $project: {
//                         project_name: 1,
//                         event: 1,
//                         description: 1,
//                         github_url: 1,
//                         website_url: 1,
//                         status: 1,
//                         image_url: 1,
//                         createdAt: 1,
//                         updateAt: 1,
//                         teamMembers: {
//                             _id: 1,
//                             name: 1,
//                             githubId: 1,
//                             avatarUrl: 1,
//                             isAdmin: 1,
//                             createdAt: 1,
//                             updateAt: 1
//                         },
//                         'eventInfo.title': 1,
//                         'eventInfo.description': 1,
//                         'eventInfo.start_date': 1,
//                         'eventInfo.end_date': 1,
//                         'eventInfo.location': 1,
//                         'eventInfo.status': 1,
//                         'eventInfo.access': 1,
//                         'eventInfo.icon_url': 1,
//                         'eventInfo.prizes': 1,
//                         'eventInfo.url': 1,
//                         'eventInfo.evaluation': 1,
//                         'eventInfo.rules': 1
//                     }
//                 }
//             ]);

//             if (project.length === 0) {
//                 return res.status(404).send({ message: 'Project Not found.' });
//             }

//             res.send(project[0]);
//         } else {
//             res.status(400).send({ message: 'Invalid ID.' });
//         }
//     } catch (err) {
//         res.status(500).json({ message: 'Server error getting project', error: err.message });
//     }
// };

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
            // {
            //     $lookup: {
            //         from: 'tracks',
            //         localField: 'tracks',
            //         foreignField: '_id',
            //         as: 'trackInfo'
            //     }
            // },
            {
                $project: {
                    project_name: 1,
                    event: 1,
                    tracks: 1,
                    description: 1,
                    comment: 1,
                    github_url: 1,
                    website_url: 1,
                    video_url: 1,
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
                    'eventInfo.rules': 1,
                    // trackInfo: {
                    //     _id: 1,
                    //     track_name: 1,
                    //     description: 1
                    // }
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

// const getProjects = async (req, res) => {
//     try {
//         const eventId = req.body.id_event;
//         // Pipeline base sin el match
//         let pipeline = [
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
//                     localField: 'event',
//                     foreignField: '_id',
//                     as: 'eventInfo'
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$eventInfo',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $project: {
//                     project_name: 1,
//                     event: 1,
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
//         ];

//         // Si se pasa un _id de evento, se filtra por ese evento
//         if (eventId) {
//             pipeline.unshift({
//                 $match: {
//                     event: new mongoose.Types.ObjectId(eventId) // Match por el campo "event" en el proyecto
//                 }
//             });
//         }

//         const projects = await Project.aggregate(pipeline);

//         if (projects.length === 0) {
//             return res.status(404).json({ message: 'No projects found.' });
//         }

//         res.status(200).json(projects);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error getting projects', error: err.message });
//     }
// };

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

const removeIdsTracks = async (ids_trac, id_proj) => {
    if (ids_trac.length > 0) {
        try {
            await Project.updateOne({_id: id_proj, tracks: {$in: ids_trac}}, {$pull: {tracks: {$in: ids_trac}}})
            console.log('Track deleted');
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log('No tracks ids provided')
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

// ------------------------------ Métodos para manejo de archivos ------------------------- //

const folderId = 'g8yiubxG';

const uploadFileToFolder = async (file, file_name) => {
    try {
        const data = await publitio.uploadFile(file, 'file', {
            title: file_name,
            folder: folderId, // Utiliza la variable folderId como la carpeta
            privacy: '1',
            option_download: '1',
            id: 1
        });
        return data.url_short;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const uploadImageProject = async (req, res) => {
    const project_id = req.params.id;
    const form = new Formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error processing file:', err);
            return res.status(500).json({ error: 'Error processing file' });
        }
        const archivo = files.archivo;
        if (!archivo) {
            return res.status(400).json({ error: 'No file provided' });
        }
        try {
            if (project_id == null || undefined) return res.send({ message: 'No ID provided by url.' });
            if (mongoose.Types.ObjectId.isValid(project_id)) {
                if (archivo) {
                    const file_name = archivo[0].originalFilename;
                    const ext_split = file_name.split('.');
                    const file_ext = ext_split[1];
                    if (file_ext === 'png' || file_ext === 'PNG' || file_ext === 'jpg' || file_ext === 'JPG' || file_ext === 'jpeg' || file_ext === 'JPEG') {
                        const fileBuffer = await fs.promises.readFile(archivo[0].filepath);
                        const urlshow = await uploadFileToFolder(fileBuffer, file_name, folderId);
                        if (urlshow) {
                            Project.findByIdAndUpdate(project_id, { $set: { 'image_url': urlshow } }, { new: true })
                                .then((projectUpdateStored) => {
                                    res.send({ message: 'Project updated OK' });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    return res.send({ message: 'Project could not be updated.' });
                                });
                        } else {
                            return console.log('Publitio did not return any download URLs.');
                        }
                    } else {
                        return console.log('Invalid file extension.');
                    }
                } else {
                    console.log('No file was provided.');
                }
            } else {
                res.status(400).send({ message: 'Invalid ID.' });
            }
        } catch (error) {
            console.error('Error uploading file to Publitio:', error);
            res.status(500).json({ error: 'Error uploading file to Publitio' });
        }
    });
};

// const deleteImageProject = async (req, res) => {
//     const { files } = req.body;

//     if (!files || files.length === 0) {
//         return res.status(400).json({ message: 'No files provided to delete.' });
//     }

//     try {
//         for (const fileId of files) {
//             // Buscar el evento que contiene la URL del archivo con 'id_file=fileId'
//             const project = await Project.findOne({ 'image_url': { $regex: `id_file=${fileId}$` } });

//             if (!project) {
//                 console.log(`Project with file id ${fileId} not found.`);
//                 continue;
//             }

//             project.image_url = project.image_url.filter(imageUrl => !imageUrl.includes(`id_file=${fileId}`));
            
//             await project.save();
//             console.log(`Image with file id ${fileId} removed from project image_url.`);

//             await deleteFilePublitio(fileId);
//         }

//         return res.json({ message: 'Files deleted successfully.' });

//     } catch (error) {
//         console.error('Error deleting file:', error);
//         return res.status(500).json({ message: 'Internal server error during deletion.' });
//     }
// };

const deleteFilePublitio = async (fileId) => {
    try {
        const path = `/files/delete/${fileId}`;
        const response = await publitio.call(path, 'DELETE');
        console.log(`File with ID ${fileId} deleted from Publitio.`, response);
    } catch (error) {
        console.error(`Error deleting file with ID ${fileId} from Publitio:`, error);
    }
};

const listImageProject = (req, res) => {
    publitio.call('/files/list', 'GET', { offset: '0', limit: '1000' })
    .then((data) => {
        const archivos = data.files
            .filter(file => file.folder === 'Event/')
            .map(file => ({
                id: file.id,
                title: file.title,
                url_download: file.url_download
            }));
        res.send(archivos);
    });
}

module.exports = {
    testHttp,
    createProject,
    updateProject,
    getProject,
    getProjects,
    deleteProject,
    uploadImageProject
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