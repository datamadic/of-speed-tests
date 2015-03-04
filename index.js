var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    
    MongoClient = require('mongodb').MongoClient,
    url = 'mongodb://display:display@ds049171.mongolab.com:49171/heroku_app34521734',
    Promise = require('es6-promise').Promise,
    _ = require('underscore');

server.listen(9000);
app.set('view engine', 'jade');

app.get('/display.html', function (req, res) {
  queryTimes()
  	.then(function(results){
  		
  		var times = results.map(function(result){
	  			return {
		  			totalTime: (parseInt(result.appLoaded) - (new Date(result.rvmInvoked)).getTime()) / 1000,
		  			name: result.sysInfo.startup_app.name,
		  			_id: result._id,
		  			runtimeVersion: result.runtimeVersion,
		  			date: result.rvmInit
		  		};
	  		});
	  	res.render('display', {results: times.sort(function(first, second){
	  		return first.date > second.date
	  	})});
	  },
	  function(reason){
	  	res.json({reason: reason});
	  });
});

app.get('/details.html/:id', function (req, res) {
  queryTimes({
  	'_id': require('mongodb').ObjectID(req.params.id)
  }).then(function(results){
	  	res.render('details', {item: JSON.stringify(results, null, ' ')});
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



function queryTimes(query) {
		return new Promise(function(resolve, reject){

			MongoClient.connect(url, function(err, db) {

	        if (err) {
	        	return reject(err);
	        }

	        var collection = db.collection('heroku_app34521734');
	        collection.find(query || {}).toArray(function(err, results) {

	        	if (err) {
		        	return reject(err);
		        	
		        }

	          db.close();
	          resolve(results);
	        });
	    });
		});
}//end 
