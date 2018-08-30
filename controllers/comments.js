const { Comment } = require('../models/index');

exports.incrementOrDecrementVotes = (req, res, next) => {
  const incrementValue = {
    up: 1,
    down: -1,
    undefined: 0
  };
  if (!/up|down/.test(req.query.vote) && req.query.vote) next({ status: 400, msg: 'Bad Request' });
  return Comment.findOneAndUpdate({ _id: req.params.comment_id }, { $inc: { votes: incrementValue[req.query.vote] } }, { new: true })
    .populate('created_by')
    .populate('belongs_to')
    .then(comment => {
      if (!comment) return Promise.reject({ status: 404, msg: 'Page Not Found' });
      res.status(200).send({ comment });
    })
    .catch(err => {
      if (err.name === 'CastError') next({ status: 400, msg: 'Bad Request' });
      else if (err.name === 'ValidationError') next({ status: 400, msg: 'Bad Request' });
      else next(err);
    });
};