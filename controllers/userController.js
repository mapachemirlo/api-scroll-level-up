const User = require('../models/User');
const mongoose = require('mongoose');



const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createUser = async (req, res) => {}

const updateUser = async (req, res) => {}

const getUser = async (req, res) => {}

const getusers = async (req, res) => {}

const deleteUser = async (req, res) => {}

module.exports = {
    testHttp,
    createUser,
    updateUser,
    getUser,
    getusers,
    deleteUser
}