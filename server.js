var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    config = require('./config.js'),
    path = require('path'),
    loggingInfo = {},
    spawn = require('child_process').spawn,
    child,
    fs = require('fs'),
    MongoClient = require('mongodb').MongoClient,
    url = 'mongodb://speed:speed@ds049171.mongolab.com:49171/heroku_app34521734';


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
    getLogs();
    logToMongo();
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
  var rvmGrep = /(\d*\/\d*\/\d* \d*:\d*:\d*),(\d*)/,
      rvmLog = fs.readFileSync(
    path.resolve(path.dirname(config.rvmLocation), 'logs', 'RVM.log'), {
    encoding: 'utf8'
  }).split('\n').slice(0,1);

  loggingInfo.rvmInit = rvmGrep.exec(rvmLog.toString())[1];
  console.log(rvmLog.toString(), loggingInfo.rvmInit);

  var runtimeGrep = /(\d*\/\d*\/\d* \d*:\d*:\d*)/,
      runtimeLog = fs.readFileSync(
    path.resolve(path.dirname(config.rvmLocation), 'cache', loggingInfo.runtimeVersion, 'desktop-'+ loggingInfo.runtimeVersion, 'debug.log'), {
    encoding: 'utf8'
  }).split('\n').slice(0,1);
  loggingInfo.runtimeInit = runtimeGrep.exec(runtimeLog.toString())[1];
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