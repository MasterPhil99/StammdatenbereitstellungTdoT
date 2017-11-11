var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

router.get('/', function(req, res, next) {
    //res.send('list with all students');
    //needs consideration whether everyone should be able to get a list of students or not
    var pLastName = req.query.lastname;
    if (pLastName != null && pLastName != undefined) {
        req.db.collection('students').find({ lastname: pLastName }).toArray(function (err, results) {
            for (var item in results) {
                results[item].id = results[item]._id;
                results[item].link = req.baseURL + "/student/" + results[item].id;
            }

            if (results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Student not found!');
            } else {
                res.send(results);
            }
        });
    }
    else {
        req.db.collection('students').find({}, { _id: 1, class: 1, lastname: 1}).toArray(function (err, results) {
            for (var item in results) {
                results[item].id = results[item]._id;
                results[item].link = req.baseURL + "/student/" + results[item].id
            }

            if (results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Student not found!');
            } else {
                res.send(results);
            }
        });
    }
});

router.get('/:id', function (req, res, next) {
    //res.send('student by id');
    var id = new mongo.ObjectID(req.params.id);

    req.db.collection('students').find({ _id: id }).toArray(function (err, results) {
        console.log(results);
        results[0].link = req.baseURL + "/student";

        res.send(results);
    });
});

router.get('/:id/stand',function(req, res, next) {
    res.send('list of stands with this user');
});

/*
router.post('/',function (req, res, next) {
    res.send('update user');
});*/

module.exports = router;