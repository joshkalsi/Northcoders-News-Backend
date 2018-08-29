const topicsRouter = require('express').Router();
const { getTopics, getArticlesByTopicSlug, postArticle } = require('../controllers/topics');

topicsRouter.route('/')
  .get(getTopics);

topicsRouter.route('/:topic_slug/articles')
  .get(getArticlesByTopicSlug)
  .post(postArticle);

module.exports = topicsRouter;