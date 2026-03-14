import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CardSearch.css'

function CardSearch() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  const [filters, setFilters] = useState({
    cardType: 'all', monsterType: 'all', spellType: 'all', trapType: 'all', level: 'all'
  })

  useEffect(() => { fetchCards() }, [])

  const fetchCards = async () => {
    try {
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
    if (searchValue) {
      const term = searchValue.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term) ||
        (c.desc && c.desc.toLowerCase().includes(term))
      )
    }
    if (filterValues.cardType !== 'all') {
      if (filterValues.cardType === 'monster') filtered = filtered.filter(c => c.type.includes('Monster'))
      else if (filterValues.cardType === 'spell') filtered = filtered.filter(c => c.type === 'Spell Card')
      else if (filterValues.cardType === 'trap') filtered = filtered.filter(c => c.type === 'Trap Card')
    }
    if (filterValues.monsterType !== 'all' && filterValues.cardType === 'monster')
      filtered = filtered.filter(c => c.type.toLowerCase().includes(filterValues.monsterType))
    if (filterValues.spellType !== 'all' && filterValues.cardType === 'spell')
      filtered = filtered.filter(c => c.race.toLowerCase().includes(filterValues.spellType))
    if (filterValues.trapType !== 'all' && filterValues.cardType === 'trap')
      filtered = filtered.filter(c => c.race.toLowerCase().includes(filterValues.trapType))
    if (filterValues.level !== 'all')
      filtered = filtered.filter(c => c.level === parseInt(filterValues.level))
    setFilteredCards(filtered)
  }

  const handleSearch = (e) => {
    const term = e.target.value
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

  return (
    <div className="card-search-page">
      {/* Navbar */}
      <nav className="cs-navbar">
        <div className="cs-logo" onClick={() => navigate('/')}>
          <span style={{ color: '#8ab4f8' }}>YU</span>
          <span style={{ color: '#c58af9' }}>GI</span>
          <span style={{ color: '#ff77c6' }}>OH</span>
          <span className="cs-logo-meta">META</span>
        </div>
        <div className="cs-nav-links">
          <a href="#" className="cs-nav-link" onClick={() => navigate('/')}>🏠 Trang chủ</a>
          <a href="#" className="cs-nav-link active">🔍 Tìm kiếm bài</a>
          <a href="#" className="cs-nav-link" onClick={() => navigate('/game')}>⚔️ Chơi ngay</a>
        </div>
      </nav>

      <div className="cs-content">
        <div className="cs-header">
          <h1>🔍 Tìm kiếm bài Yu-Gi-Oh!</h1>
          <p>Tra cứu hơn {cards.length.toLocaleString()} lá bài</p>
        </div>

        {/* Search & Filters */}
        <div className="cs-search-bar">
          <input
            type="text"
            placeholder="Tìm theo tên, loại, hoặc mô tả..."
            value={searchTerm}
            onChange={handleSearch}
            className="cs-input"
          />
          <div className="cs-filters">
            <select value={filters.cardType} onChange={e => handleFilterChange('cardType', e.target.value)} className="cs-select">
              <option value="all">Tất cả</option>
              <option value="monster">Monster</option>
              <option value="spell">Spell</option>
              <option value="trap">Trap</option>
            </select>
            {filters.cardType === 'monster' && (
              <>
                <select value={filters.monsterType} onChange={e => handleFilterChange('monsterType', e.target.value)} className="cs-select">
                  <option value="all">Tất cả Monster</option>
                  <option value="normal">Normal</option>
                  <option value="effect">Effect</option>
                  <option value="fusion">Fusion</option>
                  <option value="synchro">Synchro</option>
                  <option value="xyz">XYZ</option>
                  <option value="link">Link</option>
                  <option value="ritual">Ritual</option>
                  <option value="pendulum">Pendulum</option>
                </select>
                <select value={filters.level} onChange={e => handleFilterChange('level', e.target.value)} className="cs-select">
                  <option value="all">Tất cả Level</option>
                  {[...Array(13)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                  ))}
                </select>
              </>
            )}
            {filters.cardType === 'spell' && (
              <select value={filters.spellType} onChange={e => handleFilterChange('spellType', e.target.value)} className="cs-select">
                <option value="all">Tất cả Spell</option>
                <option value="normal">Normal</option>
                <option value="continuous">Continuous</option>
                <option value="quick-play">Quick-Play</option>
                <option value="equip">Equip</option>
                <option value="field">Field</option>
                <option value="ritual">Ritual</option>
              </select>
            )}
            {filters.cardType === 'trap' && (
              <select value={filters.trapType} onChange={e => handleFilterChange('trapType', e.target.value)} className="cs-select">
                <option value="all">Tất cả Trap</option>
                <option value="normal">Normal</option>
                <option value="continuous">Continuous</option>
                <option value="counter">Counter</option>
              </select>
            )}
          </div>
          <span className="cs-count">Tìm thấy: {filteredCards.length} lá</span>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="cs-loading">
            <div className="cs-spinner" />
            <p>Đang tải dữ liệu bài...</p>
          </div>
        ) : (
          <div className="cs-grid">
            {filteredCards.map(card => (
              <div key={card.id} className="cs-card" onClick={() => setSelectedCard(card)}>
                <img src={card.card_images[0].image_url_small} alt={card.name} loading="lazy" />
                <div className="cs-card-info">
                  <p className="cs-card-name">{card.name}</p>
                  <p className="cs-card-type">{card.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="cs-modal" onClick={() => setSelectedCard(null)}>
          <div className="cs-modal-content" onClick={e => e.stopPropagation()}>
            <button className="cs-close" onClick={() => setSelectedCard(null)}>×</button>
            <img src={selectedCard.card_images[0].image_url} alt={selectedCard.name} />
            <div className="cs-modal-info">
              <h2>{selectedCard.name}</h2>
              <p><strong>Loại:</strong> {selectedCard.type}</p>
              {selectedCard.atk !== undefined && <p><strong>ATK:</strong> {selectedCard.atk}</p>}
              {selectedCard.def !== undefined && <p><strong>DEF:</strong> {selectedCard.def}</p>}
              {selectedCard.level && <p><strong>Level:</strong> {selectedCard.level}</p>}
              {selectedCard.attribute && <p><strong>Attribute:</strong> {selectedCard.attribute}</p>}
              {selectedCard.race && <p><strong>Race:</strong> {selectedCard.race}</p>}
              <p className="cs-desc">{selectedCard.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardSearch
