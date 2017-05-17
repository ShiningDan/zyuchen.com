let Article = require('../models/article');
let Abstract = require('../models/abstract');
let Category = require('../models/category');
let Series = require('../models/series');
let marked = require('marked');
let markdownToc = require('markdown-toc');
let underScore = require('underscore');            // 查看 underscore 的使用方法

exports.upload = function(req, res) {
  Category.find({}, function(err, categories) {
    Series.find({}, function(err, series) {
      res.render('./upload/upload', {
        article: {},
        abstract: {},
        categories: categories,
        series: series,
      });
    })
  })
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
      // 处理 upload.cartegories, 因为 categories 在 input 里面有，在 checkbox 里面也有
      uploadObj.categories = uploadObj.categories.split(' ').filter(function(obj) {
        obj = obj.trim();
        if (obj !== "") {
          return obj;
        }
      });
      let cateSet = new Set(uploadObj.categories);
      if (typeof uploadObj.cbcategory === "string") {
        cateSet.add(uploadObj.cbcategory);
      } else if (typeof uploadObj.cbcategory === "object") {
        uploadObj.cbcategory.forEach(function(element) {
          cateSet.add(element)
        });
      }
      uploadObj.categories = Array.from(cateSet);

      // 处理 upload.series, 因为 series 在 input 里面有，在 checkbox 里面也有
      uploadObj.series = uploadObj.series.split(' ').filter(function(obj) {
          obj = obj.trim();
          if (obj !== "") {
          return obj;
        }
      });
      let seriesSet = new Set(uploadObj.series);
      if (typeof uploadObj.cseries === "string") {
        seriesSet.add(uploadObj.cseries);
      } else if (typeof uploadObj.cseries === "object") {
        uploadObj.cseries.forEach(function(element) {
          seriesSet.add(element)
        });
      }
      uploadObj.series = Array.from(seriesSet);

      uploadObj.md = uploadObj.content;
      let markdowntocdiv = '<div id="toc"><header>文章目录</header>' + marked(markdownToc(uploadObj.content).content) + '</div>';
      uploadObj.content = markdowntocdiv + marked(uploadObj.content);
      // 创建支持 WebP 的 Content 和 非 WebP 的 Content
      let reg = /<img([\s\S]+?)src\s*="([\s\S]+?).(png)"/g;
      uploadObj.contentWebp = uploadObj.content.replace(reg, '<img$1src="$2.webp"');

      // 判断此次更新中 series 是否从文章中删除，如果删除了，则将 series 中对应的文章删除
      article.series.forEach(function(series){
        if (!uploadObj.series.includes(series)) {
          Series.findOne({name: series}, function(err, s) {
            if (s.articles.length === 1) {
              s.remove(function(err, series) {
                console.log(err);
              })
            } else {
              s.articles.splice(s.articles.indexOf(series), 1);
              s.save(function(err, s) {
                console.log(err);
              })
            }
          })
        }
      })

      //更新 article 并且存入到数据库，替代原来的 article
      let _article = underScore.extend(article, uploadObj);

      let createAt = new Date(uploadObj.createAt);
      let updateAt = new Date(uploadObj.updateAt);

      if (!Number.isNaN(createAt.valueOf())) {
        _article.meta.createAt = createAt;
      }

      if (!Number.isNaN(updateAt.valueOf())) {
        _article.meta.updateAt = updateAt;
      }

      _article.save(function(err, article) {
        if (err) {
          console.log(err);
        }

        // 如果有series，则更新 series
        if (uploadObj.series.length !== 0) {
          uploadObj.series.forEach(function(series) {
            Series.findOne({name: series}, function(err, s) {
              if (s) {
                let sSet = new Set(s.articles);
                sSet.add(article._id);
                s.articles = Array.from(sSet);
                s.save(function(err, s) {
                  if (err) {
                    console.log(err);
                  }
                })
              } else {
                let _series = new Series({
                  name: series,
                  articles: [article._id],
                });
                // console.log(_series);   
                _series.save(function(err, s) {
                  if (err) {
                    console.log(err);
                  }
                })             
              }
            })
          })
        }

        // 更新 abstract 和 category
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

          if (!Number.isNaN(createAt.valueOf())) {
            _abstract.meta.createAt = createAt;
          }

          if (!Number.isNaN(updateAt.valueOf())) {
            _abstract.meta.updateAt = updateAt;
          }

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
    let cateSet = new Set(uploadObj.categories);
    if (typeof uploadObj.cbcategory === "string") {
      cateSet.add(uploadObj.cbcategory);
    } else if (typeof uploadObj.cbcategory === "object") {
      uploadObj.cbcategory.forEach(function(element) {
        cateSet.add(element)
      });
    }
    uploadObj.categories = Array.from(cateSet);

    // 处理 upload.series, 因为 series 在 input 里面有，在 checkbox 里面也有
    uploadObj.series = uploadObj.series.split(' ').filter(function(obj) {
        obj = obj.trim();
        if (obj !== "") {
        return obj;
      }
    });
    let seriesSet = new Set(uploadObj.series);
    if (typeof uploadObj.cseries === "string") {
      seriesSet.add(uploadObj.cseries);
    } else if (typeof uploadObj.cseries === "object") {
      uploadObj.cseries.forEach(function(element) {
        seriesSet.add(element)
      });
    }
    uploadObj.series = Array.from(seriesSet);

    let createAt = new Date(uploadObj.createAt);
    let updateAt = new Date(uploadObj.updateAt);

    let article = {
      title: uploadObj.title,
      md: uploadObj.content,
      link: '/post/' + uploadObj.link,
      comments: [],
      categories: uploadObj.categories,
      series: uploadObj.series,
    }

    let markdowntocdiv = '<div id="toc"><header>文章目录</header>' + marked(markdownToc(uploadObj.content).content) + '</div>';
    article.content = markdowntocdiv + marked(uploadObj.content);
    // 创建支持 WebP 的 Content 和 非 WebP 的 Content
    let reg = /<img([\s\S]+?)src\s*="([\s\S]+?).(png)"/g;
    article.contentWebp = article.content.replace(reg, '<img$1src="$2.webp"');

    // 首先创建 article，并且保存
    let _article = Article(article);

    if (!Number.isNaN(createAt.valueOf())) {
      _article.meta.createAt = createAt;
    }

    if (!Number.isNaN(updateAt.valueOf())) {
      _article.meta.updateAt = updateAt;
    }
    
    _article.save(function(err, article) {
      if (err) {
        console.log(err);
      }
      console.log('article saved');

      // 如果有series，则更新 series
      if (uploadObj.series.length !== 0) {
        uploadObj.series.forEach(function(series) {
          Series.findOne({name: series}, function(err, s) {
            if (s) {
              let sSet = new Set(s.articles);
              sSet.add(article._id);
              s.articles = Array.from(sSet);
              s.save(function(err, s) {
                if (err) {
                  console.log(err);
                }
                console.log('series:', s.name, 'updated');
              })
            } else {
              let _series = new Series({
                name: series,
                articles: [article._id],
              });
              // console.log(_series);   
              _series.save(function(err, s) {
                if (err) {
                  console.log(err);
                }
                console.log('series:', s.name, 'saved');                
              })             
            }
          })
        })
      }

      let abstract = {
        title: uploadObj.title,
        abstract: uploadObj.abstract,
        link: '/post/' + uploadObj.link,
        comments: [],
        categories: uploadObj.categories,
      };
      // 其次创建 abstract，并且保存
      _abstract = Abstract(abstract);

      if (!Number.isNaN(createAt.valueOf())) {
        _abstract.meta.createAt = createAt;
      }

      if (!Number.isNaN(updateAt.valueOf())) {
        _abstract.meta.updateAt = updateAt;
      }

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
      articles: articles
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
      Category.find({}, function(err, categories) {
        Series.find({}, function(err, series) {
          res.render('./upload/upload', {
            article: article,
            abstract: abstract,
            categories: categories,
            series: series,
          });
        })
      })
    })
  })
};

exports.tologin = function(req, res) {
  res.render('./admin-login/admin-login', {
    tip: '请输入账号和密码'
  });
}


exports.login = function(req, res) {
  let login = req.body.login;
  let name = login.name;
  let pass = login.pass;
  if (name === "zhangyuchen" && pass === "123456") {
    req.session.user = name;
    Article.find({}, function(err, articles) {
      if (err) {
        console.log(err);
      }
      res.render('./list/list', {
        articles: articles
      })
    })
  } else {
    res.render('./admin-login/admin-login', {
      tip: '输入的密码有误'
    });
  }
};

exports.delete = function(req, res) {
  let _id = req.query.id;
  Article.findById(_id, function(err, article) {
    if (err) {
      console.log(err);
    }
    // 删除该文章
    article.remove(function(err, article) {
      Abstract.findOne({link: article.link}, function(err, abstract) {
        // 删除该简介
        abstract.remove(function(err, abstract) {
          // 删除对应分类中文章的信息。
          let errflag = false;
          article.categories.forEach(function(cate) {
            Category.findOne({name: cate}, function(err, category) {
              // 如果该分类只有一篇文章，则删除该分类
              if (category.articles.length === 1) {
                category.remove(function(err, c) {
                  if (err) {
                    console.log(err);
                    errflag = true;
                  }
                })
              } else {
                // 如果有多篇文章，则删除该文章的信息
                category.articles.splice(category.articles.indexOf(article._id), 1);
                category.save(function(err, c) {
                  if (err) {
                    console.log(err)
                    errflag = true;
                  }
                })
              }
            })
          })
          if (!errflag) {
            res.json({success: 1});
          }
        })
        // 删除对应专题中文章的信息
        article.series.forEach(function(s) {
          Series.findOne({name: s}, function(err, series) {
            //即使该文章是本专题的最后一篇文章，也不删除本专题
            series.articles.splice(series.articles.indexOf(article._id), 1);
            series.save(function(err, s) {
              if (err) {
                console.log(err);
              }
            })
          })
        })
      })
    })
  })
}