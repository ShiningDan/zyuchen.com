
exports.upload = function(req, res) {
  res.render('./upload/upload', {
    "pageNav": {
      "prev": "上一页",
      "next": "下一页",
      "center": "博客归档"
    }
  });
}