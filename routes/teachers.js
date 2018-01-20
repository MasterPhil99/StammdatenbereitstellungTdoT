var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

router.get('/', function(req, res, next) {
    //res.send('list with all teachers');
    //needs consideration whether everyone should be able to get a list of teachers or not
    var pLastName = req.query.lastname;
    var lnFlag = false;
    var pFirstName = req.query.firstname;
    var fnFlag = false;
    var pUserName = req.query.username;
    var unFlag = false;
    var query = { category: 'teacher' };

    if (typeof pLastName != undefined && pLastName != null) {
        lnFlag = true;
        query.lastname = pLastName;
    }

    if (typeof pFirstName != undefined && pFirstName != null) {
        fnFlag = true;
        query.firstname = pFirstName;
    }

    if (typeof pUserName != undefined && pUserName != null) {
        unFlag = true;
        query.username = pUserName;
    }

    if (lnFlag || fnFlag || unFlag) {
        req.db.collection('users').find(query, { password: 0, category: 0 }).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Teacher not found!');
            } else {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/teachers/" + results[item].id;
                }
                res.send(results);
            }
        });
    }
    else {
        req.db.collection('users').find({ category: 'teacher' }, { password: 0, category: 0 }).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('No existing Teachers!');
            } else {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/teachers/" + results[item].id
                }
                res.send(results);
            }
        });
    }
});

router.get('/:id',function(req, res, next) {
    //res.send('exact teacher info');
    try {
        var id = new mongo.ObjectID(req.params.id);

        req.db.collection('users').find({ _id: id, category: 'teacher' }, { password: 0, category: 0 }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && results[0] != undefined) {
                req.db.collection('stands').find({ teachers: results[0]._id }).toArray(function (err, doc) {
                    results[0].id = results[0]._id;
                    results[0].link = req.baseURL + "/teacher/";

                    if (typeof doc != undefined && doc.length > 0) {
                        results[0].stand = doc[0];
                    }

                    res.send(results[0]);
                });
            } else {
                res.status(404);
                res.send("Teacher not found!");
            }
        });
    } catch (err) {
        res.status(400);
        res.send("Invalid ID! " + err.message);
    }
});

router.get('/:id/stand',function(req, res, next) {
    res.send('Stands with this teacher');
});

router.put('/',function (req, res, next) {
    //res.send('add a teacher');
    var teacher = req.body;
    var uuid = req.uuid;

        if (uuid == -1) {
            res.status(401);
            res.send("You need to be logged in to use this feature!");
        } else {
            req.db.collection('users').find({ uuid: uuid }).toArray(function (err, doc) {
                if (doc[0] != undefined || doc.length > 0) {
                    var cat = doc[0].category;
                    if (cat == "teacher" || cat == "admin") {
                        if ((teacher.username != undefined && teacher.username != "") &&
                            (teacher.password != undefined && teacher.password != "") &&
                            (teacher.firstname != undefined && teacher.username != "") &&
                            (teacher.lastname != undefined && teacher.lastname != "")) {
                            req.db.collection('users').find({ username: teacher.username }).toArray(function (err, resu) {
                                if (resu == undefined || resu.length <= 0) {
                                    req.db.collection('users').insertOne({
                                        username: teacher.username,
                                        firstname: teacher.firstname,
                                        lastname: teacher.lastname,
                                        category: "teacher",
                                        password: teacher.password,
                                        settings: {
                                            "breakChange": true,
                                            "joinStand": true,
                                            "leaveStand": true,
                                            "deleteStand": true,
                                            "changeStandSetting": true
                                        }
                                    }, function (err, result) {

                                        console.log("teacher added");
                                        res.status(201);
                                        res.send(teacher);
                                    });
                                } else {
                                    res.status(400);
                                    res.send("Teacher already exists!");
                                }
                            });
                        }
                        else {
                            res.status(400);
                            res.send("Bad Request! Username, Firstname, Lastname and Password must be defined!");
                        }
                    }
                    else {
                        res.status(403);
                        res.send("Unauthorized to add a teacher!");
                    }
                } else {
                    res.status(401);
                    res.send("You need to be logged in to use this feature!");
                }
            });
        }
    //});
});

router.post('/', function (req, res, next) {
    //res.send('update a teacher');
    var teacher = req.body;
    var uuid = req.uuid;

    if (uuid == -1) {
        res.status(401);
        res.send("You need to be logged in to use this feature!");
    } else {
        req.db.collection('users').find({ uuid: uuid }).toArray(function (err, doc) {
            if (typeof doc != undefined && doc.length > 0 && typeof doc[0] != undefined) {
                var cat = doc[0].category;
                console.log(cat);
                if (cat == "admin") {
                    try {
                        req.db.collection('users').find({ "_id": mongo.ObjectID(teacher.id) }).toArray(function (err, result) {
                            console.log(result);
                            if (result.length > 0) {
                                var query = {};

                                if (teacher.username != undefined)
                                    query.username = teacher.username;

                                if (teacher.lastname != undefined)
                                    query.lastname = teacher.lastname;

                                if (teacher.firstname != undefined)
                                    query.firstname = teacher.firstname;

                                if (teacher.password != undefined)
                                    query.password = teacher.password;

                                req.db.collection('users').updateOne({ "_id": mongo.ObjectID(teacher.id) }, {
                                    $set: query
                                }, function (err, resu) {
                                    if (err) {
                                        res.status(400);
                                        res.send("Error when updating the teacher!");
                                    } else {
                                        if (resu.result.nModified > 0) {
                                            res.send(teacher);
                                        } else {
                                            res.status(400);
                                            res.send("Error! Teacher was not updated!");
                                        }
                                    }
                                });
                            } else {
                                res.status(404);
                                res.send("No Stand with this ID exists!");
                            }
                        });
                    } catch (err) {
                        res.status(400);
                        res.send("Invalid ID! " + err.message);
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to edit a teacher!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

module.exports = router;
