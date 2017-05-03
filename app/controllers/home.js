let Abstract = require('../models/abstract');
let Article = require('../models/article');
let utility = require('utility');
let homepageCount = 2;

exports.home = function(req, res) {
  let lt = req.query.lt;
  let gt = req.query.gt;
  let pageNavPn = {
    prev: undefined,
    next: undefined,
  };
  if (lt === undefined && gt === undefined) {
    Abstract.find({}).limit(homepageCount + 1).
    exec(function(err, abstracts) {
      if (abstracts.length <= homepageCount) {
        pageNavPn.prev = "";
        pageNavPn.next = "";
        res.render('./home/home', {
          "abstracts": abstracts,
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": undefined,
            "next": "下一页",
            "center": "博客归档"
          }
        });
      } else {
        pageNavPn.prev = "";
        pageNavPn.next = "?gt=" + abstracts[homepageCount-1]._id;
        res.render('./home/home', {
          "abstracts": abstracts.slice(0, homepageCount),
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": undefined,
            "next": "下一页",
            "center": "博客归档"
          }
        });
      }
    });
  } else if (lt !== undefined) {
    Abstract.find({"_id": {"$lt": lt}}).sort({"_id": -1}).limit(homepageCount + 1)
    .exec(function(err, abstracts) {
      abstracts = abstracts.reverse();
      if (abstracts.length <= homepageCount) {
        pageNavPn.prev = "";
        pageNavPn.next = "?gt=" + abstracts[abstracts.length-1]._id;
        res.render('./home/home', {
          "abstracts": abstracts,
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": undefined,
            "next": "下一页",
            "center": "博客归档"
          }
        });
      } else {
        pageNavPn.prev = "?lt=" + abstracts[1]._id;
        pageNavPn.next = "?gt=" + abstracts[homepageCount]._id;
        res.render('./home/home', {
          "abstracts": abstracts.slice(1, homepageCount+1),          
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": "上一页",
            "next": "下一页",
            "center": "博客归档"
          }
        });
      }
    })
  } else if (gt !== undefined) {
    Abstract.find({"_id": {"$gt": gt}}).limit(homepageCount + 1)
    .exec(function(err, abstracts) {
      if (abstracts.length <= homepageCount) {
        pageNavPn.prev = "?lt=" + abstracts[0]._id;
        pageNavPn.next = "";
        res.render('./home/home', {
          "abstracts": abstracts,
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": "上一页",
            "next": undefined,
            "center": "博客归档"
          }
        });
      } else {
        pageNavPn.prev = "?lt=" + abstracts[0]._id;
        pageNavPn.next = "?gt=" + abstracts[homepageCount-1]._id;
        res.render('./home/home', {
          "abstracts": abstracts.slice(0, homepageCount),          
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": "上一页",
            "next": "下一页",
            "center": "博客归档"
          }
        });
      }
    })
  }
};


exports.article = function(req, res) {
  let link = '/post/' + req.params.link;
  Article.findOne({'link': link}, function(err, article) {
    if (err) {
      console.log(err);
    }
    let pageNavPn = {
      prev: undefined,
      next: undefined,
    };
    res.render('./article/article', {
      content: article.content,
      sid: utility.md5(article.link),
      "pageNavPn": pageNavPn,
      "pageNav": {
        "prev": "上一页",
        "next": "下一页",
        "center": "博客归档"
      }
    })
  })
}