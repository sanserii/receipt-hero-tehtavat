const https = require('https');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const QUEUE_URL = 'https://sqs.eu-west-1.amazonaws.com/598931837424/sqs-get-que';
let paramsJson = "";
AWS.config.update({ region: "eu-west-1" });


/* Nodejs lambda ohjelma, jossa haetaan sivuston data 
 * JSON tiedostosta, ja proseissoidaan se eteenpäin lähetettäväksi 
 * Jussa Huttunen
 * jussa.m.huttunen@gmail.com
 * 0401411449
 */

exports.handler = function (event, context, callback) {
    // Funktio, jossa prosessoidaan noudettu JSON
    function getJSON(url) {
        return new Promise(function (resolve, reject) {
            https.get(url, res => {
                res.on('error', err => console.log(err));
                let json = '';
                res.on('data', chunk => json += chunk);
                res.on('end', () => {
                    if (json == "") return resolve(null);
                    paramsJson = JSON.parse(json).filter(({ completed }) => completed === false);
                    resolve(paramsJson);
                    //resolve(JSON.parse(json).filter(({ userId }) => userId === event.queryStringParameters.userId)); //Mahdollinen ratkaisu userID hakuun
                });
            });
        });
    }

    // Funktio josta suodatettu data lähetetään eteenpäin SQS jonolle
    function todos() {
        let params = {
            MessageBody: JSON.stringify(paramsJson),
            QueueUrl: QUEUE_URL
        };
        // Otetaan URL ja lähetetään se eteenpäin getJSON funktiolle
        getJSON(`https://jsonplaceholder.typicode.com/todos`)
            //.then((data) => callback(null, data))    // Testaamiseen
            .then((data) => data)
            .catch((error) => console.error(error, "48"));
            sqs.sendMessage(params, function(err, data) {
                if(err) {
                    console.log("Error1", err);
                    context.done('error1', "ERROR Put SQS");  // ERROR viestillä
                } else {
                    console.log("Success", data);
                    context.done(null, '');  // SUCCESS
                }
            })
    }
    todos();
};