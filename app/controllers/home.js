let Abstract = require('../models/abstract');
let Article = require('../models/article');
let Series = require('../models/series');
let utility = require('utility');
let homepageCount = 5;

exports.home = function(req, res) {
  let lt = req.query.lt;
  let gt = req.query.gt;
  let pageNavPn = {
    prev: "",
    next: "",
  };
  if (lt === undefined && gt === undefined) {
    Abstract.find({}).limit(homepageCount + 1).
    exec(function(err, abstracts) {
      // abstracts = abstracts.sort(function(a, b) {
      //   return b.meta.createAt - a.meta.createAt;
      // })
      if (abstracts.length > homepageCount){
        pageNavPn.next = "?gt=" + abstracts[homepageCount-1]._id;
      }
      res.render('./home/home', {
        "abstracts": abstracts.slice(0, homepageCount),
        "pageNavPn": pageNavPn,
        "pageNav": {
          "prev": pageNavPn.prev === "" ? undefined : "上一页",
          "next": pageNavPn.next === "" ? undefined : "下一页",
          "center": "博客归档"
        }
      });
    });
  } else if (lt !== undefined) {
    Abstract.find({"_id": {"$lt": lt}}).sort({"_id": -1}).limit(homepageCount + 1)
    .exec(function(err, abstracts) {
      abstracts = abstracts.reverse();
      if (abstracts.length <= homepageCount) {
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
      prev: "",
      next: "",
    };
    Article.find({"_id": {"$gt": article._id}}).limit(1)
    .exec(function(err, articleNext) {
      if (err) {
        console.log(err);
      }
      if (articleNext.length === 1) {
        pageNavPn.next = articleNext[0].link;
      }
      Article.find({"_id": {"$lt": article._id}}).sort({"_id": -1}).limit(1)
      .exec(function(err, articlePrev) {
        if (err) {
          console.log(err);
        }
        if (articlePrev.length === 1) {
          pageNavPn.prev = articlePrev[0].link;
        }
        Series.findOne({name: article.series[0]}).limit(10)
        .populate('articles', ['title', 'link', 'meta.createAt'])
        .exec(function(err, series) {
          res.render('./article/article', {
            content: article.content,
            sid: utility.md5(article.link),
            article: article,
            series: series,
            "pageNavPn": pageNavPn,
            "pageNav": {
              "prev": pageNavPn.prev === "" ? undefined : "上一页",
              "next": pageNavPn.next === "" ? undefined : "下一页",
              "center": "博客归档"
            }
          })
        })
      })
    });
  })
}

exports.archives = function(req, res) {
  Abstract.find({}, function(err, abstracts) {
    let articles = {};
    abstracts.forEach(function(abstract) {
      let date = abstract.meta.createAt;
      let year = date.getFullYear();
      let month = date.getUTCMonth() + 1;  // 0-11
      let link = abstract.link;
      let title = abstract.title;
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
    // console.log(articles);  // object keys are in order
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
      articles: articleArray,
    });
  })
}

exports.series = function(req, res) {
  Series.find({})
  .populate('articles', ['title', 'link', 'meta.createAt'])
  .exec(function(err, series) {
    if (err) {
        console.log(err);
      }
      series.forEach(function(s) {
        s.articles = s.articles.sort(function(a, b) {
          return b.meta.createAt - a.meta.createAt;
        });
      })
      res.render('./series/series', {
        series: series,
      });
    });
}