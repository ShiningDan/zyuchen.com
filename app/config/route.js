let Home = require('../controllers/home');
let Upload = require('../controllers/upload');
// let Admin = require('../controllers/admin');

module.exports = function(app) {

  app.get('/', Home.home);
  app.get('/post/:link', Home.article);

  // admin
  app.get('/admin/upload', Upload.upload);
  app.post('/admin/upload/new', Upload.save);
  app.get('/admin/update/:id', Upload.update);
  app.get('/admin/upload/list', Upload.list);
} 