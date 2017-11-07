var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('list with all students');
    req.db.collection('students').find({}, { _id: 0, id: 1, name: 1 }).toArray(function (err, results) {
        for (var item in results) {
            results[item].link = req.baseURL + "/stand/" + results[item].id
        }
        res.send(results);
    });
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
