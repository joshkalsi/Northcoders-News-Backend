const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const apiRouter = require('./routes/apiRouter');
let DB_URL = process.env.MONGODB_URI || require('./config').DB_URL;
const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());


mongoose.connect(DB_URL, { useNewUrlParser: true })
  .then(() => {
    console.log(`connected to ${DB_URL}`);
  });

app.get('/', (req, res) => {
  res.redirect('/api')
});

app.use('/api', apiRouter);

app.get('/*', (req, res) => {
  res.status(404).send('Page not found!');
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send(err);
  }
  else {
    res.status(500).send({ msg: 'Internal Servor Error', status: 500 });
    next(err);
  }
});

module.exports = app;