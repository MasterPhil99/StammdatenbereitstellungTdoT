var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

router.get('/', function(req, res, next) {
    //res.send('list of all stands');
    //no need to check authorization -> everyone can see the stands
    var pName = req.query.name;
    if (pName != null) {
        req.db.collection('stands').find({ name: pName }).toArray(function (err, results) {
            for (var item in results) {
                results[item].id = results[item]._id;
                results[item].link = req.baseURL + "/stand/" + results[item].id;
            }
            res.send(results);
        });
    }
    else {
        req.db.collection('stands').find({}, { _id: 1, name: 1 }).toArray(function (err, results) {
            for (var item in results) {
                results[item].id = results[item]._id;
                results[item].link = req.baseURL + "/stand/" + results[item].id;
            }
            res.send(results);
        });
    }
});

router.get('/:id', function (req, res, next) {
    //res.send('list of one stand');
    //no need to check authorization -> everyone can see the stands
    try {
        var id = new mongo.ObjectID(req.params.id); //check id first!!!
        req.db.collection('stands').find({ _id: id }).toArray(function (err, results) {
            if (results != undefined && results.length > 0 && results != undefined) {
                console.log(results);
                results[0].link = req.baseURL + "/stand";

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
            if (resu[0] != undefined) {
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
            if (doc[0] != undefined || doc.length > 0) {
                var cat = doc[0].category;
                if (cat == "teacher" || cat == "admin") { //later change this to if it is the responsible teacher or a teacher at that stand
                    if (stand.name != undefined && stand.name != "") { //check multiple attributes later
                        stand._id = stand.id; //check id
                        req.db.collection('stands').update({ _id: stand.id }, stand); //doesnt really update?
                        res.send(stand);
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
            if (doc[0] != undefined || doc.length > 0) {
                var cat = doc[0].category;
                if (cat == "teacher" || cat == "admin") {
                    if (stand.name != undefined && stand.name != "") { //check multiple attributes later
                        req.db.collection('stands').find({ name: stand.name }).toArray(function (err, resu) {
                            console.log(resu);
                            if (resu.length <= 0 || resu == undefined) {
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
    res.send('add a student to a stand');
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