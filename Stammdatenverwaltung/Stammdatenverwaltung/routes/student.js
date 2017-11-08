var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    //res.send('list with all students');
    var pName = req.query.lastname;
    if (pName != null) {
        req.db.collection('students').find({ lastname: pName }).toArray(function (err, results) {
            for (var item in results) {
                results[item].id = results[item]._id;
                results[item].link = req.baseURL + "/stand/" + results[item].id;
            }
        });
    }
    else {
        req.db.collection('students').find({}, { _id: 1, class: 1, lastname: 1}).toArray(function (err, results) {
            for (var item in results) {
                results[item].id = results[item]._id;
                results[item].link = req.baseURL + "/student/" + results[item].id
            }
        });
    }
    if (results != undefined) {
        res.send(results);
    }
    else {
        res.status(404);
        res.send('Student not found!');
    }
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
