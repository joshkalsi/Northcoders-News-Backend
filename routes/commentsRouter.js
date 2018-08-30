const commentsRouter = require('express').Router();
const { incrementOrDecrementVotes } = require('../controllers/comments');

commentsRouter.route('/:comment_id')
  .patch(incrementOrDecrementVotes);

module.exports = commentsRouter;