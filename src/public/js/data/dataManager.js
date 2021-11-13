export default class DataManager {
    publisher;
    subscriber;
    #WebWorkerManager;
    #dataIsReady;
    gameData;

    constructor(publisher, subscriber, webWorkerManager) {
        this.#dataIsReady = false;
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.subscriber.setCallbackFunction(this.messageHandler);
        this.#WebWorkerManager = webWorkerManager;
        this.#WebWorkerManager.publisher.subscribe(this.messageHandler);
        this.#checkDataAvailability();
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
                break;
        }
    }

    getAllGameData() {
        // This function will return all games that the server allows( currently around 220,000)
        if (this.#dataIsReady) this.#WebWorkerManager.getData({ request: "Get All Game Data" });
        else console.log('Data is still loading on the server');
    }

    #checkDataAvailability() {
        this.#WebWorkerManager.getData({request: "Is Data Ready"});
    }
}