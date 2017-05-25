let Abstract = require('../models/abstract');
let Article = require('../models/article');
let Series = require('../models/series');
let utility = require('utility');
let homepageCount = 5;


exports.home = async function(req, res) {
  try {
    let lt = req.query.lt,
    gt = req.query.gt,
    pageNavPn = {
      prev: "",
      next: "",
    };
    
    if (lt === undefined && gt === undefined) {
      let abstracts = await Abstract.find({}).limit(homepageCount + 1);
      if (abstracts.length > homepageCount){
        pageNavPn.next = "?gt=" + abstracts[homepageCount-1]._id;
      }
      res.render('./home/home', {
        visited: req.visited,
        tag: req.tag,
        "abstracts": abstracts.slice(0, homepageCount).reverse(),
        "pageNavPn": pageNavPn,
        "pageNav": {
          "prev": pageNavPn.prev === "" ? undefined : "上一页",
          "next": pageNavPn.next === "" ? undefined : "下一页",
          "center": "博客归档"
        }
      });
    } else if (lt !== undefined) {
      let abstracts = await Abstract.find({"_id": {"$lt": lt}}).sort({"_id": -1}).limit(homepageCount + 1);
      abstracts = abstracts.reverse();
      if (abstracts.length <= homepageCount) {
        pageNavPn.next = "?gt=" + abstracts[abstracts.length-1]._id;
        res.render('./home/home', {
          visited: req.visited,
          tag: req.tag,
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
          visited: req.visited,
          tag: req.tag,
          "abstracts": abstracts.slice(1, homepageCount+1),          
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": "上一页",
            "next": "下一页",
            "center": "博客归档"
          }
        });
      }
    } else if (gt !== undefined) {
      let abstracts = await Abstract.find({"_id": {"$gt": gt}}).limit(homepageCount + 1);
      if (abstracts.length <= homepageCount) {
        pageNavPn.prev = "?lt=" + abstracts[0]._id;
        res.render('./home/home', {
          visited: req.visited,
          tag: req.tag,
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
          visited: req.visited,
          tag: req.tag,
          "abstracts": abstracts.slice(0, homepageCount),          
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": "上一页",
            "next": "下一页",
            "center": "博客归档"
          }
        });
      }
    }
  } catch (e) {
    console.log(e);
    // add error process
  }
}


exports.article = async function(req, res) {
  try {
    let acceptWebp = req.get('Accept').indexOf('image/webp') === -1 ? false : true,
    link = '/post/' + req.params.link;
    let article = await Article.findOne({'link': link});
    let articleNext = Article.find({"_id": {"$gt": article._id}}).limit(1);
    let articlePrev = Article.find({"_id": {"$lt": article._id}}).sort({"_id": -1}).limit(1);
    let series = Series.findOne({name: article.series[0]}).limit(10).populate('articles', ['title', 'link', 'meta.createAt']);
    let result = await Promise.all([articleNext, articlePrev, series]);
    let pageNavPn = {
      prev: result[1].length === 1 ? result[1][0].link : "",
      next: result[0].length === 1 ? result[0][0].link : "",
    };
    res.render('./article/article', {
      visited: req.visited,
      tag: req.tag,
      content: acceptWebp === true ? article.contentWebp : article.content,
      sid: utility.md5(article.link),
      article: article,
      series: result[2],
      "pageNavPn": pageNavPn,
      "pageNav": {
        "prev": pageNavPn.prev === "" ? undefined : result[1][0].title,
        "next": pageNavPn.next === "" ? undefined : result[0][0].title,
        "center": ""
      }
    })
  } catch (e) {
    res.redirect('/');
    // add error process
  }
}



exports.archives = async function(req, res) {
  try {
    let abstracts = await Abstract.find({});
    let articles = {};
    abstracts.forEach(function(abstract) {
      let date = abstract.meta.createAt,
      year = date.getFullYear(),
      month = date.getUTCMonth() + 1,
      {link, title} = abstract;
      if (articles[year]) {
        let aYear = articles[year];  //aYear should be an array of months
        if (aYear[month]) {
          let aMonth = aYear[month];  //aMonth should be an array of article info
          aMonth = aMonth.push({
            title: title,
            link: link,
            date: date,
          });
        } else {
          aYear[month] = [{
            title: title,
            link: link,
            date: date,
          }];
        }
      } else {
        articles[year] = {};
        articles[year][month] = [{
          title: title,
          link: link,
          date: date,
        }];
      }
    })
    let articleArray = [];
    for (let i in articles) {
      let years = {};
      years[i] = [];
      articleArray.push(years);
      for (let j in articles[i]) {
        let months = {};
        months[j] = articles[i][j];
        articleArray[articleArray.length-1][i].push(months);
      }
    }
    res.render('./archives/archives', {
      visited: req.visited,
      tag: req.tag,
      articles: articleArray,
    });
  } catch (e) {
    res.redirect('/')
    // add error process
  }
}


exports.series = async function(req, res) {
  try {
    let series = await Series.find({}).populate('articles', ['title', 'link', 'meta.createAt']);
    series.forEach(function(s) {
      s.articles = s.articles.sort(function(a, b) {
          return b.meta.createAt - a.meta.createAt;
        });
    });
    res.render('./series/series', {
      visited: req.visited,
      tag: req.tag,
      series: series,
    });
  } catch (e) {
    res.redirect('/')
    // add exception process
  }
}

exports.error = async function(req, res) {
  try {
    res.render('./error/error', {
      visited: req.visited,
    });
  } catch(e) {
    res.send('Sorry cant find that!')
  }
}