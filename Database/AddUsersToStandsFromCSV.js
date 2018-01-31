var fs = require('fs');  
var MongoClient = require('mongodb').MongoClient;

var usage = "node \"'InsertFromCSV'.js\" [file to load students from]";
var file = "./BenutzerListe.csv"; //process.argv[2];

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
		//database.close();
        /*for(var line of data.split('\r\n')){ //smth smth put the data in there etc do stuff
          if (line != ""){
            var pupil = line.split(';');
			if(pupil[5] != 'Unterricht' && pupil[5] != "") {
				database.collection('users').find({ username: pupil[0] }, function(err, result) {
					database.collection('stands').updateOne( { name: pupil[5] }, { $push: { students: result._id }}, function(err, res){
						console.log('Student ' + pupil[0] + ' was added to stand ' + pupil[5] + ' !');
					});
				});
			}
          }
        }*/
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
		if(pupil[4] != 'Unterricht' && pupil[4] != 'frei gestellt' && pupil[4] != 'abgemeldet') {
			console.log(index + " . student");
			db.collection('users').findOne({ username: pupil[0] }, function(err, result) {
				//console.log(result);
				if(result != null) {
					db.collection('stands').updateOne( { name: pupil[4] }, { $push: { students: result._id }}, function(err, res){
						index++;
						//console.log(data);
						//console.log(data[index]);
						//console.log(index);
						recUpdate(data, index, db);
						console.log('Student ' + result.username + ' was added to stand ' + pupil[5] + ' !');
					});
				}
			});
		} else {
			index++;
			recUpdate(data, index, db);
		}
	}
}