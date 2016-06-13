/* eslint-disable fecs-indent */

module.exports = function (cityId) {
  return {
    url: 'http://www.dianping.com/search/category/' + cityId + '/0',
    key: 'categories',
    type: 'basic',
    retryCount: 0,
    patterns: [
      {
        selector: '.category-nav li.primary-category',
        key: 'categories',
        fn: function ($, item) {
          var primaryCats = [];
          $(item).each(function (idx, record) {
            var secondCats = [];
            var primaryCat = {
              id: parseInt($(record).data('key'), 10),
              label: $(record).find('a.name').text()
            };

            $(record).find('.secondary-category a').each(function (idxS, recordS) {
              var key = $(recordS).data('key');
              if (key !== undefined) {
                var secondCat = {
                  id: parseInt(key, 10),
                  label: $(recordS).text()
                };
                secondCats.push(secondCat);
              }
            });

            if (secondCats.length > 0) {
              primaryCat.secondCats = secondCats;
              primaryCats.push(primaryCat);
            }
          });

          return primaryCats;
        }
      }
    ]
  };
};
