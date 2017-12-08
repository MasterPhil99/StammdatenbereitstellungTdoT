var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

router.get('/', function(req, res, next) {
    //res.send('list of all stands');
    //no need to check authorization -> everyone can see the stands
    var pName = req.query.name;
    if (pName != null) {
        req.db.collection('stands').find({ name: pName }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && typeof results[0] != undefined) {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/stand/" + results[item].id;
                }
                res.send(results);
            } else {
                res.status(404);
                res.send("Stand not found!");
            }
        });
    }
    else {
        req.db.collection('stands').find({}, { _id: 1, name: 1 }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && typeof results[0] != undefined) {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/stand/" + results[item].id;
                }
                res.send(results);
            } else {
                res.status(404);
                res.send("No Stand exists!");
            }
        });
    }
});

router.get('/:id', function (req, res, next) {
    //res.send('list of one stand');
    //no need to check authorization -> everyone can see the stands
    try {
        var id = new mongo.ObjectID(req.params.id);
        req.db.collection('stands').find({ _id: id }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && typeof results[0] != undefined) {
                console.log(results);
                results[0].link = req.baseURL + "/stand";
                //instead of just the student ids, show the entire student object, when returning the stand
                res.send(results);
            } else {
                res.status(404);
                res.send("Stand not found!");
            }
        });
    } catch (err) {
        res.status(400);
        res.send("Invalid ID! " + err.message);
    }
});

router.get('/:id/student',function(req, res, next) {
    res.send('list of students in this stand');
});

router.get('/:id/teacher',function(req, res, next) {
    res.send('list of teacher in this stand');
});

function checkHeaderAndCookie(header, cookie) {
    var uuid;

    if (cookie === undefined || cookie == "") {
        if (header === undefined || header == "") {
            uuid = -1;
        } else {
            uuid = header;
        }
    } else {
        req.db.collection('UUIDExpiry').find({ uuid: cookie }).toArray(function (err, resu) {
            if (typeof resu != undefined && typeof resu[0] != undefined) {
                uuid = cookie;
            } else {
                uuid = -1;
            }
        });
    }

    return uuid;
}

router.post('/', function (req, res, next) {
    //res.send('update the stand');
    var stand = req.body;
    var cookie = req.cookies.uuid;
    var head = req.headers['uuid'];
    var uuid = checkHeaderAndCookie(head, cookie);

    
    if (uuid == -1) {
        res.status(401);
        res.send("You need to be logged in to use this feature!");
    } else {
        req.db.collection('users').find({ uuid: uuid }).toArray(function (err, doc) {
            if (typeof doc != undefined && doc.length > 0 && typeof doc[0] != undefined) {
                var cat = doc[0].category;
                if (cat == "teacher" || cat == "admin") { //maybe use assigned teacher
                    if (stand.name != undefined && stand.name != "") {
                        try {
                            req.db.collection('stands').updateOne({ "_id": mongo.ObjectID(stand.id) }, {
                                $set: {
                                    "name": stand.name,
                                    "description": stand.description,
                                    "deadlineDate": stand.deadlineDate,
                                    "time0910": stand.time0910,
                                    "time1011": stand.time1011,
                                    "time1112": stand.time1112,
                                    "time1213": stand.time1213,
                                    "time1314": stand.time1314,
                                    "time1415": stand.time1415,
                                    "time1516": stand.time1516,
                                    "cbAllowStudentsBreak": stand.cbAllowStudentsBreak,
                                    "cbAllowStudentsJoin": stand.cbAllowStudentsJoin,
                                    "cbAllowStudentsLeave": stand.cbAllowStudentsLeave
                                }
                            });
                            res.send(stand);
                        } catch (err) {
                            res.status(400);
                            res.send("Invalid ID! " + err.message);
                        }
                    }
                    else {
                        res.status(400);
                        res.send("Bad Request! Name must be defined!");
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to edit a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.put('/', function (req, res, next) {
    //res.send('add a new stand, return stand obj with id');
    var stand = req.body;
    var cookie = req.cookies.uuid;
    var head = req.headers['uuid'];
    var uuid = checkHeaderAndCookie(head, cookie);

    if (uuid == -1) {
        res.status(401);
        res.send("You need to be logged in to use this feature!");
    } else {
        req.db.collection('users').find({ uuid: uuid }).toArray(function (err, doc) {
            if (typeof doc != undefined && doc.length > 0 && typeof doc[0] != undefined) {
                var cat = doc[0].category;
                if (cat == "teacher" || cat == "admin") {
                    if (typeof stand.name != undefined && stand.name != "") { //check multiple attributes later
                        req.db.collection('stands').find({ name: stand.name }).toArray(function (err, resu) {
                            console.log(resu);
                            if (resu.length <= 0 || resu == undefined) {
                                //do smth similar to what is done in update
                                if (typeof stand.assigned == undefined) {
                                    //copy stand and give a stand with the entire object of assigned or students etc
                                    //JSON.parse(JSON.stringify(...))
                                    //write the one with only the ids into the database
                                    stand.assigned = doc._id;
                                }

                                req.db.collection('stands').insertOne(stand, function (err, result) {
                                    console.log("1 stand inserted '" + stand.name + "'");
                                    stand.id = stand._id;
                                    res.send(stand);
                                });
                            } else {
                                res.status(400);
                                res.send("Stand already exists!");
                            }
                        });
                    }
                    else {
                        res.status(400);
                        res.send("Bad Request! Name must be defined!");
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to add a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.put('/:id/student',function (req,res,next) {
    //res.send('add a student to a stand');
    var standID = req.params.id;
    var studentID = req.body.id;
    var cookie = req.cookies.uuid;
    var head = req.headers['uuid'];
    var uuid = checkHeaderAndCookie(head, cookie);

    if (uuid == -1) {
        res.status(401);
        res.send("You need to be logged in to use this feature!");
    } else {
        req.db.collection('users').find({ uuid: uuid }).toArray(function (err, doc) {
            if (typeof doc != undefined && doc.length > 0 && typeof doc[0] != undefined) {
                var cat = doc[0].category;
                if (cat == "teacher" || cat == "admin") {
                    try {
                        standID = new mongo.ObjectID(standID);
                        req.db.collection('stands').find({ _id: id }).toArray(function (err, docu) {
                            if (typeof docu != undefined && docu.length > 0 && typeof docu[0] != undefined) {
                                try {
                                    studentID = new mongo.ObjectID(studentID);
                                    req.db.collection('users').find({ _id: studentID }).toArray(function (err, docum) {
                                        if (typeof docum != undefined && docum.length > 0 && typeof docum[0] != undefined) {
                                            req.db.collection('stands').updateOne({ _id: standID }, {
                                                $addToSet: {
                                                    "students": studentID
                                                }
                                            });
                                            res.send("Successfully added student to stand!");
                                        }
                                        else {
                                            res.status(400);
                                            res.send("Bad Request! This student does not exist!");
                                        }
                                    });
                                } catch (err) {
                                    res.status(400);
                                    res.send("Invalid Student ID! " + err.message);
                                }
                            }
                            else {
                                res.status(400);
                                res.send("Bad Request! This stand does not exist!");
                            }
                        });
                    } catch (err) {
                        res.status(400);
                        res.send("Invalid Stand ID! " + err.message);
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to add a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.put('/:id/teacher',function (req,res,next) {
    res.send('add a teacher to a stand');
});

router.delete('/:id',function (req, res, next) {
   res.send('Delete a stand');
});

router.delete('/:id/student',function (req, res, next) {
    res.send('Remove a student from a stand');
});

router.delete('/:id/teacher',function (req, res, next) {
    res.send('Remove a teacher from a stand');
});

module.exports = router;