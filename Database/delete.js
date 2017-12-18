var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/pupilmgmt";

MongoClient.connect(url, function(err, db) {
	if(err) {
		console.log(err);
	}
	else {
		db.collection("stands").drop(function(err, delOK) {
			if(err) console.log(err);
			else if(delOK) console.log("Stands deleted");
		});
		
		db.collection("users").drop(function(err, delOK) {
			if(err) console.log(err);
			else if(delOK) console.log("Users deleted");
			db.close();
		});
	}
});