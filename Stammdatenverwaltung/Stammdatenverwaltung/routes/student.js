var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

//instead of dbcollection('students') db.collection('users) and category = student

router.get('/', function(req, res, next) {
    //res.send('list with all students');
    //needs consideration whether everyone should be able to get a list of students or not
    var pLastName = req.query.lastname;
    var lnFlag = false;
    var pFirstName = req.query.firstname;
    var fnFlag = false;
    var pClass = req.query.class;
    var cFlag = false;

    if (pLastName != null && pLastName != undefined) {
        lnFlag = true;
    }

    if (pFirstName != null && pFirstName != undefined) {
        fnFlag = true;
    }

    if (pClass != null && pClass != undefined) {
        cFlag = true;
    }

    if (lnFlag || fnFlag || cFlag) {
        //filter after the available parameters
        req.db.collection('students').find({ lastname: pLastName }).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Student not found!');
            } else {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/student/" + results[item].id;
                }
                res.send(results);
            }
        });
    }
    else {
        req.db.collection('students').find({}, { _id: 1, class: 1, lastname: 1}).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Student not found!');
            } else {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/student/" + results[item].id
                }
                res.send(results);
            }
        });
    }
});

router.get('/:id', function (req, res, next) {
    //res.send('student by id');
    try {
        var id = new mongo.ObjectID(req.params.id);

        req.db.collection('students').find({ _id: id }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && results[0] != undefined) {
                console.log(results);
                results[0].link = req.baseURL + "/student";

                res.send(results);
            } else {
                res.status(404);
                res.send("Student not found!");
            }
        });
    } catch (err) {
        res.status(400);
        res.send("Invalid ID! " + err.message);
    }
    
});

router.get('/:id/stand',function(req, res, next) {
    res.send('list of stands with this user');
});

/*
router.post('/',function (req, res, next) {
    res.send('update user');
});*/

module.exports = router;