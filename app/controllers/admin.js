let Article = require('../models/article');
let User = require('../models/user');

exports.login = async function(req, res) {
  try {
    let login = req.body.login,
    name = login.name,
    pass = login.pass;
    let user = await User.findOne({name: name});
    if (user) {
      if (user.password === pass) {
        req.session.user = name;
        let articles = await Article.find({});
        res.render('./list/list', {
          pageTitle: '列表 | Yuchen 的主页',
          visited: req.visited,
          tag: req.tag,
          articles: articles
        })
      } else {
        res.render('./admin-login/admin-login', {
          pageTitle: '登录 | Yuchen 的主页',
          visited: req.visited,
          tag: req.tag,
          tip: '输入的账号或密码有误'
        });
      }
    } else {
      res.render('./admin-login/admin-login', {
        pageTitle: '登录 | Yuchen 的主页',
        visited: req.visited,
        tag: req.tag,
        tip: '没有此用户'
      });
    }
  } catch (e) {
    res.redirect('/admin/login');
    // add error process
  }
}

exports.adminRequire = async function(req, res, next) {
  try {
    if (req.session.user) {
      let user = await User.findOne({name: req.session.user});
      if (user) {
        if (user.role > 10) {
          next();
        } 
      } else{
        res.redirect('/admin/login');        
      }
    } else {
      res.redirect('/admin/login'); 
    }
  } catch(e) {
    console.log(e);
    res.redirect('/admnin/login')
    // add error process
  }
}