var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send({student:req.baseURL+'/students',
        teacher:req.baseURL+'/teachers',
        stand:req.baseURL+'/stands'});
});

module.exports = router;
