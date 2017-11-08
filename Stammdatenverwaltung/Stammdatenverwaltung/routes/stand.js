var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    //res.send('list of all stands');
    //console.log(req.baseURL);
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
    var id = req.params.id;
    req.db.collection('stands').find({"_id": id}).toArray(function(err, results) {
        console.log(results);
        for (var item in results) {
            results[item].link = req.baseURL+"/stand";
        }
        
        res.send(results);
    });
});

router.get('/:id/student',function(req, res, next) {
    res.send('list of students in this stand');
});

router.get('/:id/teacher',function(req, res, next) {
    res.send('list of teacher in this stand');
});

router.post('/',function (req,res,next) {
 //   res.send('update the stand');
    var stand = req.body;
    req.db.collection('stands').update(
        {_id:stand.id},stand
    )
});

router.put('/',function (req,res,next) {
    //res.send('add a new stand, return stand obj with id');
    var stand = req.body;
    //stand._id = guid();
    req.db.collection('stands').insertOne(stand, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted '" + stand.name + "'");
    });
    res.send(stand);
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

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

module.exports = router;
