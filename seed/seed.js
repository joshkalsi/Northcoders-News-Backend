const mongoose = require('mongoose');
const { Article, Comment, User, Topic } = require('../models');
const { createRefObj, formatArticleData, formatCommentData } = require('../utils');

const seedDB = ({ articleData, commentData, topicData, userData }) => {
  return mongoose.connection.dropDatabase()
    .then(() => {
      return Promise.all([
        Topic.insertMany(topicData),
        User.insertMany(userData)
      ]);
    })
    .then(([topicDocs, userDocs]) => {
      const userRefs = createRefObj(userData, userDocs, 'username');
      const formattedArticleData = formatArticleData(articleData, userRefs);
      return Promise.all([
        Article.insertMany(formattedArticleData),
        topicDocs,
        userDocs
      ]);
    })
    .then(([articleDocs, topicDocs, userDocs]) => {
      const userRefs = createRefObj(userData, userDocs, 'username');
      const articleRefs = createRefObj(articleData, articleDocs, 'title');
      const formattedCommentData = formatCommentData(commentData, userRefs, articleRefs);
      return Promise.all([
        Comment.insertMany(formattedCommentData),
        articleDocs,
        topicDocs,
        userDocs
      ]);
    });
};

module.exports = seedDB;