var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/pupilmgmt";

MongoClient.connect(url, function(err, db) {
	if(err) throw err;
	
	db.collection("stands").drop(function(err, delOK) {
		if(err) console.log(err);
		else
			if(delOK) console.log("Stands deleted");
	});
	
	db.collection("students").drop(function(err, delOK) {
		if(err) console.log(err);
		else
			if(delOK) console.log("Students deleted");
	});
	
	db.collection("users").drop(function(err, delOK) {
		if(err) console.log(err);
		else
			if(delOK) console.log("Users deleted");
	});
	
	var students = [
	{ class: '4AHIFS', lastname: 'BABIN', firstname: 'Angelika', birthdate: '09.03.1999' },
	{ class: '4AHIFS', lastname: 'BERI?A', firstname: 'Valon', birthdate: '01.11.1998' },
	{ class: '4AHIFS', lastname: 'BLASCHKE', firstname: 'Julian', birthdate: '25.10.1999' },
	{ class: '4AHIFS', lastname: 'BLASCHKE', firstname: 'ABC', birthdate: '25.10.1998' }
	];
	var users = [
	{ username: 'teach', password: 'TeachHash', category: 'teacher' },
	{ username: 'student', password: 'StudentHash', category: 'student' },
	{ username: 'admin', password: 'AdminHash', category: 'admin' }
	];
	
	db.createCollection("stands", function(err, res) {
		if(err) console.log(err);
		else
			console.log("Collection for Stands created!");
	});
	
	db.createCollection("UUIDExpiry", function(err, res) {
		if(err) console.log(err);
		else
			console.log("Collection for UUIDExpiry created!");
	});
	
	db.collection("users").insertMany(users, function(err, res) {
		if(err) console.log(err);
		else
			console.log("Collection for Users created and " + res.insertedCount + " test users inserted");
	});
	db.collection("students").insertMany(students, function(err, res) {
		if(err) console.log(err);
		else
			console.log("Collection for students created and " + res.insertedCount + " test students inserted");
	db.close();
	});
});