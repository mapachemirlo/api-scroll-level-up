const Project = require('../models/Project');
const mongoose = require('mongoose');


const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createProject = async (req, res) => {}

const updateProject = async (req, res) => {}

const getProject = async (req, res) => {}

const getProjects = async (req, res) => {}

const deleteProject = async (req, res) => {}


module.exports = {
    testHttp,
    createProject,
    updateProject,
    getProject,
    getProjects,
    deleteProject
}