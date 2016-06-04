/* eslint-disable fecs-indent */

/**
 * node-spider-man
 *
 * Will move out separately soon
 *
 * @author  Daniel Zhu <enterzhu@gmail.com>
 * @date    2016-06-04
 */
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');
var curlify = require('request-as-curl');

var spiderMan = function () {
  this.queue = [];
};

spiderMan.prototype.addQueue = function (conf) {
  this.queue.push(conf);
};

spiderMan.prototype.popQueue = function () {
  return this.queue.length > 0 ? this.queue.shift() : false;
};

spiderMan.prototype.checkQueue = function () {
  return this.queue.length > 0;
};

spiderMan.prototype.start = function (cb) {
  var self = this;
  var runCount = 0;
  var timeWaiting = 0;
  while (this.checkQueue()) {
    (function (waiting) {
      var task = self.popQueue();
      if (task) {
        setTimeout(function () {
          self.execSpider(task).then(
            function (response) {
              cb && cb(JSON.parse(response));
            },
            function (error) {
              console.log(JSON.stringify(error));
            }
          ).finally(function () {
            runCount++;
            console.log(new Date().getTime());
          });

          console.log('runCount: ' + runCount + ' waiting: ' + waiting);
        }, waiting);
      }
    })(timeWaiting);

    timeWaiting += 2000;
  }
};

spiderMan.prototype.execSpider = function (task) {
  if (!task) {
    task = this.popQueue();
  }

  var options = {
    url: task.url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
    }
  };

  if (task) {
    return new Promise(function (fulfill, reject) {
      var out = request(options, function (error, response, body) {
        console.log(options.url);
        console.log(response.statusCode);
        if (!error && response.statusCode === 200) {
          var $ = cheerio.load(body);
          var result = [];
          $(task.selector).each(function (index, item) {
            var itemRes = {};
            for (var i = 0; i < task.config.length; i++) {
              var subConf = task.config[i];
              var itemEl = $(item).find(subConf.selector);

              if (subConf.hasOwnProperty('fn')
                && typeof subConf.fn === 'function') {
                itemRes[subConf.key] = subConf.fn($, itemEl);
              }
              else {
                itemRes[subConf.key] = $(itemEl).text();
              }
            }
            result.push(itemRes);
          });

          fulfill(JSON.stringify(result));
        }
        else {
          if (task.retryCount > 0) {
            task.retryCount--;
            this.execSpider(task);
          }
          else {
            reject();
          }
        }
      });
      // console.log(curlify(out.request, {}));
    });
  }
  else {
    return new Promise.reject('failure');
  }
};

module.exports = spiderMan;
