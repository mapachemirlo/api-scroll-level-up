const mongoose = require('mongoose');
const { Schema } = mongoose;

const TrackSchema = new Schema({
  track_name: {type: String},
  description: {type: String},
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date},
});

module.exports = mongoose.model('Track', TrackSchema);