exports.checkll = function(req, res, next) {
  if (req.cookies.v) {
    req.visited = true;
  } else {
    req.visited = false;
    res.cookie('v', 0, {});
  }
  next();
}