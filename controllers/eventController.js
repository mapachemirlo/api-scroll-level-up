const Event = require('../models/Event');
const mongoose = require('mongoose');


const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createEvent = async (req, res) => {
    try {
        const event = req.body;
        event.title = event.title.toUpperCase();
        event.project_id = event.project_id;
        let title = event.title;

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

const updateEvent = async (req, res) => {}

const getEvent = async (req, res) => {}

const getEvents = async (req, res) => {}

const deleteEvent = async (req, res) => {}


module.exports = {
    testHttp,
    createEvent,
    updateEvent,
    getEvent,
    getEvents,
    deleteEvent
}