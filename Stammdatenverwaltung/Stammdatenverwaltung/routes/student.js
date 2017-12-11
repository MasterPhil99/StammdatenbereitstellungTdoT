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
    var pUserName = req.query.username;
    var unFlag = false;
    var query = { category: 'student' };

    if (typeof pLastName != undefined && pLastName != null) {
        lnFlag = true;
        query.lastname = pLastName;
    }

    if (typeof pFirstName != undefined && pFirstName != null) {
        fnFlag = true;
        query.firstname = pFirstName;
    }

    if (typeof pClass != undefined && pClass != null) {
        cFlag = true;
        query.class = pClass;
    }

    if (typeof pUserName != undefined && pUserName != null) {
        unFlag = true;
        query.username = pUserName;
    }

    if (lnFlag || fnFlag || cFlag || unFlag) {
        req.db.collection('users').find(query, { /*password: 0,*/ category: 0 }).toArray(function (err, results) {
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
        req.db.collection('users').find({ category: 'student'}, { _id: 1, class: 1, lastname: 1}).toArray(function (err, results) {
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

        req.db.collection('users').find({ _id: id, category: 'student' }, { /*password: 0,*/ category: 0 }).toArray(function (err, results) {
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

module.exports = router;