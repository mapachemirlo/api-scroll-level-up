const Track = require('../models/Track');
const mongoose = require('mongoose');

const testHttp = (req, res) => res.status(200).send({data:"end point OK"});

const createTrack = async (req, res) => {
    try {
        const track = req.body;
        track.name = track.name;
        let name = track.name;

        Track.findOne({name: name})
        .then((resul) => {
            if (resul === null || resul === undefined) {
                const newTrack = new Track(track);
                newTrack.save()
                .then((trackStored) => {
                    res.status(200).send({track: trackStored});
                })
            } else {
                res.status(400).send({message:'Track already exists'});
            }
        })
        .catch((err) => {
            if(err.code == 11000) {
                res.status(400).send({message:'Error in track search'});
            }
        })
        
    } catch (err) {
        return res.status(500).send({message: 'Server error create track', err})
    }
}

const updateTrack = async (req, res) => {
    try {
        const track_id = req.params.id;
        const track_update = req.body;

        if (!track_id || !mongoose.Types.ObjectId.isValid(track_id)) {
            return res.status(400).send({ message: !track_id ? 'No ID provided by URL.' : 'Invalid ID.' });
        }
        const track = await Track.findById(track_id);
        if (!track) {
            return res.status(404).send({ message: 'Track not found.' });
        }

        track_update.updateAt = new Date();

        Track.findByIdAndUpdate(track_id, track_update, {new:true})
            .then((trackUpdate) => {
                res.status(200).send({trackUpdate});
            })
            .catch((err) => {
                res.status(404).send({message:'Track not updated.', err});
            })
        
    } catch (err) {
        return res.status(500).send({error:err.message, message:'Server error get track.'});
    }
}

const getTrack = async (req, res) => {
    try {
        const track_id = req.params.id;
        if (track_id == null || undefined) return res.send({ message: 'No ID provided by URL'});
        const track = await Track.findById(track_id);
        if (!track) {
            return res.status(404).send({message: 'Track not found'});
        }
        res.status(200).send({track})
    } catch (err) {
        res.status(500).json({ message: 'Server error get track', error: err.message });
    }
}

const getTracks = async (req, res) => {
    try {
        const tracks = await Track.find();
        res.status(200).send({tracks});
        
    } catch (err) {
        res.status(500).json({ message: 'Server error get track', error: err.message });
    }
}

const deletTrack = async (req, res) => {
    try {
        const track_id = req.params.id;

        if (!track_id || !mongoose.Types.ObjectId.isValid(track_id)) {
            return res.status(400).send({
                message: !track_id ? 'No ID provided by URL.' : 'Invalid ID.'
            });
        }
        const deletedTrack = await Track.findByIdAndDelete(track_id);

        if (!deletedTrack) {
            return res.status(404).send({ message: 'Track not found.' });
        }

        res.status(200).send({ message: 'Track deleted successfully.' });
    } catch (err) {
        return res.status(500).send({error: err.message, message: 'Server error deleting Track.'});
    }
}



module.exports = {
    testHttp,
    createTrack,
    updateTrack,
    getTrack,
    getTracks,
    deletTrack
    
}