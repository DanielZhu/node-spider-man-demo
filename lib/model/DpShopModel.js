/* eslint-disable fecs-indent */

var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/dpCenter');
var db = mongoose.createConnection('mongodb://localhost/dpCenter');

var shopSchema = mongoose.Schema({
  _id: Number,
  img: String,
  cityId: Number,
  category: {primaryCat: String, secondCat: String},
  href: String,
  name: String,
  star: Number,
  commentNums: Number,
  price: {value: Number, unit: String},
  address: String,
  tags: [{href: String, label: String}],
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

function findOneAndUpdate(data) {
  var DpShopModel = db.model('dp_shop', shopSchema);
  DpShopModel.findById(data._id).exec(function (error, doc) {
    if (error) {
      console.log('finding ' + error);
    }
    else {
      if (doc) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            if (data[key] !== doc[key]
              && (['tags', 'price', 'category', 'createdAt', 'updatedAt'].indexOf(key) === -1)) {
              doc[key] = data[key];
              doc.markModified(key);
              console.log('updated ' + key + ' old: ' + doc[key] + ' new: ' + data[key] + ' shop: ' + data.name);
            }
          }
        }
        doc.tags = data.tags;
        doc.markModified('tags');

        if (data.price.value !== doc.price.value) {
          doc.price.value = data.price.value;
          doc.markModified('price.value');
        }

        doc.save();
      }
      else {
        var tobeSavedShop = new DpShopModel(data);
        tobeSavedShop.save(function (err, shop) {
          if (err) return console.error('saving ' + err);

          console.log('saved ' + shop.name);
        });
      }
    }
  });
}

module.exports = {
  findOneAndUpdate: findOneAndUpdate
};
