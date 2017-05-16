let Home = require('../controllers/home');
let Upload = require('../controllers/upload');
let Admin = require('../controllers/admin');

module.exports = function(app) {

  app.get('/', Home.home);
  app.get('/archives', Home.archives);
  app.get('/series', Home.series);
  app.get('/post/:link', Home.article);

  // admin
  app.get('/admin/upload', Admin.adminRequire, Upload.upload);
  app.get('/admin/update/:id', Admin.adminRequire, Upload.update);
  app.get('/admin/list', Admin.adminRequire, Upload.list);
  app.delete('/admin/list', Admin.adminRequire, Upload.delete);
  app.get('/admin/login', Upload.tologin);
  app.post('/admin/upload/new', Admin.adminRequire, Upload.save);
  app.post('/admin/login', Admin.login);
  app.get('/admin', Upload.tologin);
} 