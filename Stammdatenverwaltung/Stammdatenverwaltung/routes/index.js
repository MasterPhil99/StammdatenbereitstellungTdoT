var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send({student:req.baseURL+'/student',
        teacher:req.baseURL+'/teacher',
        stand:req.baseURL+'/stand'});
});

module.exports = router;
