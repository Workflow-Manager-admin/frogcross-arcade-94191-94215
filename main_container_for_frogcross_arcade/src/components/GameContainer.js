import React, { useState, useEffect } from 'react';
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
    y: 10  // Start at the bottom of the grid (0-indexed, so 10 is the 11th lane)
  });
  
  // Vehicle positions (initial placeholders)
  const [vehicles, setVehicles] = useState([
    { id: 1, x: 2, y: 3, direction: 'right', length: 2 },  // Lane 4 (0-indexed)
    { id: 2, x: 8, y: 5, direction: 'left', length: 3 },   // Lane 6 (0-indexed)
    { id: 3, x: 4, y: 7, direction: 'right', length: 2 }   // Lane 8 (0-indexed)
  ]);
  
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
      
      // Get vehicles in this lane
      const laneVehicles = vehicles.filter(vehicle => vehicle.y === i);
      
      lanes.push(
        <div key={`lane-${i}`} className={laneType}>
          {/* Display vehicles in this lane */}
          {laneVehicles.map(vehicle => (
            <div 
              key={`vehicle-${vehicle.id}`}
              className={`vehicle ${vehicle.direction === 'right' ? 'vehicle-right' : 'vehicle-left'}`}
              style={{ 
                left: `${(vehicle.x * 100) / 15}%`,
                width: `${(vehicle.length * 100) / 15}%`
              }}
            />
          ))}
          
          {/* Display frog if it's in this lane */}
          {frogPosition.y === i && (
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
