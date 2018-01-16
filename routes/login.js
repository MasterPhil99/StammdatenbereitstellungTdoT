var express = require('express');
var router = express.Router();

var ActiveDirectory = require('activedirectory');
//use the ad user, which is given to us at a later time
var config = {
    url: 'LDAP://minerva.htl-vil.local',
    baseDN: 'ou=Users,dc=htl-vil,dc=local',
    username: 'htl-vil\\',
    password: ''
}
var ad = new ActiveDirectory(config);
var base = 'ou=Users,dc=htl-vil,dc=local';

router.get('/me', function (req, res, next) {
    res.send('login/me');
    var uuid = req.uuid;

    if (uuid == -1) {
        res.status(401);
        res.send("You need to be logged in to use this feature!");
    } else {
        req.db.collection('users').find({ uuid: uuid }).toArray(function (err, doc) {
            if (typeof doc != undefined && doc.length > 0 && typeof doc[0] != undefined) {
                var userToReturn = doc[0];
                delete userToReturn.password;
                res.send(userToReturn);
            } else {
                res.status(401);
                res.send("You need to be logged in to use this feature!");
            }
        });
    }
});

router.get('/', function (req, res, next) {
    var uName = req.headers['username'];
    var uPwd = req.headers['password'];

    if (uName == undefined || uPwd == undefined) {
        res.status(400);
        res.send("Bad Request! Username and Password must be defined!");
    }
	else {
        req.db.collection('users').find({ username: uName }).toArray(function (err, doc) {
            if (doc != undefined && doc.length > 0 && typeof doc[0] != undefined) {
                var decPwd;
                if (typeof Buffer.from === "function") {
                    // Node 5.10+
                    decPwd = Buffer.from(uPwd, 'base64').toString();
                } else {
                    // older Node versions
                    decPwd = new Buffer(uPwd, 'base64').toString();
                }

                //console.log(decPwd);

                if (doc[0].category == 'student') {
                    ad.authenticate("htl-vil\\" + uName, decPwd, function (err, auth) {
						if (err) {
							var errObj = JSON.parse(JSON.stringify(err));
							if (errObj != undefined && errObj.lde_message != undefined) {
								if (errObj.lde_message.includes("AcceptSecurityContext")) {
									res.status(401);
									res.send("Authentication failed! Username or Password might be wrong!");
								}
								else {
									res.status(500);
									res.send(JSON.stringify(err));
								}
							}
							else {
								res.status(400);
								res.send("Bad Request!");
							}
                        } else {
                            if (auth) {
                                console.log('Authenticated!');
                                var expiryTime = 90000;
                                var uuid = getUuid();
                                console.log(doc[0]);
                                console.log(doc[0].uuid);
                                if (doc[0].uuid == undefined || doc[0].uuid == "") {
                                    console.log("creating new uuid..");
                                    res.cookie('uuid', uuid, { maxAge: expiryTime, httpOnly: true });

                                    var newUser = JSON.parse(JSON.stringify(doc[0]));
                                    newUser.uuid = uuid;
                                    req.db.collection('users').update({ _id: doc[0]._id }, { $set: { uuid: uuid } });

                                    req.db.collection('UUIDExpiry').createIndex({ createdAt: 1 }, { expireAfterSeconds: expiryTime });
                                    req.db.collection('UUIDExpiry').insertOne({ uuid: uuid, createdAt: new Date() });

                                    res.send(newUser);
                                } else {
                                    var User = JSON.parse(JSON.stringify(doc[0]));
                                    console.log("updating expiry and using old one..");
                                    req.db.collection('UUIDExpiry').createIndex({ createdAt: 1 }, { expireAfterSeconds: expiryTime });
                                    req.db.collection('UUIDExpiry').insertOne({ uuid: uuid, createdAt: new Date() });

                                    res.cookie('uuid', User.uuid, { maxAge: expiryTime, httpOnly: true });

                                    res.send(User);
                                }
                            }
                            else {
                                console.log('Authentication failed!');
                                res.status(401);
                                res.send("Authentication failed! Username or Password might be wrong!");
                            }
                        }
                    });
                } else {
                    req.db.collection('users').find({ username: uName, password: uPwd }).toArray(function (err, result) {
                        if (typeof result != undefined && result.length > 0) {
                            var expiryTime = 90000;
                            var uuid = getUuid();
                            console.log(result[0]);
                            console.log(result[0].uuid);
                            if (result[0].uuid == undefined || result[0].uuid == "") {
                                console.log("creating new uuid..");
                                res.cookie('uuid', uuid, { maxAge: expiryTime, httpOnly: true });

                                var newUser = JSON.parse(JSON.stringify(result[0]));
                                newUser.uuid = uuid;
                                delete newUser.password;
                                req.db.collection('users').update({ _id: result[0]._id }, { $set: { uuid: uuid } });

                                req.db.collection('UUIDExpiry').createIndex({ createdAt: 1 }, { expireAfterSeconds: expiryTime });
                                req.db.collection('UUIDExpiry').insertOne({ uuid: uuid, createdAt: new Date() });


                                res.send(newUser);
                            } else {
                                var User = JSON.parse(JSON.stringify(result[0]));
                                delete User.password;
                                console.log("updating expiry and using old one..");
                                req.db.collection('UUIDExpiry').createIndex({ createdAt: 1 }, { expireAfterSeconds: expiryTime });
                                req.db.collection('UUIDExpiry').insertOne({ uuid: uuid, createdAt: new Date() });

                                res.cookie('uuid', User.uuid, { maxAge: expiryTime, httpOnly: true });

                                res.send(User);
                            }
                        } else {
                            res.status(401);
                            res.send("Wrong password!");
                        }
                    });
                }
            } else {
                res.status(404);
                res.send("User not found!");
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