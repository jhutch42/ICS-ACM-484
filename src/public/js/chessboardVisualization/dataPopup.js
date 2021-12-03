export class DataPopup {

    constructor() {
        this.element = document.querySelector('#dataPopup');
        this.squareText = document.querySelector('#squareText');
        this.percentageText = document.querySelector('#percentageText');
        this.averageRatingText = document.querySelector('#ratingText');
        this.white = document.querySelector('#white');
        this.black = document.querySelector('#black');
        this.draw = document.querySelector('#draw');
        this.whiteText = document.querySelector('#white >  p');
        this.blackText = document.querySelector('#black >  p');
        this.drawText = document.querySelector('#draw >  p');
    }

    updateSquareText(square) {
        this.squareText.innerHTML = square;
    }

    updatePercentageText(percentage) {
        this.percentageText.innerHTML = `${percentage}%`;
    }

    updateAverageRatingText(rating) {
        this.averageRatingText.innerHTML = `${rating}`;
    }

    moveToSquare(x,y) {
        this.element.style.top = `${y - 40}px`;
        this.element.style.left = `${x +25}px`;
    }

    updateWinLoseDrawBar(winLoseDraw) {
        this.white.style.width = `${winLoseDraw.white * 100}%`;
        this.black.style.width = `${winLoseDraw.black * 100}%`;
        this.draw.style.width = `${winLoseDraw.draw * 100}%`;
        this.whiteText.innerHTML = `${parseInt(winLoseDraw.white * 100)}%`;
        this.blackText.innerHTML = `${parseInt(winLoseDraw.black * 100)}%`;
        this.drawText.innerHTML = `${parseInt(winLoseDraw.draw * 100)}%`;
    }

    hide() {
        this.element.style.display = 'none';
    }

    show() {
        this.element.style.display = 'flex';
    }
}