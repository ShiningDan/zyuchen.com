let Abstract = require('../models/abstract');
let Article = require('../models/article');
let Series = require('../models/series');
let utility = require('utility');
let homepageCount = 3;


exports.home = async function(req, res) {
  try {
    let lt = req.query.lt,
    gt = req.query.gt,
    pageNavPn = {
      prev: "",
      next: "",
    };
    let redis = res.redis;
    
    if (lt === undefined && gt === undefined) {
      let abstracts = await redis.lrangeAsync('abstracts', 0, 100).then((value) => value.reverse().slice(0, homepageCount + 1)).then((values) => values.map((value) => JSON.parse(value)));
      if (abstracts.length === 0) {
        abstracts = await Abstract.find({}).sort({"_id": -1}).limit(homepageCount + 1);
      }
      if (abstracts.length > homepageCount){
        pageNavPn.next = "?gt=" + abstracts[homepageCount-1]._id;
      }
      res.render('./home/home', {
        pageTitle: 'Yuchen 的主页',
        visited: req.visited,
        tag: req.tag,
        "abstracts": abstracts.slice(0, homepageCount),
        "pageNavPn": pageNavPn,
        "pageNav": {
          "prev": pageNavPn.prev === "" ? undefined : "上一页",
          "next": pageNavPn.next === "" ? undefined : "下一页",
          "center": "博客归档"
        }
      });
    } else if (lt !== undefined) {
      let abstracts = await Abstract.find({"_id": {"$gt": lt}}).limit(homepageCount + 1).then((value) => value.reverse());
      if (abstracts.length <= homepageCount) {
        pageNavPn.next = "?gt=" + abstracts[abstracts.length-1]._id;
        res.render('./home/home', {
          pageTitle: 'Yuchen 的主页',
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
          pageTitle: 'Yuchen 的主页',
          visited: req.visited,
          tag: req.tag,
          "abstracts": abstracts.slice(1, homepageCount + 1),          
          "pageNavPn": pageNavPn,
          "pageNav": {
            "prev": "上一页",
            "next": "下一页",
            "center": "博客归档"
          }
        });
      }
    } else if (gt !== undefined) {
      let abstracts = await Abstract.find({"_id": {"$lt": gt}}).sort({"_id": -1}).limit(homepageCount + 1);
      if (abstracts.length <= homepageCount) {
        pageNavPn.prev = "?lt=" + abstracts[0]._id;
        res.render('./home/home', {
          pageTitle: 'Yuchen 的主页',
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
          pageTitle: 'Yuchen 的主页',
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
    let redis = res.redis, article, articleNext, articlePrev, series, result, pageNavPn, pageNav;

    let exists = await redis.hexistsAsync('articlesByLink', link);
    exists = false;
    if (exists) {
      result = await redis.multi().hget('articlesByLink', link).lrange('abstracts', 0, 100).lrange('series', 0, 10).execAsync();
      article = JSON.parse(result[0]);
      abstracts = result[1].map((abstract) => JSON.parse(abstract));
      let index;
      for (let i = 0; i < abstracts.length; i++) {
        if (abstracts[i].link === link) {
          index = i
        }
      }
      articleNext = index === result[1].length - 1 ? null : abstracts[index + 1];
      articlePrev = index === 0 ? null : abstracts[index - 1];
      for (let i = 0; i < result[2].length; i++) {
        let s = JSON.parse(result[2][i])
        if (s.name === article.series[0]) {
          series = s;
          break;
        }
      }
      pageNavPn = {
        prev: articlePrev !== null ? articlePrev.link : "",
        next: articleNext !== null ? articleNext.link : "",
      }
      pageNav = {
        "prev": pageNavPn.prev === "" ? undefined : articlePrev.title,
        "next": pageNavPn.next === "" ? undefined : articleNext.title,
        "center": ""
      }
    } else {
      article = await Article.findOne({'link': link});
      articleNext = Article.find({"_id": {"$gt": article._id}}).limit(1);
      articlePrev = Article.find({"_id": {"$lt": article._id}}).sort({"_id": -1}).limit(1);
      series = Series.findOne({name: article.series[0]}).limit(10).populate('articles', ['title', 'link', 'meta.createAt']);
      [articleNext, articlePrev, series] = await Promise.all([articleNext, articlePrev, series]);
      pageNavPn = {
        prev: articlePrev.length === 1 ? articlePrev[0].link : "",
        next: articleNext.length === 1 ? articleNext[0].link : "",
      };
      pageNav = {
        "prev": pageNavPn.prev === "" ? undefined : articlePrev[0].title,
        "next": pageNavPn.next === "" ? undefined : articleNext[0].title,
        "center": ""
      }
    }
    res.render('./article/article', {
      pageTitle: article.title,
      visited: req.visited,
      tag: req.tag,
      content: acceptWebp === true ? article.contentWebp : article.content,
      sid: utility.md5(article.link),
      article: article,
      series: series,
      "pageNavPn": pageNavPn,
      "pageNav": pageNav,
    })
  } catch(e) {
    console.log(e);
    res.redirect('/');
    // add error process
  }
}



exports.archives = async function(req, res) {
  try {
    let redis = res.redis;
    let abstracts = await redis.lrangeAsync('abstracts', 0, 100).then((values) => values.map((value) => JSON.parse(value)));
    if (abstracts.length === 0) {
      abstracts = await Abstract.find({});
    }
    // let abstracts = await Abstract.find({});  
    let articles = {};
    abstracts.forEach(function(abstract) {
      let date = new Date(abstract.meta.createAt),
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
      pageTitle: '归档 | Yuchen 的主页',
      visited: req.visited,
      tag: req.tag,
      articles: articleArray,
    });
  } catch (e) {
    console.log(e);
    res.redirect('/')
    // add error process
  }
}


exports.series = async function(req, res) {
  try {
    let redis = res.redis;
    let series = await redis.lrangeAsync('series', 0, 100).then((values) => values.map((value) => {
      let s = JSON.parse(value)
      s.articles.map((a) => {
        a.meta.createAt = new Date(a.meta.createAt); 
        return a;
      })
      return s;
    }));
    if (series.length === 0) {
      series = await Series.find({}).populate('articles', ['title', 'link', 'meta.createAt']);
    }
    // let series = await Series.find({}).populate('articles', ['title', 'link', 'meta.createAt']);

    series.forEach(function(s) {
      s.articles = s.articles.sort(function(a, b) {
        return b.meta.createAt - a.meta.createAt;
      });
    });
    res.render('./series/series', {
      pageTitle: '专题 | Yuchen 的主页',
      visited: req.visited,
      tag: req.tag,
      series: series,
    });
  } catch (e) {
    console.log(e);
    res.redirect('/')
    // add exception process
  }
}

exports.error = async function(req, res) {
  try {
    res.render('./error/error', {
      pageTitle: '404 | Yuchen 的主页',
      visited: req.visited,
    });
  } catch(e) {
    res.send('Sorry cant find that!')
  }
}