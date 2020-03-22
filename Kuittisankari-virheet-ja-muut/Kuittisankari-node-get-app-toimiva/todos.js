/* Moduuliton tehtävienhaku */

const https = require('https');
const fs = require('fs');
const args = process.argv.slice(2);

// Proseissoidaan json
function getJSON(url) {
    return new Promise(function (resolve, reject) {
        https.get(url, res => {
        let json = '';
          res.on('error', err => console.log(err));
            res.on('data', chunk => json += chunk);
            res.on('end',() => {
                if (json == "") return resolve(null);
                resolve(JSON.parse(json).filter(({completed}) => completed === false));
            });
        });
    });
}

/* Haetaan url:ista halutun userId omaavat kohdat, tulostetaan 
 * ne ja tallennetaan results kansiossa olevaan JSON tiedostoon
 */
function todos() {
    getJSON(`https://jsonplaceholder.typicode.com/todos?userId=${args}`)
        .then((data) => fs.writeFile('./results/fetchedTodos.json', JSON.stringify(data), function(error) {
            if(error) {
                return console.error(error);
            }
            else {
                return console.log(data, "Fetched data saved to \"./results/fetchedTodos.json\"!");
            }
        }))
        .catch((error) => console.error(error));
}
todos();