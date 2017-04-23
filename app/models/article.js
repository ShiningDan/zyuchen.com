let mongoose = require('mongoose');
let ArticleSchema = require('../schemas/article');
let Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;