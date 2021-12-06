import { startVisualizing } from "../main.js";

export default class DataManager {
    publisher;
    subscriber;
    #WebWorkerManager;
    #dataIsReady;
    gameData;
    #playerRankMapping;

    constructor(publisher, subscriber, webWorkerManager) {
        this.#dataIsReady = false;
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.subscriber.setCallbackFunction(this.messageHandler);
        this.#WebWorkerManager = webWorkerManager;
        this.#WebWorkerManager.publisher.subscribe(this.messageHandler);
        this.#playerRankMapping = new Map();
    };

    /**
     * Parses message received from other components.
     * @param {{from: string, body: object}} message 
     */
    messageHandler = message => {
        const from = message.from;
        const body = message.body;
        switch (body.message) {
            case 'Is Data Ready':
                if (body.data === true) {
                    this.#dataIsReady = true;
                    this.getAllGameData();
                }
                break;
            case 'Get All Game Data':
                this.gameData = body.data;
                this.#printDataHead(10);
                startVisualizing();
                this.publisher.publishMessage({ from: 'dataManager', body: { message: 'All Games Loaded', data: this.gameData.length } });
                this.createPlayerRankMapping();
                this.publisher.publishMessage({ from: 'dataManager', body: { message: 'Player Rankings Map Loaded', data: this.#playerRankMapping.size } });
                this.#createDataForPlayerRankingHistogram(100);
                this.#createDataForOddsOfFavoriteWinning();
                this.#createDataForNumberOfMovesPerGame();
                this.getNumberOf1500Players();
                //this.#getCheckmateData();
                this.#getAvgRatingDiff();
                break;
            case 'Sort Data By Field':
                this.gameData = body.data;
                console.log('Sorted Data Returned from Web Worker');
                this.#printDataHead(2);
                break;
            case 'Request List Of First Moves':
                const firstMoveData = this.#getFirstMoveData(body.min, body.max);
                this.publisher.publishMessage(
                    {
                        from: 'dataManager',
                        body: {
                            message: 'First Move Data',
                            data: firstMoveData
                        }
                    });
                body.callback(firstMoveData);
                break;
            case 'Get Elo Data':
                body.callback(this.getMinElo(), this.getMaxElo());
                break;
            case 'Request List of Next Moves':
                const moveData = this.#getNextMoveData(body.moveList, body.min, body.max);
                this.publisher.publishMessage(
                    {
                        from: 'dataManager',
                        body: {
                            message: 'First Move Data',
                            data: moveData
                        }
                    });
                body.callback(moveData);
                break;

        }
    }

    getMinElo() {
        let min = Infinity;
        this.gameData.forEach(game => {
            if (parseInt(game.BlackElo) < min) min = parseInt(game.BlackElo);
            if (parseInt(game.WhiteElo) < min) min = parseInt(game.WhiteElo);
        });
        return min;
    }

    getMaxElo() {
        let max = -Infinity;
        this.gameData.forEach(game => {
            if (parseInt(game.BlackElo) > max) max = parseInt(game.BlackElo);
            if (parseInt(game.WhiteElo) > max) max = parseInt(game.WhiteElo);
        });
        return max;
    }

    getAllGameData() {
        if (this.#dataIsReady) this.#WebWorkerManager.getData({ request: "Get All Game Data" });
        else console.log('Data is still loading on the server');
    }

    checkDataAvailability() {
        this.#WebWorkerManager.getData({ request: "Is Data Ready" });
    }

    sortData(field) {
        if (this.gameData) this.#WebWorkerManager.sortDataByField({ request: 'Sort Data By Field', data: this.gameData, field: field });
        else console.log('No Data On Client.');
    }

    createPlayerRankMapping() {
        if (this.#dataIsReady) {
            this.gameData.forEach(game => {
                if (!this.#playerRankMapping.has(game.Black)) this.#playerRankMapping.set(game.Black, { rankingArray: [], rankingAverage: 0 });
                this.#playerRankMapping.get(game.Black).rankingArray.push(parseInt(game.BlackElo));
                if (!this.#playerRankMapping.has(game.White)) this.#playerRankMapping.set(game.White, { rankingArray: [], rankingAverage: 0 });
                this.#playerRankMapping.get(game.White).rankingArray.push(parseInt(game.WhiteElo));
            });
            let newbs = 0;
            this.#playerRankMapping.forEach(entry => {
                entry.rankingArray.forEach(rank => {
                    if (parseInt(rank) === 1500) newbs +=1;
                });
                entry.rankingAverage = parseInt(this.#getAverageOfArray(entry.rankingArray));
            });
            this.publisher.publishMessage(
                {
                    from: 'dataManager',
                    body: {
                        message: '1500 Players Data Loaded',
                        data: newbs
                    }
                });
        }
    }

    getNumberOf1500Players() {
        if (this.#dataIsReady) {
            let total = 0;
            this.gameData.forEach(game => {
                if (parseInt(game.BlackElo) === 1500) total += 1;
                if (parseInt(game.WhiteElo) === 1500) total += 1;
            });
            return total;
        }
        return -1;
    }

    #createDataForPlayerRankingHistogram(breakPoint) {
        const data = { x: [], y: [] };
        for (let i = 0; i < 3500; i += breakPoint) {
            data.x.push(i);
            data.y.push(0);
        }

        this.#playerRankMapping.forEach(entry => {
            const elo = entry.rankingAverage;
            const index = Math.floor(elo / breakPoint);
            data.y[index] += 1;
        });

        let index = data.y.length - 1;
        while (data.y[index] === 0) {
            data.y.pop();
            data.x.pop();
            index--;
        }

        this.publisher.publishMessage(
            {
                from: 'dataManager',
                body:
                {
                    message: 'Player Ranking Histogram Data',
                    data: data
                }
            });
    }

    #createDataForOddsOfFavoriteWinning() {
        const data = [{ value: 0, name: 'Favorite' }, { value: 0, name: 'Underdog' }, { value: 0, name: 'Draw' }];
        this.gameData.forEach(game => {
            const whiteElo = parseInt(game.WhiteElo);
            const blackElo = parseInt(game.BlackElo);
            switch (game.Result) {
                case '1-0':
                    if (whiteElo > blackElo) data[0].value += 1;
                    else data[1].value += 1;
                    break;
                case '0-1':
                    if (whiteElo < blackElo) data[0].value += 1;
                    else data[1].value += 1;
                    break;
                default:
                    data[2].value += 1;
                    break;
            }
        });
        const total = data[0].value + data[1].value + data[2].value;
        data.forEach(entry => entry.value = (entry.value / total * 100).toFixed(2));
        this.publisher.publishMessage(
            {
                from: 'dataManager',
                body:
                {
                    message: 'Odds Of Favorite Winning Pie Chart',
                    data: data
                }
            });
    }

    #createDataForNumberOfMovesPerGame() {
        let max = 0;
        let maxgame;
        this.gameData.forEach(game => {
            const moves = Object.keys(game.GameMoves).length;
            if (moves > max) {
                max = moves;
                maxgame = game;
            }
        });
        const data = { x: new Array(max + 1), y: new Array(max + 1).fill(0) }
        for (let i = 0; i <= max; i++) data.x[i] = i;
        this.gameData.forEach(game => {
            const moves = Object.keys(game.GameMoves).length;
            if (moves > 1) data.y[moves] += 1
        });
        this.publisher.publishMessage(
            {
                from: 'dataManager',
                body:
                {
                    message: 'Moves Per Game Histogram Data',
                    data: data
                }
            });
        const whiteName = maxgame.White;
        const whiteElo = maxgame.WhiteElo;
        const blackName = maxgame.Black;
        const blackElo = maxgame.BlackElo;
        const result = maxgame.Result;
        const linkToGame = maxgame.Site;

        this.publisher.publishMessage(
            {
                from: 'dataManager',
                body:
                {
                    message: 'Max Moves Game Data',
                    data: {moves: max, white: whiteName, black: blackName, whiteElo: whiteElo, blackElo: blackElo, result: result, link: linkToGame}
                }
            });

    }

    #getAvgRatingDiff() {
        let total = 0;
        let numGames = 0;
        this.gameData.forEach(game => {
            numGames++;
            total += Math.abs(parseInt(game.BlackElo) - parseInt(game.WhiteElo));
        });
        this.publisher.publishMessage(
            {
                from: 'dataManager',
                body:
                {
                    message: 'Average Ratings Difference',
                    data: (total/numGames)
                }
            });
    }

    #getAverageOfArray(array) {
        let sum = 0;
        array.forEach(element => sum += element);
        return sum / array.length;

    }

    #printDataHead(numberOfRows) {
        for (let i = 0; i < numberOfRows; i++) {
            console.log(this.gameData[i]);
        }
    }

    #getCheckmateData() {
        const checkmateGames = [];
        this.gameData.forEach(game => {
            if (game.GameMoves) {
                Object.values(game.GameMoves).forEach(move => {
                    if (move.includes('#'))
                    checkmateGames.push(game);
                });
            }
        });
        const data = {checkmates: 0, white: 0, black: 0, favoriteWon: 0, averageMoves: 0, minMoves: Infinity, maxMoves: -Infinity, piecesLeftAvg: 0, piecesLeftMax: -Infinity, piecesLeftMin: Infinity};
        let totalMoves = 0;
        let totalPiecesLeft = 0;
        let minPiecesLeft = Infinity;
        let maxPiecesLeft = -Infinity;
        checkmateGames.forEach(game => {
            data.checkmates += 1;
            if (game.Result === '1-0') {
                data.white+=1;
                if (parseInt(game.WhiteElo) > parseInt(game.BlackElo)) data.favoriteWon += 1;
            } else if (game.Result === '0-1') {
                data.black += 1;
                if (parseInt(game.WhiteElo) < parseInt(game.BlackElo)) data.favoriteWon += 1;
            }
            else console.log('DRAW!!');
            if (Object.values(game.GameMoves).length < data.minMoves) data.minMoves = Object.values(game.GameMoves).length;
            else if (Object.values(game.GameMoves).length > data.maxMoves) data.maxMoves = Object.values(game.GameMoves).length;
            totalMoves += Object.values(game.GameMoves).length;
            let piecesLeft = 32;
            Object.values(game.GameMoves).forEach(move => {
                if (move.includes('x')) piecesLeft--;
            });
            totalPiecesLeft += piecesLeft;
            if (piecesLeft < minPiecesLeft) minPiecesLeft = piecesLeft;
            if (piecesLeft > maxPiecesLeft) maxPiecesLeft = piecesLeft;
            //console.log(totalPiecesLeft);
        });
        data.piecesLeftAvg = totalPiecesLeft / checkmateGames.length;
        data.averageMoves = totalMoves / checkmateGames.length;
        data.piecesLeftMax = maxPiecesLeft;
        data.piecesLeftMin = minPiecesLeft;
        console.log(data);
    }

    #getFirstMoveData(min, max) {
        const moves = [];
        const values = [];
        const ratings = [];
        const wins = [];
        this.gameData.forEach(game => {
            if (parseInt(game.BlackElo) > min
                && parseInt(game.BlackElo) < max
                && parseInt(game.WhiteElo) > min
                && parseInt(game.WhiteElo) < max) {
                const firstMove = game.GameMoves['1.'];
                if (firstMove) {
                    if (!moves.includes(firstMove)) {
                        moves.push(firstMove);
                        values[moves.indexOf(firstMove)] = 0;
                        ratings[moves.indexOf(firstMove)] = [];
                        wins[moves.indexOf(firstMove)] = { white: 0, black: 0, draw: 0 };
                    }
                    values[moves.indexOf(firstMove)] += 1;
                    ratings[moves.indexOf(firstMove)].push(parseInt(game.WhiteElo));
                    if (game.Result === '1-0') wins[moves.indexOf(firstMove)].white += 1;
                    else if (game.Result === '0-1') wins[moves.indexOf(firstMove)].black += 1;
                    else wins[moves.indexOf(firstMove)].draw += 1;
                }
            }
        });

        const avgRatings = [];
        ratings.forEach(array => avgRatings.push(this.#getAverageOfArray(array)));

        for (let i = 0; i < wins.length; i++) wins[i] = this.#convertWinLoseDrawPercentages(wins[i]);

        const combinedData = [];
        for (let i = 0; i < moves.length; i++) {
            combinedData.push({ move: moves[i], value: values[i], rating: avgRatings[i], winLoseDraw: wins[i] });
        }
        combinedData.sort((a, b) => a.value - b.value);
        const data = { moves: [], values: [], ratings: [], winLoseDraw: [] };
        combinedData.forEach(datapoint => {
            data.moves.push(datapoint.move);
            data.values.push(datapoint.value);
            data.ratings.push(parseInt(datapoint.rating));
            data.winLoseDraw.push(datapoint.winLoseDraw);
        });
        return data;
    }

    #convertWinLoseDrawPercentages(winLoseDraw) {
        const total = winLoseDraw.white + winLoseDraw.black + winLoseDraw.draw;
        winLoseDraw.white = (winLoseDraw.white / total).toFixed(2);
        winLoseDraw.black = (winLoseDraw.black / total).toFixed(2);
        winLoseDraw.draw = (winLoseDraw.draw / total).toFixed(2);
        return winLoseDraw;
    }

    #getNextMoveData(moveList, min, max) {
        const moves = [];
        const values = [];
        const matchingGames = [];
        const wins = [];
        const ratings = [];
        this.gameData.forEach((game, index) => {
            if (parseInt(game.BlackElo) > min
                && parseInt(game.BlackElo) < max
                && parseInt(game.WhiteElo) > min
                && parseInt(game.WhiteElo) < max) {
                const gameMoves = Object.values(game.GameMoves);
                let match = true;
                for (let i = 0; i < moveList.length; i++) {
                    // TODO: Strip the check and ! and all of those characters.
                    let testMove = gameMoves[i];
                    if (testMove) {
                        testMove = testMove.replace('x', '')
                        testMove = testMove.replace('!', '');
                        testMove = testMove.replace('?', '');
                        testMove = testMove.replace('+', '');
                        testMove = testMove.replace('#', '');
                        if (testMove.length > 2 && (
                            testMove[0] === 'a' ||
                            testMove[0] === 'b' ||
                            testMove[0] === 'c' ||
                            testMove[0] === 'd' ||
                            testMove[0] === 'e' ||
                            testMove[0] === 'f' ||
                            testMove[0] === 'g' ||
                            testMove[0] === 'h'
                        )) {
                            testMove = testMove.substr(1);
                        }
                    }
                    if (testMove !== moveList[i]) match = false;
                }
                if (match) matchingGames.push(game);
            }
        });
        matchingGames.forEach((game, index) => {
            const nextMove = this.stripSpecialCharacters(Object.values(game.GameMoves)[moveList.length]);
            if (nextMove) {
                if (!moves.includes(nextMove)) {
                    moves.push(nextMove);
                    values[moves.indexOf(nextMove)] = 0;
                    ratings[moves.indexOf(nextMove)] = [];
                    wins[moves.indexOf(nextMove)] = { white: 0, black: 0, draw: 0 };
                }
                values[moves.indexOf(nextMove)] += 1;
                const elo = moveList.length % 2 === 0 ? game.WhiteElo : game.BlackElo;
                ratings[moves.indexOf(nextMove)].push(parseInt(elo));
                if (game.Result === '1-0') wins[moves.indexOf(nextMove)].white += 1;
                else if (game.Result === '0-1') wins[moves.indexOf(nextMove)].black += 1;
                else wins[moves.indexOf(nextMove)].draw += 1;
            }
        });

        const avgRatings = [];
        ratings.forEach(array => avgRatings.push(this.#getAverageOfArray(array)));
        for (let i = 0; i < wins.length; i++) wins[i] = this.#convertWinLoseDrawPercentages(wins[i]);
        const combinedData = [];
        for (let i = 0; i < moves.length; i++) {
            combinedData.push({ move: moves[i], value: values[i], rating: avgRatings[i], winLoseDraw: wins[i] });
        }
        combinedData.sort((a, b) => a.value - b.value);
        const data = { moves: [], values: [], ratings: [], winLoseDraw: [] };
        combinedData.forEach(datapoint => {
            data.moves.push(datapoint.move);
            data.values.push(datapoint.value);
            data.ratings.push(parseInt(datapoint.rating));
            data.winLoseDraw.push(datapoint.winLoseDraw);
        });
        return data;
    }
    stripSpecialCharacters(testMove) {
        if (testMove) {
            testMove = testMove.replace('!', '');
            testMove = testMove.replace('?', '');
        }
        return testMove;
    }
}