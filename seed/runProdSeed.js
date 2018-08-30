process.env.NODE_ENV = 'production';

const mongoose = require('mongoose');
const seedDB = require('./seed');
let { DB_URL } = require('../config');

let data = require('./devData');

mongoose.connect(DB_URL, { useNewUrlParser: true })
  .then(() => {
    console.log(`Connected to DB ${DB_URL}`);
    return mongoose.connection.dropDatabase();
  })
  .then(() => {
    console.log('Database dropped.');
    return seedDB(data);
  })
  .then(() => {
    console.log('Data seeded. Disconnecting.');
    return mongoose.disconnect();
  });

