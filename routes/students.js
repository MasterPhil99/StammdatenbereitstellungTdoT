var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

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
    var pTeacher = req.query.teacher;
    var tFlag = false;
    var pStand = req.query.stand;
    var sFlag = false;
    var pAssigned = req.query.assigned;
    var asFlag = false;
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

    if (typeof pTeacher != undefined && pTeacher != null) {
        tFlag = true;
    }

    if (typeof pStand != undefined && pStand != null) {
        sFlag = true;
    }

    if (typeof pAssigned != undefined && pAssigned != null) {
        asFlag = true;
    }

    if (lnFlag || fnFlag || cFlag || unFlag || tFlag || sFlag) {
        req.db.collection('users').find(query, { /*password: 0,*/ category: 0 }).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Student not found!');
            } else {
                var resultsToReturn = [];
                for (var item in results) {
                    //console.log(results[item]);
                    /*req.db.collection('stands').find({ students: [results[item]._id] }).toArray(function (err, doc) {
                        results[item].id = results[item]._id;
                        results[item].link = req.baseURL + "/student/" + results[item].id;

                        if (typeof doc != undefined && doc.length > 0) {
                            results[item].assigned = true;

                            if (tFlag) {
                                results[item].teacher = doc.assigned; //get the entire teacher?
                            }

                            if (sFlag) {
                                results[item].stand = doc;
                            }
                        } else {
                            results[item].assigned = false;
                        }

                        if (asFlag) {
                            if (pAssigned) {
                                if (results[item].assigned) {
                                    resultsToReturn.push(results[item]);
                                }
                            } else {
                                if (!results[item].assigned) {
                                    resultsToReturn.push(results[item]);
                                }
                            }
                        } else {
                            resultsToReturn.push(results[item]);
                        }

                        res.send(resultsToReturn); //there needs to be a loop in here but ?????
                        //idk how to get all of the students
                    });*/

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
                req.db.collection('stands').find({ students: results[0]._id }).toArray(function (err, doc) {
                    results[0].id = results[0]._id;
                    results[0].link = req.baseURL + "/student/";
                    results[0].assigned = false;
                    console.log(doc);
                    if (typeof doc != undefined && doc.length > 0) {
                        results[0].assigned = true;
                        results[0].teacher = doc[0].assigned; //get the entire teacher?
                        console.log(results[0].teacher);
                        results[0].stand = doc[0];
                    }

                    res.send(results);
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
    res.send('list of stands with this user');
});

module.exports = router;