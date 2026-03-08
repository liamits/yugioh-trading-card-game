import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  const [filters, setFilters] = useState({
    cardType: 'all',
    monsterType: 'all',
    spellType: 'all',
    trapType: 'all',
    level: 'all'
  })

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php')
      const data = await response.json()
      setCards(data.data)
      setFilteredCards(data.data)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (searchValue = searchTerm, filterValues = filters) => {
    let filtered = cards

    if (searchValue !== '') {
      const term = searchValue.toLowerCase()
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(term) ||
        card.type.toLowerCase().includes(term) ||
        (card.desc && card.desc.toLowerCase().includes(term))
      )
    }

    if (filterValues.cardType !== 'all') {
      if (filterValues.cardType === 'monster') {
        filtered = filtered.filter(card => card.type.includes('Monster'))
      } else if (filterValues.cardType === 'spell') {
        filtered = filtered.filter(card => card.type === 'Spell Card')
      } else if (filterValues.cardType === 'trap') {
        filtered = filtered.filter(card => card.type === 'Trap Card')
      }
    }

    if (filterValues.monsterType !== 'all' && filterValues.cardType === 'monster') {
      filtered = filtered.filter(card => {
        const type = card.type.toLowerCase()
        return type.includes(filterValues.monsterType)
      })
    }

    if (filterValues.spellType !== 'all' && filterValues.cardType === 'spell') {
      filtered = filtered.filter(card => {
        const race = card.race.toLowerCase()
        return race.includes(filterValues.spellType)
      })
    }

    if (filterValues.trapType !== 'all' && filterValues.cardType === 'trap') {
      filtered = filtered.filter(card => {
        const race = card.race.toLowerCase()
        return race.includes(filterValues.trapType)
      })
    }

    if (filterValues.level !== 'all') {
      const levelNum = parseInt(filterValues.level)
      filtered = filtered.filter(card => card.level === levelNum)
    }

    setFilteredCards(filtered)
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    applyFilters(term, filters)
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    
    if (filterType === 'cardType') {
      newFilters.monsterType = 'all'
      newFilters.spellType = 'all'
      newFilters.trapType = 'all'
      newFilters.level = 'all'
    }
    
    setFilters(newFilters)
    applyFilters(searchTerm, newFilters)
  }

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Yu-Gi-Oh Cards...</h2>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎴 Yu-Gi-Oh Card Search</h1>
        <p>Total Cards: {cards.length}</p>
        <button className="play-now-btn" onClick={() => navigate('/game')}>
          ⚔️ Play Now
        </button>
      </header>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, type, or description..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        
        <div className="filters">
          <select 
            value={filters.cardType} 
            onChange={(e) => handleFilterChange('cardType', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Cards</option>
            <option value="monster">Monster</option>
            <option value="spell">Spell</option>
            <option value="trap">Trap</option>
          </select>

          {filters.cardType === 'monster' && (
            <>
              <select 
                value={filters.monsterType} 
                onChange={(e) => handleFilterChange('monsterType', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Monsters</option>
                <option value="normal">Normal</option>
                <option value="effect">Effect</option>
                <option value="fusion">Fusion</option>
                <option value="synchro">Synchro</option>
                <option value="xyz">XYZ</option>
                <option value="link">Link</option>
                <option value="ritual">Ritual</option>
                <option value="pendulum">Pendulum</option>
              </select>

              <select 
                value={filters.level} 
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                {[...Array(13)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                ))}
              </select>
            </>
          )}

          {filters.cardType === 'spell' && (
            <select 
              value={filters.spellType} 
              onChange={(e) => handleFilterChange('spellType', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Spells</option>
              <option value="normal">Normal</option>
              <option value="continuous">Continuous</option>
              <option value="quick-play">Quick-Play</option>
              <option value="equip">Equip</option>
              <option value="field">Field</option>
              <option value="ritual">Ritual</option>
            </select>
          )}

          {filters.cardType === 'trap' && (
            <select 
              value={filters.trapType} 
              onChange={(e) => handleFilterChange('trapType', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Traps</option>
              <option value="normal">Normal</option>
              <option value="continuous">Continuous</option>
              <option value="counter">Counter</option>
            </select>
          )}
        </div>

        <p className="results-count">Found: {filteredCards.length} cards</p>
      </div>

      <div className="cards-grid">
        {filteredCards.map(card => (
          <div 
            key={card.id} 
            className="card"
            onClick={() => setSelectedCard(card)}
          >
            <img 
              src={card.card_images[0].image_url_small} 
              alt={card.name}
              loading="lazy"
            />
            <h3>{card.name}</h3>
            <p className="card-type">{card.type}</p>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div className="modal" onClick={() => setSelectedCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCard(null)}>×</button>
            <img 
              src={selectedCard.card_images[0].image_url} 
              alt={selectedCard.name}
            />
            <div className="modal-info">
              <h2>{selectedCard.name}</h2>
              <p><strong>Type:</strong> {selectedCard.type}</p>
              {selectedCard.atk !== undefined && <p><strong>ATK:</strong> {selectedCard.atk}</p>}
              {selectedCard.def !== undefined && <p><strong>DEF:</strong> {selectedCard.def}</p>}
              {selectedCard.level && <p><strong>Level:</strong> {selectedCard.level}</p>}
              {selectedCard.attribute && <p><strong>Attribute:</strong> {selectedCard.attribute}</p>}
              <p className="description">{selectedCard.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
