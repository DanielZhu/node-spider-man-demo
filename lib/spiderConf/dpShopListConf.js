/* eslint-disable fecs-indent */

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
      },
      {
        catName: 'police-offices',
        secondCatId: 'g33764'
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

var pageNo = 1;

var dpShopListConf = {
  url: '',
  type: 'autoIncrease',
  patterns: [
    {
      selector: '.shop-wrap .shop-all-list li',
      retryCount: 1,
      key: 'shopList',
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
        },
      ]
    },
    {
      selector: '.shop-wrap .page a',
      key: 'maxPageNum',
      fn: function ($, item) {
        var maxPageNum = $(item[item.length - 1]).text();
        if ($(item[item.length - 1]).attr('class').indexOf('next') !== -1) {
          maxPageNum = $(item[item.length - 2]).text();
        }
        return maxPageNum;
      }
    }
  ],
  urlGen: function (response) {
    var url = '';
    if (pageNo === 1 || pageNo <= parseInt(response.maxPageNum, 10)) {
      // URL for category searching
      var spiderCategoryBaseUrl = 'http://www.dianping.com/search/category/1/%f-nav%/%s-nav%p%p-num%';

      // Current category the spider working on
      var spiderCatNow = category.food.sList[0];

      url = spiderCategoryBaseUrl
                            .replace('%f-nav%', category.food.firstCatId)
                            .replace('%s-nav%', spiderCatNow.secondCatId)
                            .replace('%p-num%', pageNo);
      pageNo++;
    }
    else {
      console.error('Reached the max page');
      url = false;
    }

    console.log('url: ' + url);
    return url;
  }
};

module.exports = dpShopListConf;
