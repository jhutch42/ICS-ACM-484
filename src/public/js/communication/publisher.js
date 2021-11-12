export default class Publisher {

    /* (Private) This is an array of callback functions. When a message is published, all of these
    functions are called and the message is passed to them as a parameter. */
    #subscribers = [];

    constructor() {};

    /**
     * Sends a message to all subscribers.
     * @param {{from: string, body : object}} message 
     */
    publishMessage(message) {
        if (this.#validateMessage(message)) {
            // Pass the message to every callback function.
            this.#subscribers.forEach(callBackFunction => callBackFunction(message));
        } else console.log('Invalid Message Format, must be. {to: string, from: string: body: object}');
    }

    /**
     * Checks for undefined messages and correct format with to, from, and body.
     * @param {{from: string, body : object}} message 
     * @returns true if valid message, false if not.
     */
    #validateMessage(message) {
        if (message && message.from && message.body) {
            if (typeof (message) === 'object' && typeof (message.from) === 'string' && typeof (message.body) === 'object') return true;
        } else return false;
    }

    /**
     * This function is added to the subscriber array and called by publishMessage.
     * @param {function} callbackFunction 
     */
    subscribe(callbackFunction) {
        if (callbackFunction && typeof(callbackFunction) === 'function') this.#subscribers.push(callbackFunction);
        else console.log('Invalid callback function, cannot subscribe.');
    }
}