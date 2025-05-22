import React from 'react';
import './App.css';
import GameContainer from './components/GameContainer';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">🐸</span> FrogCross Arcade
            </div>
            <div className="nav-info">Classic Arcade Game</div>
          </div>
        </div>
      </nav>

      <main>
        <div className="container game-page">
          <div className="game-header">
            <h1 className="title">FrogCross Arcade</h1>
            <div className="description">
              Help the frog cross the busy road by avoiding moving vehicles!
            </div>
          </div>
          
          <GameContainer />
          
          <div className="game-instructions">
            <h2>How to Play</h2>
            <ul>
              <li>Use the arrow keys to move the frog</li>
              <li>Avoid getting hit by vehicles</li>
              <li>Reach the safe zone at the top</li>
              <li>Complete levels to increase your score</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;