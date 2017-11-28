var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    //res.send('login');
    var uName = req.headers['username'];
    var uPwd = req.headers['password'];

    if (uName == undefined || uPwd == undefined) {
        res.status(400);
        res.send("Bad Request! Username and Password must be defined!");
    }
    else {
        req.db.collection('users').find({ username: uName }).toArray(function (err, doc) {
            if (typeof doc != undefined || doc.length > 0) {
                req.db.collection('users').find({ username: uName, password: uPwd }).toArray(function (err, result) {
                    if (typeof result != undefined || result.length > 0) {
                        var expiryTime = 90000;
                        var uuid = getUuid();
                        if (typeof result[0].uuid == undefined || result[0].uuid == "") {
                            res.cookie('uuid', uuid, { maxAge: expiryTime, httpOnly: true });
                                
                            var newUser = JSON.parse(JSON.stringify(result[0]));
                            newUser.uuid = uuid;
                            req.db.collection('users').update({ _id: result[0]._id }, { $set: { uuid: uuid } });

                            req.db.collection('UUIDExpiry').createIndex({ createdAt: 1 }, { expireAfterSeconds: expiryTime });
                            req.db.collection('UUIDExpiry').insertOne({ uuid: uuid, createdAt: new Date() });

                            res.send(newUser);
                        }
                        else {
                            req.db.collection('UUIDExpiry').createIndex({ createdAt: 1 }, { expireAfterSeconds: expiryTime });
                            req.db.collection('UUIDExpiry').insertOne({ uuid: uuid, createdAt: new Date() });

                            res.cookie('uuid', result[0].uuid, { maxAge: expiryTime, httpOnly: true });
                            res.send(result[0]);
                        }
                    } else {
                        res.status(401);
                        res.send("Wrong password!");
                    }
                });
            } else {
                res.status(404);
                res.send("User not Found!");
            }
        });
    }
});

function getUuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

module.exports = router;