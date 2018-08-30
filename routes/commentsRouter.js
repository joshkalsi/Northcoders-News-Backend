const commentsRouter = require('express').Router();
const { incrementOrDecrementVotes, deleteComment } = require('../controllers/comments');

commentsRouter.route('/:comment_id')
  .patch(incrementOrDecrementVotes)
  .delete(deleteComment);

module.exports = commentsRouter;