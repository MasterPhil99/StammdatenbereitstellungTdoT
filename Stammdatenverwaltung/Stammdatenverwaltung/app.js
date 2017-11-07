var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cors = require('cors');


var index = require('./routes/index');
var student = require('./routes/student');
var stand = require('./routes/stand');
var teacher = require('./routes/teacher');

var db;

var port=3000;
var baseUrl = 'http://127.0.0.1:'+port;

var MongoClient = require('mongodb').MongoClient;

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('json spaces', 40);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
    req.baseURL = baseUrl;
    req.db = db;
    next();
});


app.use('/', index);
app.use('/student',student);
app.use('/teacher',teacher);
app.use('/stand',stand);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

MongoClient.connect('mongodb://127.0.0.1:27017/pupil-management', (err, database) => {
        if (err) throw err;
        db = database;
        app.listen(port, () => {
            console.log("Listen to port " + port);
    });
});
