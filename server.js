var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    config = require('./config.js'),
    path = require('path'),
    timing = {},
    spawn = require('child_process').spawn,
    child,
    fs = require('fs'),
    moment = require('moment');

console.log(config.rvmLocation, config.appConfig);
//server.static('.');
server.listen(9000);
app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  //socket.emit('news', { hello: 'world' });
  socket.on('times', function (data) {
    
    timing.appInitial = data.ofInitialTime;
    timing.appLoaded = data.ofAfterLoaded;
    //child.kill();
    socket.emit('shutdown', 'true');
    //console.log(timing);
  });
});

timing.rvmInvoked = Date.now();

child = spawn(config.rvmLocation, [ '--config', config.appConfig]);

child.on('error', function(err){
 console.log(err.toString())
});

child.on('close', function(){
  server.close();
  console.log(path.dirname(config.rvmLocation));
  getLogs();
});

function getLogs () {
  var _rvmGrep = /\[ '(\d*\/\d*\/\d* \d*:\d*:\d*),(\d*)/,
      rvmGrep = /(\d*\/\d*\/\d* \d*:\d*:\d*),(\d*)/,
      rvmLog = fs.readFileSync(
    path.resolve(path.dirname(config.rvmLocation), 'logs', 'RVM.log'), {
    encoding: 'utf8'
  }).split('\n').slice(0,1);
  //console.log(typeof rvmLog,rvmGrep.exec(rvmLog.toString()));
  //console.log(moment.utc(rvmGrep.exec(rvmLog.toString())[1]));
  timing.rvmInit = rvmGrep.exec(rvmLog.toString())[1];


  var runtimeGrep = /\[ '\[(\d*\/\d*\/\d* \d*:\d*:\d*)/,
      runtimeLog = fs.readFileSync(
    path.resolve(path.dirname(config.rvmLocation), 'cache', config.runtimeVersion, 'desktop-'+ config.runtimeVersion, 'debug.log'), {
    encoding: 'utf8'
  }).split('\n').slice(0,1);
  console.log(runtimeGrep.exec(runtimeLog.toString()));
  console.log(timing);
}


//C:\Users\openfin\AppData\Local\OpenFin\OpenFinRVM.exe --config="https://demoappdirectory.openf.in/desktop/config/apps/tmp/speed-tests/empty-app/3.0.2.16/app.json"

//C:\Users\openfin\AppData\Local\OpenFin\OpenFinRVM.exe --config="https://demoappdirectory.openf.in/desktop/config/apps/tmp/speed-tests/empty-app/3.0.2.16/app.json"