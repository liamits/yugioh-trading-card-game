import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CharacterSelect.css'

function CharacterSelect() {
  const navigate = useNavigate()
  const [characters, setCharacters] = useState([])
  const [playerCharacter, setPlayerCharacter] = useState(null)
  const [aiCharacter, setAiCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectingFor, setSelectingFor] = useState('player') // 'player' or 'ai'

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/characters')
      const data = await response.json()
      setCharacters(data)
    } catch (error) {
      console.error('Error fetching characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCharacterSelect = (character) => {
    if (selectingFor === 'player') {
      setPlayerCharacter(character)
      setSelectingFor('ai')
    } else {
      setAiCharacter(character)
    }
  }

  const startDuel = () => {
    if (playerCharacter && aiCharacter) {
      navigate('/duel', {
        state: {
          player: playerCharacter,
          ai: aiCharacter
        }
      })
    }
  }

  const resetSelection = () => {
    setPlayerCharacter(null)
    setAiCharacter(null)
    setSelectingFor('player')
  }

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Characters...</h2>
      </div>
    )
  }

  return (
    <div className="character-select">
      <button className="back-btn" onClick={() => navigate('/game')}>
        ← Back
      </button>

      {/* Top Section - Large Avatars */}
      <div className="battle-preview">
        <div className="fighter-display player-display">
          {playerCharacter ? (
            <>
              <img src={playerCharacter.avatar} alt={playerCharacter.name} className="fighter-avatar" />
              <div className="fighter-info">
                <h2>{playerCharacter.name}</h2>
                <p>{playerCharacter.description}</p>
                <div className="stats">
                  <span>⭐ Wins: {playerCharacter.stats.wins}</span>
                  <span>🎴 Deck: {playerCharacter.deck.main.length}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-fighter">
              <div className="question-mark">?</div>
              <p>Select Your Character</p>
            </div>
          )}
        </div>

        <div className="vs-section">
          <div className="vs-text">VS</div>
          {selectingFor === 'ai' && (
            <div className="selection-hint">
              <p>Now select AI opponent</p>
            </div>
          )}
          {playerCharacter && aiCharacter && (
            <>
              <button className="start-duel-btn" onClick={startDuel}>
                ⚔️ START DUEL
              </button>
              <button className="reset-btn" onClick={resetSelection}>
                🔄 Reset
              </button>
            </>
          )}
        </div>

        <div className="fighter-display ai-display">
          {aiCharacter ? (
            <>
              <img src={aiCharacter.avatar} alt={aiCharacter.name} className="fighter-avatar" />
              <div className="fighter-info">
                <h2>{aiCharacter.name}</h2>
                <p>{aiCharacter.description}</p>
                <div className="stats">
                  <span>⭐ Wins: {aiCharacter.stats.wins}</span>
                  <span>🎴 Deck: {aiCharacter.deck.main.length}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-fighter">
              <div className="question-mark">?</div>
              <p>Select AI Opponent</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Character Grid */}
      <div className="selection-area">
        <div className="selection-header">
          <h3>
            {selectingFor === 'player' ? '👤 SELECT YOUR CHARACTER' : '🤖 SELECT AI OPPONENT'}
          </h3>
        </div>
        
        <div className="character-grid">
          {characters.map((char) => {
            const isSelected = 
              (selectingFor === 'player' && playerCharacter?._id === char._id) ||
              (selectingFor === 'ai' && aiCharacter?._id === char._id)
            
            const isDisabled = 
              (selectingFor === 'ai' && playerCharacter?._id === char._id)

            return (
              <div
                key={char._id}
                className={`character-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleCharacterSelect(char)}
              >
                <img src={char.avatar} alt={char.name} />
                <div className="character-name">{char.name}</div>
                {isSelected && <div className="selected-badge">✓</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CharacterSelect
