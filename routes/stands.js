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
        req.db.collection('stands').aggregate([{
            "$match": {
                "_id": id
            }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "students",
                    "foreignField": "_id",
                    "as": "students"
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "teachers",
                    "foreignField": "_id",
                    "as": "teachers"
                }
            }
        ]).toArray(function (err, results) {
            if (results != undefined && results.length > 0 && typeof results[0] != undefined) {
                results[0].link = req.baseURL + "/stand";
                results[0].id = results[0]._id;
                var idx = 0;

                for (idx = 0; idx < results[0].students.length; idx++) {
                    results[0].students[idx].id = results[0].students[idx]._id;
                }

                for (idx = 0; idx < results[0].teachers.length; idx++) {
                    results[0].teachers[idx].id = results[0].teachers[idx]._id;
                }

                res.send(results[0]);
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


router.post('/', function (req, res, next) {
    //res.send('update the stand');
    var stand = req.body; 
    var uuid = req.uuid;
    
    if (uuid == -1) {
        res.status(401);
        res.send("You need to be logged in to use this feature!");
    } else {
        req.db.collection('users').find({ uuid: uuid }).toArray(function (err, doc) {
            if (typeof doc != undefined && doc.length > 0 && typeof doc[0] != undefined) {
                var cat = doc[0].category;
                if (cat == "teacher" || cat == "admin") { //maybe use assigned teacher
                    if (stand.name != undefined && stand.name != "") {
                        req.db.collection('stands').find({ name: stand.name }).toArray(function (err, docu) {
                            if (docu.length <= 0 || docu == undefined) {
                                try {
                                    req.db.collection('stands').find({ "_id": mongo.ObjectID(stand.id) }).toArray(function (err, result) {
                                        if (result.length > 0) {
                                            var query = { name: stand.name };
                                            if (stand.description != undefined)
                                                query.description = stand.description;

                                            if (stand.deadlineDate != undefined)
                                                query.deadlineDate = stand.deadlineDate;

                                            if (stand.time0910 != undefined)
                                                query.time0910 = stand.time0910;

                                            if (stand.time1011 != undefined)
                                                query.time1011 = stand.time1011;

                                            if (stand.time1112 != undefined)
                                                query.time1112 = stand.time1112;

                                            if (stand.time1213 != undefined)
                                                query.time1213 = stand.time1213;

                                            if (stand.time1314 != undefined)
                                                query.time1314 = stand.time1314;

                                            if (stand.time1415 != undefined)
                                                query.time1415 = stand.time1415;

                                            if (stand.time1516 != undefined)
                                                query.time1516 = stand.time1516;
                                            
                                            if (stand.cbAllowStudentsBreak != undefined)
                                                query.cbAllowStudentsBreak = stand.cbAllowStudentsBreak;

                                            if (stand.cbAllowStudentsJoin != undefined)
                                                query.cbAllowStudentsJoin = stand.cbAllowStudentsJoin;

                                            if (stand.cbAllowStudentsLeave != undefined)
                                                query.cbAllowStudentsLeave = stand.cbAllowStudentsLeave;

                                            if (stand.assigned != undefined)
                                                query.assigned = stand.assigned;

                                            req.db.collection('stands').updateOne({ "_id": mongo.ObjectID(stand.id) }, {
                                                $set: query
                                            }, function (err, resu) {
                                                if (err) {
                                                    res.status(400);
                                                    res.send("Error when updating the stand!");
                                                } else {
                                                    if (resu.result.nModified > 0) {
                                                        res.send(stand);
                                                    } else {
                                                        res.status(400);
                                                        res.send("Error! Stand was not updated!");
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
                            } else {
                                res.status(400);
                                res.send("Bad Request! Stand with this name already exists!");
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
    var uuid = req.uuid;

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
                            if (resu.length <= 0 || resu == undefined) {

                                if (stand.teachers == undefined) {
                                    stand.teachers = [];
                                }

                                if (stand.students == undefined) {
                                    stand.students = [];
                                }
                                
                                if (stand.assigned == undefined && cat != "admin") {
                                    stand.assigned = doc[0]._id;
                                    stand.teachers.push(doc[0]._id);
                                }

                                req.db.collection('stands').insertOne({
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
                                    "cbAllowStudentsLeave": stand.cbAllowStudentsLeave,
                                    "assigned": stand.assigned,
                                    "students": stand.students,
                                    "teachers": stand.teachers
                                }, function (err, result) {
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

router.put('/:id/student', function (req, res, next) {
    //res.send('add a student to a stand');
    var standID = req.params.id;
    var studID = req.body.id; 
    var uuid = req.uuid;

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
                        req.db.collection('stands').find({ _id: standID }).toArray(function (err, docu) {
                            if (typeof docu != undefined && docu.length > 0 && typeof docu[0] != undefined) {
                                try {
                                    studentID = new mongo.ObjectID(studID);
                                    req.db.collection('users').find({ _id: studentID }).toArray(function (err, docum) {
                                        if (typeof docum != undefined && docum.length > 0 && typeof docum[0] != undefined) {

                                            for (var key in docu[0].students) {
                                                docu[0].students[key] = docu[0].students[key] + "";
                                            }

                                            if (docu[0].students.includes(studentID + "")) {
                                                res.status(400);
                                                res.send("Student already in stand!");
                                            } else {
                                                req.db.collection('stands').updateOne({ _id: standID }, {
                                                    $addToSet: {
                                                        "students": studentID
                                                    }
                                                });
                                                res.send("Successfully added student to stand!");
                                            }
                                        }
                                        else {
                                            res.status(404);
                                            res.send("This student does not exist!");
                                        }
                                    });
                                } catch (err) {
                                    res.status(400);
                                    res.send("Invalid Student ID! " + err.message);
                                }
                            }
                            else {
                                res.status(404);
                                res.send("This stand does not exist!");
                            }
                        });
                    } catch (err) {
                        res.status(400);
                        res.send("Invalid Stand ID! " + err.message);
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to add a student to a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.put('/:id/teacher',function (req,res,next) {
    //res.send('add a teacher to a stand');
	var standID = req.params.id;
    var teachID = req.body.id; 
    var uuid = req.uuid;

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
                        req.db.collection('stands').find({ _id: standID }).toArray(function (err, docu) {
                            if (typeof docu != undefined && docu.length > 0 && typeof docu[0] != undefined) {
                                try {
                                    teacherID = new mongo.ObjectID(teachID);
                                    req.db.collection('users').find({ _id: teacherID }).toArray(function (err, docum) {
                                        if (typeof docum != undefined && docum.length > 0 && typeof docum[0] != undefined) {

                                            for (var key in docu[0].students) {
                                                docu[0].teachers[key] = docu[0].students[key] + "";
                                            }

                                            if (docu[0].teachers.includes(teacherID + "")) {
                                                res.status(400);
                                                res.send("Teacher already in stand!");
                                            } else {
                                                req.db.collection('stands').updateOne({ _id: standID }, {
                                                    $addToSet: {
                                                        "teachers": teacherID
                                                    }
                                                });
                                                res.send("Successfully added teacher to stand!");
                                            }
                                        }
                                        else {
                                            res.status(404);
                                            res.send("This Teacher does not exist!");
                                        }
                                    });
                                } catch (err) {
                                    res.status(400);
                                    res.send("Invalid Teacher ID! " + err.message);
                                }
                            }
                            else {
                                res.status(404);
                                res.send("This stand does not exist!");
                            }
                        });
                    } catch (err) {
                        res.status(400);
                        res.send("Invalid Stand ID! " + err.message);
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to add a teacher to a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.delete('/:id',function (req, res, next) {
    //res.send('Delete a stand');
    var standID = req.params.id;
    var studID = req.body.id;
    var uuid = req.uuid;

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
                        req.db.collection('stands').find({ _id: standID }).toArray(function (err, docu) {
                            if (typeof docu != undefined && docu.length > 0 && typeof docu[0] != undefined) {
                                req.db.collection('stands').deleteOne({ _id: standID });
                                res.send("Stand successfully deleted!");
                                //notify
                            }
                            else {
                                res.status(404);
                                res.send("This stand does not exist!");
                            }
                        });
                    } catch (err) {
                        res.status(400);
                        res.send("Invalid Stand ID! " + err.message);
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to delete a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.delete('/:id/student',function (req, res, next) {
    //res.send('Remove a student from a stand');
    var standID = req.params.id;
    var studID = req.body.id; 
    var uuid = req.uuid;

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
                        req.db.collection('stands').find({ _id: standID }).toArray(function (err, docu) {
                            if (typeof docu != undefined && docu.length > 0 && typeof docu[0] != undefined) {
                                try {
                                    studentID = new mongo.ObjectID(studID);
                                    req.db.collection('users').find({ _id: studentID }).toArray(function (err, docum) {
                                        if (typeof docum != undefined && docum.length > 0 && typeof docum[0] != undefined) {

                                            for (var key in docu[0].students) {
                                                docu[0].students[key] = docu[0].students[key] + "";
                                            }

                                            if (docu[0].students.includes(studentID + "")) {

                                                //check if this rly works
                                                req.db.collection('stands').updateOne({ _id: standID }, {
                                                    $pull: { students: studentID }
                                                });

                                                res.send("Successfully removed student from stand!"); //check if assigned -> also remove? but maybe not
                                                //also notify w msg.js
                                            } else {
                                                res.status(400);
                                                res.send("Student not in stand!");
                                            }
                                        }
                                        else {
                                            res.status(404);
                                            res.send("This Student does not exist!");
                                        }
                                    });
                                } catch (err) {
                                    res.status(400);
                                    res.send("Invalid Student ID! " + err.message);
                                }
                            }
                            else {
                                res.status(404);
                                res.send("This stand does not exist!");
                            }
                        });
                    } catch (err) {
                        res.status(400);
                        res.send("Invalid Stand ID! " + err.message);
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to add a student to a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.delete('/:id/teacher',function (req, res, next) {
    //res.send('Remove a teacher from a stand');
    var standID = req.params.id;
    var teachID = req.body.id; 
    var uuid = req.uuid;

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
                        req.db.collection('stands').find({ _id: standID }).toArray(function (err, docu) {
                            if (typeof docu != undefined && docu.length > 0 && typeof docu[0] != undefined) {
                                try {
                                    teacherID = new mongo.ObjectID(teachID);
                                    req.db.collection('users').find({ _id: teacherID }).toArray(function (err, docum) {
                                        if (typeof docum != undefined && docum.length > 0 && typeof docum[0] != undefined) {

                                            for (var key in docu[0].teachers) {
                                                docu[0].teachers[key] = docu[0].students[key] + "";
                                            }

                                            if (docu[0].teachers.includes(teacherID + "")) {

                                                //check if this rly works
                                                req.db.collection('stands').updateOne({ _id: standID }, {
                                                    $pull: { teachers: teacherID }
                                                });

                                                res.send("Successfully removed teacher from stand!"); //check if assigned -> also remove? but maybe not
                                                //also notify w msg.js
                                            } else {
                                                res.status(400);
                                                res.send("Teacher not in stand!");
                                            }
                                        }
                                        else {
                                            res.status(404);
                                            res.send("This Teacher does not exist!");
                                        }
                                    });
                                } catch (err) {
                                    res.status(400);
                                    res.send("Invalid Teacher ID! " + err.message);
                                }
                            }
                            else {
                                res.status(404);
                                res.send("This stand does not exist!");
                            }
                        });
                    } catch (err) {
                        res.status(400);
                        res.send("Invalid Stand ID! " + err.message);
                    }
                }
                else {
                    res.status(403);
                    res.send("Unauthorized to add a teacher to a stand!");
                }
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

module.exports = router;