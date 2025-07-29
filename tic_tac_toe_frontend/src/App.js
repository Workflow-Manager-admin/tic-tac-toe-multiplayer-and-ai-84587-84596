import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Utility to get the winning combinations in tic tac toe.
 * @returns {number[][]} Array of winning index combinations.
 */
function getWinningCombos() {
  return [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // columns
    [0,4,8],[2,4,6]          // diagonals
  ];
}

// PUBLIC_INTERFACE
function App() {
  // Theme state for toggling between light/dark (bonus: retain previous theme logic)
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((theme) => theme === 'light' ? 'dark' : 'light');

  // Core game states
  const [mode, setMode] = useState(null); // 'single' | 'multi'
  const [selectPiece, setSelectPiece] = useState(null); // 'X' | 'O'
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);

  // Keep track of user/AI interaction
  const playerPiece = selectPiece; // what the human is playing as
  const aiPiece = playerPiece === "X" ? "O" : "X";

  // On every relevant state update:
  useEffect(() => {
    // Detect winner or draw
    const w = calculateWinner(squares);
    if (w) {
      setWinner(w);
      setStatus(w === 'D' ? "It's a draw!" : `Winner: ${w}`);
      setIsGameActive(false);
      setIsDraw(w === 'D');
      return;
    }
    if (isGameActive) {
      setStatus(`Next turn: ${xIsNext ? 'X' : 'O'}`);
    }
  }, [squares, xIsNext, isGameActive]);

  // Handle computer move (if single player, it's the AI's turn and game not over)
  useEffect(() => {
    if (
      mode === "single" &&
      isGameActive &&
      !winner &&
      ((xIsNext && playerPiece === "O") || (!xIsNext && playerPiece === "X"))
    ) {
      // Delay (brief) for realism
      const aiTimeout = setTimeout(() => {
        // Find best move for AI
        const aiMove = findBestMove(squares, aiPiece, playerPiece);
        handleMove(aiMove);
      }, 450);
      return () => clearTimeout(aiTimeout);
    }
    // eslint-disable-next-line
  }, [mode, isGameActive, xIsNext, winner, squares, playerPiece, aiPiece]);

  // Handle square click
  function handleMove(idx) {
    if (!isGameActive || squares[idx] || winner) return;
    if (mode === "single") {
      // Only allow user to play their side
      if ((xIsNext && playerPiece !== "X") || (!xIsNext && playerPiece !== "O")) return;
    }
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // Compute winner or draw
  function calculateWinner(sqs) {
    for (const line of getWinningCombos()) {
      const [a,b,c] = line;
      if (sqs[a] && sqs[a] === sqs[b] && sqs[a] === sqs[c]) {
        return sqs[a];
      }
    }
    if (sqs.every(Boolean)) return 'D';
    return null;
  }

  // Find move for AI (simple strategy: win if possible, block, else random)
  function findBestMove(currSquares, me, opp) {
    // Try to win
    for (let i=0;i<9;i++) {
      if (!currSquares[i]) {
        const copy = currSquares.slice();
        copy[i] = me;
        if (calculateWinner(copy) === me) return i;
      }
    }
    // Try to block
    for (let i=0;i<9;i++) {
      if (!currSquares[i]) {
        const copy = currSquares.slice();
        copy[i] = opp;
        if (calculateWinner(copy) === opp) return i;
      }
    }
    // Take center, corners, then sides
    if (!currSquares[4]) return 4;
    const priority = [0,2,6,8,1,3,5,7];
    return priority.find((idx) => !currSquares[idx]);
  }

  // Start new game with options selected
  function startGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setIsDraw(false);
    setIsGameActive(true);
    setStatus(`Next turn: ${playerPiece === "X" ? "X" : "O"}`);
  }
  function resetAll() {
    setMode(null);
    setSelectPiece(null);
    setSquares(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
    setIsGameActive(false);
    setXIsNext(true);
    setStatus('');
  }

  // PUBLIC_INTERFACE
  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 'unset', justifyContent: 'flex-start', paddingTop: 60 }}>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 style={{
          color: 'var(--text-primary)', 
          fontWeight: 700, 
          margin: '0 0 16px 0',
          fontSize: '2.25rem'
        }}>
          Tic Tac Toe
        </h1>

        <div style={{
          width: 340,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column', 
          alignItems: 'center'
        }}>
          {/* Mode selection panel */}
          {!isGameActive && mode == null && (
            <div style={{
              background: 'var(--bg-secondary)',
              padding: 24,
              borderRadius: 16,
              boxShadow: '0 2px 16px 1px rgba(28,40,75,0.06)',
              marginBottom: 24
            }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Mode</div>
              <button
                type="button"
                className="ttt-btn"
                style={{
                  background: 'var(--button-bg)', color: 'var(--button-text)',
                  border: 0, borderRadius: 12, padding: '10px 30px',
                  fontSize: 18, margin: 5, cursor: 'pointer', fontWeight: 500
                }}
                onClick={() => setMode('single')}
              >Single player (vs Computer)</button>
              <button
                type="button"
                className="ttt-btn"
                style={{
                  background: 'var(--secondary, #424242)', color: '#fff',
                  border: 0, borderRadius: 12, padding: '10px 30px',
                  fontSize: 18, margin: 5, cursor: 'pointer', fontWeight: 500
                }}
                onClick={() => setMode('multi')}
              >Two player</button>
            </div>
          )}

          {/* X/O select for both modes, prior to first move */}
          {!isGameActive && mode && selectPiece == null && (
            <div style={{
              background: 'var(--bg-secondary)',
              padding: 18,
              borderRadius: 16,
              boxShadow: '0 2px 16px 1px rgba(28,40,75,0.06)',
              marginBottom: 18
            }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Choose your side</div>
              <button
                className="ttt-btn"
                style={{
                  background: mode === "single" ? '#1976d2' : '#8bc34a', color: '#fff',
                  border: 0, borderRadius: 12, padding: '10px 34px',
                  fontSize: 20, margin: 6, cursor: 'pointer', fontWeight: 700, letterSpacing: 2
                }}
                onClick={() => setSelectPiece('X')}
              >X</button>
              <button
                className="ttt-btn"
                style={{
                  background: mode === "single" ? '#ffb300' : '#f44336', color: '#fff',
                  border: 0, borderRadius: 12, padding: '10px 34px',
                  fontSize: 20, margin: 6, cursor: 'pointer', fontWeight: 700, letterSpacing: 2
                }}
                onClick={() => setSelectPiece('O')}
              >O</button>
            </div>
          )}

          {/* Game Board Panel */}
          {(mode && selectPiece && isGameActive) && (
            <div style={{ marginTop: 22, marginBottom: 16, width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StatusSection 
                status={status}
                winner={winner}
                xIsNext={xIsNext}
                selectPiece={playerPiece}
                mode={mode}
                isDraw={isDraw}
              />
              <Board squares={squares} onClick={handleMove} winner={winner} />
            </div>
          )}

          {/* End panel (win/loss/draw) */}
          {(winner || isDraw) && (
            <div style={{
              margin: '24px 0 4px 0',
              fontSize: 22,
              fontWeight: 600,
              color: winner === playerPiece ? "#1976d2" : (winner === aiPiece ? "#f44336" : "#424242")
            }}>
              {isDraw
                ? "It's a draw!"
                : (mode === "single" 
                    ? (winner === playerPiece 
                        ? "You win! 🎉"
                        : winner === aiPiece
                          ? "Computer wins."
                          : winner
                      )
                    : `Player ${winner} wins!`)
              }
            </div>
          )}

          {/* Game Controls */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            margin: '24px 0 8px 0',
            gap: 18
          }}>
            {mode && selectPiece && !isGameActive && (
              <button
                className="ttt-btn"
                style={{
                  background: 'var(--button-bg)', color: 'var(--button-text)',
                  border: 0, borderRadius: 10, padding: '10px 28px',
                  fontSize: 16, cursor: 'pointer', fontWeight: 600
                }}
                onClick={startGame}
              >{squares.some(Boolean) ? "Restart Game" : "Start Game"}</button>
            )}
            {(mode || selectPiece) && (
              <button
                className="ttt-btn"
                style={{
                  background: "#eee", color: "#444",
                  border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 18px',
                  fontSize: 16, cursor: 'pointer', fontWeight: 600
                }}
                onClick={resetAll}
              >Back</button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

// Board component (stateless)
// PUBLIC_INTERFACE
function Board({ squares, onClick, winner }) {
  const renderSquare = (idx) => {
    const isWin = winner && squareHighlightIdxs(squares, winner).includes(idx);
    return (
      <button
        key={idx}
        className="ttt-square"
        style={{
          width: 75,
          height: 75,
          fontSize: '2.3rem',
          fontWeight: 700,
          background: isWin ? '#ffeb3b' : '#fff',
          color: squares[idx] === "X" ? "#1976d2" : squares[idx] === "O" ? "#f44336" : "#222",
          border: '2px solid var(--border-color)',
          borderRadius: 6,
          outline: 'none',
          margin: 0,
          transition: 'background 0.22s, color 0.2s'
        }}
        onClick={() => onClick(idx)}
        disabled={Boolean(squares[idx]) || Boolean(winner)}
        aria-label={`Tic Tac Toe cell ${idx+1} ${squares[idx] ? 'occupied' : 'empty'}`}
      >
        {squares[idx]}
      </button>
    );
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 75px)', gap: 8, background: 'var(--bg-secondary)', borderRadius: 12, padding: 14 }}>
      {squares.map((_, i) => renderSquare(i))}
    </div>
  );
}
// Highlight winner squares
function squareHighlightIdxs(squares, winner) {
  if (!winner) return [];
  for (const combo of getWinningCombos()) {
    const [a,b,c] = combo;
    if (squares[a] && squares[a] === winner && squares[b] === winner && squares[c] === winner) {
      return [a,b,c];
    }
  }
  return [];
}

// PUBLIC_INTERFACE
function StatusSection({ status, winner, xIsNext, selectPiece, mode, isDraw }) {
  let subtext = '';
  if (!winner && !isDraw) {
    if (mode === "multi") {
      subtext = `Current: ${xIsNext ? "X" : "O"}`;
    } else if (mode === "single") {
      subtext = (selectPiece === (xIsNext ? "X" : "O"))
        ? "Your move"
        : "Computer's move";
    }
  }
  return (
    <div style={{ margin: '0 0 14px 0', textAlign: 'center', minHeight: 40 }}>
      <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: 1 }}>
        {status}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 2, minHeight: 22 }}>
        {subtext}
      </div>
    </div>
  );
}

export default App;
