export default class Subscriber {
    callbackFunction;
    constructor() {};

    setCallbackFunction(callBackFunction) {
        this.callbackFunction = callBackFunction;
    }

    subscribe(publisher) {
        publisher.subscribe(this.callbackFunction);
    }
}