const { Topic, Article, User } = require('../models/index');

exports.getTopics = (req, res, next) => {
  return Topic.find()
    .then(topics => {
      res.status(200).send({ topics });
    })
    .catch(err => next(err));
};

exports.getArticlesByTopicSlug = (req, res, next) => {
  if (/[A-Z]/.test(req.params.topic_slug)) next({ status: 400, msg: 'Bad Request' });
  else {
    return Article.find({ belongs_to: req.params.topic_slug })
      .populate('created_by')
      .then(articles => {
        if (articles.length === 0) return Promise.reject({ status: 404, msg: 'Page Not Found' });
        res.status(200).send({ articles });
      })
      .catch(err => next(err));
  }
};

exports.postArticle = (req, res, next) => {
  return Topic.findOne({ slug: req.params.topic_slug })
    .then(topic => {
      if (!topic) return Promise.reject({ status: 404, msg: 'Page Not Found' });
      return User.findOne({ username: req.body.created_by });
    })
    .then(user => {
      if (!user) return Promise.reject({ status: 400, msg: 'Bad Request' });
      const article = { ...req.body };
      article.created_at = Date.now();
      article.belongs_to = req.params.topic_slug;
      article.created_by = user._id;

      return Article.create(article);
    })
    .then(article => {
      return Article.findOne({ _id: article._id })
        .populate('created_by');
    })
    .then(article => {
      const modArticle = { ...article._doc, comment_count: 0 };
      res.status(201).send({ modArticle });
    })
    .catch(err => next(err));
};
