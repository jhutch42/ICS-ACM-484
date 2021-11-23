export class MoveVisualizer {

    constructor(divId, publisher) {
        this.divId = divId;
        this.publisher = publisher;
        this.moveArray = [];
        this.moveListContainer = document.querySelector('#moveVisualizerMoveListContainer');
        this.currentMoveData = [];
    }

    initializeNewChessboard() {
        const options = {
            position: 'start',
            draggable: true,
            dropOffBoard: 'snapback',
            onDrop: this.onDrop.bind(this)
        }
        this.board = Chessboard(this.divId, options);
    }

    startVisualization() {
        this.publisher.publishMessage({ from: 'moveVisualizer', body: { message: 'Request List Of First Moves', callback: this.processMoves.bind(this) } });
    }

    onDrop(oldLocation, newLocation, source, piece, position, orientation) {
        if (oldLocation === newLocation) return;
        let leadingLetter = '';
        if (source === 'wB' || source === 'bB') leadingLetter = 'B';
        else if (source === 'wK' || source === 'bK') leadingLetter = 'K';
        else if (source === 'wR' || source === 'bR') leadingLetter = 'R';
        else if (source === 'wN' || source === 'bN') leadingLetter = 'N';
        else if (source === 'wQ' || source === 'bQ') leadingLetter = 'Q';

        const move = `${leadingLetter}${newLocation}`;
        this.moveListContainer.appendChild(this.createMoveCard(move, this.getSingleMovePercentage(move)));
        this.moveArray.push(move);

        this.publisher.publishMessage({
            from: 'moveVisualizer', 
            body: {
                message: 'Request List of Next Moves', moveList: this.moveArray, callback: this.processMoves.bind(this)
            }
        });
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
    }
    
    getSingleMovePercentage(move) {

        for (let i = 0; i < this.currentMoveData.moves.length; i++) {
            let testMove = this.currentMoveData.moves[i];
            if (testMove) {
                testMove = testMove.replace('x', '')
                testMove = testMove.replace('!', '');
                testMove = testMove.replace('?', '');
                testMove = testMove.replace('+', '');
                testMove = testMove.replace('#', '');
            }
            if (testMove === move) {
                return this.currentMoveData.values[i];
            }
        }
        return -1;
    }

    createMoveCard(moveString, movePercentage) {
        const moveCard = document.createElement('div');
        moveCard.classList.add('move-card')
        const moveText = document.createElement('p');
        moveText.appendChild(document.createTextNode(moveString));
        const movePercentageText = document.createElement('p');
        movePercentageText.appendChild(document.createTextNode(`${movePercentage}%`));
        moveCard.appendChild(moveText);
        moveCard.appendChild(movePercentageText);
        return moveCard;
        
    }

    messageHandler(message) {
        switch (message.body.message) {
            case 'First Move Data':
                this.publisher.publishMessage({ from: 'moveVisualizer', body: { message: 'Plot Move Percentages - Initial', data: message.body.data } });
                break;
        }
    }
}