var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('list with all teachers');
});
router.get('/:id',function(req, res, next) {
    res.send('exact teacher info');
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
                    if ((typeof teacher.name != undefined && teacher.name != "") && (typeof teacher.password != undefined && teacher.password != "")) { //check multiple attributes later
                        //add teacher to database?
                    }
                    else {
                        res.status(400);
                        res.send("Bad Request! Name and Password must be defined!");
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
