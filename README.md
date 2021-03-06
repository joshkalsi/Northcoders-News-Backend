# Northcoders News API

An Express server API that serves up data from the Northcoders News database. The database is built in MongoDB, and contains articles, comments on the articles, a list of users, and article topics.

## [Click here to see a running version of this program.](https://ncnews-joshkalsi-backend.herokuapp.com/)

### Prerequisites

This project requires NodeJS, NPM (Node Project Manager) and MongoDB. For instructions on how to install these, use the following links:

* Node and NPM: [Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows) | [Mac](http://blog.teamtreehouse.com/install-node-js-npm-mac) | [Linux](http://blog.teamtreehouse.com/install-node-js-npm-linux)
* [MongoDB](https://docs.mongodb.com/manual/installation/)

### Setup and Dependencies

This project is built using Express as a web framework, Mongoose to interact with our Mongo database, and Nodemon for when changes are being made in development. It also uses Mocha, Chai and Supertest for testing. When first opening the project, simply run

```
npm install
```
to install all of these.

You will also need to create a config file for your Mongo Database URIs before you can start the server. This will contain an object that will contain keys for test and dev environments, and the required URIs and port numbers for each.

* First, create a config folder, and create an index.js file inside of it.

* Inside this index.js file, insert the following object:
```
const ENV = process.env.NODE_ENV || 'dev';

const config = {
  dev: {
    DB_URL: 'mongodb://localhost:27017/northcoders_news',
    PORT: 9090
  },
  test: {
    DB_URL: 'mongodb://localhost:27017/northcoders_news_TEST'
  }
};

module.exports = config[ENV];
```
This is preset to create a test database called northcoders_news_TEST and a dev database called northcoders_news and sets the listening port to 9090.

## Use

First, run the command 
``` 
mongod 
``` 
in your terminal of choice - this will start Mongo listening for requests to the databases. You will also need to seed the dev database with initial datasets - this can be done with the command:
``` 
npm run seed:dev 
```


To start the server, use either the command 
```
npm run dev // starts server with nodemon - use this if you will be making changes to the server
```
or 
```
npm start // starts server normally with Node - mainly for production use
```

### Endpoints

The endpoints for this API are as follows:

GET:
* **/api**: Default HTML homepage
* **/api/topics**: Returns all topics
* **/api/topics/:topic_slug/articles**: Returns all articles for a certain topic. *e.g. /api/topics/football/articles*
* **/api/articles**: Returns all articles
* **/api/articles/:article_id**: Returns article with given Mongo ID. *e.g. /api/articles/507f191e810c19729de860ea*
* **/api/articles/:article_id/comments**: Returns the comments on article with given Mongo ID. *e.g. /api/articles/507f191e810c19729de860ea/comments*
* **/api/users/:username**: Returns user with given username. *e.g. /api/users/dedekind561*

POST:
* **/api/topics/:topic_slug/articles**: Creates an article for the provided topic. Needs to be sent a JSON body with properties:
```
{title: <STRING>, body: <STRING>, created_by: <username STRING>}
```
* **/api/articles/:article_id/comments**: Creates a new comment on an article with given Mongo ID. Needs to be sent a JSON body with properties:
```
{body: <STRING>, created_by: <username STRING>}
```

PATCH: 
* **/api/articles/:article_id**: Increment or decrement the votes of an article by one. This requires a vote query of 'up' or 'down'. *e.g./api/articles/507f191e810c19729de860ea?vote=up*

DELETE: 
* **/api/comments/:comment_id**: Deletes comment with given Mongo ID. *e.g /api/comments/507f191e810c19729ea860de*



## Testing

To run tests, use the command
```
npm test
```
which will start the full test process. Each test will reseed the test database fully to ensure consistency in results.

### Test Objectives

Each test will check the functionality of an endpoint of the API. When testing a valid request, it will check the response code is correct, and that the data returned contains data matching what was originally seeded:

```
it('GET returns 200 status and all topic objects', () => {
        return request
          .get('/api/topics')
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.all.keys('topics');
            expect(body.topics.length).to.equal(topicDocs.length);
            expect(body.topics[0].slug).to.equal(topicDocs[0].slug);
          });
      });
```
It will then check that any errors are correctly handled and a proper response is sent - for example, an invalid request will return a 400 code and an appropriate message:

```
it('GET returns 400 error for invalid topic slug', () => {
        return request
          .get('/api/topics/INVALID/articles') // Uppercase not allowed
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal('Bad Request');
          });
      });

```

## Built With

* [Express](https://expressjs.com/) - The web framework used
* [MongoDB](https://www.mongodb.com/) - Database system
* [Mongoose](https://mongoosejs.com/) - MongoDB interface for Node.JS

## Authors

* **Josh Kalsi** - *Initial work* - [joshkalsi](https://github.com/joshkalsi)

## Acknowledgments

* Mitch, the angel who walks among us
* All the other tutors (not quite as angelic but still fantastic!)
