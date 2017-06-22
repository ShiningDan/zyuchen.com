let fs = require('fs');
let path = require('path');
let utility = require('utility');

let tag = utility.md5(fs.readFileSync(path.join(__dirname, '../../www/static/css/common-combo.css'), 'utf-8'));
let gavTag = "1";

exports.checkll = function(req, res, next) {
  if (req.cookies.v && req.cookies.v === tag) {
    req.visited = true;
  } else {
    req.visited = false;
    req.tag = tag;
  }

  if (req.cookies.analytics && req.cookies.analytics === gavTag) {
    req.gav = true;
  } else {
    req.gav = false;
    req.gavTag = gavTag;
  }
  next();
}