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
        this.#checkDataAvailability();
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
                console.log('Game Data is Set... ' + this.gameData.length + ' games');
                this.#printDataHead(2);
                this.publisher.publishMessage({from: 'dataManager', body: {message: 'All Games Loaded', data: this.gameData.length}});
                break;
            case 'Sort Data By Field':
                this.gameData = body.data;
                console.log('Sorted Data Returned from Web Worker');
                this.#printDataHead(2);
                break;
        }
    }

    getAllGameData() {
        // This function will return all games that the server allows( currently around 220,000)
        if (this.#dataIsReady) this.#WebWorkerManager.getData({ request: "Get All Game Data" });
        else console.log('Data is still loading on the server');
    }

    #checkDataAvailability() {
        this.#WebWorkerManager.getData({ request: "Is Data Ready" });
    }

    sortData(field) {
        if (this.gameData) this.#WebWorkerManager.sortDataByField({ request: 'Sort Data By Field', data: this.gameData, field: field });
        else console.log('No Data On Client.');
    }

    getRankingHistogramData(breakPoint) {
        const data = { x: [], y: [] };
        for (let i = 0; i < 3500; i += breakPoint) {
            data.x.push(i);
        }
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

    #getAverageOfArray(array) {
        if (array.length > 0) {
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


}