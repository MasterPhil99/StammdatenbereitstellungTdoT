var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('list with all students');
});
router.get('/:id',function(req, res, next) {
    res.send('student by id');
});
router.get('/:id/stand',function(req, res, next) {
    res.send('list of stands with this user');
});

router.post('/',function (req, res, next) {
    res.send('update user');
});


module.exports = router;
