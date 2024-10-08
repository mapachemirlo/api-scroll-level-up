const Event = require('../models/Event');
const Project = require('../models/Project');
const mongoose = require('mongoose');


const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createEvent = async (req, res) => {
    try {
        const event = req.body;
        event.title = event.title;
        event.project_id = event.project_id;
        let title = event.title;

        console.log(event)

        Event.findOne({title: title})
        .then((resul) => {
            if (resul === null || resul === undefined) {
                const newEvent = new Event(event);
                newEvent.save()
                .then((eventStored) => {
                    res.status(200).send({event: eventStored});
                })
            } else {
                res.status(400).send({message:'Event already exists'});
            }
        })
        .catch((err) => {
            if(err.code == 11000) {
                res.status(400).send({message:'Error in event search'});
            }
        })

    } catch (err) {
        return res.status(500).send({message: 'Server error create event', err})
    }
}

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
        const ids_projects_quit = event_update.project_quit;
        const updateQuery = {};
        const addToSetQuery = {};

        if (ids_projects && ids_projects.length > 0) {
            addToSetQuery.project_id = {$each: ids_projects};
        }

        for (const key in event_update) {
            if (event_update.hasOwnProperty(key)) {
                if (Event.schema.paths[key] && !key.endsWith('_quit')) {
                    if (!updateQuery.$set) {
                        updateQuery.$set = {}
                      }
                      updateQuery.$set[key] = tasacion_update[key];
                }
            }
        }

        if (Object.keys(addToSetQuery).length > 0) {
            updateQuery.$addToSet = addToSetQuery;
        }

        if (ids_projects_quit && ids_projects_quit.length > 0) removeIdsProjects(ids_projects_quit, event_id);

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
                            github_url: 1,
                            website_url: 1,
                            status: 1,
                            image_url: 1
                        }
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
                    github_url: 1,
                    website_url: 1,
                    status: 1,
                    image_url: 1
                }
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
            return res.status(400).send({ message: !event_id ? 'No ID provided by URL.' : 'Invalid ID.' });
        }
        await Event.findByIdAndRemove(event_id);
        res.status(200).send({message: "Event deleted."})
    } catch (err) {
        return res.status(500).send({error:err.message, message:'Server error delete event.'});
    }
}

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

module.exports = {
    testHttp,
    createEvent,
    updateEvent,
    getEvent,
    getEvents,
    deleteEvent
}