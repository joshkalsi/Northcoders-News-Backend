const usersRouter = require('express').Router();
const { getUser } = require('../controllers/users');

usersRouter.route('/:username')
  .get(getUser);

module.exports = usersRouter;