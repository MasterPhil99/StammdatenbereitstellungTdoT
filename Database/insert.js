var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/pupilmgmt";

MongoClient.connect(url, function(err, db) {
	if(err) throw err;
	
	db.collection("stands").drop(function(err, delOK) {
		if(err) console.log(err);
		else if(delOK) console.log("Stands deleted");
	});
	
	db.collection("students").drop(function(err, delOK) {
		if(err) console.log(err);
		else if(delOK) console.log("Students deleted");
	});
	
	db.collection("users").drop(function(err, delOK) {
		if(err) console.log(err);
		else if(delOK) console.log("Users deleted");
	});
	
	var users = [
	//{ class: '4AHIFS', lastname: 'BABIN', firstname: 'Angelika', username: 'babina', category: 'student'},
	//{ class: '4AHIFS', lastname: 'BERI?A', firstname: 'Valon', username: 'beri?av', category: 'student'},
	//{ class: '4AHIFS', lastname: 'BLASCHKE', firstname: 'Julian', username: 'blaschkej', category: 'student'},
	{ firstname: 'achim', lastname: 'karasek', username: 'kaa', password: 'KaaHash', category: 'teacher' },
	{ username: 'admin', password: 'AdminHash', category: 'admin' }
	];
	
	db.createCollection("stands", function(err, res) {
		if(err) console.log(err);
		else console.log("Collection for Stands created!");
	});
	
	db.createCollection("UUIDExpiry", function(err, res) {
		if(err) console.log(err);
		else console.log("Collection for UUIDExpiry created!");
	});
	
	db.collection("users").insertMany(users, function(err, res) {
		if(err) console.log(err);
		else console.log("Collection for Users created and " + res.insertedCount + " test users inserted");
		db.close();
	});
});