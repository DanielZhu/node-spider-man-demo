/* eslint-disable fecs-indent */

/**
 * DaZhongDianPing Spider Config and Executing file
 *
 * @author  Daniel Zhu <enterzhu@gmail.com>
 * @date    2016-06-04
 */
var SpiderMan = require('node-spider-man');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/danSpiderMan');

var parkingSchema = mongoose.Schema({
  id: Number,
  img: String,
  href: String,
  name: String,
  star: Number,
  commentNums: Number,
  meanPrice: String,
  address: String,
  tags: [{href: String, label: String}]
});

var ParkingModel = mongoose.model('Parking', parkingSchema);

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
 * @param  {Array} dataList hte data list tobe stored
 */
function saveRecords(dataList) {
  for (var i = 0; i < dataList.length; i++) {
    var data = dataList[i];
    extend(data, data.shopInfo);
    extend(data, data.shopComment);
    extend(data, data.shopTag);

    delete data.shopInfo;
    delete data.shopComment;
    delete data.shopTag;

    // console.log(JSON.stringify(data));
    (function () {
      var park = new ParkingModel(data);
      ParkingModel.findOneAndUpdate(
        {id: data.id},
        data,
        {new: true, upsert: true},
        function (error, doc) {
          if (error) {
            console.log(error);
          }
          else {
            console.log('updated ' + doc.name);
          }
        }
      );
    })();
  }
}

var category = {
  // Channel
  beauty: {
    firstCatId: 50,
    sList: [
      {
        catName: 'hair',  // MeiFa
        secCatId: 'g157'
      }
    ]
  },
  food: {
    firstCatId: 10,
    sList: [
      {
        catName: 'chaffyDish',  // HuoGuo
        secondCatId: 'g110'
      }
    ]
  },
  car: {
    firstCatId: 65,
    sList: [
      {
        catName: 'parking', // TingCheChang
        secondCatId: 'g180'
      }
    ]
  },
  training: {
    firstCatId: 75,
    sList: [
      {
        catName: 'art', // MeiShu PeiXun
        secondCatId: 'g2874'
      }
    ]
  }
};

var carParkingListConf = {
  selector: '.shop-all-list li',
  retryCount: 1,
  config: [
    {
      selector: '.pic img',
      key: 'img',
      fn: function ($, item) {
        return $(item).data('src');
      }
    },
    {
      selector: '.txt .tit',
      key: 'shopInfo',
      fn: function ($, item) {
        var shopInfo = {
          href: $(item).find('a').attr('href'),
          name: $(item).find('h4').text()
        };
        var id = shopInfo.href.substr(shopInfo.href.indexOf('/shop/') + '/shop/'.length);
        shopInfo.id = id;
        return shopInfo;
      }
    },
    {
      selector: '.txt .comment',
      key: 'shopComment',
      fn: function ($, item) {
        var starClassNames = $(item).find('.sml-rank-stars').attr('class');
        var star = +starClassNames.substr(starClassNames.indexOf('sml-str') + 'sml-str'.length);
        var shopComment = {
          star: star / 10,
          commentNums: $(item).find('.review-num b').text(),
          meanPrice: $(item).find('.mean-price b').text()
        };

        return shopComment;
      }
    },
    {
      selector: '.tag-addr',
      key: 'shopTag',
      fn: function ($, item) {
        var tags = [];
        $(item).find('a').each(function (idx, tag) {
          tags.push({href: $(tag).attr('href'), label: $(tag).find('.tag').text()});
        });

        var shopTagAddr = {
          tags: tags,
          address: $(item).find('.addr').text()
        };

        return shopTagAddr;
      }
    }
  ]
};

// URL for category searching
var spiderCategoryBaseUrl = 'http://www.dianping.com/search/category/1/%f-nav%/%s-nav%p%p-num%';

// Current category the spider working on
var spiderCatNow = category.car.sList[0];

function dpStart() {
  var spiderMan = new SpiderMan({
    done: saveRecords,
    delayFetch: 2200
  });

  var pageNo = 1;

  // while (pageNo < 10) {
    var conf = Object.assign({}, carParkingListConf);
    conf.url = spiderCategoryBaseUrl
                          .replace('%f-nav%', category.car.firstCatId)
                          .replace('%s-nav%', spiderCatNow.secondCatId)
                          .replace('%p-num%', pageNo);

    spiderMan.addQueue(conf);
    pageNo++;
    // conf = {};
  // }

  spiderMan.start();
}

module.exports = dpStart;
