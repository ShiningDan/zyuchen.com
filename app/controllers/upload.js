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
      uploadObj.categories = uploadObj.categories.split(' ').filter(function(obj) {
          obj = obj.trim();
          if (obj !== "") {
            return obj;
          }
      });
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
          let oldCategories = abstract.categories;
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

            // 更新 category
            // 新的 category 不在旧的 oldCategories 中
            abstract.categories.forEach(function(cate) {
              // 如果更新的 category 不在原有 category 里面
              if (oldCategories.indexOf(cate) === -1) {
                // 则创建新的 category 或者在新的 category 中添加文章链接
                Category.findOne({name: cate}, function(err, category) {
                  if (err) {
                    console.log(err);
                  }
                  if (category) {
                    // 如果新的 category 已经存在了，则将该文章添加到新的 category 中
                    category.articles.push(article._id);
                    category.save(function(err, c) {
                      if (err) {
                        console.log(err);
                      }
                      console.log('category:', c, 'updated');
                    })
                  } else {
                    // 如果新的 category 不存在，则创建新的 category，并且将该文章添加进去
                    let _category = new Category({
                      name: cate,
                      articles: [article._id],
                    });
                    _category.save(function(err, category) {
                      if (err) {
                        console.log(err);
                      }
                      console.log('category:', category, 'saved');
                    })
                  }
                })
              } 
            })
            // 如果 oldCategories 中的元素在修改以后被删去，则要从对应的 category 中删除该文章的链接
            oldCategories.forEach(function(cate) {
              // 如果 旧的 cate 不在新的里面
              if (abstract.categories.indexOf(cate) === -1) {
                // 则将文章从旧的 category 中删除
                Category.findOne({name: cate}, function(err, category) {
                  if (err) {
                    console.log(err);
                  }
                  // 如果原有的 category 中只有一篇文章，则删掉这个 category
                  if (category.articles.length === 1) {
                    category.remove(function(err, c) {
                      if (err) {
                        console.log(err);
                      }
                      console.log('category', c, 'removed');
                    })
                  } else {
                    // 如果有多篇文章，则删除该文章
                    category.articles.splice(category.articles.indexOf(article._id), 1);
                    category.save(function(err, c) {
                      if (err) {
                        console.log(err);
                      }
                      console.log('category', c, 'updated');
                    })
                  }
                })
              }
            })
            res.redirect(abstract.link);
          })
        })
      })
    })
  } else {
    // 如果 id 不存在，即该文章是一篇新文章
    uploadObj.categories = uploadObj.categories.split(' ').filter(function(obj) {
        obj = obj.trim();
        if (obj !== "") {
          return obj;
        }
    });
    console.log(uploadObj);
    let article = {
      title: uploadObj.title,
      content: marked(uploadObj.content),
      md: uploadObj.content,
      link: '/post/' + uploadObj.link,
      comments: [],
      categories: uploadObj.categories,
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
        categories: uploadObj.categories,
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
        categories.forEach(function(cate) {
          Category.findOne({name: cate}, function(err, category) {
            if (err) {
              console.log(err);
            }
            // 如果 category 已经存在了
            if (category) {
              category.articles.push(article._id);
              category.save(function(err, c) {
                if (err) {
                  console.log(err)
                }
                console.log('category:', c, 'updated');
              })
            } else {
              // 如果 categroy 不存在
              let _category =  new Category({
                name: cate,
                articles: [article._id],
              });
              _category.save(function(err, category) {
                if (err) {
                  console.log(err);
                }
                console.log('category:', category.name, 'saved');
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
