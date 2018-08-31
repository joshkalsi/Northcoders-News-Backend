# Northcoders News API

An Express server API that serves up data from the Northcoders News database. The database is built in MongoDB, and contains articles, comments on the articles, a list of users, and article topics.

## [Click here to see a running version of this program.](https://northcoders-news-jk.herokuapp.com/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

This project requires Express, Mongoose and Node for production, Nodemon for development, and Mocha, Chai and Supertest for testing. When first opening the project, simply run

```
npm install
```
to add them all.

### Installing

You will need to create a config file for your Mongo Database URIs before you can start the server. This will contain an object that will contain keys for test, dev and production, and the required URIs and port numbers for each.

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
  },
  production: {
    DB_URL: <Mongo URI connection string for hosted database>
  }
};

module.exports = config[ENV];
```
This is preset to create a test database called northcoders_news_TEST and a dev database called northcoders_news and sets the listening port to 9090.
You will need to add in your own URI for a hosted Mongo database (through a service like mLab, for example).

## Use
To start the server, use either the command 
```
npm run dev // starts server with nodemon - use this if you will be making changes to the server
```
or 
```
npm start // starts server normally with node - mainly for production use
```
There are two seed functions - one for dev, and one for production.
```
npm run seed:dev // This will reseed the development database
npm run seed:prod // USE CAREFULLY - THIS WILL RESEED THE HOSTED DATABASE
```

### Endpoints

The endpoints for this API are as follows:
GET:
* **/api**: Default HTML homepage
* **/api/topics**: Returns all topics
* **/api/topics/:topic_slug/articles**: Returns all articles for a certain topic
 *e.g. /api/topics/football/articles*
* **/api/articles**: Returns all articles

## Testing

To run tests, use the command
```
npm test
```
which will start the full test process. Each test will reseed the test database fully to ensure consistency in results.

### Break down into end to end tests

Each test will check the functionality of an endpoint of the API. When testing a valid request, it will check the response code is correct, and that the data returned contains data matching what was originally seeded.

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
It will also check that any errors are correctly handled and a proper response is sent - for example, an invalid request will return a 400 code and an appropriate message.

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

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Express](https://expressjs.com/) - The web framework used
* [MongoDB](https://www.mongodb.com/) - Database system
* [Mongoose](https://mongoosejs.com/) - MongoDB interface for Node.JS

## Authors

* **Josh Kalsi** - *Initial work* - [joshkalsi](https://github.com/joshkalsi)

## Acknowledgments

* Mitch, the angel who walks among us
* All the other tutors (not quite as angelic but still fantastic!)
