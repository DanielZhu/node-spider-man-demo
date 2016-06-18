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
      },
      {
        catName: 'coffee',
        secondCatId: 'g132'
      },
      {
        catName: 'japanese-food',
        secondCatId: 'g113'
      },
      {
        catName: 'bread-desert',
        secondCatId: 'g117'
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
      },
      {
        catName: 'car-check-stationi',
        secondCatId: 'g33763'
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
  },
  life: {
    firstCatId: 80,
    sList: [
      {
        catName: 'pipe',
        secondCatId: 'g2932'
      }
    ]
  }
};

module.exports = function (cityId, category) {
  var pageNo = 1;

  return {
    url: '',
    key: 'shops',
    type: 'autoIncrease',
    retryCount: 0,
    patterns: [
      {
        selector: '.shop-wrap .shop-all-list li',
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
              var href = $(item).find('a').attr('href');
              var id = parseInt(href.substr(href.indexOf('/shop/') + '/shop/'.length), 10);
              var shopInfo = {
                _id: id,
                href: href,
                name: $(item).find('a').attr('title'),
                cityId: cityId,
                category: {
                  primaryCat: category.primaryCat.id,
                  secondCat: category.secondCat.id
                }
              };
              return shopInfo;
            }
          },
          {
            selector: '.txt .comment',
            key: 'shopComment',
            fn: function ($, item) {
              var starClassNames = $(item).find('.sml-rank-stars').attr('class');
              var star = +starClassNames.substr(starClassNames.indexOf('sml-str') + 'sml-str'.length);
              var price = {
                value: 0,
                unit: '￥'
              };
              var perPriceReg = /^([￥$])(\d*)/;
              var commPer = $(item).find('.mean-price b').text();
              if (commPer.trim().length > 0) {
                var commPerPrice = commPer.match(perPriceReg);
                price = {
                  value: parseFloat(commPerPrice[2]) || 0,
                  unit: commPerPrice[1]
                };
              }

              var shopComment = {
                star: star / 10,
                commentNums: parseInt($(item).find('.review-num b').text(), 10) || 0,
                price: price
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
        var spiderCategoryBaseUrl = 'http://www.dianping.com/search/category/%city-id%/%f-nav%/g%s-nav%p%p-num%';

        url = spiderCategoryBaseUrl
                              .replace('%city-id%', cityId)
                              .replace('%f-nav%', category.primaryCat.id)
                              .replace('%s-nav%', category.secondCat.id)
                              .replace('%p-num%', pageNo);
        pageNo++;
      }
      else {
        console.error('Reached the max page');
        url = false;
      }

      console.log('shop urlGen: ' + url);
      return url;
    }
  };
}
