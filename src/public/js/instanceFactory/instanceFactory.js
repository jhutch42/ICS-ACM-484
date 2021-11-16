import DataManager from "../data/dataManager.js";
import Subscriber from "../communication/subscriber.js";
import Publisher from "../communication/publisher.js";
import CSVReader from "../data/csv/csvReader.js";
import WebWorkerManager from "../webWorkers/webWorkerManager.js";

export default class InstanceFactory {
    #numberOfDataManagers = 0;     // (Private) tracks number of DataManager Objects
    #numberOfSubscribers = 0;      // (Private) tracks number of Subscriber Objects
    #numberOfPublishers = 0;       // (Private) tracks number of Publisher Objects
    #numberOfCsvReaders = 0;          
    #numberOfWebWorkerManagers = 0;
    constructor() {};
    
    /**
     * Create A singleton Data Manager.
     * @returns a new Data Manager object
     */
    createDataManager() {
        if (this.#numberOfDataManagers === 0) {
            this.#numberOfDataManagers++;
            return new DataManager(this.#createPublisher(), this.#createSubscriber(), this.#createWebWorkerManager(3));
        } 
        else console.log('Only 1 DataManager is allowed.');
        return undefined;
    }

    /**
     * Create A singleton Web Worker Manager.
     * @returns a new Web Worker Manager object
     */
    #createWebWorkerManager(sizeOfWorkerPool) {
        if (this.#numberOfWebWorkerManagers === 0) {
            this.#numberOfWebWorkerManagers++;
            return new WebWorkerManager(this.#createPublisher(), sizeOfWorkerPool);
        } 
        else console.log('Only 1 WebWorkerManager is allowed.');
        return undefined;
    }

    /**
     * Private function that creates a new subscriber object and increments the counter.
     * @returns new Subscriber Object
     */
    #createSubscriber() {
        this.#numberOfSubscribers++;
        return new Subscriber();
    }

    /**
     * Private function that creates a new publisher object and increments the coutner.
     * @returns a new Publisher object
     */
    #createPublisher() {
        this.#numberOfPublishers++;
        return new Publisher();
    }

    #createCsvReader() {
        if (this.#numberOfCsvReaders === 0) {
            this.#numberOfCsvReaders++;
            return new CSVReader();
        } else console.log('Only 1 CSV Reader is allowed.');

    }

    #printFactoryOutput() {
        console.log(`DataManagers: ${this.#numberOfDataManagers}`);
        console.log(`Subscribers: ${this.#numberOfSubscribers}`);
        console.log(`Publishers: ${this.#numberOfPublishers}`);
    }
}