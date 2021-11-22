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
                this.publisher.publishMessage({ from: 'dataManager', body: { message: 'First Move Data', data: this.#getFirstMoveData() } })
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
        const data = { moves: [], values: [] };
        this.gameData.forEach(game => {
            const firstMove = game.GameMoves['1.'];
            if (!data.moves.includes(firstMove)) {
                data.moves.push(firstMove);
                data.values[data.moves.indexOf(firstMove)] = 0;
            }
            data.values[data.moves.indexOf(firstMove)] += 1;
        });
        return data;
    }
}