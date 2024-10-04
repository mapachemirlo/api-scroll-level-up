const Event = require('../models/Event');
const mongoose = require('mongoose');


const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createEvent = async (req, res) => {}

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