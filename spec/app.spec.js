process.env.NODE_ENV = 'test';

const app = require('../app');
const { expect } = require('chai');
const request = require('supertest')(app);
const mongoose = require('mongoose');
const seedDB = require('../seed/seed');
const testData = require('../seed/testData');

describe('nc_news', () => {
  let commentDocs;
  let articleDocs;
  let topicDocs;
  let userDocs;

  beforeEach(() => {
    return seedDB(testData)
      .then((docs) => {
        commentDocs = docs[0];
        articleDocs = docs[1];
        topicDocs = docs[2];
        userDocs = docs[3];
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

  describe('/api/articles', () => {
    it('GET /api/articles', () => {
      return request
        .get('/api/articles')
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('articles');
          expect(res.body.articles.length).to.equal(4);
          expect(res.body.articles[3].title).to.equal('UNCOVERED: catspiracy to bring down democracy');
          expect(res.body.articles[1].created_by.name).to.equal('mitch');
        });
    });
    it('GET /api/articles/:article_id', () => {
      return request
        .get(`/api/articles/${articleDocs[1]._id}`)
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('article');
          expect(res.body.article.title).to.equal('7 inspirational thought leaders from Manchester UK');
          expect(res.body.article.created_by.name).to.equal('mitch');
        });
    });
    it('GET /api/articles/:article_id/comments', () => {
      return request
        .get(`/api/articles/${articleDocs[3]._id}/comments`)
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('comments');
          expect(res.body.comments.length).to.equal(2);
          expect(res.body.comments[0].body).to.equal('What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.');
          expect(res.body.comments[1].belongs_to.title).to.equal('UNCOVERED: catspiracy to bring down democracy');
          expect(res.body.comments[1].created_by.name).to.equal('jonny');
        });
    });
    it('POST /api/articles/:article_id/comments', () => {
      return request
        .post(`/api/articles/${articleDocs[2]._id}/comments`)
        .send({ body: 'first!!!11!1', created_by: 'dedekind561' })
        .expect(201)
        .then(res => {
          expect(res.body).to.have.all.keys('comment');
          expect(res.body.comment.body).to.equal('first!!!11!1');
          expect(res.body.comment.created_by.username).to.equal('dedekind561');
          expect(res.body.comment.belongs_to.title).to.equal('They\'re not exactly dogs, are they?');
        });
    });
    it('PATCH /api/articles/:article_id - increment vote', () => {
      return request
        .patch(`/api/articles/${articleDocs[0]._id}?vote=up`)
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('article');
          expect(res.body.article.title).to.equal('Living in the shadow of a great man');
          expect(res.body.article.votes).to.equal(1);
        });
    });
    it('PATCH /api/articles/:article_id - decrement vote', () => {
      return request
        .patch(`/api/articles/${articleDocs[0]._id}?vote=down`)
        .expect(200)
        .then(res => {
          expect(res.body).to.have.all.keys('article');
          expect(res.body.article.title).to.equal('Living in the shadow of a great man');
          expect(res.body.article.votes).to.equal(-1);
        });
    });
  });
});
