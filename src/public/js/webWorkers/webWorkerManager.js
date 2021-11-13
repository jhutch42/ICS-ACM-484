export default class WebWorkerManager {
    #workerHashTable;
    #workerIdIndex;
    #workerQueue;
    publisher;

    constructor(publisher) {
        this.publisher = publisher;
        this.#workerIdIndex = -1;
        this.#workerHashTable = new Map();
        this.#workerQueue = [];
        this.#createWorkerPool(3);
    };

    getData(instructions) {
        if (this.#workerQueue.length > 0) {
            const worker = this.#dequeueWorker();
            worker.postMessage({type: 'Get Data', instructions: instructions});
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
        console.log(data);
        this.#enqueueWorker(this.#workerHashTable.get(id).worker);
        this.publisher.publishMessage({from: 'webWorkerManager', body: {message: data.request, data: data.data}});
    }

    #setWorkerMessageHandler(id) {
        this.#workerHashTable.get(id).worker.onmessage = (event, id) => {
            if (event.data.message === 'Return With Data') this.#handleReturn(event.data.data, event.data.id);
            else console.log(event.data);
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