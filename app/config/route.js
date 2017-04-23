let Home = require('../controllers/home');
let Upload = require('../controllers/upload');

module.exports = function(app) {

  app.get('/', Home.home);
  app.get('/admin/upload', Upload.upload);
} 