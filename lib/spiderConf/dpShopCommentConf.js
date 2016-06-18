/* eslint-disable fecs-indent */
var shopCommentPageNo = 1;

function extend(origin, target) {
  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      origin[key] = target[key];
    }
  }

  return origin;
}

module.exports = function (shopId) {
  return {
    url: '',
    key: 'shopComments',
    type: 'autoIncrease',
    retryCount: 0,
    patterns: [
      {
        selector: '.comment-mode .comment-star dl dd',
        key: 'commentStar',
        fn: function ($, item) {
          var starItem = [];
          var numReg = /^\((\d*)\)$/;
          $(item).each(function (idx, starCat) {
            starItem.push({
              title: $(starCat).find('a').text(),
              num: parseInt($(starCat).find('.col-exp').text().match(numReg)[1], 10)
            });
          });

          return starItem;
        }
      },
      {
        selector: '.comment-mode .comment-list > ul > li',
        key: 'commentList',
        config: [
          {
            selector: '.pic',
            key: 'rev',
            fn: function ($, item) {
              var rankReg = /urr-rank(\d*)$/;
              var rankRst = $(item).find('.contribution .user-rank-rst');
              return {
                userId: $(item).find('.J_card').attr('user-id'),
                avatar: $(item).find('.J_card img').attr('src'),
                name: $(item).find('.J_card img').attr('title'),
                rank: parseFloat(rankRst.attr('class').match(rankReg)[1] / 10, 10)
              };
            }
          },
          {
            selector: '.content',
            key: 'content',
            fn: function ($, item) {
              // For comment rst
              var rankReg = /^(.*)(\d)\((.*)\)$/;
              var perPriceReg = /^(.*)([￥$])(\d*)/;
              var itemRankRstReg = /irr-star(\d*)$/;
              var userSubmitEl = $(item).find('.user-info');
              var rstItem = [];
              $(userSubmitEl).find('.comment-rst .rst').each(function (idx, commentRst) {
                var rstMatches = $(commentRst).text().match(rankReg);
                rstItem.push({
                  title: rstMatches[1],
                  star: parseFloat(rstMatches[2]),
                  shortComment: rstMatches[3]
                });
              });

              var userSubmit = {};
              var commPer = $(userSubmitEl).find('.comm-per').text();
              var commPerPrice = null;
              userSubmit.price = {
                value: 0,
                unit: '￥'
              };
              if (commPer.trim().length > 0) {
                commPerPrice = commPer.match(perPriceReg);
                userSubmit.price = {
                  value: parseFloat(commPerPrice[2]) || 0,
                  unit: parseFloat(commPerPrice[1]) || '￥'
                };
              }
              var itemRankRst = $(userSubmitEl).find('.item-rank-rst');
              userSubmit = extend(userSubmit, {
                rst: rstItem
              });

              var star = 0;
              if (itemRankRst.length > 0) {
                star = $(userSubmitEl).find('.item-rank-rst').attr('class').match(itemRankRstReg)[1] / 10;
              }

              userSubmit = extend(userSubmit, {
                star: star
              });

              var commentTxt = $(item).find('.comment-txt');
              var txt = {
                type: $(commentTxt).find('.comment-type').text(),
                content: $(commentTxt).find('.J_brief-cont').html().trim()
              };

              var recommend = $(item).find('.comment-recommend');
              var recommends = [];
              $(recommend).find('.col-exp').each(function (idx, expItem) {
                recommends.push({
                  label: $(expItem).text(),
                  link: $(expItem).attr('href')
                });
              });

              var photosEl = $(item).find('.shop-photo');
              var photos = [];
              $(photosEl).find('li a').each(function (idx, photoItem) {
                photos.push({
                  origin: $(photoItem).find('img').attr('src'),
                  thumb: $(photoItem).find('img').attr('panel-src'),
                  link: $(photoItem).attr('href')
                });
              });

              var numReg = /^\((\d*)\)$/;
              var miscInfoEl = $(item).find('.misc-info');
              var heartNum = $(miscInfoEl).find('.heart-num').text();
              var timeText = $(miscInfoEl).find('.time').text();

              var timeReg = /更新于(.*)/;
              if (timeReg.test(timeText)) {
                timeText = '20' + timeText.match(timeReg)[1];
              }
              else {
                var now = new Date();
                timeText = now.getFullYear() + '-' + timeText;
              }

              var miscInfo = {
                time: new Date(timeText).getTime(),
                heartNum: heartNum.trim().length > 0 && heartNum.match(numReg)[1]
              };

              var idReg = /^review_(\d*)_action$/;
              return {
                _id: parseInt($(miscInfoEl).attr('id').match(idReg)[1], 10),
                shopId: shopId,
                userSubmit: userSubmit,
                txt: txt,
                recommends: recommends,
                photos: photos,
                miscInfo: miscInfo
              };
            }
          }
        ]
      },
      {
        selector: '.comment-mode .Pages a',
        key: 'maxPageNum',
        fn: function ($, item) {
          var maxPageNum = 1;
          if (item && item.length > 0) {
            maxPageNum = $(item[item.length - 1]).text();
            if ($(item[item.length - 1]).attr('class').indexOf('NextPage') !== -1) {
              maxPageNum = $(item[item.length - 2]).text();
            }
            maxPageNum = parseInt(maxPageNum, 10);
          }

          return maxPageNum;
        }
      }
    ],
    urlGen: function (response) {
      var url = '';
      var now = new Date();
      now.setDate(now.getDate() - 1);
      var shopCommentBaseUrl = 'http://www.dianping.com/shop/%shop_id%/review_more?pageno=%p-num%';

      if (response) {
        // console.log('*** comment urlGen: ' + response.content.shopId);
        var timeCheck = true;
        if (shopCommentPageNo !== 1) {
          for (var i = 0; i < response.commentList.length; i++) {
            var commentItem = response.commentList[i];
            if (commentItem.time < now.getTime()) {
              timeCheck = false;
              break;
            }
          }
        }

        if (shopCommentPageNo === 1
          || (shopCommentPageNo <= response.maxPageNum && timeCheck)) {
          url = shopCommentBaseUrl
                                .replace('%shop_id%', shopId)
                                .replace('%p-num%', shopCommentPageNo);
          shopCommentPageNo++;
        }
        else {
          console.error('Reached the max page');
        }
        url = false;
      }
      else {
        shopCommentPageNo = 1;
        url = shopCommentBaseUrl
                              .replace('%shop_id%', shopId)
                              .replace('%p-num%', shopCommentPageNo);
        shopCommentPageNo++;
      }

      console.log('### comment urlGen: ' + url);
      return url;
    }
  }
};
