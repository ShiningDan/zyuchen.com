let mongoose = require('mongoose');
let AbstractSchema = require('../schemas/abstract');
let Abstract = mongoose.model('Abstract', AbstractSchema);

module.exports = Abstract;