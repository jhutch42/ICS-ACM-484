

export class EloSlider {
    constructor(min, max, updateMovesCallback) {
        this.updateMovesCallback = updateMovesCallback;
        this.minElo = min;
        this.maxElo = max;
        this.minDragging = false;
        this.maxDragging = false;
        this.minPosition = 10;
        this.maxPosition = 440;
        this.currentMinElo = 0;
        this.currentMaxElo = 5000;
        this.positionHistory = [];
        this.min = document.querySelector('#slider-low');
        this.max = document.querySelector('#slider-high');
        this.maxText = document.querySelector('#maxEloText');
        this.minText = document.querySelector('#minEloText');
        this.maxText.innerHTML = this.maxElo.toString();
        this.minText.innerHTML = this.minElo.toString();
        this.min.addEventListener('mousedown', this.startDragMin.bind(this));
        document.addEventListener('mousemove', this.dragMin.bind(this));
        this.max.addEventListener('mousedown', this.startDragMax.bind(this));
        document.addEventListener('mousemove', this.dragMax.bind(this));
        document.addEventListener('mouseup', this.stopDragMax.bind(this));
        document.addEventListener('mouseup', this.stopDragMin.bind(this));
        this.totalPossibleDistance = this.maxPosition + Math.abs(this.minPosition);
    };

    startDragMin(event) {
        this.minDragging = true;
        this.positionHistory = [];
        event.preventDefault();
    }
    startDragMax(event) {
        this.maxDragging = true;
        this.positionHistory = [];
        event.preventDefault();
    }
    stopDragMin() {
        this.minDragging = false;
        this.positionHistory = [];
        this.updateMovesCallback(this.currentMinElo, this.currentMaxElo);
    }
    stopDragMax() {
        this.maxDragging = false;
        this.positionHistory = [];
        this.updateMovesCallback(this.currentMinElo, this.currentMaxElo);
    }


    dragMin(event) {
        if (this.minDragging) {
            this.positionHistory.push(event.clientX);
            if (this.positionHistory.length > 1) {
                const difference = this.positionHistory[this.positionHistory.length - 1] - this.positionHistory[0];
                if ((this.minPosition + difference) > 10 && (this.minPosition + difference) < this.maxPosition - 10) {
                    this.minPosition += difference;
                    this.min.style.left = `${this.minPosition}px`;
                    this.positionHistory = [this.positionHistory[this.positionHistory.length - 1]];
                    this.updateMinText();
                }
            }
        }
        event.preventDefault();
    }
    dragMax(event) {
        if (this.maxDragging) {
            this.positionHistory.push(event.clientX);
            if (this.positionHistory.length > 1) {
                const difference = this.positionHistory[this.positionHistory.length - 1] - this.positionHistory[0];
                if ((this.maxPosition + difference) < 473 && (this.maxPosition + difference) > this.minPosition + 10) {
                    this.maxPosition += difference;
                    this.max.style.left = `${this.maxPosition}px`;
                    this.positionHistory = [this.positionHistory[this.positionHistory.length - 1]];
                    this.updateMaxText();
                }
            }
        }
        event.preventDefault();
    }

    updateMaxText(){
        this.currentMaxElo = this.getEloValue(this.maxPosition);
        this.maxText.innerHTML = this.currentMaxElo.toString();
    }
    updateMinText(){
        this.currentMinElo = this.getEloValue(this.minPosition);
        this.minText.innerHTML = this.currentMinElo.toString();
    }

    getEloValue(position) {
        const adjustedPosition = position - 14;
        const percentage = adjustedPosition / this.totalPossibleDistance;
        const currentElo = parseInt((percentage * (this.maxElo - this.minElo)) + this.minElo);
        if (currentElo < this.minElo) return this.minElo;
        else if (currentElo > this.maxElo) return this.maxElo;
        else return currentElo;
    }

    getDifference() {
        if (this.positionHistory.length > 1) {
            return {
                x: this.positionHistory[this.positionHistory.length - 1].x - this.positionHistory[0].x,
                y: this.positionHistory[this.positionHistory.length - 1].y - this.positionHistory[0].y
            }
        } else return undefined;
    }
}