var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('list with all teachers');
});
router.get('/:id',function(req, res, next) {
    res.send('exact teacher info');
});
router.get('/:id/stand',function(req, res, next) {
    res.send('Stands with this teacher');
});

router.post('/',function (req, res, next) {
    res.send('update teacher');
});

module.exports = router;
