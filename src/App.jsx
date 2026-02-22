import { useState, useCallback, useRef, useEffect } from 'react'
import { solve, isSolvable, GOAL } from './solver'
import './App.css'

const SIZE = 3
const DEFAULT_IMAGE = 'https://picsum.photos/seed/slidingpuzzle/400/400'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getSolvableShuffle() {
  let state
  do {
    state = shuffleArray(GOAL)
  } while (!isSolvable(state))
  return state
}

/** For a piece number 1–8, returns CSS background-position so this tile shows the correct slice (3×3 grid). */
function pieceBackgroundPosition(piece) {
  const col = (piece - 1) % SIZE
  const row = Math.floor((piece - 1) / SIZE)
  return `${col * 50}% ${row * 50}%`
}

export default function App() {
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE)
  const [imageError, setImageError] = useState(false)
  const [board, setBoard] = useState(() => getSolvableShuffle())
  const [solution, setSolution] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [isSolving, setIsSolving] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const playIntervalRef = useRef(null)
  const fileInputRef = useRef(null)

  const isSolved = board.every((v, i) => v === GOAL[i])

  const shuffle = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = null
    }
    setIsPlaying(false)
    setSolution(null)
    setStepIndex(0)
    setMoveCount(0)
    setBoard(getSolvableShuffle())
    setIsSolving(false)
  }, [])

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setImageError(false)
    e.target.value = ''
  }, [])

  const resetImage = useCallback(() => {
    setImageUrl(DEFAULT_IMAGE)
    setImageError(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleImageLoadError = useCallback(() => setImageError(true), [])

  const handleSolve = useCallback(() => {
    setIsSolving(true)
    setSolution(null)
    setStepIndex(0)
    const path = solve(board)
    setIsSolving(false)
    if (path) {
      setSolution(path)
      setStepIndex(0)
    }
  }, [board])

  const playSolution = useCallback(() => {
    if (!solution || solution.length <= 1) return
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = null
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    let idx = 0
    playIntervalRef.current = setInterval(() => {
      idx++
      if (idx >= solution.length) {
        if (playIntervalRef.current) clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
        setIsPlaying(false)
        return
      }
      setBoard(solution[idx])
      setStepIndex(idx)
    }, 400)
  }, [solution])

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [])

  const move = useCallback((index) => {
    if (isPlaying || solution) return
    const empty = board.indexOf(0)
    const size = SIZE
    const emptyRow = Math.floor(empty / size)
    const emptyCol = empty % size
    const tileRow = Math.floor(index / size)
    const tileCol = index % size
    const adjacent =
      (Math.abs(emptyRow - tileRow) === 1 && emptyCol === tileCol) ||
      (Math.abs(emptyCol - tileCol) === 1 && emptyRow === tileRow)
    if (!adjacent) return
    const next = [...board]
    next[empty] = board[index]
    next[index] = 0
    setBoard(next)
    setMoveCount((c) => c + 1)
  }, [board, isPlaying, solution])

  return (
    <div className="app">
      <header className="header">
        <h1>Sliding Puzzle</h1>
        <p className="subtitle">A* solves it</p>
      </header>

      <div className="image-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleImageChange}
          className="file-input"
          id="puzzle-image"
        />
        <label htmlFor="puzzle-image" className="btn btn-secondary">
          Choose image
        </label>
        <button type="button" className="btn btn-outline" onClick={resetImage}>
          Default image
        </button>
      </div>

      {/* Preload image and detect load errors */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="sr-only"
          onError={handleImageLoadError}
          onLoad={() => setImageError(false)}
        />
      )}

      {imageError && (
        <p className="image-error">Could not load image. Try another or use default.</p>
      )}

      <div className="board-wrap">
        <div className="board board-image" data-size={SIZE}>
          {board.map((value, i) => (
            <button
              key={i}
              type="button"
              className={`tile ${value === 0 ? 'empty' : ''}`}
              onClick={() => value !== 0 && move(i)}
              disabled={isPlaying}
              style={
                value !== 0 && imageUrl && !imageError
                  ? {
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: `${SIZE * 100}% ${SIZE * 100}%`,
                      backgroundPosition: pieceBackgroundPosition(value),
                    }
                  : undefined
              }
            >
              {value !== 0 && (imageError || !imageUrl) ? value : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="stats">
        <span>Moves: {moveCount}</span>
        {solution && (
          <span className="solution-info">
            Solution: {solution.length - 1} steps
          </span>
        )}
      </div>

      <div className="controls">
        <button type="button" className="btn btn-secondary" onClick={shuffle}>
          Shuffle
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSolve}
          disabled={isSolving || isSolved}
        >
          {isSolving ? 'Solving…' : 'Solve (A*)'}
        </button>
        {solution && solution.length > 1 && (
          <button
            type="button"
            className={`btn ${isPlaying ? 'btn-warning' : 'btn-accent'}`}
            onClick={playSolution}
          >
            {isPlaying ? 'Stop' : 'Play solution'}
          </button>
        )}
      </div>

      {isSolved && (
        <div className="solved-banner">Solved!</div>
      )}
    </div>
  )
}
