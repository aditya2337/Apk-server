const mongoose = require('mongoose');
require('../db');

const AppSchema = new mongoose.Schema({
  apk: String,
  userId: String
},
{ collection: 'apps' }
);

module.exports = mongoose.model('Apps', AppSchema);
