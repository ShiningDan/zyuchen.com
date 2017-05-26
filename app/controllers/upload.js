let Article = require('../models/article');
let Abstract = require('../models/abstract');
let Category = require('../models/category');
let Series = require('../models/series');
let marked = require('marked');
let markdownToc = require('markdown-toc');
let underScore = require('underscore');            // 查看 underscore 的使用方法
let path = require('path');
let fs = require('fs');
var sizeOf = require('image-size');

exports.upload = async function(req, res) {
  try {
    let categories = Category.find({});
    let series = Series.find({});
    [categories, series] = await Promise.all([categories, series]);
    res.render('./upload/upload', {
      pageTitle: '上传 | Yuchen 的主页',
      visited: req.visited,
      article: {},
      abstract: {},
      categories: categories,
      series: series,
    });
  } catch(e) {
    console.log(e);
    res.redirect('/admin/list');
    // add error process
  }
}

function handleUploadObj(uploadObj) {
  // 处理 upload.categories, 因为 categories 在 input 里面有，在 checkbox 里面也有
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

  let markdowntocdiv = '<div id="toc"><header>文章目录</header>' + marked(markdownToc(uploadObj.content).content) + '</div>';
  let content = markdowntocdiv + marked(uploadObj.content);
  uploadObj.md = uploadObj.content;
  // 创建支持 WebP 的 Content 和 非 WebP 的 Content
  let reg = /<img([\s\S]+?)src\s*="([\s\S]+?).(png)"/g;
  uploadObj.content = content.replace(reg, function(value, p1, p2) {
    try {
      let imageSize = sizeOf(path.join(__dirname, '../../www/static', p2+'.png'));
      return '<img' + p1 + 'data-src="' + p2 +'.png" width=' + imageSize.width + ' height='+imageSize.height + ' alt=' + p2;
    } catch(e) {
      console.log(e);
      // return '<img' + p1 + 'data-src="' + p2 +'.png"' + ' alt=' + p2;
    }
    
  })
  uploadObj.contentWebp = uploadObj.content.replace(reg, '<img$1src="$2.webp"');

}

async function removeArticleformCategories(categories, id) {
  categories = await Category.find({name: categories});
  let promises = categories.map(function(category) {
    //如果该分类只有一篇文章，则删除该分类
    if (category.articles.length === 1) {
      return category.remove();
    } else {
      // 如果有多篇文章，则删除该文章的信息
      category.articles.splice(category.articles.indexOf(id), 1);
      return category.save();
    }
  });
  return Promise.all(promises);
}

async function removeArticleformSeries(serieses, id) {
  serieses = await Series.find({name: serieses});
  let promises = serieses.map((series) => {
    // 即使该文章是本专题的最后一篇文章，也不删除本专题
    series.articles.splice(series.articles.indexOf(id), 1);
    return series.save();
  })
  return Promise.all(promises);
}

async function addArticlesToSeries(serieses, id) {
  if (serieses.length !== 0) {
    let promises = serieses.map(function(series) {
      return Series.findOne({name: series}).then(function(s) {
        if (s) {
          // 如果该 series 已经存在了
          let sSet = new Set(s.articles.map(function(article) {
            return article.toString();
          }));
          sSet.add(id.toString());
          s.articles = Array.from(sSet);
          return s.save()
        } else {
          // 如果该 series 不存在
          let _series = new Series({
            name: series,
            articles: [id],
          }); 
          return  _series.save()             
        }
      }).then((s) => console.log('series:', s.name, 'updated'));
    });
  }
}

async function addArticlesToCategories(categories, id) {
  if (categories.length !== 0) {
    let promises = categories.map(function(category) {
      return Category.findOne({name: category}).then(function(cate) {
        // 如果 category 已经存在了
        if (cate) {
          let cSet = new Set(cate.articles.map(function(article) {
            return article.toString();
          }));
          cSet.add(id.toString());
          cate.articles = Array.from(cSet);
          return cate.save();
        } else {
          // 如果 categroy 不存在
          let _category =  new Category({
            name: category,
            articles: [id],
          });
          return _category.save();
        }
      }).then((c) => console.log('category:', c, 'updated'));
    })
  }
}

exports.save = async function(req, res) {
  try {
    let uploadObj = req.body.upload,
    id = uploadObj._id;
    if (id) {
      // 如果 id 存在，即该文章原来就已经存在了
      handleUploadObj(uploadObj);
      let article = await Article.findById(id);
      let abstract = await Abstract.findOne({link: article.link});

      // 判断此次更新中旧的 series 是否被从文章中删除，如果删除了，则将 series 中对应的文章删除
      let seriesTmp = [],
          categoriesTmp = [];
      article.series.forEach(function(series){
        if (!uploadObj.series.includes(series)) {
          seriesTmp.push(series);
        }
      })
      // 判断此次更新中旧的 categories 中的元素在修改以后被删去，则要从对应的 category 中删除该文章的链接
      article.categories.forEach(function(cate) {
        if (!uploadObj.categories.includes(cate)) {
          categoriesTmp.push(cate);
        }
      })

      //更新 article 并且存入到数据库，替代原来的 article
      let _article = underScore.extend(article, uploadObj);
      let _abstract = underScore.extend(abstract, {
        title: uploadObj.title,
        abstract: uploadObj.abstract,
        link: abstract.link,
        categories: uploadObj.categories,
      }); 

      let createAt = new Date(uploadObj.createAt);
      let updateAt = new Date(uploadObj.updateAt);

      if (!Number.isNaN(createAt.valueOf())) {
        _article.meta.createAt = createAt;
        _abstract.meta.createAt = createAt;
      }

      if (!Number.isNaN(updateAt.valueOf())) {
        _article.meta.updateAt = updateAt;
        _abstract.meta.updateAt = updateAt;
      }

      await Promise.all([_article.save(), _abstract.save(), removeArticleformSeries(seriesTmp, id), removeArticleformCategories(categoriesTmp, id), addArticlesToCategories(_article.categories, id), addArticlesToSeries(_article.series, id)]);
      
      res.redirect(_article.link);
    } else {
      // 如果 id 不存在，即该文章是一篇新文章
      handleUploadObj(uploadObj);

      let article = {
        title: uploadObj.title,
        md: uploadObj.md,
        link: '/post/' + uploadObj.link,
        comments: [],
        categories: uploadObj.categories,
        series: uploadObj.series,
        content: uploadObj.content,
        contentWebp: uploadObj.contentWebp,
      }

      let abstract = {
        title: uploadObj.title,
        abstract: uploadObj.abstract,
        link: '/post/' + uploadObj.link,
        comments: [],
        categories: uploadObj.categories,
      };

      let createAt = new Date(uploadObj.createAt);
      let updateAt = new Date(uploadObj.updateAt);

      // 首先创建 article，并且保存
      let _article = Article(article);
      // 其次创建 abstract，并且保存
      let _abstract = Abstract(abstract);
      // 如果在创建文章的时候提供了创建时间
      if (!Number.isNaN(createAt.valueOf())) {
        _article.meta.createAt = createAt;
        _abstract.meta.createAt = createAt;
      }
      // 如果在创建文章的时候提供了更新时间
      if (!Number.isNaN(updateAt.valueOf())) {
        _article.meta.updateAt = updateAt;
        _abstract.meta.updateAt = updateAt;
      }

      await Promise.all([_article.save(), _abstract.save(), addArticlesToSeries(_article.series, _article._id), addArticlesToCategories(_article.categories, _article._id)]);
      res.redirect(_article.link);
    }
  } catch(e) {
    console.log(e);
    res.redirect('/admin/list');
    // add error process
  }
}


exports.list = async function(req, res) {
  try {
    let articles = await Article.find({});
    res.render('./list/list', {
      pageTitle: '列表 | Yuchen 的主页',
      visited: req.visited,
      articles: articles
    })
  } catch(e) {
    console.log(e);
    res.redirect('/admin/login');
    // add error process
  }
}

exports.update = async function(req, res) {
  try {
    let _id = req.params.id;
    let article = await Article.findById(_id);
    let abstract = Abstract.findOne({link: article.link});
    let categories = Category.find({});
    let series = Series.find({});
    [abstract, categories, series] = await Promise.all([abstract, categories, series]);
    res.render('./upload/upload', {
      pageTitle: '上传 | Yuchen 的主页',
      visited: req.visited,
      article: article,
      abstract: abstract,
      categories: categories,
      series: series,
    });
  } catch(e) {
    console.log(e);
    res.redirect('/admin/list');
  }
}

exports.tologin = function(req, res) {
  res.render('./admin-login/admin-login', {
    pageTitle: '登录 | Yuchen 的主页',
    visited: req.visited,
    tip: '请输入账号和密码'
  });
}

exports.delete = async function(req, res) {
  try {
    let _id = req.query.id;
    let article = await Article.findById(_id);
    let abstract = await Abstract.findOne({link: article.link});
    await Promise.all([article.remove(), abstract.remove(), removeArticleformCategories(article.categories, _id), removeArticleformSeries(article.series, _id)])
    res.json({success: 1});
  } catch(e) {
    console.log(e);
    res.json({success: 0});
    // add error process
  }
}