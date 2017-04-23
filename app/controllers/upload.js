let Article = require('../models/article');
let Abstract = require('../models/abstract');
let marked = require('marked');

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
  let article = {
    title: uploadObj.title,
    content: marked(uploadObj.content),
    md: uploadObj.content,
    link: '/post/' + uploadObj.link,
    comments: [],
    categories: uploadObj.categories.split(' '),
  }
  _article = Article(article);
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
      console.log(abstract)
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
