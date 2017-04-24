let Article = require('../models/article');
let Abstract = require('../models/abstract');
let Category = require('../models/category');
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
    // 如果 id 存在，即该文章原来就已经存在了
    Article.findById(id, function(err, article) {
      if (err) {
        console.log(err);
      }
      uploadObj.md = uploadObj.content;
      uploadObj.content = marked(uploadObj.content);
      //更新 article 并且存入到数据库，替代原来的 article
      let _article = underScore.extend(article, uploadObj);
      _article.save(function(err, article) {
        if (err) {
          console.log(err);
        }
        Abstract.findOne({link: article.link}, function(err, abstract) {
          if (err) {
            console.log(err);
          }
          // 更新 abstract 并且存入到数据库，替代原来的 abstract
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
    // 如果 id 不存在，即该文章是一篇新文章
    let article = {
      title: uploadObj.title,
      content: marked(uploadObj.content),
      md: uploadObj.content,
      link: '/post/' + uploadObj.link,
      comments: [],
      categories: uploadObj.categories.split(' '),
    }
    // 首先创建 article，并且保存
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
      // 其次创建 abstract，并且保存
      _abstract = Abstract(abstract);
      _abstract.save(function(err, abstract) {
        if (err) {
          console.log(err);
        }
        console.log('abstract saved');

        // 最后创建 Category，并且保存
        let categories = abstract.categories;
        console.log(categories);
        categories.forEach(function(cate) {
          Category.findOne({name: cate}, function(err, category) {
            if (err) {
              console.log(err);
            }
            if (category) {
              category.articles.push(article._id);
              console.log('category:', category.name, 'updated');
            } else {
              let _category =  new Category({
                name: cate,
                article: article._id,
              });
              _category.save(function(err, category) {
                if (err) {
                  console.log(err);
                  console.log('category:', category.name, 'saved');
                }
              })
            }
          })
        })
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
