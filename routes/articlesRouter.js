const articlesRouter = require('express').Router();
const { getArticles, getArticleByID, getCommentsforArticle, createComment, incrementOrDecrementVotes } = require('../controllers/articles');

articlesRouter.route('/')
  .get(getArticles);

articlesRouter.route('/:article_id')
  .get(getArticleByID)
  .patch(incrementOrDecrementVotes);

articlesRouter.route('/:article_id/comments')
  .get(getCommentsforArticle)
  .post(createComment);

module.exports = articlesRouter;