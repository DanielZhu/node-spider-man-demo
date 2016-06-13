/* eslint-disable fecs-indent */

var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/dpCenter');
var db = mongoose.createConnection('mongodb://localhost/dpCenter');

var shopSchema = mongoose.Schema({
  id: Number,
  img: String,
  cityId: String,
  category: {cat: String, subcat: String},
  href: String,
  name: String,
  star: Number,
  commentNums: Number,
  star: [{title: String, num: Number}],
  price: {value: Number, unit: String},
  address: String,
  tags: [{href: String, label: String}],
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

function findOneAndUpdate(data) {
  var DpShopModel = db.model('dp_shop', shopSchema);
  DpShopModel.findOneAndUpdate(
    {id: data.id},
    data,
    {'new': true, 'upsert': true},
    function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('updated ' + doc.name);
      }
    }
  );
}

module.exports = {
  findOneAndUpdate: findOneAndUpdate
};
