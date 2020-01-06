import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={'square' + (props.winning ? ' square-win' : '')}
                onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}

function Board(props) {

    function renderSquare(i) {
        const winning = props.winningLine ? props.winningLine.includes(i) : false;
        return (
            <Square
                value={props.squares[i]}
                onClick={() => props.onClick(i)}
                winning={winning}
            />
        );
    }

    const boardSize = 3;
    return (
        <div>
            {Array(boardSize).fill(null).map((v, row) => {
                return <div className="board-row">
                    {Array(boardSize).fill(null).map((v, column) => {
                        return renderSquare(row * boardSize + column);
                    })}
                </div>
            })}
        </div>
    );
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                position: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            selected: null,
            sortHistoryDesc: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                position: i,
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
            selected: null,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            selected: step,
        });
    }

    handleSortButtonClick() {
        this.setState({
            sortHistoryDesc: !this.state.sortHistoryDesc,
        })
    }

    render() {
        let history = this.state.history;
        const current = history[this.state.stepNumber];
        const winningLine = calculateWinner(current.squares);
        const winner = winningLine ? current.squares[winningLine[0]] : null;

        if (this.state.sortHistoryDesc) {
            history = history.slice(0).reverse();
        }
        const moves = history.map((step, move) => {
            if (this.state.sortHistoryDesc) {
                move = history.length - 1 - move;
            }
            let description = move ?
                'Go to move #' + move :
                'Go to game start';
            const column = step.position % 3;
            const row = Math.floor(step.position / 3);
            description += step.position != null ? ' (' + column + ', ' + row + ')' : '';
            const descriptionClass = this.state.selected === move ? 'selected-move' : null;
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        <span className={descriptionClass}>{description}</span>
                    </button>
                </li>
            );
        });

        let status;
        const boardIsFull = this.state.stepNumber === current.squares.length;
        if (winner) {
            status = 'Winner: ' + winner;
        } else if (!boardIsFull) {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        } else {
            status = "It's a draw";
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winningLine={winningLine}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
                <div>
                    History sort order:
                    <button onClick={() => this.handleSortButtonClick()}>
                        {'change to ' + (this.state.sortHistoryDesc ? 'asc' : 'desc')}
                    </button>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i];
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
