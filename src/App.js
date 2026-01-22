import logo from "./logo.svg";
import "./App.css";
import { useState, useMemo, useEffect } from "react";

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, timeLeft }) {
  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);
  let status;

  if (winner) {
    status = "Winner: " + winner;
  } else if (isDraw) status = "Draw!";
  else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }

    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const rows = [];
  for (let i = 0; i < 3; i++) {
    const cols = [];
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j;
      cols.push(
        <Square
          key={idx}
          value={squares[idx]}
          onSquareClick={() => handleClick(idx)}
        />,
      );
    }
    rows.push(
      <div className="board-row" key={i}>
        {cols}
      </div>,
    );
  }

  return (
    <>
      <div className="status">
        {status}
        {!winner && !isDraw && (
          <span style={{ marginLeft: 12 }}>
            Time left: <b> {timeLeft}</b>s
          </span>
        )}
      </div>
      {rows}
    </>
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
      return squares[a];
    }
  }

  return null;
}
export default function Game() {
  const TURN_SECONDS = 30;
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  const winner = useMemo(
    () => calculateWinner(currentSquares),
    [currentSquares],
  );
  const isDraw = useMemo(
    () => !winner && currentSquares.every(Boolean),
    [winner, currentSquares],
  );
  const isGameOver = winner || isDraw;

  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  useEffect(() => {
    setTimeLeft(TURN_SECONDS);
  }, [currentMove, TURN_SECONDS]);

  useEffect(() => {
    if (isGameOver) return;
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    if (timeLeft !== 0) return;

    handlePlay(currentSquares.slice());
  }, [timeLeft, isGameOver]);

  const moves = history.map((squares, move) => {
    let description;

    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          timeLeft={timeLeft}
        />
      </div>

      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}
