let request = require('superagent');

exports.ga = function(req, res) {
  let headers = req.headers;
  delete headers.host;
  // console.log(headers);
  request.get('https://www.google-analytics.com/collect')
    .query(req.query)
    .set(headers)
    .end((err, data) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(data);        
      }
    })
  res.end();
}

exports.gar = function(req, res) {
  let headers = req.headers;
  delete headers.host;
  // console.log(headers);
  request.get('https://www.google-analytics.com/r/collect')
    .query(req.query)
    .set(headers)
    .end((err, data) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(data);        
      }
    })
  res.end();
}