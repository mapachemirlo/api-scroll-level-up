const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
  project_id: [{type:mongoose.Types.ObjectId}],
  track_id: [{type:mongoose.Types.ObjectId}],
  title: {type: String},
  description: {type: String},
  start_date: {type: Date},
  end_date: {type: Date},
  location: {type: String},
  status: {type: String, enum: ['UPCOMING', 'OPEN', 'ENDED'], default: 'UPCOMING'},
  access: {type: String, enum: ['FREE', 'INVITE ONLY'], default: 'FREE'},
  icon_url: {type: String},
  visibility: {type: Boolean},
  prizes: {type: String},
  url: {type: String},
  evaluation: {type: String},
  rules: {type: String},
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date},
});

module.exports = mongoose.model('Event', EventSchema);