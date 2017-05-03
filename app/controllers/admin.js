let Article = require('../models/article');

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

exports.adminRequire = function(req, res, next) {
  if (req.session.user === 'zhangyuchen') {
    console.log(req.session.user);                     // 需要验证用户为 admin 用户
    next();
  } else {
    res.redirect('/admin/login');
  }
} 