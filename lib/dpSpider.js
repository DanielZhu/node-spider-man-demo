/* eslint-disable fecs-indent */

/**
 * DaZhongDianPing Spider Config and Executing file
 *
 * @author  Daniel Zhu <enterzhu@gmail.com>
 * @date    2016-06-04
 */
var SpiderMan = require('node-spider-man');
var DpShopModel = require('./model/DpShopModel');
var DpShopCommentModel = require('./model/DpShopCommentModel');
var dpShopCommentConf = require('./spiderConf/dpShopCommentConf');
var dpShopListConf = require('./spiderConf/dpShopListConf');

var shopSpiderMan;
var shopCommentSpiderMan;
var shopCommentSpiderManStarted = false;

function extend(origin, target) {
  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      origin[key] = target[key];
    }
  }

  return origin;
}

/**
 * Save new record, update the old one if found the duplicated by id
 *
 * @param  {Array} patternResults hte data list tobe stored
 */
function saveShopRecords(patternResults) {
  for (var i = 0; i < patternResults.shopList.length; i++) {
    var data = patternResults.shopList[i];
    extend(data, data.shopInfo);
    extend(data, data.shopComment);
    extend(data, data.shopTag);

    delete data.shopInfo;
    delete data.shopComment;
    delete data.shopTag;

    if (data.commentNums > 0) {
      shopCommentSpiderMan.unshiftQueue(dpShopCommentConf(data.id));
    }

    (function () {
      DpShopModel.findOneAndUpdate(data);
    })();
  }
}

/**
 * Save new record, update the old one if found the duplicated by id
 *
 * @param  {Array} results hte data list tobe stored
 */
function saveCommentRecords(results) {
  for (var i = 0; i < results.commentList.length; i++) {
    var data = results.commentList[i];

    data.id = data.content.id;
    data.shopId = data.content.shopId;
    extend(data, data.content.userSubmit);
    extend(data, data.content.miscInfo);
    extend(data, data.content.recommends);
    extend(data, data.content.photos);
    // It must be the final expression
    extend(data, data.content.txt);

    delete data.content.id;
    delete data.content.userSubmit;
    delete data.content.txt;
    delete data.content.recommends;
    delete data.content.photos;
    delete data.content.miscInfo;

    (function () {
      DpShopCommentModel.findOneAndUpdate(data);
    })();
  }
}

function startCommentSpider () {
  if (!shopCommentSpiderManStarted) {
    shopCommentSpiderManStarted = true;
    shopCommentSpiderMan.start();
  }
}

function dpStart() {
  shopSpiderMan = new SpiderMan({
    done: saveShopRecords,
    execMode: 'sync',
    queueDone: startCommentSpider,
    delayFetch: 10000
  });

  shopCommentSpiderMan = new SpiderMan({
    done: saveCommentRecords,
    execMode: 'sync',
    delayFetch: 10000
  });

  shopSpiderMan.appendQueue(dpShopListConf);
  shopSpiderMan.start();
}

module.exports = dpStart;
