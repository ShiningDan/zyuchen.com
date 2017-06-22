let request = require('superagent');

exports.ga = function(req, res) {
  let headers = req.headers;
  delete headers.host;
  let query = req.query;
  let queryZ = query.z;
  delete query.z;
  query['uip'] = req.connection.remoteAddress.split(":").reverse()[0];
  query['z'] = queryZ;
  // console.log(query)
  // console.log(headers);
  // console.log(req.query);
  // console.log(req.connection.remoteAddress);
  request.get('http://www.google-analytics.com/collect')
    .query(query)
    .set(headers)
    .end((err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);        
      }
    })
  res.end();
}

exports.gar = function(req, res) {
  let headers = req.headers;
  delete headers.host;
  let query = req.query;
  let queryZ = query.z;
  delete query.z;
  query['uip'] = req.connection.remoteAddress.split(":").reverse()[0];
  query['z'] = queryZ;
  // console.log(query)
  // console.log(headers);
  // console.log(req.query);
  // console.log(req.connection.remoteAddress);
  request.get('http://www.google-analytics.com/r/collect')
    .query(query)
    .set(headers)
    .end((err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);        
      }
    })
  res.end();
}