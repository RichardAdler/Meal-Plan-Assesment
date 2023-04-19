const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  versionKey: false
});



const User = mongoose.model('User', UserSchema);
module.exports = User;
