var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/pupilmgmt";

MongoClient.connect(url, function(err, db) {
	if(err) throw err;
	
	db.collection("stands").drop(function(err, delOK) {
		if(err) throw err;
		if(delOK) console.log("Stands deleted");
	});
	
	db.collection("students").drop(function(err, delOK) {
		if(err) throw err;
		if(delOK) console.log("Students deleted");
	});
	
	var students = [
	{ class: '4AHIFS', lastname: 'BABIN', firstname: 'Angelika', birthdate: '09.03.1999' },
	{ class: '4AHIFS', lastname: 'BERI?A', firstname: 'Valon', birthdate: '01.11.1998' },
	{ class: '4AHIFS', lastname: 'BLASCHKE', firstname: 'Julian', birthdate: '25.10.1999' }
	];
	
	db.createCollection("stands", function(err, res) {
		if(err) throw err;
		console.log("Collection for Stands created!");
	});
	
	db.collection("students").insertMany(students, function(err, res) {
		if(err) throw err;
		console.log("Collection for students created and " + res.insertedCount + " test students inserted");
	db.close();
	});
});