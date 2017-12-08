var express = require('express');
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


    if (typeof pLastName != undefined && pLastName != null) {
        lnFlag = true;
    }

    if (typeof pFirstName != undefined && pFirstName != null) {
        fnFlag = true;
    }

    if (typeof pUserName != undefined && pUserName != null) {
        unFlag = true;
    }

    if (lnFlag || fnFlag || cFlag) {
        //filter after the available parameters
        req.db.collection('users').find({ lastname: pLastName, category: 'teacher' }, { password: 0, category: 0 }).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Teacher not found!');
            } else {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/teacher/" + results[item].id;
                }
                res.send(results);
            }
        });
    }
    else {
        req.db.collection('users').find({ category: 'teacher' }, { _id: 1, username: 1}).toArray(function (err, results) {
            if (typeof results == undefined || results.length <= 0) {
                res.status(404);
                res.send('Teacher not found!');
            } else {
                for (var item in results) {
                    results[item].id = results[item]._id;
                    results[item].link = req.baseURL + "/teacher/" + results[item].id
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
                console.log(results);
                results[0].link = req.baseURL + "/teacher";

                res.send(results);
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
                    if ((typeof teacher.username != undefined && teacher.username != "") && 
                            (typeof teacher.password != undefined && teacher.password != "") && 
                                (typeof teacher.firstname != undefined && teacher.username != "") && 
                                    (typeof teacher.lasname != undefined && teacher.lastname != "")) {
                        req.db.collection('users').insertOne({
                            username : teacher.usermane,
                            firstname : teacher.firstname,
                            lastname : teacher.lastname,
                            category : "teacher",
                            password : teacher.password,
                        }, function (err, result) {

                            console.log("teacher added");
                            res.send(teacher);
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
});

module.exports = router;
