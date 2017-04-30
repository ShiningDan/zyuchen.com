let Abstract = require('../models/abstract');
let Article = require('../models/article');
let utility = require('utility');

exports.home = function(req, res) {
  Abstract.find({})
  .exec(function(err, abstracts) {
    res.render('./home/home', {
      "abstracts": abstracts,
      "pageNav": {
        "prev": "上一页",
        "next": "下一页",
        "center": "博客归档"
      }
    });
  }) 
};


exports.article = function(req, res) {
  let link = '/post/' + req.params.link;
  Article.findOne({'link': link}, function(err, article) {
    if (err) {
      console.log(err);
    }
    res.render('./article/article', {
      content: article.content,
      sid: utility.md5(article.link),
      "pageNav": {
        "prev": "上一页",
        "next": "下一页",
        "center": "博客归档"
      }
    })
  })
}