import { useNavigate } from 'react-router-dom'
import './Game.css'

function Game() {
  const navigate = useNavigate()

  return (
    <div className="game-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Cards
      </button>

      <div className="game-content">
        <h1 className="game-title">⚔️ Yu-Gi-Oh Duel Arena</h1>
        <p className="game-subtitle">Coming Soon...</p>
        
        <div className="game-features">
          <div className="feature-card" onClick={() => navigate('/character-select')}>
            <div className="feature-icon">🎮</div>
            <h3>Play vs AI</h3>
            <p>Challenge the computer in epic duels</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🃏</div>
            <h3>Build Decks</h3>
            <p>Create your ultimate deck strategy</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Battles</h3>
            <p>Experience fast-paced card battles</p>
          </div>
        </div>

        <div className="coming-soon-box">
          <h2>🚧 Under Development</h2>
          <p>We're working hard to bring you an amazing Yu-Gi-Oh gaming experience!</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: '35%'}}></div>
          </div>
          <p className="progress-text">35% Complete</p>
        </div>
      </div>
    </div>
  )
}

export default Game
