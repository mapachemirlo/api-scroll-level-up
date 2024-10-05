const User = require('../models/User');
const mongoose = require('mongoose');



const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const updateUser = async (req, res) => {}

const getUser = async (req, res) => {
    try {
        const user_id = req.params.id;
        if (user_id == null || undefined) return res.send({ message: 'No ID provided by URL'});
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).send({message: 'User not found'});
        }
        res.status(200).send({user})
    } catch (err) {
        res.status(500).send({ message: 'Server error get user' , error});
    }
}

const getusers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send({users});
    } catch (error) {
        res.status(500).send({ error: e.message, message: 'Server error get users' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user_id = req.params.id;
        if (user_id == null || undefined) return res.send({ message: 'No ID provided by URL'});
        const user = await User.findByIdAndRemove(user_id)
        if (!user) {
            return res.status(404).send({message: 'User not found'});
        }
        res.status(200).send({message: 'User deleted'});
    } catch (error) {
        res.status(500).send({ message: 'Server error get user' , error});
    }
}

module.exports = {
    testHttp,
    updateUser,
    getUser,
    getusers,
    deleteUser
}