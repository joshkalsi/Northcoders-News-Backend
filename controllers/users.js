const { User } = require('../models/index');

exports.getUser = (req, res, next) => {
  if (/[A-Z]/.test(req.params.username)) next({ status: 400, msg: 'Bad Request' });
  return User.findOne({ username: req.params.username })
    .then(user => {
      if (!user) return Promise.reject({ status: 404, msg: 'Page Not Found' });
      res.status(200).send({ user });
    })
    .catch(err => {
      if (err.name === 'CastError') next({ status: 400, msg: 'Bad Request' });
      else if (err.name === 'ValidationError') next({ status: 400, msg: 'Bad Request' });
      else next(err);
    });
};