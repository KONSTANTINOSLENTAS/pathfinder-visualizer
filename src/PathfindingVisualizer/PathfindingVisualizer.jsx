import React, { useState, useEffect, useCallback } from 'react';
import Node from './Node/Node';

import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra.js'; 
import { astar } from '../algorithms/astar.js'; 
import './PathfindingVisualizer.css';
import Tutorial from '../Tutorial/tutorial.jsx';

// --- DEFAULTS ---
const DEFAULT_START_NODE_ROW = 10;
const DEFAULT_START_NODE_COL = 5;
const DEFAULT_FINISH_NODE_ROW = 10;
const DEFAULT_FINISH_NODE_COL = 45;
const GRID_ROWS = 20;
const GRID_COLS = 50;


const createNode = (col, row, startPos, finishPos) => {
  return {
    col,
    row,
    isStart: row === startPos.row && col === startPos.col,
    isFinish: row === finishPos.row && col === finishPos.col,
    isWall: false,
    distance: Infinity,
    previousNode: null,
  };
};

const createInitialGrid = (startPos, finishPos) => {
  const grid = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < GRID_COLS; col++) {
      currentRow.push(createNode(col, row, startPos, finishPos));
    }
    grid.push(currentRow);
  }
  return grid;
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.map(gridRow => gridRow.slice());
  const node = newGrid[row][col];
  if (node.isStart || node.isFinish) return grid;
  const newNode = { ...node, isWall: !node.isWall };
  newGrid[row][col] = newNode;
  return newGrid;
};


export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [dijkstraTime, setDijkstraTime] = useState(0);
  const [aStarTime, setAStarTime] = useState(0);

  const [startNodePos, setStartNodePos] = useState({
    row: DEFAULT_START_NODE_ROW,
    col: DEFAULT_START_NODE_COL,
  });
  const [finishNodePos, setFinishNodePos] = useState({
    row: DEFAULT_FINISH_NODE_ROW,
    col: DEFAULT_FINISH_NODE_COL,
  });
  const [isMovingStart, setIsMovingStart] = useState(false);
  const [isMovingFinish, setIsMovingFinish] = useState(false);


  useEffect(() => {
    const newGrid = createInitialGrid(startNodePos, finishNodePos);
    setGrid(newGrid);
  }, []);

  // --- MOUSE HANDLERS ---
  const handleMouseDown = useCallback((row, col) => {
    if (isVisualizing) return;

    if (row === startNodePos.row && col === startNodePos.col) {
      setIsMovingStart(true);
    } else if (row === finishNodePos.row && col === finishNodePos.col) {
      setIsMovingFinish(true);
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
      setIsMousePressed(true);
    }
  }, [grid, isVisualizing, startNodePos, finishNodePos]);

  const handleMouseEnter = useCallback((row, col) => {
    if (isVisualizing) return;

    if (isMovingStart) {
      
      setStartNodePos(prevPos => {
        // This 'prevPos' is guaranteed to be the latest state
        const newPos = { row, col };

        // also use a functional update for setGrid
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(gridRow => gridRow.slice());
          
          // 1. Clear the node at the *previous* position
          const oldStartNode = newGrid[prevPos.row][prevPos.col];
          const newOldStartNode = { ...oldStartNode, isStart: false };
          newGrid[prevPos.row][prevPos.col] = newOldStartNode;

          // 2. Set the node at the *new* position
          const newStartNode = newGrid[newPos.row][newPos.col];
          const newNewStartNode = { ...newStartNode, isStart: true, isWall: false };
          newGrid[newPos.row][newPos.col] = newNewStartNode;
          
          return newGrid;
        });

        return newPos; // This becomes the new 'startNodePos'
      });
    } else if (isMovingFinish) {
      
      setFinishNodePos(prevPos => {
        const newPos = { row, col };
        
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(gridRow => gridRow.slice());
          const oldFinishNode = newGrid[prevPos.row][prevPos.col];
          const newOldFinishNode = { ...oldFinishNode, isFinish: false };
          newGrid[prevPos.row][prevPos.col] = newOldFinishNode;
          
          const newFinishNode = newGrid[newPos.row][newPos.col];
          const newNewFinishNode = { ...newFinishNode, isFinish: true, isWall: false };
          newGrid[newPos.row][newPos.col] = newNewFinishNode;
          
          return newGrid;
        });

        return newPos;
      });
    } else if (isMousePressed) {
      
      setGrid(prevGrid => {
        return getNewGridWithWallToggled(prevGrid, row, col);
      });
    }
  }, [isVisualizing, isMousePressed, isMovingStart, isMovingFinish]); 

  const handleMouseUp = useCallback(() => {
    setIsMousePressed(false);
    setIsMovingStart(false);
    setIsMovingFinish(false);
  }, []);

  const handleMouseLeaveGrid = useCallback(() => {
    // If the mouse leaves the grid, stop all dragging actions
    setIsMousePressed(false);
    setIsMovingStart(false);
    setIsMovingFinish(false);
  }, []);
  





  // --- CLEAR FUNCTIONS ---
  const clearAllAnimations = () => {
    for (const row of grid) {
      for (const node of row) {
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (node.isStart) {
          nodeElement.className = 'node node-start';
        } else if (node.isFinish) {
          nodeElement.className = 'node node-finish';
        } else if (node.isWall) {
          nodeElement.className = 'node node-wall';
        } else {
          nodeElement.className = 'node';
        }
      }
    }
  }

  const handleClearBoard = () => {
    if (isVisualizing) return;
    const startPos = { row: DEFAULT_START_NODE_ROW, col: DEFAULT_START_NODE_COL };
    const finishPos = { row: DEFAULT_FINISH_NODE_ROW, col: DEFAULT_FINISH_NODE_COL };
    setStartNodePos(startPos);
    setFinishNodePos(finishPos);
    
    const newGrid = createInitialGrid(startPos, finishPos);
    setGrid(newGrid);
    setDijkstraTime(0);
    setAStarTime(0);
  };

  const handleClearPath = () => {
    if (isVisualizing) return;
    clearAllAnimations();
    setDijkstraTime(0);
    setAStarTime(0);
    
    const newGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        distance: Infinity,
        previousNode: null,
      }))
    );
    setGrid(newGrid);
  };

  // ANIMATION FUNCTIONS
  const animateShortestPath = (nodesInShortestPathOrder) => { 
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) { 
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i]; 
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-path';
        }
      }, 50 * i); 
    }
  };

  const animateVisualization = (visitedNodesInOrder, nodesInShortestPathOrder) => { 
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i); 
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';
        }
      }, 10 * i);
    }
  };

  // --- VISUALIZE FUNCTIONS 
  const visualizeDijkstra = () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    clearAllAnimations();

    const gridCopy = grid.map(row => 
      row.map(node => ({
        ...node,
        isVisited: false,
        distance: Infinity,
        previousNode: null,
        fScore: Infinity,
        gScore: Infinity,
        hScore: Infinity,
      }))
    );
    
    setTimeout(() => {
      const startNode = gridCopy[startNodePos.row][startNodePos.col];
      const finishNode = gridCopy[finishNodePos.row][finishNodePos.col]; // <-- FIX
      
      const startTime = performance.now();
      const visitedNodesInOrder = dijkstra(gridCopy, startNode, finishNode);
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode); 
      const totalAnimationTime = 
        (visitedNodesInOrder.length * 10) + (nodesInShortestPathOrder.length * 50);

      animateVisualization(visitedNodesInOrder, nodesInShortestPathOrder); 
      
      setTimeout(() => {
        setIsVisualizing(false);
        setDijkstraTime(timeTaken);
        setAStarTime(0);
      }, totalAnimationTime + 500);
    }, 10);
  };

  const visualizeAStar = () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    clearAllAnimations();

    const gridCopy = grid.map(row => 
      row.map(node => ({
        ...node,
        isVisited: false,
        distance: Infinity,
        previousNode: null,
        fScore: Infinity,
        gScore: Infinity,
        hScore: Infinity,
      }))
    );

    setTimeout(() => {
      const startNode = gridCopy[startNodePos.row][startNodePos.col];
      const finishNode = gridCopy[finishNodePos.row][finishNodePos.col];  
      
      const startTime = performance.now();
      const visitedNodesInOrder = astar(gridCopy, startNode, finishNode); 
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode); 
      const totalAnimationTime = 
        (visitedNodesInOrder.length * 10) + (nodesInShortestPathOrder.length * 50);

      animateVisualization(visitedNodesInOrder, nodesInShortestPathOrder); 
      
      setTimeout(() => {
        setIsVisualizing(false);
        setAStarTime(timeTaken);
        setDijkstraTime(0);
      }, totalAnimationTime + 500);
    }, 10);
  };

  
  return (
    <>
       <Tutorial /> 
      
      <nav className="navbar">
        <div className="navbar-buttons">
          <button
            className="visualize-button"
            onClick={visualizeDijkstra}
            disabled={isVisualizing}
          >
            Visualize Dijkstra's
          </button>
          <button
            className="visualize-button"
            onClick={visualizeAStar}
            disabled={isVisualizing}
          >
            Visualize A* Search
          </button>
          <button 
            className="clear-button" 
            onClick={handleClearPath}
            disabled={isVisualizing}
          >
            Clear Path
          </button>
        
          <button 
            className="clear-button" 
            onClick={handleClearBoard}
            disabled={isVisualizing}
          >
            Clear Board
          </button>
        </div>
        <div className="time-display">
          {dijkstraTime > 0 && (
            <p>Dijkstra: <span>{dijkstraTime.toFixed(2)} ms</span></p>
          )}
          {aStarTime > 0 && (
            <p>A* Search: <span>{aStarTime.toFixed(2)} ms</span></p>
          )}
        </div>
      </nav>

      <div className="grid">
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="grid-row">
              {row.map((node, nodeIndex) => {
                const { row, col, isStart, isFinish, isWall } = node;
                return (
                  <Node
                    key={nodeIndex}
                    col={col}
                    row={row}
                    isStart={isStart}
                    isFinish={isFinish}
                    isWall={isWall}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onMouseUp={handleMouseUp}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}