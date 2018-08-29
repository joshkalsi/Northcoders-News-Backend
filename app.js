const express = require('express');
const mongoose = require('mongoose');
const apiRouter = require('./routes/apiRouter');
const { DB_URL } = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))

mongoose.connect(DB_URL, { useNewUrlParser: true })
  .then(() => {
    console.log(`connected to ${DB_URL}`);
  });

app.use('/api', apiRouter);


module.exports = app;