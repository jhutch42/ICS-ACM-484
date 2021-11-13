// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const readline = require('readline');
const fs = require('fs');

app.use(cors());
app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(express.json())
app.use(express.static('./public'));

const PORT = process.env.PORT || 4040;

app.listen(PORT, () => {
    console.log('Server connected at:', PORT);
});

app.post('/', function (req, res) {
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });
    const data = postHandler(req.body);
    res.end(JSON.stringify(data));
});

const openingsList = [];
const classicalGames = [];


function postHandler(postMessage) {
    switch (postMessage.request) {
        case 'Get All Game Data':
            return classicalGames;
        case 'Get All Openings':
            return openingsList;
    }
}

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

// processLineByLine(parseCSV);
// createOpeningsJSONFile(checkForCompletion);

// const headerArray = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result', 'UTCDate', 'UTCTime',
//     'WhiteElo', 'BlackElo', 'ECO', 'Opening', 'TimeControl', 'Termination', 'GameMoves', 'WhiteRatingDiff',
//     'BlackRatingDiff', 'BlackTitle', 'WhiteTitle'];
// function parseCSV(dataArray) {
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

//             jsonData.push(jsonObject);
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

// cleanResultInJsonFiles(writeFile);
// function cleanResultInJsonFiles(callback) {
//     for (let i = 0; i < 30; i++) {

//         const filename = `chessDataFiles/ratedCLassicalGame_${i}.json`;
//         fs.readFile(filename, 'utf8', (error, data) => {
//             if (error) {
//                 console.log(error);
//                 return;
//             }
//             const list = JSON.parse(data);
//             Object.values(list).forEach(object => {
//                 if  (object.Result) {
//                     object.Result = object.Result.replace("Jan-00", "1-0");
//                 }
//             });
//             callback(filename, list);
//             count++;
//             console.log(count);
//         });
//     }
// }

// const openings = [];


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

// function writeFile(filename, object) {
//     fs.writeFile(filename, JSON.stringify(object), (error, result) => {
//         if (error) console.log(error);
//     });
// }
let count = 0;
function loadAllData(n) {
    for (let i = 0; i < n; i++) {
        const filename = `chessDataFiles/ratedClassicalGame_${i}.json`;
        fs.readFile(filename, 'utf8', (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            const list = JSON.parse(data);
            Object.values(list).forEach(object => {
                classicalGames.push(object);
            });
            count++;
            if (count === n) {
                console.log('All Game Data Loaded. ' + classicalGames.length + ' games.');
                console.log('Cleaning Data');
                classicalGames.forEach(game => {
                    game.Opening = game.Opening.replace("\\", "");
                    game.Opening = game.Opening.replace("\"", "");
                    game.GameMoves = parseGameMoves(game.GameMoves);
                    game.Result = game.Result.replace('Jan-00', '1-0');
                });
                console.log('Done Cleaning Data');
                // for(let i = 0; i < 20; i++) {
                //     console.log(classicalGames[i]);
                // }
            }
            else console.log(`${count} files loaded`);
        });

    }
    fs.readFile('chessDataFiles/openingsList.json', 'utf8', (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        const list = JSON.parse(data);
        Object.values(list).forEach(object => {
            openingsList.push(object);
        });
        console.log(`Openings Data Loaded. ${openingsList.length} openings`);
    });
}

loadAllData(12);

// function getDataWithFilters(object) {
//     // TODO: Write a function that will mimic a database query and return JSON object
// }
// setTimeout(() => {
//     parseGameMoves();
// }, 1000);

// cleanGameMovesInJsonFiles(writeFile);
// function cleanGameMovesInJsonFiles(callback) {
//     for (let i = 0; i < 30; i++) {

//         const filename = `chessDataFiles/ratedCLassicalGame_${i}.json`;
//         fs.readFile(filename, 'utf8', (error, data) => {
//             if (error) {
//                 console.log(error);
//                 return;
//             }
//             const list = JSON.parse(data);
//             Object.values(list).forEach(object => {
//                 if (object.GameMoves) {
//                     let moves = [];
//                     // TODO: Write a function that will convert the game move string into an array of sequential moves.
//                     let splitMoves = gameString.split(' ');
//                     let inParenthesis = false;
//                     for (let i = 0; i < splitMoves.length; i++) {
//                         if (!inParenthesis) {
//                             if (splitMoves[i] === '{') {
//                                 inParenthesis = true;
//                             } else {
//                                 moves.push(splitMoves[i]);
//                             }
//                         } else {
//                             if (splitMoves[i] === '}') {
//                                 inParenthesis = false;
//                             }
//                         }
//                     }

//                     let movesObjects = [];
//                     for (let i = 0; i < moves.length; i += 2) {
//                         const num = moves[i];
//                         const move = moves[i + 1];
//                         movesObjects[num] = move;
//                     }
//                     object.GameMoves = movesObjects;
//                 }
//             });
//             callback(filename, list);
//             count++;
//             console.log(count);
//         });
//     }
// }

// const openings = [];


function parseGameMoves(gameString) {
    let moves = [];
    // TODO: Write a function that will convert the game move string into an array of sequential moves.
    let splitMoves = gameString.split(' ');
    let inParenthesis = false;
    for (let i = 0; i < splitMoves.length; i++) {
        if (!inParenthesis) {
            if (splitMoves[i] === '{') {
                inParenthesis = true;
            } else {
                moves.push(splitMoves[i]);
            }
        } else {
            if (splitMoves[i] === '}') {
                inParenthesis = false;
            }
        }
    }

    let movesObjects = [];
    for (let i = 0; i < moves.length; i += 2) {
        const num = moves[i];
        const move = moves[i + 1];
        movesObjects[num] = move;
    }
    return movesObjects;
}

