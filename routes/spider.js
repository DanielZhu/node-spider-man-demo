/* eslint-disable fecs-indent */
var express = require('express');
var router = express.Router();

var dp = require('../lib/dp');

/* GET users listing. */
router.get('/dp', function (req, res, next) {
  dp();
  res.send('respond with a resource');
});

// router.post('/', function (req, res) {
//   res.send('Got a POST request');
// });

// router.put('/spider', function (req, res) {
//   res.send('Got a PUT request at /spider');
// });

// router.delete('/spider', function (req, res) {
//   res.send('Got a DELETE request at /spider');
// });

module.exports = router;
