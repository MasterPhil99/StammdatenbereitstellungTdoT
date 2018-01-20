var express = require('express');
var mongo = require('mongodb');
var router = express.Router();

router.get('/', function (req, res, next) {
    //res.send('list with all users');
    req.db.collection('users').find({}, { password: 0, category: 0 }).toArray(function (err, results) {
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

        req.db.collection('users').find({ _id: id }, { password: 0, category: 0 }).toArray(function (err, results) {
            if (typeof results != undefined && results.length > 0 && results[0] != undefined) {
                res.send(results[0]);
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
    res.send('list of stands with this user');
});

module.exports = router;