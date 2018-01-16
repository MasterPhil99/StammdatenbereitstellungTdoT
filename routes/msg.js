var express = require('express');
var mongodb = require('mongodb');
var router = express.Router();

router.get('/', function (req, res, next) {
    var UserId = req.user.id;
    req.db.collection('msg').aggregate([
        { $match: { user: mongodb.ObjectID(UserId) } },
        {
            $lookup:
            {
                from: 'user',
                localField: 'from',
                foreignField: '_id',
                as: 'from'
            }
        },
        { $unwind: "$from" }
    ], function (err, result) {
        if (err) throw err;
        //    console.log(JSON.stringify(res));
        //    db.close();
        //});
        //req.db.collection('msg').find({ user: UserId }, function (err, result) {
        //    if (err) throw err;
        for (var k in result) {
            result[k].id = result[k]._id;
            delete result[k]._id;
            delete result[k].user;
            delete result[k].from.password;
            delete result[k].from.loginToken;
            delete result[k].from.stand;
        }
        res.send(result);
    });
});

router.put('/', function (req, res, next) {
    var body = req.body;
    if (body && body.text && body.to) {
        var o = (mongodb.ObjectID.isValid(body.to)) ? { $or: [{ _id: mongodb.ObjectID(body.to) }, { username: body.to }] } : { username: body.to };
        req.db.collection('user').find(o).toArray(function (err, result) {
            if (err) throw err;
            if (result.length <= 0) {
                res.status(404);
                res.send({ info: "user not found", link: req.baseURL });
            } else {
                var o = {
                    text: body.text,
                    user: result[0]._id,
                    from: req.user.id,
                    time: new Date()
                };
                req.db.collection('msg').insert(o, function (err, result2) {
                    if (err) throw err;
                    res.send({ info: "message sent", link: req.baseURL });
                });
            }
        });
    }else{
        res.status(400);
        res.send({ info: "text, user with userid have to be set", link: req.baseURL });
    }
});

router.delete('/:mId', function (req, res, next) {
    req.db.collection('msg').deleteOne({ _id: mongodb.ObjectID(req.params.mId), user: req.user.id }, function (err, result) {
        if (result.n <= 0 ) {
            res.status(404);
            res.send({ info: "no Message found", link: req.baseURL });
        } else {
            res.send({ info: "Message Deleted" });        
        }
    });
});
module.exports = router;