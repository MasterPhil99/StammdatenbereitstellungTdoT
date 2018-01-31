var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

router.get('/', function (req, res, next) {
    //res.send('list with all users');
    req.db.collection('users').find({}, { password: 0 }).toArray(function (err, results) {
        if (typeof results == undefined || results.length <= 0) {
            res.status(404);
            res.send('No User exists!');
        } else {
            var resultsToReturn = [];
            for (var item in results) {
                results[item].id = results[item]._id;
                results[item].link = req.baseURL + "/users/" + results[item].id;
            }
            res.send(results);
        }
    });
});

router.get('/:id', function (req, res, next) {
    //res.send('user by id');
    try {
        var id = new mongo.ObjectID(req.params.id);

        req.db.collection('users').find({ _id: id }, { password: 0 }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && results[0] != undefined) {
                var query = {};
                if (results[0].category == 'student')
                    query = { students: results[0]._id };

                if (results[0].category == 'teacher')
                    query = { teachers: results[0]._id };
                
                req.db.collection('stands').find(query).toArray(function (err, doc) {
                    results[0].id = results[0]._id;
                    results[0].link = req.baseURL + "/users/";
                    results[0].assigned = false;
                    if (typeof doc != undefined && doc.length > 0) {
                        doc[0].id = doc[0]._id;
                        results[0].assigned = true;
                        results[0].teacher = doc[0].assigned;
                        results[0].stand = doc;
                    }

                    res.send(results[0]);
                });
            } else {
                res.status(404);
                res.send("User not found!");
            }
        });
    } catch (err) {
        res.status(400);
        res.send("Invalid ID! " + err.message);
    }
});

router.get('/:id/stand', function (req, res, next) {
    //res.send('list of stands with this user');
    try {
        var id = new mongo.ObjectID(req.params.id);

        req.db.collection('users').find({ _id: id }, { password: 0, category: 0 }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && results[0] != undefined) {
                req.db.collection('stands').find({ students: results[0]._id }).toArray(function (err, doc) {
                    console.log(doc);
                    if (typeof doc != undefined && doc.length > 0) {
                        res.send(doc);
                    } else {
                        res.status(404);
                        res.send("This user is in no stand!");
                    }
                });
            } else {
                res.status(404);
                res.send("User not found!");
            }
        });
    } catch (err) {
        res.status(400);
        res.send("Invalid ID! " + err.message);
    }
});

module.exports = router;