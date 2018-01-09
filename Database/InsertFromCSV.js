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
        var objs = [];
        for(var line of data.split('\r\n')){
          if (line != ""){
            var pupil = line.split(',');
            var o = {
              username: pupil[0],
              lastname: pupil[1],
              firstname: pupil[2],
              class: pupil[3],
              category: 'student',
			  settings: {
                            "breakChange": true,
                            "joinStand": true,
                            "leaveStand": true,
                            "deleteStand": false,
                            "changeStandSetting": true
                        };
            };
            objs.push(o);
          }
        }      
        database.collection('users').insertMany(objs, function (err, res) {
          if (err) console.log(JSON.stringify(err));
          database.close();
        });
      });
    }    
  });

} else {
  console.log(usage);
}