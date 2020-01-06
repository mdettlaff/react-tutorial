import React, {useState} from 'react';
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

function Game(props) {

    const [historyState, setHistoryState] = useState([{
        squares: Array(9).fill(null),
        position: null,
    }]);
    const [stepNumber, setStepNumber] = useState(0);
    const [xIsNext, setXIsNext] = useState(true);
    const [selected, setSelected] = useState(null);
    const [sortHistoryDesc, setSortHistoryDesc] = useState(false);

    function handleClick(i) {
        const history = historyState.slice(0, stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = xIsNext ? 'X' : 'O';
        setHistoryState(history.concat([{
            squares: squares,
            position: i,
        }]));
        setXIsNext(!xIsNext);
        setStepNumber(history.length);
        setSelected(null);
    }

    function jumpTo(step) {
        setStepNumber(step);
        setXIsNext((step % 2) === 0);
        setSelected(step);
    }

    function handleSortButtonClick() {
        setSortHistoryDesc(!sortHistoryDesc);
    }

    let history = historyState;
    const current = history[stepNumber];
    const winningLine = calculateWinner(current.squares);
    const winner = winningLine ? current.squares[winningLine[0]] : null;

    if (sortHistoryDesc) {
        history = history.slice(0).reverse();
    }
    const moves = history.map((step, move) => {
        if (sortHistoryDesc) {
            move = history.length - 1 - move;
        }
        let description = move ?
            'Go to move #' + move :
            'Go to game start';
        const column = step.position % 3;
        const row = Math.floor(step.position / 3);
        description += step.position != null ? ' (' + column + ', ' + row + ')' : '';
        const descriptionClass = selected === move ? 'selected-move' : null;
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>
                    <span className={descriptionClass}>{description}</span>
                </button>
            </li>
        );
    });

    let status;
    const boardIsFull = stepNumber === current.squares.length;
    if (winner) {
        status = 'Winner: ' + winner;
    } else if (!boardIsFull) {
        status = 'Next player: ' + (xIsNext ? 'X' : 'O');
    } else {
        status = "It's a draw";
    }
    return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={current.squares}
                    onClick={(i) => handleClick(i)}
                    winningLine={winningLine}
                />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{moves}</ol>
            </div>
            <div>
                History sort order:
                <button onClick={() => handleSortButtonClick()}>
                    {'change to ' + (sortHistoryDesc ? 'asc' : 'desc')}
                </button>
            </div>
        </div>
    );
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

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
