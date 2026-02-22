/**
 * A* solver for 3x3 sliding puzzle.
 * State: flat array of 9 numbers, 0 = empty.
 * Goal: [1, 2, 3, 4, 5, 6, 7, 8, 0]
 */

const SIZE = 3;
const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function stateToKey(state) {
  return state.join(',');
}

function getEmptyIndex(state) {
  return state.indexOf(0);
}

function getNeighbors(state) {
  const empty = getEmptyIndex(state);
  const row = Math.floor(empty / SIZE);
  const col = empty % SIZE;
  const neighbors = [];

  const moves = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];

  for (const [dr, dc] of moves) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      const swapIdx = nr * SIZE + nc;
      const next = [...state];
      next[empty] = state[swapIdx];
      next[swapIdx] = 0;
      neighbors.push(next);
    }
  }
  return neighbors;
}

/** Manhattan distance heuristic: sum of distances of each tile from its goal position */
function heuristic(state) {
  let h = 0;
  for (let i = 0; i < state.length; i++) {
    const val = state[i];
    if (val === 0) continue;
    const goalIdx = val - 1;
    const currRow = Math.floor(i / SIZE);
    const currCol = i % SIZE;
    const goalRow = Math.floor(goalIdx / SIZE);
    const goalCol = goalIdx % SIZE;
    h += Math.abs(currRow - goalRow) + Math.abs(currCol - goalCol);
  }
  return h;
}

/** A* search. Returns array of states from current to goal, or null if unsolvable. */
export function solve(initialState) {
  if (stateToKey(initialState) === stateToKey(GOAL)) {
    return [initialState];
  }

  const openSet = new Map();
  const cameFrom = new Map();
  const gScore = new Map();
  const startKey = stateToKey(initialState);
  openSet.set(startKey, { state: initialState, f: heuristic(initialState) });
  gScore.set(startKey, 0);

  while (openSet.size > 0) {
    let bestKey = null;
    let bestF = Infinity;
    for (const [key, node] of openSet) {
      if (node.f < bestF) {
        bestF = node.f;
        bestKey = key;
      }
    }

    if (bestKey === null) break;

    const current = openSet.get(bestKey).state;
    openSet.delete(bestKey);

    if (bestKey === stateToKey(GOAL)) {
      const path = [];
      let key = bestKey;
      while (key) {
        const state = key.split(',').map(Number);
        path.unshift(state);
        key = cameFrom.get(key);
      }
      return path;
    }

    const currentG = gScore.get(bestKey);
    for (const neighbor of getNeighbors(current)) {
      const neighborKey = stateToKey(neighbor);
      const tentativeG = currentG + 1;
      const prevG = gScore.get(neighborKey);
      if (prevG === undefined || tentativeG < prevG) {
        cameFrom.set(neighborKey, bestKey);
        gScore.set(neighborKey, tentativeG);
        const f = tentativeG + heuristic(neighbor);
        openSet.set(neighborKey, { state: neighbor, f });
      }
    }
  }

  return null;
}

/** Check if a puzzle state is solvable (invariant: even number of inversions for 3x3). */
export function isSolvable(state) {
  let inversions = 0;
  const arr = state.filter((n) => n !== 0);
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

export { GOAL };
