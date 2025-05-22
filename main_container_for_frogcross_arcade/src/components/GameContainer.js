import React, { useState } from 'react';
import './GameContainer.css';

/**
 * Main container component for the FrogCross Arcade game.
 * This component handles the layout for the game including lanes, 
 * starting position, goal area, and placeholders for game elements.
 */
const GameContainer = () => {
  // Game state placeholders
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  
  // Frog position state (grid-based)
  const [frogPosition, setFrogPosition] = useState({
    x: 7, // Middle of the bottom lane
    y: 9  // Start at the bottom of the grid
  });
  
  // Number of lanes in the game
  const totalLanes = 11; // 1 starting lane, 9 crossing lanes, 1 goal lane
  
  // Generate lanes for the game board
  const renderLanes = () => {
    const lanes = [];
    
    for (let i = 0; i < totalLanes; i++) {
      let laneType = 'lane';
      
      // Define lane types based on position
      if (i === 0) {
        laneType = 'lane goal-lane';
      } else if (i === totalLanes - 1) {
        laneType = 'lane start-lane';
      } else if (i % 2 === 0) {
        laneType = 'lane road-lane road-lane-light';
      } else {
        laneType = 'lane road-lane road-lane-dark';
      }
      
      lanes.push(
        <div key={`lane-${i}`} className={laneType}>
          {/* Lane content will be populated with vehicles or other items later */}
          {i === totalLanes - 1 && frogPosition.y === i && (
            <div 
              className="frog"
              style={{ left: `${(frogPosition.x * 100) / 15}%` }}
            />
          )}
        </div>
      );
    }
    
    return lanes;
  };
  
  // Game controls placeholder
  const handleStartGame = () => {
    setGameActive(true);
    setScore(0);
    setLives(3);
    setLevel(1);
    setFrogPosition({
      x: 7,
      y: 9
    });
  };
  
  return (
    <div className="game-container">
      <div className="game-stats">
        <div className="stats-item">Score: {score}</div>
        <div className="stats-item">Level: {level}</div>
        <div className="stats-item">Lives: {lives}</div>
      </div>
      
      <div className="game-board">
        {renderLanes()}
      </div>
      
      <div className="game-controls">
        {!gameActive && (
          <button className="btn btn-large" onClick={handleStartGame}>
            Start Game
          </button>
        )}
        {gameActive && (
          <div className="control-info">
            Use arrow keys to move the frog
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
