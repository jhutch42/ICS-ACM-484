import { DataPopup } from "./dataPopup.js";

export class MoveVisualizer {

    constructor(divId, publisher) {
        this.divId = divId;
        this.publisher = publisher;
        this.moveArray = { moves: [], positions: [] };
        this.moveListContainer = document.querySelector('#moveVisualizerMoveListContainer');
        this.currentMoveData = [];
        this.#setResetEventListener();
        this.whiteTurn = true;
        this.dataPopup = new DataPopup();
    }

    initializeNewChessboard() {
        const options = {
            position: 'start',
            draggable: true,
            dropOffBoard: 'snapback',
            onDrop: this.onDrop.bind(this),
            onMouseoverSquare: this.mouseenterSquare.bind(this)
        }
        this.board = Chessboard(this.divId, options);
    }

    startVisualization() {
        this.moveArray = { moves: [], positions: [] };
        this.publisher.publishMessage({ from: 'moveVisualizer', body: { message: 'Request List Of First Moves', callback: this.processMoves.bind(this) } });
    }

    mouseenterSquare(square, piece, position, orientation, event) {
        const rect = event.target.getBoundingClientRect();
        const value = this.isAMappedSquare(square);
        if (value) {
            this.dataPopup.show();
            this.dataPopup.moveToSquare(rect.right, rect.top + window.pageYOffset);
            this.dataPopup.updateSquareText(square);
            this.dataPopup.updatePercentageText(value.percentage);
            this.dataPopup.updateAverageRatingText(value.rating);
            this.dataPopup.updateWinLoseDrawBar(value.winLoseDraw);
        } else this.dataPopup.hide();
    }

    isAMappedSquare(square) {
        for (let i = 0; i < this.currentMoveData.moves.length; i++) {
            let move = this.currentMoveData.moves[i];
            if (move === 'O-O') move = this.whiteTurn ? 'g1' : 'g8';
            if (move === 'O-O-O') move = this.whiteTurn ? 'c1' : 'c8';
            if (this.#stripLeadingCharacterForHighlight(move) === square) return {percentage: this.currentMoveData.values[i], rating: this.currentMoveData.ratings[i], winLoseDraw: this.currentMoveData.winLoseDraw[i]};
        }
        return false;
    }

    onDrop(oldLocation, newLocation, source, piece, position, orientation) {
        // Delay Function exection until piece is dropped onto the board
        setTimeout(() => {
            if (oldLocation === newLocation) return;
            this.whiteTurn = !this.whiteTurn;
            let leadingLetter = '';
            if (source === 'wB' || source === 'bB') leadingLetter = 'B';
            else if (source === 'wK' || source === 'bK') leadingLetter = 'K';
            else if (source === 'wR' || source === 'bR') leadingLetter = 'R';
            else if (source === 'wN' || source === 'bN') leadingLetter = 'N';
            else if (source === 'wQ' || source === 'bQ') leadingLetter = 'Q';

            let move = `${leadingLetter}${newLocation}`;
            if (source === 'wK' && oldLocation === 'e1' && newLocation === 'g1') {
                move = 'O-O';
                this.board.move('h1-f1');
            } else if (source === 'wK' && oldLocation === 'e1' && newLocation === 'c1') {
                move = 'O-O-O';
                this.board.move('a1-d1');
            } else if (source === 'bK' && oldLocation === 'e8' && newLocation === 'g8') {
                move = 'O-O';
                this.board.move('h8-f8');
            } else if (source === 'bK' && oldLocation === 'e8' && newLocation === 'c8') {
                move = 'O-O-O';
                this.board.move('a8-d8');
            }

            const color = source[0] === 'w' ? 'white' : 'black';
            this.moveListContainer.appendChild(this.createMoveCard(move, this.getSingleMovePercentage(move), color));
            this.moveArray.moves.push(move);

            this.publisher.publishMessage({
                from: 'moveVisualizer',
                body: {
                    message: 'Request List of Next Moves', moveList: this.moveArray.moves, callback: this.processMoves.bind(this)
                }
            });
        }, 50);

        // console.log(move);
        // console.log('New location: ' + newLocation)
        // console.log('Old location: ' + oldLocation)
        // console.log('Source: ' + source)
        //     console.log('Piece: ' + piece)
        //     console.log('Position: ' + Chessboard.objToFen(position))
        //     console.log('Orientation: ' + orientation)
        //     console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    }

    processMoves(data) {
        this.currentMoveData = data;
        let sum = 0;
        this.currentMoveData.values.forEach(n => sum += n);
        for (let i = 0; i < this.currentMoveData.values.length; i++) {
            this.currentMoveData.values[i] = (this.currentMoveData.values[i] / sum * 100).toFixed(2);
        }
        this.updateBoardHeatmap();
    }

    updateBoardHeatmap() {
        this.board.removeGradientHighlights();
        for (let i = 0; i < this.currentMoveData.moves.length; i++) {
            const gradientIndex = this.getGradientValue(this.currentMoveData.values[i]);
            let move = this.currentMoveData.moves[i];
            if (move === 'O-O') move = this.whiteTurn ? 'g1' : 'g8';
            if (move === 'O-O-O') move = this.whiteTurn ? 'c1' : 'c8';
            this.board.highlightSquare(this.#stripLeadingCharacterForHighlight(move), gradientIndex);
        }

    }

    getGradientValue(percentage) {
        let val = parseInt(39 * percentage * 2 * 0.01);
        val = val > 39 ? 39: val;
        return 39 - val;
    }

    getSingleMovePercentage(move) {

        for (let i = 0; i < this.currentMoveData.moves.length; i++) {
            let testMove = this.#stripLeadingCharacter(this.currentMoveData.moves[i]);
            if (testMove === move) {
                return this.currentMoveData.values[i];
            }
        }
        return 0.00;
    }

    #stripLeadingCharacter(testMove) {
        if (testMove) {
            testMove = testMove.replace('x', '')
            testMove = testMove.replace('!', '');
            testMove = testMove.replace('?', '');
            testMove = testMove.replace('+', '');
            testMove = testMove.replace('#', '');
        }
        if (testMove.length > 2 && (
            testMove[0] === 'a' ||
            testMove[0] === 'b' ||
            testMove[0] === 'c' ||
            testMove[0] === 'd' ||
            testMove[0] === 'e' ||
            testMove[0] === 'f' ||
            testMove[0] === 'g' ||
            testMove[0] === 'h'
        )) {
            testMove = testMove.substr(1);
        }
        return testMove;
    }

    #stripLeadingCharacterForHighlight(testMove) {
        if (testMove) {
            testMove = testMove.replace('x', '')
            testMove = testMove.replace('!', '');
            testMove = testMove.replace('?', '');
            testMove = testMove.replace('+', '');
            testMove = testMove.replace('#', '');
        }
        if (testMove.length > 2) {
            testMove = testMove.substr(1);
        }
        return testMove;
    }

    #setResetEventListener() {
        document.querySelector('#resetMoveVisualizerButton').addEventListener('click', this.resetVisualization.bind(this));
    }

    createMoveCard(moveString, movePercentage, color) {
        const moveCard = document.createElement('div');
        moveCard.classList.add('move-card');
        if (color === 'black') moveCard.classList.add('move-card-black');
        const moveText = document.createElement('p');
        moveText.appendChild(document.createTextNode(moveString));
        const movePercentageText = document.createElement('p');
        movePercentageText.appendChild(document.createTextNode(`${movePercentage}%`));
        moveCard.appendChild(moveText);
        moveCard.appendChild(movePercentageText);
        return moveCard;
    }

    resetVisualization() {
        this.moveListContainer.innerHTML = '';
        this.initializeNewChessboard();
        this.startVisualization();
    }

    messageHandler(message) {
        switch (message.body.message) {
            case 'First Move Data':
                this.publisher.publishMessage({ from: 'moveVisualizer', body: { message: 'Plot Move Percentages - Initial', data: message.body.data } });
                break;
        }
    }
}