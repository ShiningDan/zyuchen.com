let mongoose = require('mongoose');
let redis = require('redis');
let bluebird = require('bluebird');
let Abstract = require('./app/models/abstract');
let Article = require('./app/models/article');
let Series = require('./app/models/series');
let schedule = require('node-schedule');
// let Category = require('./app/models/category');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * 这个函数实现的功能是从 Mongodb 中获取数据，并且发送给 Redis
 * 
 * @param {String} mongUrl 
 * @param {String} collection 
 * @param {Array} keys 
 */
async function fetchFormMongoToRedis(redisClient) {
  try {
    let [abstracts, series, articles] = await Promise.all([Abstract.find({}), Series.find({}).populate('articles', ['title', 'link', 'meta.createAt']), Article.find({})])
  
    let seriesStrings = series.map((series) => JSON.stringify(series)),
    abstractsStrings = abstracts.map((abstract) => JSON.stringify(abstract)),
    articlesStrings = articles.map((article) => {
      article.md = null;
      return JSON.stringify(article);
    });
    
    let saveSeries = redisClient.multi().del('series').rpush('series', seriesStrings).execAsync();
    let saveAbstracts = redisClient.multi().del('abstracts').rpush('abstracts', abstractsStrings).execAsync();
    // let saveArticles = redisClient.multi().del('articles').rpush('articles', articlesStrings).execAsync();
    let saveArticlesByLink = redisClient.multi().del('articlesByLink');
    for (let i = 0; i < articles.length; i++) {
      saveArticlesByLink.hset('articlesByLink', articles[i].link, articlesStrings[i]);
    }
    saveArticlesByLink.execAsync();
    let saveArticlesById = redisClient.multi().del('articlesById');
    for (let i = 0; i < articles.length; i++) {
      saveArticlesById.hset('articlesById', articles[i]._id.toString(), articlesStrings[i]);
    }
    saveArticlesById.execAsync();

    await Promise.all([ saveSeries, saveAbstracts, saveArticlesByLink, saveArticlesById]).then((value) => console.log('finish fetch data from mongo to redis: series', value[0][1], ', abstracts', value[1][1], ', articles'));
  } catch(e) {
    console.log(e)
  }
}

try {
  //connect mongodb
  let mongoUrl = 'mongodb://zyc:blog@127.0.0.1:27017/blog';
  mongoose.Promise = global.Promise;
  mongoose.connect(mongoUrl, function(err) {
    if (err) {
      console.log("Error connecting to mongodb", err)
    }
  });

  //connect redis
  let redisClient = redis.createClient({host : 'localhost', port : 6379});
  redisClient.on("error", function(err) {
    console.error("Error connecting to redis", err);
  });

  var rule = new schedule.RecurrenceRule();
  rule.minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  // rule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  schedule.scheduleJob(rule, function(){
    console.log('Redis Fetch Schedule start at:' + new Date());
    fetchFormMongoToRedis(redisClient);
  }); 
} catch(e) {
  console.log(e);
}