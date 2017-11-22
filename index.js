const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const ip = require('ip')
const ADDRESS = ip.address()
const PORT = 9090

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.use('/public/css', express.static(__dirname + '/public/css'));
app.use('/public/js', express.static(__dirname + '/public/js'));
app.set('view engine', 'pug');

app.get('/', (req, res, next) => res.render('index'))

app.get('/temperature/case', (req, res, next) => {
  console.log('User requested temp for case.');

  let result = {
    temperature: Math.round(Math.random() * 100)
  }

  res.json(result)
})

app.get('/temperature/gpus', (req, res, next) => {
  console.log('User requested temp for GPUs.')

  let result = {
    temperature: Math.round(Math.random() * 100)
  }

  res.json(result)
})

app.post('/reset', (req, res, next) => {
  console.log(req.body);
  res.sendStatus(200)
})

app.use((req, res, next) => {
  console.log(`${req.url} --> 404`)
  res.sendStatus(404)
})

app.listen(PORT, () => console.log(`Up and running at ${ADDRESS}:${PORT}`))