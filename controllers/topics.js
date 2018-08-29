const { Topic, Article, User } = require('../models/index');

exports.getTopics = (req, res, next) => {
  return Topic.find()
    .then(topics => {
      res.status(200).send({ topics });
    })
    .catch(err => next(err));
};

exports.getArticlesByTopicSlug = (req, res, next) => {
  return Article.find({ belongs_to: req.params.topic_slug })
    .populate('created_by')
    .then(articles => {
      res.status(200).send({ articles });
    })
    .catch(err => next(err));
};

exports.postArticle = (req, res, next) => {
  User.find({ username: req.body.created_by })
    .then(user => {
      const article = { ...req.body };
      article.created_at = Date.now();
      article.belongs_to = req.params.topic_slug;
      article.created_by = user[0]._id;

      return Article.create(article)
        .then(article => {
          return Article.find({ _id: article._id })
            .populate('created_by');
        })
        .then(article => {
          res.status(201).send({ article: article[0] });
        });
    })
    .catch(err => next(err));
};
