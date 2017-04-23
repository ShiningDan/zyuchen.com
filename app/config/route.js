let Home = require('../controllers/home');
let Upload = require('../controllers/upload');

module.exports = function(app) {

  app.get('/', Home.home);
  app.get('/post/:link', Home.article);

  // admin
  app.get('/admin/upload', Upload.upload);
  app.post('/admin/upload/new', Upload.save);
} 