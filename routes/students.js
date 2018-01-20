var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

router.get('/', function (req, res, next) {
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
    var pFilter = req.query.filter;
    var filtFlag = false;
    var query = { category: 'student' };

    if (typeof pLastName != undefined && pLastName != null) {
        lnFlag = true;
        query.lastname = pLastName;
    }

    if (typeof pFirstName != undefined && pFirstName != null) {
        fnFlag = true;
        query.firstname = { $regex: ".*" + pFirstName + ".*" };
    }

    if (typeof pClass != undefined && pClass != null) {
        cFlag = true;
        query.class = { $regex: ".*" + pClass + ".*" };
    }

    if (typeof pUserName != undefined && pUserName != null) {
        unFlag = true;
        query.username = { $regex: ".*" + pUserName + ".*" }
    }

    if (typeof pFilter != undefined && pFilter != null) {
        filtFlag = true;
    }

    if (filtFlag || lnFlag || fnFlag || cFlag || unFlag) {
        req.db.collection('users').find(query, { /*password: 0,*/ category: 0 }).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Student not found!');
            } else {
                var resultsToReturn = [];
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/students/" + results[item].id;
                }

                if (filtFlag) {
                    for (var item in results) {
                        var student = results[item];

                        var filters = pFilter.split(" ");
                        var correctFilter = true;

                        for (var key in filters) {
                            var f = filters[key];
                            if (!checkStudentFilterOnValue(student, f)) {
                                correctFilter = false; break;
                            }
                        }
                        if (correctFilter) {
                            resultsToReturn.push(student);
                        }
                    }

                    res.send(resultsToReturn);
                } else {
                    res.send(results);
                }
            }
        });
    }
    else {
        req.db.collection('users').find({ category: 'student' }, { category: 0 }).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Student not found!');
            } else {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/students/" + results[item].id
                }
                res.send(results);
            }
        });
    }
});

function checkStudentFilterOnValue(student, filter) {
    return (student.username.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ||
        student.firstname.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ||
        student.lastname.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ||
        student.class.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
}

router.get('/:id', function (req, res, next) {
    //res.send('student by id');
    try {
        var id = new mongo.ObjectID(req.params.id);

        req.db.collection('users').find({ _id: id, category: 'student' }, { /*password: 0,*/ category: 0 }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && results[0] != undefined) {
                req.db.collection('stands').find({ students: results[0]._id }).toArray(function (err, doc) {
                    results[0].id = results[0]._id;
                    results[0].link = req.baseURL + "/students/";
                    results[0].assigned = false;
                    if (typeof doc != undefined && doc.length > 0) {
                        doc[0].id = doc[0]._id;
                        results[0].assigned = true;
                        results[0].teacher = doc[0].assigned;
                        results[0].stand = doc[0];
                    }

                    res.send(results[0]);
                });
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
    //res.send('list of stands with this user');
    try {
        var id = new mongo.ObjectID(req.params.id);

        req.db.collection('users').find({ _id: id, category: 'student' }, { /*password: 0,*/ category: 0 }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && results[0] != undefined) {
                req.db.collection('stands').find({ students: results[0]._id }).toArray(function (err, doc) {
                    console.log(doc);
                    if (typeof doc != undefined && doc.length > 0) {
                        res.send(doc);
                    } else {
                        res.status(404);
                        res.send("This student is in no stand!");
                    }
                });
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

module.exports = router;