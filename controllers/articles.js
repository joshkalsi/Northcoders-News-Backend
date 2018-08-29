const { Article, Comment, User } = require('../models/index');

exports.getArticles = (req, res, next) => {
  return Article.find()
    .populate('created_by')
    .then(articles => {
      res.status(200).send({ articles });
    })
    .catch(err => next(err));
};

exports.getArticleByID = (req, res, next) => {
  return Article.findOne({ _id: req.params.article_id })
    .populate('created_by')
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => next(err));
};

exports.getCommentsforArticle = (req, res, next) => {
  return Article.findOne({ _id: req.params.article_id })
    .populate('created_by')
    .then(article => {
      return Comment.find({ belongs_to: article._id })
        .populate('belongs_to')
        .populate('created_by');
    })
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(err => next(err));
};

exports.createComment = (req, res, next) => {
  return User.findOne({ username: req.body.created_by })
    .then(user => {
      const comment = { ...req.body };
      comment.belongs_to = req.params.article_id;
      comment.created_at = Date.now();
      comment.created_by = user._id;

      return Comment.create(comment)
        .then(comment => {
          return Comment.findOne({ _id: comment._id })
            .populate('created_by')
            .populate('belongs_to');
        })
        .then(comment => {
          res.status(201).send({ comment });
        })
        .catch(err => next(err));
    });
};

exports.incrementOrDecrementVotes = (req, res, next) => {
  const incrementValue = {
    up: 1,
    down: -1,
    undefined: 0
  };
  return Article.findOneAndUpdate({ _id: req.params.article_id }, { $inc: { votes: incrementValue[req.query.vote] } }, { new: true })
    .populate('created_by')
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => next(err));
};