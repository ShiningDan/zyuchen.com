let Abstract = require('../models/abstract');
let Article = require('../models/article');
let utility = require('utility');

exports.home = function(req, res) {
  let pn = req.query.pn;
  let pageNavPn = {
    prev: undefined,
    next: undefined,
  };
  if (pn === undefined) {
    pageNavPn.next = '?pn=' + 2;
  } else {
    pn = parseInt(pn);
    pageNavPn.prev = '?pn=' + (pn-1 >= 1 ? pn-1 : 1);
    pageNavPn.next = '?pn=' + (pn+1);
  }
  Abstract.find({})
  .exec(function(err, abstracts) {
    res.render('./home/home', {
      "abstracts": abstracts,
      "pageNavPn": pageNavPn,
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