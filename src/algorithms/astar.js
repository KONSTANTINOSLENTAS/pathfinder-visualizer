

export function astar(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const unvisitedNodes = getAllNodes(grid); // 1. Get all nodes (resets them)

  e
  startNode.distance = 0;
  startNode.gScore = 0;
  startNode.hScore = calculateHeuristic(startNode, finishNode); // Correctly calculate hScore
  startNode.fScore = startNode.gScore + startNode.hScore;

  while (!!unvisitedNodes.length) {
    sortNodesByFScore(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.isWall) continue;
   
    if (closestNode.fScore === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    updateUnvisitedNeighborsAStar(closestNode, grid, finishNode);
  }
}


function calculateHeuristic(node, finishNode) {
  const dx = Math.abs(node.col - finishNode.col);
  const dy = Math.abs(node.row - finishNode.row);
  return dx + dy;
}


function updateUnvisitedNeighborsAStar(node, grid, finishNode) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    
    const gScore = node.gScore + 1; 

    if (gScore < neighbor.gScore) {
      neighbor.gScore = gScore;
      neighbor.hScore = calculateHeuristic(neighbor, finishNode);
      neighbor.fScore = neighbor.gScore + neighbor.hScore;
      neighbor.distance = neighbor.gScore; 
      neighbor.previousNode = node;
    }
  }
}

// 
function sortNodesByFScore(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.fScore - nodeB.fScore);
}

// 

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}


export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}