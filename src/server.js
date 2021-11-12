// server.js
const express = require('express');
const readline = require('readline');
const fs = require('fs');

// Define Express App
const app = express();
app.use(express.static('./public'));

const PORT = process.env.PORT || 4040;

app.listen(PORT, () => {
    console.log('Server connected at:', PORT);
});

const data = [];

// async function processLineByLine(callback) {
//     const fileStream = fs.createReadStream('chessDataFiles/ratedClassicalGame.csv');

//     const rl = readline.createInterface({
//         input: fileStream,
//         crlfDelay: Infinity
//     });
//     // Note: we use the crlfDelay option to recognize all instances of CR LF
//     // ('\r\n') in input.txt as a single line break.

//     for await (const line of rl) {
//         // Each line in input.txt will be successively available here as `line`.
//         data.push(line);
//     }
//     callback(data);
// }

//processLineByLine(parseCSV);
// createOpeningsJSONFile(checkForCompletion);

// function parseCSV(dataArray) {
//     let headerArray = dataArray[0].split(',');
//     const breaks = [];
//     for (let i = 0; i < 620000; i += 20000) {
//         breaks.push(i);
//     }
//     for (let k = 0; k < breaks.length - 1; k++) {
//         const jsonData = [];
//         for (let i = breaks[k]; i < breaks[k + 1]; i++) {
//             let jsonObject = {};
//             const lineArray = dataArray[i].split(',');
//             for (let j = 0; j < headerArray.length; j++) {
//                 jsonObject[headerArray[j]] = lineArray[j];
//             }

//             if (jsonObject.Termination !== 'Abandoned' && jsonObject.Termination !== 'Rules infraction' && jsonObject.Termination !== 'Time forfeit') jsonData.push(jsonObject);
//             if (i % 50000 === 0) console.log(i);
//         }
//         fs.writeFile('chessDataFiles/ratedClassicalGame_' + k + '.json', JSON.stringify(jsonData), (error, result) => {
//             if (error) console.log(error);
//         });
//     }
// }

// function cleanOpeningsInJsonFiles(callback) {
//     for (let i = 0; i < 30; i++) {

//         const filename = `chessDataFiles/ratedCLassicalGame_${i}.json`;
//         fs.readFile(filename, 'utf8', (error, data) => {
//             if (error) {
//                 console.log(error);
//                 return;
//             }
//             const list = JSON.parse(data);
//             Object.values(list).forEach(object => {
//                 if  (object.Opening) {
//                     object.Opening = object.Opening.replace("\\", "");
//                     object.Opening = object.Opening.replace("\"", "");
//                 }
//             });
//             callback(filename, list);
//         });
//     }
// }

// cleanOpeningsInJsonFiles(writeFile);

// const openings = [];
// function createOpeningsJSONFile(callback) {

//     for (let i = 0; i < 15; i++) {
//         fs.readFile('chessDataFiles/ratedClassicalGame_' + i + '.json','utf8', (error, data) => {
//             if (error) {
//                 console.log(error);
//                 return;
//             }
//             const gameData = JSON.parse(data);
//             Object.values(gameData).forEach(game => {
//                 if (!openings.includes(game.Opening)) {
//                     openings.push(game.Opening);
//                 }
//             });
//             callback();
//         });

//     }
// }

// let count = 0;
// function checkForCompletion () {
//     count++;
//     if (count === 15) {
//         writeFile('chessDataFiles/openingsList.json', openings);
//     } else console.log('not done yet: ' + count);
// } 
// cleanOpeningsList(writeFile);
// function cleanOpeningsList(callback) {
//     fs.readFile('chessDataFiles/openingsList.json', 'utf8', (error, data) => {
//         if (error) {
//             console.log(error);
//             return;
//         }
//         const list = JSON.parse(data);
//         for (let i = 0; i < list.length; i++) {
//             list[i] = list[i].replace("\\", "");
//             list[i] = list[i].replace("\"", "");
//         }
//         callback('chessDataFiles/openingsList.json', list);
//     });
// }

function writeFile(filename, object) {
    fs.writeFile(filename, JSON.stringify(object), (error, result) => {
        if (error) console.log(error);
    });
}