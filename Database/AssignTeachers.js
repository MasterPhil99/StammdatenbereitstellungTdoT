var fs = require('fs');  
var MongoClient = require('mongodb').MongoClient;

var usage = "node \"'InsertFromCSV'.js\" [file to load students from]";
var file = "./LehrerlisteWIP.csv"; //process.argv[2];

if (file){
  MongoClient.connect('mongodb://127.0.0.1:27017/pupilmgmt', (err, database) => {
    if (err) 
      console.log (usage);
    else {
		//database.collection("users").ensureIndex({ username: 1 }, { unique: true });
		fs.readFile(file , 'binary', function (err, data){
		var idx = 0;
		var splittedData = data.split('\r\n');
		//console.log(splittedData);
		//console.log(splittedData[idx]);
		recUpdate(splittedData, idx, database);
      });
    }    
  });
} else {
  console.log(usage);
}

function recUpdate(data, index, db) {
	console.log("recUpdate" + index);
	if(data != "" && data != undefined) {
	console.log("recUpdate" + index);
		var pupil = data[index].split(';');
		//console.log(pupil);
		console.log(index + " . teacher");
		db.collection('users').findOne({ username: pupil[1] }, function(err, result) {
			//console.log(result);
			if(result != null) {
				db.collection('stands').updateOne( { name: pupil[0] }, { assigned: result._id, $push: { teachers: result._id }}, function(err, res){
					index++;
					//console.log(data);
					//console.log(data[index]);
					//console.log(index);
					recUpdate(data, index, db);
					console.log('Teacher ' + result.username + ' was assigned to stand ' + pupil[0] + ' !');
				});
			}
		});
	}
}