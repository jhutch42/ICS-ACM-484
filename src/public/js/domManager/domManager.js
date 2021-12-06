export class DomManager {

    #elementHashTable;
    constructor(publisher, subscriber) {
        this.#elementHashTable = new Map();
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.subscriber.setCallbackFunction(this.messageHandler);
        this.#elementHashTable.set('loadingDiv', document.querySelector('#loadingDiv'));
        this.#elementHashTable.set('uniquePlayersDiv', document.querySelector('#uniquePlayersDiv'));
        this.#elementHashTable.set('uniquePlayersChartDiv', document.querySelector('#uniquePlayersChartDiv'));
        this.#elementHashTable.set('oddsOfFavoriteWinningDiv', document.querySelector('#oddsOfFavoriteWinningDiv'));
        this.#elementHashTable.set('movesPerGameDiv', document.querySelector('#movesPerGameDiv'));
        this.#elementHashTable.set('moveVisualizationChartDiv', document.querySelector('#moveVisualizationChartDiv'));
        this.#elementHashTable.set('newbPlayersDiv', document.querySelector('#newbPlayersDiv'));
        this.#elementHashTable.set('favorite-winner', document.querySelector('#favorite-winner'));
        this.#elementHashTable.set('underdog-winner', document.querySelector('#underdog-winner'));
        this.#elementHashTable.set('draw-winner', document.querySelector('#draw-winner'));
        this.#elementHashTable.set('avgRatingDiff', document.querySelector('#avgRatingDiff'));
        this.#elementHashTable.set('max-game-num-moves', document.querySelector('#max-game-num-moves'));
        this.#elementHashTable.set('max-white-name', document.querySelector('#max-white-name'));
        this.#elementHashTable.set('max-black-name', document.querySelector('#max-black-name'));
        this.#elementHashTable.set('max-white-elo', document.querySelector('#max-white-elo'));
        this.#elementHashTable.set('max-black-elo', document.querySelector('#max-black-elo'));
        this.#elementHashTable.set('max-outcome', document.querySelector('#max-outcome'));
        this.#elementHashTable.set('max-link', document.querySelector('#max-link'));
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
                this.#updateText('loadingDiv', `<span class="red">${messageBody.data.toLocaleString('en-US')}</span> unique chess games loaded.`);
                break;
            case 'Player Rankings Map Loaded':
                this.#updateText('uniquePlayersDiv', `${messageBody.data}`);
                break;
            case '1500 Players Data Loaded':
                this.#updateText('newbPlayersDiv', `<span class="red">${messageBody.data.toLocaleString('en-US')}</span>`);
                break;
            case 'Odds Of Favorite Winning Pie Chart':
                this.#updateText('favorite-winner', `<span class="red">${messageBody.data[0].value.toLocaleString('en-US')}%</span>`);
                this.#updateText('underdog-winner', `<span class="blue">${messageBody.data[1].value.toLocaleString('en-US')}%</span>`);
                this.#updateText('draw-winner', `<span class="orange">${messageBody.data[2].value.toLocaleString('en-US')}%</span>`);
                break;
                case 'Average Ratings Difference':
                    this.#updateText('avgRatingDiff',`<span class="red">${parseInt(messageBody.data)}</span>`);
                    break;
                case 'Max Moves Game Data':
                    this.#updateText('max-game-num-moves', `<span class="red">${parseInt(messageBody.data.moves)}`);
                    this.#updateText('max-white-name', `<span class="red">${messageBody.data.white}`);
                    this.#updateText('max-black-name', `<span class="red">${messageBody.data.black}`);
                    this.#updateText('max-white-elo', `<span class="red">${parseInt(messageBody.data.whiteElo)}`);
                    this.#updateText('max-black-elo', `<span class="red">${parseInt(messageBody.data.blackElo)}`);

                    let outcomeString = 'This epic game ended with an anticlimatic draw';
                    if (messageBody.data.result === '1-0') outcomeString = `${messageBody.data.white} won this game playing the white pieces`;
                    if (messageBody.data.result === '0-1') outcomeString = `${messageBody.data.black} won this game playing the black pieces`;
                    this.#updateText('max-outcome', outcomeString);
                    this.#updateText('max-link', `${messageBody.data.link}`);
                    this.#elementHashTable.get('max-link').href = messageBody.data.link;
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