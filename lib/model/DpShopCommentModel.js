/* eslint-disable fecs-indent */

var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/dpCenter');
var db = mongoose.createConnection('mongodb://localhost/dpCenter');

var shopCommentSchema = mongoose.Schema({
  _id: Number,
  shopId: Number,
  star: Number,
  price: {value: Number, unit: String},
  type: String,
  content: String,
  rev: {userId: String, avatar: String, name: String, rank: Number},
  rst: [{title: String, star: Number, shortComment: String}],
  recommends: [{label: String, link: String}],
  photos: [{origin: String, thumb: String, link: String}],
  time: String,
  heartNum: Number,
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});


function findOneAndUpdate(data) {
  var DpShopCommentModel = db.model('dp_shop_comment', shopCommentSchema);
  DpShopCommentModel.findById(data._id).exec(function (error, doc) {
    if (error) {
      console.log('finding ' + error);
    }
    else {
      if (doc) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            if (['recommends', 'photos', 'rev', 'rst'].indexOf(key) !== -1) {
              doc[key] = data[key];
              doc.markModified(key);
            }
            else {
              if (data[key] && data[key] != doc[key]
                && (['price', 'createdAt', 'shopId', 'updatedAt'].indexOf(key) === -1)) {
                doc[key] = data[key];
                doc.markModified(key);
                console.log('updated ' + key + ' old: ' + doc[key] + ' new: ' + JSON.stringify(data[key]) + ' shop: ' + data.shopId);
              }
            }
          }
        }

        if (data.price.value !== doc.price.value) {
          doc.price.value = data.price.value;
          doc.markModified('price.value');
        }

        doc.save();
      }
      else {
        var tobeSavedComment = new DpShopCommentModel(data);
        tobeSavedComment.save(function (err, comment) {
          if (err) return console.error('saving ' + err);

          console.log('saved ' + comment.rev.name + ' at shop ' + comment.shopId);
        });
      }
    }
  });
}

function findLatestByLimit(data) {
  var DpShopCommentModel = db.model('dp_shop_comment', shopCommentSchema);
  return DpShopCommentModel.find().limit(15).sort({time: 'asc'}).exec();
}

module.exports = {
  findLatestByLimit: findLatestByLimit,
  findOneAndUpdate: findOneAndUpdate
};
