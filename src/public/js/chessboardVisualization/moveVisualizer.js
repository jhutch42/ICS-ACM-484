export class MoveVisualizer {


    constructor(divId, publisher) {
        this.divId = divId;
        this.publisher = publisher;
    }

    initializeNewChessboard() {
        const options = {
            position: 'start', 
            draggable: true, 
            dropOffBoard: 'snapback',
            onDrop: this.onDrop
        }
        this.board = Chessboard(this.divId, options);
    }

    startVisualization() {
        this.publisher.publishMessage({from: 'moveVisualizer', body: {message: 'Request List Of First Moves', callback: this.procesFirstMoves.bind(this)}});
    }

    onDrop(newLocation, oldLocation, source, piece, position, orientation) {
        console.log('New location: ' + newLocation)
        console.log('Old location: ' + oldLocation)
        console.log('Source: ' + source)
        console.log('Piece: ' + piece)
        console.log('Position: ' + Chessboard.objToFen(position))
        console.log('Orientation: ' + orientation)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    }

    procesFirstMoves(data) {

    }

    messageHandler(message) {
        switch(message.body.message) {
            case 'First Move Data':
                this.publisher.publishMessage({from: 'moveVisualizer', body: {message: 'Plot Move Percentages - Initial', data: message.body.data}});
                break;
        }
    }
}