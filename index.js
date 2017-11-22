const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const ip = require('ip')
const ADDRESS = ip.address()
const PORT = 9090
const CONFIG = require('./config')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.use('/public/css', express.static(__dirname + '/public/css'));
app.use('/public/js', express.static(__dirname + '/public/js'));
app.set('view engine', 'pug');


// MKR1000 stuffs
let httpServer = require('http').Server(app)
let io = require('socket.io')(httpServer)
let net = require('net')
let five = require('johnny-five')
let firmata = require('firmata')

// set options to match Firmata config for wifi
// using MKR1000 with WiFi101
const options = {
  host: CONFIG.MKR1000_IP,
  port: CONFIG.MKR1000_PORT
}

// connection to MKR1000 starts here
net.connect(options, function() {
  console.log('Socket to MKR1000 opened')

  let socketClient = this

  // use the socketClient instead of a serial port for transport
  let boardIo = new firmata.Board(socketClient)

  boardIo.once('ready', function(){
    console.log('boardIo ready')

    boardIo.isReady = true

    let board = new five.Board({io: boardIo, repl: true})

    board.on('ready', function() {
      // full Johnny-Five support here
      console.log('Johnny-five ready to rock')

      // setup led on pin 6 --> led pin for MKR1000
      led = new five.Led(6)

      led.blink(2000)

      // setup temperature sensor LM35
      let caseTemp = new five.Thermometer({
        controller: 'LM35',
        pin: 'A1',
        freq: 250
      })

      // setup temperature sensor LM35
      let gpuTemp = new five.Thermometer({
        controller: 'LM35',
        pin: 'A2',
        freq: 250
      })

      // setup temperature sensor LM35
      let gpuTemp2 = new five.Thermometer({
        controller: 'LM35',
        pin: 'A3',
        freq: 250
      })

      // power supply relay
      let psuRelay = new five.Relay(5);

      io.on('connection', function (socket) {
        console.log(socket.id)

        // emit usersCount on new connection
        emitUsersCount(io)

        // emit usersCount when connection is closed
        socket.on('disconnect', function () {
          emitUsersCount(io)
        })
      })

      // emit chart data on each interval
      setInterval(function () {
        emitChartData(io, caseTemp, gpuTemp, gpuTemp2, psuRelay)
      }, 1000)

    })
  })

}).on('error', function (err) {
  console.log(err)
  console.log('Unable to connect!')
  console.log('Please make sure you have the latest StandardFirmataWifi sketch loaded on the MKR1000')
})

// emit usersCount to all sockets
function emitUsersCount(io) {
  io.sockets.emit('usersCount', {
    totalUsers: io.engine.clientsCount
  })
}

// emit chart data to all sockets
function emitChartData(io, caseTemp, gpuTemp, gpuTemp2, psuRelay) {
  console.log('---------')
  console.log(getTemp(caseTemp))
  console.log(getTemp(gpuTemp))
  console.log(getTemp(gpuTemp2))
  console.log(psuRelay.value)

  io.sockets.emit('chart:data', {
    date: new Date().getTime(),
    value: [getTemp(caseTemp), getTemp(gpuTemp), getTemp(gpuTemp2)]
  })
}

// get temperature measurement
function getTemp(tempSensor) {
  return Math.round(tempSensor.fahrenheit - 25)
}

// pulse led
function pulseLed(led, duration, cb) {
  led.blink()
  setTimeout(function () {
    led.stop().off()
    cb()
  }, duration)
}


// Routes
app.get('/', (req, res, next) => res.render('index'))

app.get('/temperature/case', (req, res, next) => {
  console.log('User requested temp for case.');

  let result = {
    name: 'Case',
    temperature: Math.round(Math.random() * 100)
  }

  res.json(result)
})

app.get('/temperature/gpus', (req, res, next) => {
  console.log('User requested temp for GPUs.')

  let results = [{
    name: 'GPU 1',
    temperature: Math.round(Math.random() * 100)
  }, {
    name: 'GPU 2',
    temperature: Math.round(Math.random() * 100)
  }]

  res.json(results)
})

app.post('/reset', (req, res, next) => {
  console.log(req.body);
  res.sendStatus(200)
})

app.use((req, res, next) => {
  console.log(`${req.url} --> 404`)
  res.sendStatus(404)
})

httpServer.listen(PORT, () => console.log(`Up and running at ${ADDRESS}:${PORT}`))