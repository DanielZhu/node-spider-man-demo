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
var dpCategoriesConf = require('./spiderConf/dpCategoriesConf');

var shopSpiderMan;
var categoriesSpiderMan;
var shopCommentSpiderMan;
var shopListSpiderManStarted = false;
var shopCommentSpiderManStarted = false;
var cityIds = [
  {
    id: 1,
    name: '上海'
  }
];

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
      shopCommentSpiderMan.unshiftQueue(dpShopCommentConf(data._id));
    }

    (function () {
      DpShopModel.updateAndInsertNew(data);
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

    data._id = data.content._id;
    data.shopId = data.content.shopId;
    data.recommends = data.content.recommends;
    data.photos = data.content.photos;
    extend(data, data.content.userSubmit);
    extend(data, data.content.miscInfo);
    // It must be the final expression
    extend(data, data.content.txt);

    delete data.content.id;
    delete data.content.userSubmit;
    delete data.content.txt;
    delete data.content.recommends;
    delete data.content.photos;
    delete data.content.miscInfo;

    (function () {
      DpShopCommentModel.updateAndInsertNew(data);
    })();
  }
}

function startCommentSpider() {
  if (!shopCommentSpiderManStarted) {
    shopCommentSpiderManStarted = true;
    shopCommentSpiderMan.start();
  }
}

function startShopSpider(response) {
  var categories = response.categories;
  console.log('### startShopSpider: ' + JSON.stringify(categories));
  categories.forEach(function (primaryCat, idxP) {
    // Just loop the food cat
    if (primaryCat.id === 10) {
      console.log(idxP);
      primaryCat.secondCats.forEach(function (secondCat, idS) {
        if (idS >= 14) {
          shopSpiderMan.appendQueue(dpShopListConf(cityIds[0].id, {primaryCat: primaryCat, secondCat: secondCat}));
        }
      });
    }
  });

  if (!shopListSpiderManStarted) {
    shopSpiderMan.start();
  }
}

function dpStart() {
  categoriesSpiderMan = new SpiderMan({
    spiderManName: 'categoriesSpiderMan',
    execMode: 'sync',
    delayFetch: 6000,
    done: startShopSpider
  });
  categoriesSpiderMan.appendQueue(dpCategoriesConf(cityIds[0].id));
  categoriesSpiderMan.start();

  shopSpiderMan = new SpiderMan({
    spiderManName: 'shopSpiderMan',
    done: saveShopRecords,
    execMode: 'sync',
    queueDone: startCommentSpider,
    delayFetch: 10000
  });

  shopCommentSpiderMan = new SpiderMan({
    spiderManName: 'shopCommentSpiderMan',
    done: saveCommentRecords,
    execMode: 'sync',
    delayFetch: 13000
  });

  // For test comment spider only
  // shopCommentSpiderMan.unshiftQueue(dpShopCommentConf(3181522));
  // startCommentSpider();
}

module.exports = dpStart;
