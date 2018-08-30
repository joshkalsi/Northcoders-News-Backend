const express = require('express');
const mongoose = require('mongoose');
const apiRouter = require('./routes/apiRouter');
let { DB_URL } = require('./config');
if (process.env.NODE_ENV === 'production') DB_URL = process.env.MONGODB_URI;

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

mongoose.connect(DB_URL, { useNewUrlParser: true })
  .then(() => {
    console.log(`connected to ${DB_URL}`);
  });

app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send(err);
  }
  else res.status(500).send({ msg: 'Internal Servor Error', status: 500 });
});

module.exports = app;