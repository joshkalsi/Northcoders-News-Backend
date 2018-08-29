process.env.NODE_ENV = 'test';

const app = require('../app');
const { expect } = require('chai');
const request = require('supertest')(app);
const mongoose = require('mongoose');
const seedDB = require('../seed/seed');
const testData = require('../seed/testData');

describe('/api', () => {

  beforeEach(() => {
    return seedDB(testData)
      .then(() => {
        console.log('Database reseeded.');
      });
  });


  after(() => {
    return mongoose.disconnect()
      .then(() => {
        console.log('Disconnected');
      });
  });


  it('GET /api', () => {
    return request
      .get('/api')
      .expect(200)
      .then(res => {
        expect(res.body.Documentation).to.equal('Documentation');
      });
  });

});
