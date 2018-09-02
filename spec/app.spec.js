process.env.NODE_ENV = 'test';

const app = require('../app');
const { expect } = require('chai');
const request = require('supertest')(app);
const mongoose = require('mongoose');
const seedDB = require('../seed/seed');
const testData = require('../seed/testData');
const ObjectId = mongoose.Types.ObjectId;

describe('nc_news', () => {
  let commentDocs;
  let articleDocs;
  let topicDocs;
  let userDocs;

  beforeEach(() => {
    return seedDB(testData)
      .then((docs) => {
        [commentDocs, articleDocs, topicDocs, userDocs] = docs;
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('topics');
            expect(body.topics.length).to.equal(topicDocs.length);
            expect(body.topics[0].slug).to.equal(topicDocs[0].slug);
          });
      });
    });

    describe('GET /api/:topic_slug/articles', () => {
      it('GET returns 200 status and articles from a valid topic slug', () => {
        return request
          .get('/api/topics/mitch/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.all.keys('articles');
            expect(body.articles.length).to.equal(2);
            expect(body.articles[0].belongs_to).to.equal(articleDocs[0].belongs_to);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('article');
            expect(body.article._id).to.equal(`${new ObjectId(body.article._id)}`);
            expect(body.article.comment_count).to.equal(0);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('articles');
            expect(body.articles.length).to.equal(articleDocs.length);
            expect(body.articles[3].title).to.equal(articleDocs[3].title);
            expect(body.articles[1].created_by._id).to.equal(`${userDocs[1]._id}`);
            expect(body.articles[0].comment_count).to.equal(2);
          });
      });
    });

    describe('GET /api/articles/:article_id', () => {
      it('GET returns article with valid id and 200 code', () => {
        return request
          .get(`/api/articles/${articleDocs[1]._id}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.all.keys('article');
            expect(body.article.title).to.equal(articleDocs[1].title);
            expect(body.article.created_by._id).to.equal(`${userDocs[1]._id}`);
            expect(body.article.comment_count).to.equal(2);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('comments');
            expect(body.comments.length).to.equal(2);
            const filteredComments = commentDocs.filter(comment => {
              return comment.belongs_to === articleDocs[3]._id;
            });
            expect(body.comments[0].body).to.equal(filteredComments[0].body);
            expect(body.comments[1].created_by._id).to.equal(`${filteredComments[1].created_by}`);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('comment');
            expect(body.comment.body).to.equal('first!!!11!1');
            expect(body.comment.created_by.username).to.equal('dedekind561');
            expect(body.comment._id).to.equal(`${new ObjectId(body.comment._id)}`);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('article');
            expect(body.article.title).to.equal(articleDocs[0].title);
            expect(body.article.votes).to.equal(articleDocs[0].votes + 1);
          });
      });
      it('PATCH with a valid article_id and query will decrement votes and return 200 code', () => {
        return request
          .patch(`/api/articles/${articleDocs[0]._id}?vote=down`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.all.keys('article');
            expect(body.article.title).to.equal(articleDocs[0].title);
            expect(body.article.votes).to.equal(articleDocs[0].votes - 1);
          });
      });
      it('PATCH with a valid article_id but no query will not affect votes', () => {
        return request
          .patch(`/api/articles/${articleDocs[0]._id}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.all.keys('article');
            expect(body.article.title).to.equal(articleDocs[0].title);
            expect(body.article.votes).to.equal(articleDocs[0].votes);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('comment');
            expect(body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(body.comment.votes).to.equal(commentDocs[0].votes + 1);
          });
      });
      it('PATCH with a valid comment_id and query will decrement votes and return 200 code', () => {
        return request
          .patch(`/api/comments/${commentDocs[0]._id}?vote=down`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.all.keys('comment');
            expect(body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(body.comment.votes).to.equal(commentDocs[0].votes - 1);
          });
      });
      it('PATCH with a valid comment_id but no query will not affect votes', () => {
        return request
          .patch(`/api/comments/${commentDocs[0]._id}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.all.keys('comment');
            expect(body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(body.comment.votes).to.equal(commentDocs[0].votes);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('comment');
            expect(body.comment.belongs_to._id).to.equal(`${articleDocs[0]._id}`);
            expect(body.comment.votes).to.equal(commentDocs[0].votes);
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
          .then(({ body }) => {
            expect(body).to.have.all.keys('user');
            expect(body.user.username).to.equal(userDocs[0].username);
            expect(body.user._id).to.equal(`${userDocs[0]._id}`);
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