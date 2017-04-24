let Home = require('../controllers/home');
let Upload = require('../controllers/upload');
// let Admin = require('../controllers/admin');

module.exports = function(app) {

  app.get('/', Home.home);
  app.get('/post/:link', Home.article);

  // admin
  app.get('/admin/upload', Upload.upload);
  app.get('/admin/update/:id', Upload.update);
  app.get('/admin/list', Upload.list);
  app.get('/admin/login', Upload.tologin);
  app.post('/admin/upload/new', Upload.save);
  // app.post('/admin/login', Upload.login);
} 