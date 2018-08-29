const apiRouter = require('express').Router();
const { articlesRouter, commentsRouter, usersRouter, topicsRouter } = require('./index');
const { getApiDocs } = require('../controllers/api');

apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/topics', topicsRouter);

apiRouter.get('/', getApiDocs);

module.exports = apiRouter;