var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    config = require('./config.js'),
    path = require('path'),
    loggingInfo = {},
    spawn = require('child_process').spawn,
    rimraf = require('rimraf'),
    child,
    fs = require('fs'),
    MongoClient = require('mongodb').MongoClient,
    url = 'mongodb://speed:speed@ds049171.mongolab.com:49171/heroku_app34521734',
    Promise = require('es6-promise').Promise;//,
    //q = require('q');

// var rimrafPromise = function(paths){
//     var deferred = q.defer();

//     rimraf(paths, function(err){
//         if (err){
//             deferred.reject(err);
//         }
//         else {
//             deferred.resolve();
//         }
//     });
//     return deferred.promise;
// };


server.listen(9000);
app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('times', function (data) {
    
    loggingInfo.appInitial = data.ofInitialTime;
    loggingInfo.appLoaded = data.ofAfterLoaded;
    loggingInfo.runtimeVersion = data.runtimeVersion;
    loggingInfo.sysInfo = data.sysInfo;
    socket.emit('shutdown', 'true');
    console.log('shutting down...');
    getLogs();
    logToMongo ();

      // .then(function(){
      //   console.log('hey ho')
      //   logToMongo ()
      // });
    //console.log(data);
  });
});

loggingInfo.rvmInvoked = Date.now();

child = spawn(config.rvmLocation, [ '--config', config.appConfig]);

child.on('error', function(err){
 console.log(err.toString())
});

child.on('close', function(){
  server.close();
  // console.log(path.dirname(config.rvmLocation));
  // getLogs();
  // logToMongo();
});


function getLogs () {
  console.log('callcalled')
  //return new Promise(function(resolve, reject){

    var rvmGrep = /(\d*)\/(\d*)\/(\d*) (\d*):(\d*):(\d*),(\d*)/,
        rvmLog = fs.readFileSync(
          path.resolve(__dirname, 'logs', 'RVM.log'), {
          encoding: 'utf8'
        }).split('\n').slice(0,1),
        dateArray = rvmGrep.exec(rvmLog.toString());

    //loggingInfo.rvmInit = (new Date(dateArray[3], dateArray[2], dateArray[1], dateArray[4], dateArray[5], dateArray[6], dateArray[7] )).toString(); 
    loggingInfo.rvmInit = Date.apply(Date, dateArray.slice(-1));// (dateArray[3], dateArray[2], dateArray[1], dateArray[4], dateArray[5], dateArray[6], dateArray[7] )).toString(); 
    console.log(rvmLog.toString(), loggingInfo.rvmInit);

    var runtimeGrep = /(\d*)\/(\d*)\/(\d*) (\d*):(\d*):(\d*)/,
        runtimeLog = fs.readFileSync(
          path.resolve(path.dirname(config.rvmLocation), 'cache', loggingInfo.runtimeVersion, 'desktop-'+ loggingInfo.runtimeVersion, 'debug.log'), {
          encoding: 'utf8'
        }).split('\n').slice(0,1),
        runtimeDateArray = runtimeGrep.exec(runtimeLog.toString());

    loggingInfo.runtimeInit = Date.apply(Date, runtimeDateArray.slice(-1));

    console.log('waka waka');
    //resolve();
  //});

  
  //console.log(loggingInfo);
}

function logToMongo () {
  MongoClient.connect(url, function(err, db) {
    //assert.equal(null, err);
    var test = db.collection('heroku_app34521734');

    test.insert(loggingInfo, function(err, res){
      console.log('yeah buddy', loggingInfo);
    });

    console.log("Connected correctly to server");

    db.close();
    process.exit();
  });
}

//setInterval(function(){}, 5000);


//C:\Users\openfin\AppData\Local\OpenFin\OpenFinRVM.exe --config="https://demoappdirectory.openf.in/desktop/config/apps/tmp/speed-tests/empty-app/3.0.2.16/app.json"

//C:\Users\openfin\AppData\Local\OpenFin\OpenFinRVM.exe --config="https://demoappdirectory.openf.in/desktop/config/apps/tmp/speed-tests/empty-app/3.0.2.16/app.json"