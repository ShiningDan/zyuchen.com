let schedule = require('node-schedule');
let request = require('superagent');
let fs = require('fs');

function testGaTime() {
  let startTime = new Date();
  let endTime;
  request.get("http://www.google-analytics.com/collect")
    .query("v=1&_v=j56&a=54916858&t=pageview&_s=1&dl=http%3A%2F%2Flocalhost%2F&ul=zh-cn&de=UTF-8&dt=Yuchen%20%E7%9A%84%E4%B8%BB%E9%A1%B5&sd=24-bit&sr=1280x800&vp=536x726&je=0&fl=26.0%20r0&_u=AACAAEABI~&jid=&gjid=&cid=1957870495.1497964145&tid=UA-101336456-1&_gid=1961109138.1497964145&z=1668004735")
    .end((err, data) => {
      if (err) {
        console.log(err)
      }
      endTime = new Date();
      console.log(endTime.getTime() - startTime.getTime());
      fs.appendFileSync('./galog.txt', endTime.getTime() - startTime.getTime() + " ", (err) => {
        console.log(err);
      })
    })
}

try {
  var rule = new schedule.RecurrenceRule();
  rule.minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  schedule.scheduleJob(rule, function(){
    testGaTime();
  }); 
} catch(e) {
  console.log(e);
}