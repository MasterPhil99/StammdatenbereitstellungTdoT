var fs = require('fs');  
var MongoClient = require('mongodb').MongoClient;

var usage = "node \"'InsertFromCSV'.js\" [file to load students from]";
var file = "./Benutzerliste.CSV"; //process.argv[2];


if (file){
  MongoClient.connect('mongodb://127.0.0.1:27017/pupilmgmt', (err, database) => {
    if (err) 
      console.log (usage);
    else {
      //database.collection("users").ensureIndex({ username: 1 }, { unique: true });
      fs.readFile(file , 'binary', function (err, data){
        var stands = [];
		var standNames = []
        for(var line of data.split('\r\n')){
          if (line != ""){
            var pupil = line.split(';');
			if(pupil[4] != 'Unterricht' && pupil[4] != 'abgemeldet' && pupil[4] != 'frei gestellt' && pupil[4] != 'Guide') {
				standNames.push(pupil[4]);
			}
			
			if(pupil[5] != 'Unterricht' && pupil[5] != 'abgemeldet' && pupil[5] != 'frei gestellt' && pupil[4] != 'Guide') {
				standNames.push(pupil[5]);
			}
          }
        }

		var uniqueStandNames = standNames.filter(function(elem, pos) {
			return standNames.indexOf(elem) == pos;
		})
		
		for(var i = 0, len = uniqueStandNames.length; i < len; i++) {
			var o = {
				  "name": uniqueStandNames[i],
				  "description": "",
				  "deadlineDate": "01.02.2018",
				  "time0910": "1",
				  "time1011": "1",
				  "time1112": "1",
				  "time1213": "1",
				  "time1314": "1",
				  "time1415": "1",
				  "time1516": "1",
				  "cbAllowStudentsBreak": true,
				  "cbAllowStudentsJoin": true,
				  "cbAllowStudentsLeave": true,
				  "assigned": "",
				  "students": [],
				  "teachers": []
				};
				
			stands.push(o);
		}
		
        database.collection('stands').insertMany(stands, function (err, res) {
          if (err) console.log(JSON.stringify(err));
          database.close();
        });
      });
    }    
  });

} else {
  console.log(usage);
}