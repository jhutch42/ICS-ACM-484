export default class DataManager {
    publisher;
    subscriber;
    #WebWorkerManager;

    constructor(publisher, subscriber, webWorkerManager) {
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.subscriber.setCallbackFunction(this.messageHandler);
        this.#WebWorkerManager = webWorkerManager;
    };

    /**
     * Parses message received from other components.
     * @param {{from: string, body: object}} message 
     */
    messageHandler = message => {
        const from = message.from;
        const body = message.body;
    }

    getAllGameData() {
        // This function will return all games that the server allows( currently around 220,000)
        this.#WebWorkerManager.getData({ request: "Get All Game Data" });
    }
}