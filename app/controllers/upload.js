let Article = require('../models/article');
let Abstract = require('../models/abstract');
let marked = require('marked');

exports.upload = function(req, res) {
  res.render('./upload/upload', {
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