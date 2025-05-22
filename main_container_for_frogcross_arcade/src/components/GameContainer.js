import React, { useState, useEffect, useCallback } from 'react';
import './GameContainer.css';

/**
 * Main container component for the FrogCross Arcade game.
 * This component handles the layout for the game including lanes, 
 * starting position, goal area, and game elements.
 */
const GameContainer = () => {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  // Frog position state (grid-based)
  const [frogPosition, setFrogPosition] = useState({
    x: 7, // Middle of the bottom lane
    y: 10  // Start at the bottom of the grid (0-indexed, so 10 is the 11th lane)
  });
  
  // Vehicle positions with wrapping state
  const [vehicles, setVehicles] = useState([
    { id: 1, x: 2, y: 3, direction: 'right', length: 2, speed: 1, wrapping: false, exitingPart: 0, enteringPart: 0 },  // Lane 4 (0-indexed)
    { id: 2, x: 8, y: 5, direction: 'left', length: 3, speed: 1.2, wrapping: false, exitingPart: 0, enteringPart: 0 },   // Lane 6 (0-indexed)
    { id: 3, x: 4, y: 7, direction: 'right', length: 2, speed: 0.8, wrapping: false, exitingPart: 0, enteringPart: 0 }   // Lane 8 (0-indexed)
  ]);
  
  // Game configuration
  const totalLanes = 11; // 1 starting lane, 9 crossing lanes, 1 goal lane
  const gridWidth = 15; // 15 grid cells horizontally
  
  // Handle key presses for frog movement
  const handleKeyDown = useCallback((event) => {
    if (!gameActive || gameOver) return;
    
    // Clone current position to avoid direct state mutation
    const newPosition = { ...frogPosition };
    
    // Update position based on key pressed
    switch (event.key) {
      case 'ArrowUp':
        if (newPosition.y > 0) newPosition.y -= 1;
        break;
      case 'ArrowDown':
        if (newPosition.y < 10) newPosition.y += 1;
        break;
      case 'ArrowLeft':
        if (newPosition.x > 0) newPosition.x -= 1;
        break;
      case 'ArrowRight':
        if (newPosition.x < 14) newPosition.x += 1;
        break;
      default:
        return; // Exit if not an arrow key
    }
    
    // Update frog position if it changed
    if (newPosition.x !== frogPosition.x || newPosition.y !== frogPosition.y) {
      setFrogPosition(newPosition);
      
      // Check if frog reached the goal
      if (newPosition.y === 0) {
        handleLevelComplete();
      }
    }
  }, [gameActive, frogPosition, gameOver, handleLevelComplete]);
  
  // Set up event listeners when component mounts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive, frogPosition, gameOver, handleKeyDown]); // Re-add listeners when these dependencies change
  
  // Animation timer for vehicle movement
  useEffect(() => {
    let animationTimer;
    
    if (gameActive && !gameOver) {
      // Update vehicle positions every 50ms
      animationTimer = setInterval(() => {
        moveVehicles();
      }, 50);
    }
    
    // Clean up timer when component unmounts or game stops
    return () => {
      clearInterval(animationTimer);
    };
  }, [gameActive, level, gameOver, moveVehicles]);
  
  // Check for collisions after each vehicle movement or frog position update
  useEffect(() => {
    if (gameActive && !gameOver) {
      checkCollisions();
    }
  }, [vehicles, frogPosition, gameActive, gameOver, checkCollisions]);
  
  // Move vehicles based on direction and speed with smooth wrapping
  const moveVehicles = useCallback(() => {
    // Speed factor increases with level
    const levelSpeedFactor = 1 + (level - 1) * 0.2;
    
    setVehicles(currentVehicles => 
      currentVehicles.map(vehicle => {
        // Deep clone the vehicle object to avoid mutations
        const updatedVehicle = { ...vehicle };
        const moveAmount = vehicle.speed * levelSpeedFactor * 0.1;
        
        if (vehicle.wrapping) {
          // Vehicle is in the process of wrapping
          if (vehicle.direction === 'right') {
            // For right-moving vehicles, increase entering part
            updatedVehicle.enteringPart += moveAmount;
            
            // When fully entered, end wrapping
            if (updatedVehicle.enteringPart >= vehicle.length) {
              updatedVehicle.wrapping = false;
              updatedVehicle.x = updatedVehicle.enteringPart - vehicle.length;
              updatedVehicle.enteringPart = 0;
              updatedVehicle.exitingPart = 0;
            }
          } else {
            // For left-moving vehicles
            updatedVehicle.exitingPart -= moveAmount;
            updatedVehicle.enteringPart += moveAmount;
            
            // When fully exited and entered, end wrapping
            if (updatedVehicle.enteringPart >= vehicle.length) {
              updatedVehicle.wrapping = false;
              updatedVehicle.x = gridWidth - updatedVehicle.enteringPart;
              updatedVehicle.enteringPart = 0;
              updatedVehicle.exitingPart = 0;
            }
          }
          
          return updatedVehicle;
        }
        
        // Regular movement (not wrapping)
        if (vehicle.direction === 'right') {
          updatedVehicle.x = vehicle.x + moveAmount;
          
          // Start wrapping when vehicle reaches the edge
          if (updatedVehicle.x > gridWidth - vehicle.length * 0.3) { // Start wrapping earlier to look smooth
            updatedVehicle.wrapping = true;
            updatedVehicle.exitingPart = gridWidth - updatedVehicle.x;
            updatedVehicle.enteringPart = 0;
          }
        } else {
          updatedVehicle.x = vehicle.x - moveAmount;
          
          // Start wrapping when vehicle reaches the edge
          if (updatedVehicle.x < -vehicle.length * 0.7) {  // Start wrapping earlier
            updatedVehicle.wrapping = true;
            updatedVehicle.exitingPart = updatedVehicle.x;
            updatedVehicle.enteringPart = 0;
          }
        }
        
        return updatedVehicle;
      })
    );
  }, [level, gridWidth]);
  
  // Check if frog collides with any vehicle
  const checkCollisions = useCallback(() => {
    // Only check road lanes (not start or goal)
    if (frogPosition.y === 0 || frogPosition.y === 10) {
      return;
    }
    
    // Get vehicles in the same lane as frog
    const vehiclesInLane = vehicles.filter(vehicle => vehicle.y === frogPosition.y);
    
    // Check if frog collides with any vehicle in the lane
    const collision = vehiclesInLane.some(vehicle => {
      // Frog position (center point)
      const frogX = frogPosition.x;
      
      // Vehicle occupies space from its x position to x + length
      const vehicleStart = vehicle.x;
      const vehicleEnd = vehicle.x + vehicle.length;
      
      // Check if frog is within vehicle bounds
      // Allow a small margin (0.5) for visual clarity
      return frogX + 0.5 > vehicleStart && frogX - 0.5 < vehicleEnd;
    });
    
    if (collision) {
      handleCollision();
    }
  }, [gameActive, frogPosition, gameOver, handleLevelComplete]);
  
  // Handle collision with vehicle
  const handleCollision = useCallback(() => {
    // Reduce lives by 1
    const updatedLives = lives - 1;
    setLives(updatedLives);
    
    // Check for game over
    if (updatedLives <= 0) {
      setGameOver(true);
      return;
    }
    
    // Reset frog to starting position
    resetFrog();
  }, [lives, resetFrog]);
  
  // Handle level completion
  const handleLevelComplete = useCallback(() => {
    // Increase score (10 points per level)
    setScore(prevScore => prevScore + 10 * level);
    
    // Advance to next level
    setLevel(prevLevel => prevLevel + 1);
    
    // Reset frog position
    resetFrog();
  }, [level, resetFrog]);
  
  // Reset frog to starting position
  const resetFrog = () => {
    setFrogPosition({
      x: 7,
      y: 10
    });
  };
  
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
          {/* Display vehicles in this lane with wrapping animation */}
          {laneVehicles.map(vehicle => {
            if (vehicle.wrapping) {
              // For wrapping vehicles, render two parts: exiting and entering
              return (
                <React.Fragment key={`vehicle-${vehicle.id}`}>
                  {/* Exiting part of the vehicle */}
                  {vehicle.direction === 'right' && (
                    <div 
                      className={`vehicle vehicle-right`}
                      style={{ 
                        left: `${((gridWidth - vehicle.exitingPart) * 100) / gridWidth}%`,
                        width: `${(vehicle.exitingPart * 100) / gridWidth}%`
                      }}
                    />
                  )}
                  
                  {/* Entering part of the vehicle */}
                  {vehicle.direction === 'right' ? (
                    <div 
                      className={`vehicle vehicle-right`}
                      style={{ 
                        left: `0%`,
                        width: `${(vehicle.enteringPart * 100) / gridWidth}%`
                      }}
                    />
                  ) : (
                    <div 
                      className={`vehicle vehicle-left`}
                      style={{ 
                        left: `${((gridWidth - vehicle.enteringPart) * 100) / gridWidth}%`,
                        width: `${(vehicle.enteringPart * 100) / gridWidth}%`,
                      }}
                    />
                  )}
                  
                  {/* Exiting part for left-moving vehicles */}
                  {vehicle.direction === 'left' && (
                    <div 
                      className={`vehicle vehicle-left`}
                      style={{ 
                        left: `0%`,
                        width: `${(Math.abs(vehicle.exitingPart) * 100) / gridWidth}%`
                      }}
                    />
                  )}
                </React.Fragment>
              );
            } else {
              // Regular vehicle rendering
              return (
                <div 
                  key={`vehicle-${vehicle.id}`}
                  className={`vehicle ${vehicle.direction === 'right' ? 'vehicle-right' : 'vehicle-left'}`}
                  style={{ 
                    left: `${(vehicle.x * 100) / gridWidth}%`,
                    width: `${(vehicle.length * 100) / gridWidth}%`
                  }}
                />
              );
            }
          })}
          
          {/* Display frog if it's in this lane */}
          {frogPosition.y === i && (
            <div 
              className="frog"
              style={{ left: `${(frogPosition.x * 100) / gridWidth}%` }}
            />
          )}
        </div>
      );
    }
    
    return lanes;
  };
  
  // Game controls
  const handleStartGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    resetFrog();
    
    // Reset vehicles to starting positions with wrapping properties
    setVehicles([
      { id: 1, x: 2, y: 3, direction: 'right', length: 2, speed: 1, wrapping: false, exitingPart: 0, enteringPart: 0 },
      { id: 2, x: 8, y: 5, direction: 'left', length: 3, speed: 1.2, wrapping: false, exitingPart: 0, enteringPart: 0 },
      { id: 3, x: 4, y: 7, direction: 'right', length: 2, speed: 0.8, wrapping: false, exitingPart: 0, enteringPart: 0 }
    ]);
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
        
        {/* Game over message */}
        {gameOver && (
          <div className="game-overlay">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button className="btn btn-large" onClick={handleStartGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <div className="game-controls">
        {!gameActive && !gameOver && (
          <button className="btn btn-large" onClick={handleStartGame}>
            Start Game
          </button>
        )}
        {gameActive && !gameOver && (
          <div className="control-info">
            Use arrow keys to move the frog
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
