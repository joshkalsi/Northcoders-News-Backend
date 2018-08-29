process.env.NODE_ENV = 'test';

const app = require('../app');
const { expect } = require('chai');
const request = require('supertest')(app);
const mongoose = require('mongoose');
const seedDB = require('../seed/seed');
const testData = require('../seed/testData');

describe('nc_news', () => {

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

  describe('/api', () => {
    it('GET /api', () => {
      return request
        .get('/api')
        .expect(200);
    });
  });

  describe('/api/topics', () => {
    it('GET /api/topics', () => {
      return request
        .get('/api/topics')
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('topics');
          expect(res.body.topics.length).to.equal(2);
          expect(res.body.topics[0].slug).to.equal('mitch');
        });
    });
    it('GET /api/:topic_slug/articles - :topic_slug = "mitch"', () => {
      return request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('articles');
          expect(res.body.articles.length).to.equal(2);
          expect(res.body.articles[0].belongs_to).to.equal('mitch');
        });
    });
    it('GET /api/:topic_slug/articles - :topic_slug = "cats"', () => {
      return request
        .get('/api/topics/cats/articles')
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('articles');
          expect(res.body.articles.length).to.equal(2);
          expect(res.body.articles[1].belongs_to).to.equal('cats');
        });
    });
    it('POST /api/:topic_slug/articles', () => {
      return request
        .post('/api/topics/cats/articles')
        .send({ title: 'Best Cats', body: 'These are the best cats', created_by: 'butter_bridge' })
        .expect(201)
        .then(res => {
          expect(res.body).to.have.all.keys('article');
          expect(res.body.article.title).to.equal('Best Cats');
          expect(res.body.article.belongs_to).to.equal('cats');
          expect(res.body.article.created_by.username).to.equal('butter_bridge');
        });
    });

  });
});
