var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    //res.send('list of all stands');
    console.log(req.baseURL);
    req.db.collection('stand').find({}, {_id: 0,id:1,name: 1}).toArray(function(err, results) {
        for (var item in results) {
            results[item].link = req.baseURL+"/stand/"+results[item].id
        }
        res.send(results);
    });
});

router.get('/:id', function (req, res, next) {

    //res.send('list of one stand');
    var id = req.params.id;
    req.db.collection('stand').find({"id": id},{_id:0}).toArray(function(err, results) {
        console.log(results);
        for (var item in results) {
            results[item].link = req.baseURL+"/stand";
        }

        res.send(results);
    });
});

router.get('/:id/students',function(req, res, next) {
    res.send('list of students in this stand');
});

router.get('/:id/teacher',function(req, res, next) {
    res.send('list of teacher in this stand');
});

router.post('/',function (req,res,next) {
 //   res.send('update the stand');
    var stand = req.body;
    req.db.collection('stand').update(
        {id:stand.id},stand
    )
});

router.put('/',function (req,res,next) {
    //res.send('add a new stand, return stand obj with id');
    var stand = req.body;
    stand.id = guid();
    req.db.collection('stand').insert( stand );
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
