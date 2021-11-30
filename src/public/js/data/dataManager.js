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
                break;
            case 'Sort Data By Field':
                this.gameData = body.data;
                console.log('Sorted Data Returned from Web Worker');
                this.#printDataHead(2);
                break;
            case 'Request List Of First Moves':
                const firstMoveData = this.#getFirstMoveData();
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
            case 'Request List of Next Moves':
                const moveData = this.#getNextMoveData(body.moveList);
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

    getAllGameData() {
        // This function will return all games that the server allows( currently around 220,000)
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
            this.#playerRankMapping.forEach(entry => {
                entry.rankingAverage = parseInt(this.#getAverageOfArray(entry.rankingArray));
            });
        }
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
        this.gameData.forEach(game => {
            const moves = Object.keys(game.GameMoves).length;
            if (moves > max) max = moves;
        });
        const data = { x: new Array(max + 1), y: new Array(max + 1).fill(0) }
        for (let i = 1; i <= max; i++) data.x[i] = i;
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
    }

    #getAverageOfArray(array) {
        if (array.length > 1) {
            let sum = 0;
            array.forEach(element => sum += element);
            return sum / array.length;
        } else return -1;

    }

    #printDataHead(numberOfRows) {
        for (let i = 0; i < numberOfRows; i++) {
            console.log(this.gameData[i]);
        }
    }

    #getFirstMoveData() {
        const moves = [];
        const values = [];
        this.gameData.forEach(game => {
            const firstMove = game.GameMoves['1.'];
            if (firstMove) {
                if (!moves.includes(firstMove)) {
                    moves.push(firstMove);
                    values[moves.indexOf(firstMove)] = 0;
                }
                values[moves.indexOf(firstMove)] += 1;
            }
        });
        const combinedData = [];
        for (let i = 0; i < moves.length; i++) {
            combinedData.push({ move: moves[i], value: values[i] });
        }
        combinedData.sort((a, b) => a.value - b.value);
        const data = { moves: [], values: [] };
        combinedData.forEach(datapoint => {
            data.moves.push(datapoint.move);
            data.values.push(datapoint.value);
        });
        console.log(data);
        return data;
    }

    #getNextMoveData(moveList) {
        const moves = [];
        const values = [];
        const matchingGames = [];
        this.gameData.forEach(game => {
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
        });
        matchingGames.forEach(game => {
            const nextMove = Object.values(game.GameMoves)[moveList.length];
            if (nextMove) {
                if (!moves.includes(nextMove)) {
                    moves.push(nextMove);
                    values[moves.indexOf(nextMove)] = 0;
                }
                values[moves.indexOf(nextMove)] += 1;
            }
        });
        const combinedData = [];
        for (let i = 0; i < moves.length; i++) {
            combinedData.push({ move: moves[i], value: values[i] });
        }
        combinedData.sort((a, b) => a.value - b.value);
        const data = { moves: [], values: [] };
        combinedData.forEach(datapoint => {
            data.moves.push(datapoint.move);
            data.values.push(datapoint.value);
        });
        return data;
    }
}