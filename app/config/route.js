let Home = require('../controllers/home');

module.exports = function(app) {

  app.get('/', Home.home);
} 