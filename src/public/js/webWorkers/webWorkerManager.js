export default class WebWorkerManager {
    #workerHashTable;
    #workerIdIndex;
    #workerQueue;
    publisher;

    /**
     * @param {Publisher Object} publisher 
     * @param {number} sizeOfWorkerPool 
     */
    constructor(publisher, sizeOfWorkerPool) {
        this.publisher = publisher;
        this.#workerIdIndex = -1;
        this.#workerHashTable = new Map();
        this.#workerQueue = [];
        this.#createWorkerPool(sizeOfWorkerPool);  // Create an initial pool of web workers.
    };

    /** Gets Data from the server
     * @param {{request: string}} instruction ie. 'Get All Game Data'
     */
    getData(instructions) {
        if (this.#workerQueue.length > 0) {
            const worker = this.#dequeueWorker();
            worker.postMessage({type: 'Get Data', instructions: instructions});
        }
    }

    /**
     * Sorts a dataset by a field, like White (white username) or WhiteElo (white's rankings).
     * @param {object {request: string, data: (dataobject), sortField: string}} instructions
     */
    sortDataByField(instructions) {
        if (this.#workerQueue.length > 0) {
            this.#dequeueWorker().postMessage({type: 'Sort Data', instructions});
        }
    }

    #createWorkerPool(numberOfWorkers) {
        for (let i = 0; i < numberOfWorkers; i++) this.#createNewWorker();
    }

    #createNewWorker() {
        const worker = this.#startWorker('js/webWorkers/worker.js');
        this.#incrementWorkerIdIndex();
        const id = this.#getNextWorkerIdIndex();
        this.#addWorkerToDataTable(worker, id);
        this.#setWorkerMessageHandler(id);
        this.#setWorkerId(id);
        this.#enqueueWorker(worker);
    }

    #startWorker = filename => new Worker(filename);

    #incrementWorkerIdIndex() {
        this.#workerIdIndex++;
    }

    #getNextWorkerIdIndex() {
        return this.#workerIdIndex;
    }

    #addWorkerToDataTable(worker, id) {
        this.#workerHashTable.set(id, { worker: worker, stopFunction: this.#stopWorker, handleReturnFunction: undefined});
    }

    #stopWorker(id) {
        if (this.#workerHashTable.has(id)) this.#workerHashTable.get(id).worker.terminate();
    }

    #handleReturn(data, id) {
        this.#enqueueWorker(this.#workerHashTable.get(id).worker);
        this.publisher.publishMessage({from: 'webWorkerManager', body: {message: data.request, data: data.data}});
    }

    #setWorkerMessageHandler(id) {
        this.#workerHashTable.get(id).worker.onmessage = (event, id) => {
            if (event.data.message === 'Return With Data') this.#handleReturn(event.data.data, event.data.id);
            else if(event.data.message === 'Return With Sorted Data') this.#handleReturn(event.data.data, event.data.id);
        }
    }

    #setWorkerId(id) {
        this.#workerHashTable.get(id).worker.postMessage({type: 'Set Id', id: id});
    }

    #enqueueWorker(worker) {
        this.#workerQueue.push(worker);
    }

    #dequeueWorker() {
        return this.#workerQueue.shift();
    }
}