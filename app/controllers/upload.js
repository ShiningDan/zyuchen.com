let Article = require('../models/article');
let Abstract = require('../models/abstract');
let marked = require('marked');
let underScore = require('underscore');            // 查看 underscore 的使用方法

exports.upload = function(req, res) {
  res.render('./upload/upload', {
    article: {},
    abstract: {},
    "pageNav": {
      "prev": "上一页",
      "next": "下一页",
      "center": "博客归档"
    }
  });
};

exports.save = function(req, res) {
  let uploadObj = req.body.upload;
  let id = uploadObj._id;
  if(id) {
    Article.findById(id, function(err, article) {
      if (err) {
        console.log(err);
      }
      uploadObj.md = uploadObj.content;
      uploadObj.content = marked(uploadObj.content);
      let _article = underScore.extend(article, uploadObj);
      _article.save(function(err, article) {
        if (err) {
          console.log(err);
        }
        Abstract.findOne({link: article.link}, function(err, abstract) {
          if (err) {
            console.log(err);
          }
          let _abstract = underScore.extend(abstract, {
            title: uploadObj.title,
            abstract: uploadObj.abstract,
            link: abstract.link,
            categories: uploadObj.categories,
          }); 
          _abstract.save(function(err, abstract) {
            if (err) {
              console.log(err);
            }
            res.redirect(abstract.link);
          })
        })
      })
    })
  } else {
    let article = {
      title: uploadObj.title,
      content: marked(uploadObj.content),
      md: uploadObj.content,
      link: '/post/' + uploadObj.link,
      comments: [],
      categories: uploadObj.categories.split(' '),
    }
    let _article = Article(article);
    _article.save(function(err, article) {
      if (err) {
        console.log(err);
      }
      console.log('article saved');

      let abstract = {
        title: uploadObj.title,
        abstract: uploadObj.abstract,
        link: '/post/' + uploadObj.link,
        comments: [],
        categories: uploadObj.categories.split(' '),
      };
      _abstract = Abstract(abstract);
      _abstract.save(function(err, abstract) {
        if (err) {
          console.log(err);
        }
        console.log('abstract saved');
        res.redirect(abstract.link);
      })
    })
  }
};

exports.list = function(req, res) {
  Article.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    }
    res.render('./list/list', {
      articles: articles,
      "pageNav": {
        "prev": "上一页",
        "next": "下一页",
        "center": "博客归档"
      }
    })
  })
};

exports.update = function(req, res) {
  let _id = req.params.id;
  let article = Article.findById(_id, function(err, article) {
    if (err) {
      console.log(err);
    }
    Abstract.findOne({link: article.link}, function(err, abstract) {
      if (err) {
        console.log(err);
      }
      res.render('./upload/upload', {
        article: article,
        abstract: abstract,
        "pageNav": {
          "prev": "上一页",
          "next": "下一页",
          "center": "博客归档"
        }
      });
    })
  })
};
