export class DomManager {
    loadingDiv;

    constructor(publisher, subscriber) {
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.subscriber.setCallbackFunction(this.messageHandler);
        this.loadingDiv = document.querySelector('#loadingDiv');
    };

    updateTextInLoadingDiv(text) {
        this.loadingDiv.innerHTML = text;
    }

    messageHandler = message => {
        switch (message.from) {
            case 'dataManager':
                this.#handleMessageFromDataManager(message.body);
                break;
        }
    }

    #handleMessageFromDataManager(messageBody) {
        switch (messageBody.message) {
            case 'All Games Loaded':
                console.log(messageBody.data);
                break;
        }
    }
}