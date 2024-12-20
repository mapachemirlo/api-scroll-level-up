const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  team: [{type:mongoose.Types.ObjectId}],
  event: {type:mongoose.Types.ObjectId},
  // tracks: [{type:mongoose.Types.ObjectId}],
  tracks: [{type: String}],
  project_name: {type: String, require: true},
  description: {type: String},
  comment: {type: String},
  github_url: {type: String},
  website_url: {type: String},
  video_url: {type: String},
  image_url: {type: String},
  status: {type: String, enum: ['PENDING', 'SUBMITED', 'APPROVED'], default: 'PENDING'},
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date},
});

module.exports = mongoose.model('Project', ProjectSchema);