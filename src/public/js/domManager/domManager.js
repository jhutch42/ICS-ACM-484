export class DomManager {

    #elementHashTable;
    constructor(publisher, subscriber) {
        this.#elementHashTable = new Map();
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.subscriber.setCallbackFunction(this.messageHandler);
        this.#elementHashTable.set('loadingDiv', document.querySelector('#loadingDiv'));
        this.#elementHashTable.set('uniquePlayersDiv', document.querySelector('#uniquePlayersDiv'));
    };

    #updateText(elementKey, text) {
        this.#elementHashTable.get(elementKey).innerHTML = text;
    }

    messageHandler = message => {
        switch (message.from) {
            case 'dataManager':
                this.#handleMessageFromDataManager(message.body);
                break;
            case 'chartBuilder':
                this.#handleMessageFromChartBuilder(message.body);
                break;
        }
    }

    #handleMessageFromDataManager(messageBody) {
        switch (messageBody.message) {
            case 'All Games Loaded':
                this.#updateText('loadingDiv', `Number of Unique Chess Games Loaded: ${messageBody.data}`);
                break;
            case 'Player Rankings Map Loaded':
                this.#updateText('uniquePlayersDiv', `Number of Unique Chess Players: ${messageBody.data}`);
                break;
        }
    }

    #handleMessageFromChartBuilder(messageBody) {
        switch (messageBody.message) {
            case 'Dom Element Request':
                messageBody.callbackFunction(this.#elementHashTable.get(messageBody.divKey), messageBody.divKey);
                break;
        }
    }
}