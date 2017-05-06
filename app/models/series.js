let mongoose = require('mongoose');
let SeriesSchema = require('../schemas/series');
let Series = mongoose.model('Series', SeriesSchema);

module.exports = Series;