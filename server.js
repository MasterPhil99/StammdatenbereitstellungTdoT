var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');

var https = require('https');
var options = {
    key: fs.readFileSync("./server.key"),
    cert: fs.readFileSync("./server.crt"),
    passphrase: 'ourpassphrase'
}

var index = require('./routes/index');
var students = require('./routes/students');
var stands = require('./routes/stands');
var teachers = require('./routes/teachers');
var login = require('./routes/login');
var msg = require('./routes/msg');

var db;

var port = 3000;
var baseUrl = 'https://127.0.0.1:' + port;

var MongoClient = require('mongodb').MongoClient;

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('json spaces', 40);


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


app.use(function (req, res, next) {
	var stand = req.body;
	var cookie = req.cookies.uuid;
	var header = req.headers['uuid'];

	if (cookie === undefined || cookie == "") {
		if (header === undefined || header == "") {
			req.uuid = -1;
		} else {
			req.uuid = header;
		}
		next();
	} else {
		req.db.collection('UUIDExpiry').find({ uuid: cookie }).toArray(function (err, resu) {
			if (typeof resu != undefined && typeof resu[0] != undefined) {
				req.uuid = cookie;
			} else {
				req.uuid = -1;
			}
			next();
		});
	}

});

app.use('/', index);
app.use('/students', students);
app.use('/teachers', teachers);
app.use('/stands', stands);
app.use('/login', login);
app.use(['/messages', '/message'], msg);

app.use(function (req, res, next) {
    if (req.method === 'OPTIONS') {
        console.log('!OPTIONS');
        var headers = {};
        // IE8 does not allow domains to be specified, just the *
        // headers["Access-Control-Allow-Origin"] = req.headers.origin;
        headers["Access-Control-Allow-Origin"] = "*";
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Credentials"] = false;
        headers["Access-Control-Max-Age"] = '90000'; // 24 hours
        headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
        res.writeHead(200, headers);
        res.end();
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

MongoClient.connect('mongodb://127.0.0.1:27017/pupilmgmt', (err, database) => {
	if (err) throw err;
	db = database;
	/*app.listen(port, () => {
		console.log("Listen to port " + port);
    });*/

    https.createServer(options, app).listen(port, function () {
        console.log("Listen to port " + port);
    });
});
