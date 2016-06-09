/* eslint-disable fecs-indent */

var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/dpCenter');
var db = mongoose.createConnection('mongodb://localhost/dpCenter');

var shopCommentSchema = mongoose.Schema({
  id: Number,
  star: Number,
  price: {value: Number, unit: String},
  type: String,
  content: String,
  rev: {userId: String, avatar: String, name: String, rank: Number},
  rst: [{title: String, star: Number, shortComment: String}],
  recommends: [{label: String, link: String}],
  photos: [{origin: String, thumb: String, link: String}],
  time: Date,
  heartNum: Number
});

function findOneAndUpdate(data) {
  var DpShopCommentModel = db.model('dp_shop_comment', shopCommentSchema);
  DpShopCommentModel.findOneAndUpdate(
    {id: data.id},
    data,
    {'new': true, 'upsert': true},
    function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('updated ' + doc.id);
      }
    }
  );
}

module.exports = {
  findOneAndUpdate: findOneAndUpdate
};
