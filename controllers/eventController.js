const Event = require('../models/Event');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const fs = require('fs');
const PublitioAPI = require('publitio_js_sdk').default
const publitio = new PublitioAPI(process.env.PUBLITIO_APYKEY, process.env.PUBLITIO_APYSECRET);
const { Formidable } = require('formidable');


const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createEvent = async (req, res) => {
    try {
        const event = req.body;

        if (typeof event.tracks === 'string') {
            event.tracks = event.tracks.split(/[\s,]+/).filter(Boolean);
        }
        const title = event.title;

        Event.findOne({ title: title })
            .then((resul) => {
                if (resul === null || resul === undefined) {
                    const newEvent = new Event(event);
                    newEvent.save()
                        .then((eventStored) => {
                            res.status(200).send({ event: eventStored });
                        });
                } else {
                    res.status(400).send({ message: 'Event already exists' });
                }
            })
            .catch((err) => {
                if (err.code === 11000) {
                    res.status(400).send({ message: 'Error in event search' });
                }
            });

    } catch (err) {
        return res.status(500).send({ message: 'Server error create event', err });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event_id = req.params.id;
        const event_update = req.body;

        if (!event_id || !mongoose.Types.ObjectId.isValid(event_id)) {
            return res.status(400).send({ message: !event_id ? 'No ID provided by URL.' : 'Invalid ID.' });
        }
        const event = await Event.findById(event_id);
        if (!event) {
            return res.status(404).send({ message: 'Event not found.' });
        }

        event_update.updateAt = new Date();
        const ids_projects = event_update.project_add;
        //const ids_tracks = event_update.track_add;
        const ids_projects_quit = event_update.project_quit;
        //const ids_tracks_quit = event_update.track_quit;
        const tracks_add = event_update.track_add; // nuevo
        const tracks_quit = event_update.track_quit; // nuevo

        const updateQuery = {};
        const addToSetQuery = {};
        const pullQuery = {}; // nuevo

        if (ids_projects && ids_projects.length > 0) {
            addToSetQuery.project_id = {$each: ids_projects};
        }

        // Agregar elementos al array `tracks`  //nuevo
        if (tracks_add && tracks_add.length > 0) {
            addToSetQuery.tracks = { $each: tracks_add };
        }

        // Quitar elementos del array `tracks` // nuevo
        if (tracks_quit && tracks_quit.length > 0) {
            pullQuery.tracks = { $in: tracks_quit };
        }

        // if (ids_tracks && ids_tracks.length > 0) {
        //     addToSetQuery.track_id = {$each: ids_tracks};
        // }

        // for (const key in event_update) {
        //     if (event_update.hasOwnProperty(key)) {
        //         if (Event.schema.paths[key] && !key.endsWith('_quit')) {
        //             if (!updateQuery.$set) {
        //                 updateQuery.$set = {}
        //             }
        //             updateQuery.$set[key] = event_update[key];
        //         }
        //     }
        // }

        // Configurar `$set` para actualizar otros campos // nuevo
        for (const key in event_update) {
            if (event_update.hasOwnProperty(key) && Event.schema.paths[key] && !key.endsWith('_quit') && !key.endsWith('_add')) {
                if (!updateQuery.$set) {
                    updateQuery.$set = {};
                }
                updateQuery.$set[key] = event_update[key];
            }
        }
        if (Object.keys(addToSetQuery).length > 0) {
            updateQuery.$addToSet = addToSetQuery;
        }

        // Añadir `$pull` si existen elementos que quitar  // nuevo
        if (Object.keys(pullQuery).length > 0) {
            updateQuery.$pull = pullQuery;
        } 

        if (ids_projects_quit && ids_projects_quit.length > 0) removeIdsProjects(ids_projects_quit, event_id);
        //if (ids_tracks_quit && ids_tracks_quit.length > 0) removeIdsTracks(ids_tracks_quit, event_id);

        await Event.updateOne({_id: event_id}, updateQuery);
        return res.status(200).send({message: 'Event updated.'});

    } catch (err) {
        return res.status(500).send({error:err.message, message:'Server error get event.'});
    }
}

const getEvent = async (req, res) => {
    try {
        const event_id = req.params.id;
        if (event_id == null || undefined) return res.send({message:'no ID provided by URL.'});
        if (mongoose.Types.ObjectId.isValid(event_id)) {
            const event = await Event.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(event_id)
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: 'project_id',
                        foreignField: '_id',
                        as: 'projectDetails'
                    }
                },
                // {
                //     $lookup: {
                //         from: 'tracks',
                //         localField: 'track_id',
                //         foreignField: '_id',
                //         as: 'trackDetails' 
                //     }
                // },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        start_date: 1,
                        end_date: 1,
                        location: 1,
                        status: 1,
                        access: 1,
                        icon_url: 1,
                        visibility: 1,
                        overview: 1,
                        prizes: 1,
                        url: 1,
                        evaluation: 1,
                        rules: 1,
                        createdAt: 1,
                        updateAt: 1,
                        projectDetails: {
                            _id: 1,
                            project_name: 1,
                            description: 1,
                            comment: 1,
                            github_url: 1,
                            website_url: 1,
                            video_url: 1,
                            image_url: 1,
                            tracks: 1,
                            status: 1,
                            image_url: 1,
                            createdAt: 1,
                            updateAt: 1
                        },
                        tracks: 1
                        // trackDetails: {
                        //     _id: 1,
                        //     track_name: 1,
                        //     description: 1
                        // }
                    }
                }
          ]);

          if (!event || event.length === 0) {
            return res.status(404).json({ message: 'Event Not found' });
          }
      
          res.status(200).json(event[0]); 
        } else {
            res.status(400).send({message: 'Invalid ID.'});
        }

    } catch (err) {
      res.status(500).json({ message: 'Server error get event', error: err.message });
    }
};

const getEvents = async (req, res) => {
    try {
      const events = await Event.aggregate([
        {
            $lookup: {
                from: 'projects',
                localField: 'project_id',
                foreignField: '_id',
                as: 'projectDetails' 
            }
        },
        // {
        //     $lookup: {
        //         from: 'tracks',
        //         localField: 'track_id',
        //         foreignField: '_id',
        //         as: 'trackDetails' 
        //     }
        // },
        {
            $project: {
                title: 1,
                description: 1,
                start_date: 1,
                end_date: 1,
                location: 1,
                status: 1,
                access: 1,
                icon_url: 1,
                visibility: 1,
                overview: 1,
                prizes: 1,
                url: 1,
                evaluation: 1,
                rules: 1,
                createdAt: 1,
                updateAt: 1,
                projectDetails: {
                    _id: 1,
                    project_name: 1,
                    description: 1,
                    comment: 1,
                    github_url: 1,
                    website_url: 1,
                    video_url: 1,
                    image_url: 1,
                    tracks: 1,
                    status: 1,
                    image_url: 1,
                    createdAt: 1,
                    updateAt: 1
                },
                tracks: 1
                // trackDetails: {
                //     _id: 1,
                //     track_name: 1,
                //     description: 1
                // }
            }
        }
    ]);
  
      res.status(200).json(events);
    } catch (err) {
      res.status(500).json({ message: 'Server error get events', error: err.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event_id = req.params.id;

        if (!event_id || !mongoose.Types.ObjectId.isValid(event_id)) {
            return res.status(400).send({
                message: !event_id ? 'No ID provided by URL.' : 'Invalid ID.'
            });
        }

        const deletedEvent = await Event.findByIdAndDelete(event_id);

        if (!deletedEvent) {
            return res.status(404).send({ message: 'Event not found.' });
        }

        res.status(200).send({ message: 'Event deleted successfully.' });
    } catch (err) {
        return res.status(500).send({
            error: err.message,
            message: 'Server error deleting event.'
        });
    }
};

const removeIdsProjects = async (ids_proj, id_event) => {
    if (ids_proj.length > 0) {
        try {
            await Event.updateOne({_id: id_event, project_id: {$in: ids_proj}}, {$pull: {project_id: {$in: ids_proj}}})
            console.log('Project deleted');
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log('No Project ids provided')
    }
}

const removeIdsTracks = async (ids_trac, id_event) => {
    if (ids_trac.length > 0) {
        try {
            await Event.updateOne({_id: id_event, track_id: {$in: ids_trac}}, {$pull: {track_id: {$in: ids_trac}}})
            console.log('Track deleted');
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log('No Tracks ids provided')
    }
}

// ------------------------------ Métodos para manejo de archivos ------------------------- //

const folderId = 'Q9u6P9PG';

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

const uploadImageEvent = async (req, res) => {
    const event_id = req.params.id;
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
            if (event_id == null || undefined) return res.send({ message: 'No ID provided by url.' });
            if (mongoose.Types.ObjectId.isValid(event_id)) {
                if (archivo) {
                    const file_name = archivo[0].originalFilename;
                    const ext_split = file_name.split('.');
                    const file_ext = ext_split[1];
                    if (file_ext === 'png' || file_ext === 'PNG' || file_ext === 'jpg' || file_ext === 'JPG' || file_ext === 'jpeg' || file_ext === 'JPEG') {
                        const fileBuffer = await fs.promises.readFile(archivo[0].filepath);
                        const urlshow = await uploadFileToFolder(fileBuffer, file_name, folderId);
                        if (urlshow) {
                            //Event.findByIdAndUpdate(event_id, { $push: { ['icon_url']: urlshow } }, { new: true })
                            Event.findByIdAndUpdate(event_id, { $set: { 'icon_url': urlshow } }, { new: true })
                                .then((eventUpdateStored) => {
                                    res.send({ message: 'Event updated OK' });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    return res.send({ message: 'Event could not be updated.' });
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

const deleteImageEvent = async (req, res) => {
    const { files } = req.body;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files provided to delete.' });
    }

    try {
        for (const fileId of files) {
            // Buscar el evento que contiene la URL del archivo con 'id_file=fileId'
            const event = await Event.findOne({ 'icon_url': { $regex: `id_file=${fileId}$` } });

            if (!event) {
                console.log(`Event with file id ${fileId} not found.`);
                continue;
            }

            event.icon_url = event.icon_url.filter(imageUrl => !imageUrl.includes(`id_file=${fileId}`));
            
            await event.save();
            console.log(`Image with file id ${fileId} removed from event icon_url.`);

            await deleteFilePublitio(fileId);
        }

        return res.json({ message: 'Files deleted successfully.' });

    } catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({ message: 'Internal server error during deletion.' });
    }
};

const deleteFilePublitio = async (fileId) => {
    try {
        const path = `/files/delete/${fileId}`;
        const response = await publitio.call(path, 'DELETE');
        console.log(`File with ID ${fileId} deleted from Publitio.`, response);
    } catch (error) {
        console.error(`Error deleting file with ID ${fileId} from Publitio:`, error);
    }
};

// const deleteImageEvent = async (req, res) => {
//     const { files } = req.body;
//     try {
//         for (const fileId of files) {
//             const event = await Event.findOne({ 'icon_url': { $regex: `id_file=${fileId}$` } });
//             if (event) {
//                 // Eliminar la URL que contiene el ID en MongoDB
//                 event.icon_url = event.icon_url.filter(imageUrl => !imageUrl.includes(`id_file=${fileId}`));
//                 await event.save();
//             }
//             // Eliminar el archivo en Publit.io
//             await deleteFilePublitio(fileId);
//         }
//         return res.json({ message: 'Deleted OK.' });
//     } catch (error) {
//         console.error('Error deleting file:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };

// const deleteFilePublitio = (file) => {
//     // Borrar el archivo de publit y de mongo
//     const file_name = file;
//     const path = `/files/delete/${file_name}`;
//     publitio.call(path, 'DELETE')
//    .then((data) => { console.log(data)})
//    .catch((error) => { console.log(error) })
// }

const listImageEvent = (req, res) => {
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
    createEvent,
    updateEvent,
    getEvent,
    getEvents,
    deleteEvent,
    uploadImageEvent,
    deleteImageEvent,
    listImageEvent
}


