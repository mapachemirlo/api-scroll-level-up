// const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String},
  githubId: {type: String, unique: true},
  avatarUrl: {type: String},
  isAdmin: {type: Boolean},
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date},
});

module.exports = mongoose.model('User', UserSchema);
