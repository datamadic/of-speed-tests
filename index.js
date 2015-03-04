var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    
    MongoClient = require('mongodb').MongoClient,
    url = 'mongodb://display:display@ds049171.mongolab.com:49171/heroku_app34521734',
    Promise = require('es6-promise').Promise;

app.set('view engine', 'jade');

app.use(express.static(__dirname));

app.get('/display.html', function (req, res) {
	console.log('asking');
  queryTimes()
  	.then(function(results){
  		
  		var times = results.map(function(result){
	  			return {
		  			totalTime: (parseInt(result.appLoaded) - (new Date(result.rvmInvoked)).getTime()) / 1000,
		  			name: result.sysInfo.startup_app.name
		  		};
	  		});
	  	res.render('display', {results: times});
	  },
	  function(reason){
	  	res.json({reason: reason});
	  });
});

app.get('/data', function (req, res) {
  queryTimes()
  	.then(function(results){
	  	res.json(results);
	  },
	  function(reason){
	  	res.json({reason: reason});
	  });
});

server.listen(9000);

function queryTimes() {
		return new Promise(function(resolve, reject){

			MongoClient.connect(url, function(err, db) {

	        if (err) {
	        	return reject(err);
	        }

	        var collection = db.collection('heroku_app34521734');
	        collection.find().toArray(function(err, results) {

	        	if (err) {
		        	return reject(err);
		        	
		        }

	          db.close();
	          console.log('resolving');
	          resolve(results);
	        });
	    });
		});
    
}//end 

//logToMongo();
