const { Article, Comment, User } = require('../models/index');

exports.getArticles = (req, res, next) => {
  return Article.find()
    .lean()
    .populate('created_by')
    .then(articles => {
      const articleComments = articles.map(article => {
        return Comment.find({ belongs_to: article._id });
      });
      return Promise.all([articles, ...articleComments]);
    })
    .then(([articles, ...comments]) => {
      articles.forEach((article, index) => {
        article.comment_count = comments[index].length;
      });
      res.send({ articles });
    })
    .catch(err => next(err));
};

exports.getArticleByID = (req, res, next) => {
  return Article.findOne({ _id: req.params.article_id })
    .lean()
    .populate('created_by')
    .then(article => {
      if (!article) return Promise.reject({ status: 404, msg: 'Page Not Found' });
      return Promise.all([Comment.find({ belongs_to: article._id }), article]);
    })
    .then(([comments, article]) => {
      article.comment_count = comments.length;
      res.status(200).send({ article });
    })
    .catch(err => {
      if (err.name === 'CastError') next({ status: 400, msg: 'Bad Request' });
      else next(err);
    });
};

exports.getCommentsforArticle = (req, res, next) => {
  return Article.findOne({ _id: req.params.article_id })
    .populate('created_by')
    .then(article => {
      if (!article) return Promise.reject({ status: 404, msg: 'Page Not Found' });
      return Comment.find({ belongs_to: article._id })
        .populate('belongs_to')
        .populate('created_by');
    })
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(err => {
      if (err.name === 'CastError') next({ status: 400, msg: 'Bad Request' });
      else next(err);
    });
};

exports.createComment = (req, res, next) => {
  return Article.findById(req.params.article_id)
    .then(article => {
      if (!article) return Promise.reject({ status: 404, msg: 'Page Not Found' });
      return User.findOne({ username: req.body.created_by });
    })
    .then(user => {
      if (!user) return Promise.reject({ status: 400, msg: 'Bad Request' });
      const comment = { ...req.body };
      comment.belongs_to = req.params.article_id;
      comment.created_at = Date.now();
      comment.created_by = user._id;
      return Comment.create(comment);
    })
    .then(comment => {
      return Comment.findOne({ _id: comment._id })
        .populate('created_by')
        .populate('belongs_to');
    })
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(err => {
      if (err.name === 'CastError') next({ status: 400, msg: 'Bad Request' });
      else if (err.name === 'ValidationError') next({ status: 400, msg: 'Bad Request' });
      else next(err);
    });

};

exports.incrementOrDecrementVotes = (req, res, next) => {
  const incrementValue = {
    up: 1,
    down: -1,
    undefined: 0
  };
  if (!/up|down/.test(req.query.vote) && req.query.vote) next({ status: 400, msg: 'Bad Request' });
  return Article.findOneAndUpdate({ _id: req.params.article_id }, { $inc: { votes: incrementValue[req.query.vote] } }, { new: true })
    .populate('created_by')
    .then(article => {
      if (!article) return Promise.reject({ status: 404, msg: 'Page Not Found' });
      res.status(200).send({ article });
    })
    .catch(err => {
      if (err.name === 'CastError') next({ status: 400, msg: 'Bad Request' });
      else if (err.name === 'ValidationError') next({ status: 400, msg: 'Bad Request' });
      else next(err);
    });
};