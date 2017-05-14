let Article = require('../models/article');
let User = require('../models/user');

exports.login = function(req, res) {
  let login = req.body.login;
  let name = login.name;
  let pass = login.pass;
  User.findOne({name: name}, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      if (user.password === pass) {
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
          tip: '输入的账号或密码有误'
        });
      }
    } else {
      res.render('./admin-login/admin-login', {
        tip: '没有此用户'
      });
    }
  })
};

exports.adminRequire = function(req, res, next) {
  if (req.session.user) {
    User.findOne({name: req.session.user}, function(err, user) {
      if (err) {
        console.log(err);
      }
      if (user) {
        if (user.role > 10) {
          next();
        } 
      } else{
        res.redirect('/admin/login');        
      }
    })
  } else {
    res.redirect('/admin/login');    
  }
} 