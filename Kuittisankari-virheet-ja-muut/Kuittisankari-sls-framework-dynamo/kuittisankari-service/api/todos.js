'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Mietintöjen postaamiseen käytettävä funktio
module.exports.submit = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const userId = requestBody.userId;
  const title = requestBody.title;
  const completed = requestBody.completed;

  if (typeof userId !== 'number' || typeof title !== 'string' || typeof completed !== 'boolean') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit because of validation errors.'));
    return;
  };

  submitTodosP(todosInfo(userId, title, completed))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted todo with userId ${userId}`,
          todosId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit todo with userId ${userId}`
        })
      })
    });
};

const submitTodosP = todos => {
  console.log('Submitting todos');
  const todosInfo = {
    TableName: process.env.TODOS_TABLE,
    Item: todos,
  };
  return dynamoDb.put(todosInfo).promise()
    .then(res => todos);
};

const todosInfo = (userId, title, completed) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    userId: userId,
    title: title,
    completed: completed,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

 /*const response = {
   statusCode: 200,
   body: JSON.stringify({
     message: 'Go Serverless v1.0! Your function executed successfully!',
     input: event,
    }),
  };


callback(null, response);
};*/

//Kaikkien mietintöjen listaamiseen käytettävä funktio
module.exports.list = (event, context, callback) => {
  var params = {
      TableName: process.env.TODOS_TABLE,
      ProjectionExpression: "userId, id, title, completed"
  };

  console.log("Scanning Todos table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              body: JSON.stringify({
                  todos: data.Items
              })
          });
      }

  };

  dynamoDb.scan(params, onScan);

};

// Mietintöjen filtteröintiin userId perusteella käytettävä funktio
module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      userId: event.pathParameters.userId,
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch a todo.'));
      return;
    });
};