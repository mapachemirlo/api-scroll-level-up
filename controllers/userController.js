const User = require('../models/User');
const mongoose = require('mongoose');



const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const updateUser = async (req, res) => {
    try {
        const user_id = req.params.id;
        const user_update = req.body;

        if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).send({ message: !user_id ? 'No ID provided by URL.' : 'Invalid ID.' });
        }
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        user_update.updateAt = new Date();

        User.findByIdAndUpdate(user_id, user_update, {new:true})
            .then((userUpdate) => {
                res.status(200).send({userUpdate});
            })
            .catch((err) => {
                res.status(404).send({message:'User not updated.', err});
            })

    } catch (err) {
        return res.status(500).send({ message: 'Server error update user' , error});
    }
}

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
        return res.status(500).send({ message: 'Server error get user' , error});
    }
}

const getusers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send({users});
    } catch (error) {
        return res.status(500).send({ error: e.message, message: 'Server error get users' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user_id = req.params.id;

        if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).send({
                message: !user_id ? 'No ID provided by URL.' : 'Invalid ID.'
            });
        }

        const user = await User.findByIdAndDelete(user_id);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted' });
    } catch (error) {
        return res.status(500).send({ message: 'Server error deleting user', error: error.message });
    }
};


module.exports = {
    testHttp,
    updateUser,
    getUser,
    getusers,
    deleteUser
}