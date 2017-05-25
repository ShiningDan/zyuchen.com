let Home = require('../controllers/home');
let Upload = require('../controllers/upload');
let Admin = require('../controllers/admin');
let Cookie = require('../controllers/cookie');

module.exports = function(app) {

  app.get('/', Cookie.checkll, Home.home);
  app.get('/archives/', Cookie.checkll, Home.archives);
  app.get('/series/', Cookie.checkll, Home.series);
  app.get('/post/:link', Cookie.checkll, Home.article);

  // admin
  app.get('/admin/upload', Admin.adminRequire, Cookie.checkll, Upload.upload);
  app.get('/admin/update/:id', Admin.adminRequire, Cookie.checkll, Upload.update);
  app.get('/admin/list', Admin.adminRequire, Cookie.checkll, Upload.list);
  app.delete('/admin/list', Admin.adminRequire, Upload.delete);
  app.get('/admin/login', Cookie.checkll, Upload.tologin);
  app.post('/admin/upload/new', Admin.adminRequire, Cookie.checkll, Upload.save);
  app.post('/admin/login', Cookie.checkll, Admin.login);
  app.get('/admin', Cookie.checkll, Upload.tologin);

  //404 Error
  app.use(function(req, res, next) {
    res.status(404);
    Home.error(req, res);
  });
} 