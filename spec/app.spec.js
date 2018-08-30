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
  // let topicDocs;
  let userDocs;

  beforeEach(() => {
    return seedDB(testData)
      .then((docs) => {
        commentDocs = docs[0];
        articleDocs = docs[1];
        // topicDocs = docs[2];
        userDocs = docs[3];
      });
  });

  after(() => {
    return mongoose.disconnect()
      .then(() => {
        console.log('Disconnected');
      });
  });
  // =============================================================
  // ============================TESTS============================
  // =============================================================

  // ----------------------------api----------------------------

  describe('/api', () => {
    describe('GET /api', () => {
      it('GET returns a 200 and a html page', () => {
        return request
          .get('/api')
          .expect(200);
      });
    });
  });

  // ----------------------------topics----------------------------

  describe('/api/topics', () => {
    describe('GET /api/topics', () => {
      it('GET returns 200 status and all topic objects', () => {
        return request
          .get('/api/topics')
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('topics');
            expect(res.body.topics.length).to.equal(2);
            expect(res.body.topics[0].slug).to.equal('mitch');
          });
      });
    });

    describe('GET /api/:topic_slug/articles', () => {
      it('GET returns 200 status and articles from a valid topic slug', () => {
        return request
          .get('/api/topics/mitch/articles')
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('articles');
            expect(res.body.articles.length).to.equal(2);
            expect(res.body.articles[0].belongs_to).to.equal('mitch');
          });
      });
      it('GET returns 400 error for invalid topic slug', () => {
        return request
          .get('/api/topics/INVALID/articles') // Uppercase not allowed
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('GET returns 404 error for valid topic slug with no articles', () => {
        return request
          .get('/api/topics/test/articles') // no test slug
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
    });

    describe('POST /api/:topic_slug/articles', () => {
      it('POST adds a new article and returns the added article with a 201 code', () => {
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
      it('POST returns a 404 code when trying to add to a nonexistent topic', () => {
        return request
          .post('/api/topics/test/articles')
          .send({ title: 'Test', body: 'test', created_by: 'butter_bridge' })
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
      it('POST returns a 400 code when trying to add with a nonexistant username in the body', () => {
        return request
          .post('/api/topics/mitch/articles')
          .send({ title: 'Test', body: 'test', created_by: 'test_name' })
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
    });
  });

  //  ----------------------------articles----------------------------

  describe('/api/articles', () => {
    describe('GET /api/articles', () => {
      it('GET returns all articles and 200 code', () => {
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
    });

    describe('GET /api/articles/:article_id', () => {
      it('GET returns article with valid id and 200 code', () => {
        return request
          .get(`/api/articles/${articleDocs[1]._id}`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('article');
            expect(res.body.article.title).to.equal('7 inspirational thought leaders from Manchester UK');
            expect(res.body.article.created_by.name).to.equal('mitch');
          });
      });
      it('GET returns 400 error for invalid article_id', () => {
        return request
          .get('/api/articles/test-id')
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('GET returns 404 error when no articles have passed (valid) id', () => {
        return request
          .get('/api/articles/507f191e810c19729de860ea')
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
    });

    describe('GET /api/articles/:article_id/comments', () => {
      it('GET returns all comments and 200 code with valid article_id', () => {
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
      it('GET returns 400 code with invalid article_id', () => {
        return request
          .get('/api/articles/test-id/comments')
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('GET returns 404 code when no articles have (valid) article_id', () => {
        return request
          .get('/api/articles/507f191e810c19729de860ea/comments')
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
    });

    describe('POST /api/articles/:article_id/comments', () => {
      it('POST adds a comment and returns it with a 201 code', () => {
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
      it('POST returns 400 when article_id is invalid', () => {
        return request
          .post(`/api/articles/test_id/comments`)
          .send({ body: 'first!!!11!1', created_by: 'dedekind561' })
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('POST returns 404 code when no articles have (valid) article_id', () => {
        return request
          .post(`/api/articles/507f191e810c19729de860ea/comments`)
          .send({ body: 'first!!!11!1', created_by: 'dedekind561' })
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
      it('POST returns 400 code when req.body.username does not exist in collection', () => {
        return request
          .post(`/api/articles/${articleDocs[0]._id}/comments`)
          .send({ body: 'first!!!11!1', created_by: 'test_user' })
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
    });

    describe('PATCH /api/articles/:article_id', () => {
      it('PATCH with a valid article_id and query will increment votes and return 200 code', () => {
        return request
          .patch(`/api/articles/${articleDocs[0]._id}?vote=up`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('article');
            expect(res.body.article.title).to.equal('Living in the shadow of a great man');
            expect(res.body.article.votes).to.equal(1);
          });
      });
      it('PATCH with a valid article_id and query will decrement votes and return 200 code', () => {
        return request
          .patch(`/api/articles/${articleDocs[0]._id}?vote=down`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('article');
            expect(res.body.article.title).to.equal('Living in the shadow of a great man');
            expect(res.body.article.votes).to.equal(-1);
          });
      });
      it('PATCH with a valid article_id but no query will not affect votes', () => {
        return request
          .patch(`/api/articles/${articleDocs[0]._id}`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('article');
            expect(res.body.article.title).to.equal('Living in the shadow of a great man');
            expect(res.body.article.votes).to.equal(0);
          });
      });
      it('PATCH with invalid article_id will return 400', () => {
        return request
          .patch(`/api/articles/test_id`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('PATCH with valid but non-present article_id will return 404', () => {
        return request
          .patch(`/api/articles/507f191e810c19729de860ea`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
      it('PATCH with valid but non-present article_id will return 404', () => {
        return request
          .patch(`/api/articles/507f191e810c19729de860ea`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
      it('PATCH with invalid query returns 400', () => {
        return request
          .patch(`/api/articles/${articleDocs[0]._id}?vote=3`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
    });
  });

  // ----------------------------comments----------------------------

  describe('/api/comments', () => {
    describe('PATCH /api/comments/:comment_id', () => {
      it('PATCH with a valid comment_id and query will increment votes and return 200 code', () => {
        return request
          .patch(`/api/comments/${commentDocs[0]._id}?vote=up`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('comment');
            expect(res.body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(res.body.comment.votes).to.equal(8);
          });
      });
      it('PATCH with a valid comment_id and query will decrement votes and return 200 code', () => {
        return request
          .patch(`/api/comments/${commentDocs[0]._id}?vote=down`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('comment');
            expect(res.body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(res.body.comment.votes).to.equal(6);
          });
      });
      it('PATCH with a valid comment_id but no query will not affect votes', () => {
        return request
          .patch(`/api/comments/${commentDocs[0]._id}`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('comment');
            expect(res.body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(res.body.comment.votes).to.equal(7);
          });
      });
      it('PATCH with invalid comment_id will return 400', () => {
        return request
          .patch(`/api/comments/test_id`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('PATCH with valid but non-present comment_id will return 404', () => {
        return request
          .patch(`/api/comments/507f191e810c19729de860ea`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
      it('PATCH with invalid query returns 400', () => {
        return request
          .patch(`/api/comments/${commentDocs[0]._id}?vote=3`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
    });

    describe('DELETE /api/comments/:comments_id', () => {
      it('DELETE removes comment with given ID and returns deleted comment with 200', () => {
        return request
          .delete(`/api/comments/${commentDocs[0]._id}`)
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('comment');
            expect(res.body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(res.body.comment.votes).to.equal(7);
          });
      });
      it('DELETE with invalid comment_id will return 400', () => {
        return request
          .delete(`/api/comments/test_id`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('DELETE with valid but non-present comment_id will return 404', () => {
        return request
          .delete(`/api/comments/507f191e810c19729de860ea`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
    });
  });

  // ----------------------------users----------------------------

  describe('/api/users', () => {
    describe('GET /api/users/:username', () => {
      it('GET returns user object and 200 code', () => {
        return request
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(res => {
            expect(res.body).to.have.all.keys('user');
            expect(res.body.user.username).to.equal('butter_bridge');
            expect(res.body.user._id).to.equal(`${userDocs[0]._id}`);
          });
      });
      it('GET with invalid username will return 400', () => {
        return request
          .get(`/api/users/USER`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });
      it('GET with valid but non-present username will return 404', () => {
        return request
          .get(`/api/users/testuser`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal('Page Not Found');
          });
      });
    });
  });
});