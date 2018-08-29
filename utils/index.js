exports.createRefObj = (data, docs, property) => {
  return data.reduce((refObj, datum, index) => {
    refObj[datum[property]] = docs[index]._id;
    return refObj;
  }, {});
};

exports.formatArticleData = (articleData, userRefs) => {
  return articleData.map(articleDatum => {
    const formattedArticleDatum = { ...articleDatum };
    // Rename topic to belongs_to
    Object.defineProperty(formattedArticleDatum, 'belongs_to', Object.getOwnPropertyDescriptor(formattedArticleDatum, 'topic'));
    delete formattedArticleDatum['topic'];
    // Replace usernames from created_by with Mongo ID
    formattedArticleDatum.created_by = userRefs[formattedArticleDatum.created_by];
    return formattedArticleDatum;
  });
};

exports.formatCommentData = (commentData, userRefs, articleRefs) => {
  return commentData.map(commentDatum => {
    const formattedCommentDatum = { ...commentDatum };
    // Replace usernames from created_by with Mongo ID of user
    formattedCommentDatum.created_by = userRefs[formattedCommentDatum.created_by];
    // Replace title from belongs_to with Mongo ID of article
    formattedCommentDatum.belongs_to = articleRefs[formattedCommentDatum.belongs_to];
    return formattedCommentDatum;
  });
};
