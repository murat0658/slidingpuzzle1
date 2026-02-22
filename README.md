# Sliding Puzzle (A* Solver)

A 3×3 sliding puzzle built with React. It includes an **A*** solver that finds an optimal solution and can play the solution step-by-step.

## Run

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (e.g. http://localhost:5173).

## How it works

- **Shuffle** – Generates a random solvable puzzle.
- **Solve (A*)** – Runs A* with Manhattan distance heuristic and computes the shortest sequence of moves to the goal.
- **Play solution** – Animates the computed solution move by move (≈400 ms per step).

You can also move tiles manually by clicking a tile adjacent to the empty cell.

## Tech

- React 18 + Vite
- A* search with Manhattan distance heuristic
- Solvability check so only solvable configurations are generated
