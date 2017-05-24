let fs = require('fs');
let path = require('path');
let utility = require('utility');

let tag = utility.md5(fs.readFileSync(path.join(__dirname, '../../www/static/css/common-combo.css'), 'utf-8'));

exports.checkll = function(req, res, next) {
  if (req.cookies.v && req.cookies.v === tag) {
    req.visited = true;
  } else {
    req.visited = false;
    req.tag = tag;
  }
  next();
}