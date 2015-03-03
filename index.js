var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    
    MongoClient = require('mongodb').MongoClient,
    url = 'mongodb://display:display@ds049171.mongolab.com:49171/heroku_app34521734',
    Promise = require('es6-promise').Promise;

app.set('view engine', 'jade');

app.use(express.static(__dirname));

app.get('/display.html', function (req, res) {
  queryTimes()
  	.then(function(results){
	  	res.render('display', {results: results});
	  },
	  function(reason){
	  	res.json({reason: reason});
	  });
});

app.get('/data', function (req, res) {
  queryTimes()
  	.then(function(results){
	  	res.render('display', {results: results});
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
	          resolve(results);
	        });
	    });
		});
    
}//end 

//logToMongo();
