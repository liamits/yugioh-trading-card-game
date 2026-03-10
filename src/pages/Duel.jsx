import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Duel.css'

function Duel() {
  const location = useLocation()
  const navigate = useNavigate()
  const { player, ai } = location.state || {}

  const [playerLP, setPlayerLP] = useState(8000)
  const [aiLP, setAiLP] = useState(8000)
  const [playerHand, setPlayerHand] = useState([])
  const [aiHand, setAiHand] = useState([])
  const [playerDeck, setPlayerDeck] = useState([])
  const [aiDeck, setAiDeck] = useState([])
  const [currentTurn, setCurrentTurn] = useState('player') // 'player' or 'ai'
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showCoinToss, setShowCoinToss] = useState(true)
  const [coinFlipping, setCoinFlipping] = useState(false)
  const [coinResult, setCoinResult] = useState(null)
  const [playerChoice, setPlayerChoice] = useState(null)
  const [showExtraDeck, setShowExtraDeck] = useState(false)
  const [draggedCard, setDraggedCard] = useState(null)
  const [playerField, setPlayerField] = useState({
    monsters: [null, null, null, null, null],
    spells: [null, null, null, null, null]
  })
  const [aiField, setAiField] = useState({
    monsters: [null, null, null, null, null],
    spells: [null, null, null, null, null]
  })
  const [showCardOptions, setShowCardOptions] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)
  const [selectedAttacker, setSelectedAttacker] = useState(null)
  const [playerGraveyard, setPlayerGraveyard] = useState([])
  const [aiGraveyard, setAiGraveyard] = useState([])
  const [battlePhase, setBattlePhase] = useState(false)
  const [showGraveyard, setShowGraveyard] = useState(false)
  const [graveyardOwner, setGraveyardOwner] = useState(null)
  const [damageAnimation, setDamageAnimation] = useState({ player: null, ai: null })
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [tributeMode, setTributeMode] = useState(false)
  const [selectedTributes, setSelectedTributes] = useState([])
  const [tributeCard, setTributeCard] = useState(null)
  const [selectedHandCard, setSelectedHandCard] = useState(null)
  const [summonMode, setSummonMode] = useState(null) // 'normal', 'tribute', 'set'
  const [selectingZone, setSelectingZone] = useState(false)
  const [activatingSpell, setActivatingSpell] = useState(null)
  const [spellTargetMode, setSpellTargetMode] = useState(false)
  const [spellTargetType, setSpellTargetType] = useState(null) // 'monster', 'spell', 'player'
  const [discardingCards, setDiscardingCards] = useState(false)
  const [selectedDiscards, setSelectedDiscards] = useState([])
  const [handLimit, setHandLimit] = useState(6)

  useEffect(() => {
    if (!player || !ai) {
      navigate('/character-select')
      return
    }
  }, [])

  useEffect(() => {
    // Check win/lose condition
    if (playerLP <= 0) {
      setGameOver(true)
      setWinner('ai')
    } else if (aiLP <= 0) {
      setGameOver(true)
      setWinner('player')
    }
  }, [playerLP, aiLP])

  const handleCoinChoice = (choice) => {
    setPlayerChoice(choice)
    setCoinFlipping(true)

    // Simulate coin flip animation
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails'
      setCoinResult(result)
      setCoinFlipping(false)

      // Determine who goes first
      setTimeout(() => {
        const playerWon = (choice === 'heads' && result === 'heads') || 
                         (choice === 'tails' && result === 'tails')
        setCurrentTurn(playerWon ? 'player' : 'ai')
        
        // Close coin toss and start game
        setTimeout(() => {
          setShowCoinToss(false)
          drawInitialHands()
        }, 2000)
      }, 1000)
    }, 2000)
  }

  const shuffleDeck = (deck) => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const drawInitialHands = () => {
    if (player && ai) {
      // Shuffle decks
      const shuffledPlayerDeck = shuffleDeck(player.deck.main)
      const shuffledAiDeck = shuffleDeck(ai.deck.main)

      // Draw 5 cards
      const playerInitial = shuffledPlayerDeck.slice(0, 5)
      const aiInitial = shuffledAiDeck.slice(0, 5)

      // Set hands and remaining decks
      setPlayerHand(playerInitial)
      setAiHand(aiInitial)
      setPlayerDeck(shuffledPlayerDeck.slice(5))
      setAiDeck(shuffledAiDeck.slice(5))
    }
  }

  const handleEndTurn = () => {
    const currentHand = currentTurn === 'player' ? playerHand : aiHand
    
    // Check hand limit before ending turn
    if (currentHand.length > handLimit) {
      // Need to discard cards
      setDiscardingCards(true)
      setSelectedDiscards([])
      return
    }
    
    // Proceed with end turn
    proceedEndTurn()
  }

  const proceedEndTurn = () => {
    const nextTurn = currentTurn === 'player' ? 'ai' : 'player'
    
    // Enable trap cards that were set this turn
    const currentField = currentTurn === 'player' ? playerField : aiField
    const setCurrentField = currentTurn === 'player' ? setPlayerField : setAiField
    
    const updatedSpells = currentField.spells.map(card => {
      if (card && !card.faceUp && card.type.includes('Trap')) {
        return { ...card, canActivate: true }
      }
      return card
    })
    
    setCurrentField({ ...currentField, spells: updatedSpells })
    
    setCurrentTurn(nextTurn)
    
    // Draw a card for the next player
    if (nextTurn === 'player' && playerDeck.length > 0) {
      const newCard = playerDeck[0]
      setPlayerHand([...playerHand, newCard])
      setPlayerDeck(playerDeck.slice(1))
    } else if (nextTurn === 'ai' && aiDeck.length > 0) {
      const newCard = aiDeck[0]
      setAiHand([...aiHand, newCard])
      setAiDeck(aiDeck.slice(1))
    }
  }

  const handleDiscardSelect = (index) => {
    if (selectedDiscards.includes(index)) {
      setSelectedDiscards(selectedDiscards.filter(i => i !== index))
    } else {
      setSelectedDiscards([...selectedDiscards, index])
    }
  }

  const handleConfirmDiscard = () => {
    const currentHand = currentTurn === 'player' ? playerHand : aiHand
    const setCurrentHand = currentTurn === 'player' ? setPlayerHand : setAiHand
    const graveyard = currentTurn === 'player' ? playerGraveyard : aiGraveyard
    const setGraveyard = currentTurn === 'player' ? setPlayerGraveyard : setAiGraveyard
    
    const cardsToDiscard = currentHand.length - handLimit
    
    if (selectedDiscards.length !== cardsToDiscard) {
      alert(`Bạn phải loại bỏ ${cardsToDiscard} lá bài!`)
      return
    }
    
    // Send selected cards to graveyard
    const discardedCards = selectedDiscards.map(i => currentHand[i])
    setGraveyard([...graveyard, ...discardedCards])
    
    // Remove from hand
    const newHand = currentHand.filter((_, i) => !selectedDiscards.includes(i))
    setCurrentHand(newHand)
    
    // Reset and proceed
    setDiscardingCards(false)
    setSelectedDiscards([])
    proceedEndTurn()
  }

  const handleExtraDeckClick = () => {
    setShowExtraDeck(true)
  }

  const closeExtraDeck = () => {
    setShowExtraDeck(false)
  }

  const handleHandCardClick = (card, index) => {
    // Close context menu
    setContextMenu(null)

    // If already selected, show summon options
    if (selectedHandCard?.index === index) {
      setSelectedHandCard(null)
      return
    }

    // Select card and show summon options
    setSelectedHandCard({ card, index })
  }

  const handleSummonOption = (option) => {
    if (!selectedHandCard) return

    const card = selectedHandCard.card
    const level = card.level || 0

    // Calculate tributes needed
    let tributesNeeded = 0
    if (level >= 10) {
      tributesNeeded = 3
    } else if (level >= 7) {
      tributesNeeded = 2
    } else if (level >= 5) {
      tributesNeeded = 1
    }

    if (option === 'normal') {
      // Normal Summon Attack Position (no tribute) - only for level 1-4
      if (level >= 5) {
        alert('Monster level 5+ cần tribute summon!')
        return
      }
      setSummonMode('normal')
      setSelectingZone(true)
    } else if (option === 'defense') {
      // Normal Summon Defense Position (face-up) - only for level 1-4
      if (level >= 5) {
        alert('Monster level 5+ cần tribute summon!')
        return
      }
      setSummonMode('defense')
      setSelectingZone(true)
    } else if (option === 'tribute') {
      // Tribute Summon - only face-up for level 5+
      if (tributesNeeded === 0) {
        alert('Monster này không cần tribute!')
        return
      }

      const field = currentTurn === 'player' ? playerField : aiField
      const availableMonsters = field.monsters.filter(m => m !== null)

      if (availableMonsters.length < tributesNeeded) {
        alert(`Cần ${tributesNeeded} monster để tribute summon! (Hiện có ${availableMonsters.length})`)
        return
      }

      // Enter tribute selection mode (always face-up for tribute summon)
      setTributeMode(true)
      setTributeCard({ card, tributesNeeded, faceUp: true, availableMonsters })
      setSelectedTributes([])
    } else if (option === 'set') {
      // Set (face-down defense) - only for level 1-4 monsters or spell/trap
      if (card.type.includes('Monster') && level >= 5) {
        alert('Monster level 5+ không thể úp! Chỉ có thể Tribute Summon.')
        return
      }
      setSummonMode('set')
      setSelectingZone(true)
    }
  }

  const handleZoneSelect = (zoneIndex, type) => {
    if (!selectingZone || !selectedHandCard) return

    const field = currentTurn === 'player' ? playerField : aiField
    const setField = currentTurn === 'player' ? setPlayerField : setAiField
    const hand = currentTurn === 'player' ? playerHand : aiHand
    const setHand = currentTurn === 'player' ? setPlayerHand : setAiHand

    // Check if zone is empty
    if (type === 'monster' && field.monsters[zoneIndex]) {
      alert('Zone này đã có bài!')
      return
    }
    if (type === 'spell' && field.spells[zoneIndex]) {
      alert('Zone này đã có bài!')
      return
    }

    const card = selectedHandCard.card

    // Place card
    if (type === 'monster') {
      const newMonsters = [...field.monsters]
      
      if (summonMode === 'normal') {
        // Attack position, face-up
        newMonsters[zoneIndex] = {
          ...card,
          faceUp: true,
          position: 'attack'
        }
      } else if (summonMode === 'defense') {
        // Defense position, face-up
        newMonsters[zoneIndex] = {
          ...card,
          faceUp: true,
          position: 'defense'
        }
      } else if (summonMode === 'set') {
        // Face-down defense
        newMonsters[zoneIndex] = {
          ...card,
          faceUp: false,
          position: 'defense'
        }
      }
      
      setField({ ...field, monsters: newMonsters })
    } else {
      const newSpells = [...field.spells]
      
      // If activating spell, process effect immediately
      if (summonMode === 'activate') {
        handleSpellActivation(card, zoneIndex)
        return
      }
      
      // If setting spell/trap
      newSpells[zoneIndex] = {
        ...card,
        faceUp: false,
        canActivate: false // Can't activate until next turn
      }
      setField({ ...field, spells: newSpells })
    }

    // Remove from hand
    const newHand = hand.filter((_, i) => i !== selectedHandCard.index)
    setHand(newHand)

    // Reset states
    setSelectedHandCard(null)
    setSummonMode(null)
    setSelectingZone(false)
  }

  const handleSpellActivation = (card, zoneIndex) => {
    const isPlayerTurn = currentTurn === 'player'
    const field = isPlayerTurn ? playerField : aiField
    const setField = isPlayerTurn ? setPlayerField : setAiField
    const hand = isPlayerTurn ? playerHand : aiHand
    const setHand = isPlayerTurn ? setPlayerHand : setAiHand
    const graveyard = isPlayerTurn ? playerGraveyard : aiGraveyard
    const setGraveyard = isPlayerTurn ? setPlayerGraveyard : setAiGraveyard

    // Check spell type and handle accordingly
    const spellType = card.race || '' // race field contains spell type

    if (spellType.includes('Continuous') || spellType.includes('Field') || spellType.includes('Equip')) {
      // Continuous/Field/Equip spells stay on field
      const newSpells = [...field.spells]
      newSpells[zoneIndex] = {
        ...card,
        faceUp: true,
        isActive: true
      }
      setField({ ...field, spells: newSpells })
      
      // Remove from hand
      const newHand = hand.filter((_, i) => i !== selectedHandCard.index)
      setHand(newHand)
      
      // Show activation
      setActivatingSpell(card)
      setTimeout(() => setActivatingSpell(null), 3000)
      
      // Apply effect based on card
      applySpellEffect(card, isPlayerTurn)
    } else {
      // Normal/Quick-Play spells go to GY after activation
      // Remove from hand
      const newHand = hand.filter((_, i) => i !== selectedHandCard.index)
      setHand(newHand)
      
      // Show activation
      setActivatingSpell(card)
      setTimeout(() => {
        setActivatingSpell(null)
        // Send to GY
        setGraveyard([...graveyard, card])
      }, 3000)
      
      // Apply effect based on card
      applySpellEffect(card, isPlayerTurn)
    }

    // Reset states
    setSelectedHandCard(null)
    setSummonMode(null)
    setSelectingZone(false)
  }

  const applySpellEffect = (card, isPlayerTurn) => {
    const cardName = card.name.toLowerCase()
    
    // Common spell effects (simplified)
    if (cardName.includes('pot of greed')) {
      // Draw 2 cards
      const deck = isPlayerTurn ? playerDeck : aiDeck
      const hand = isPlayerTurn ? playerHand : aiHand
      const setDeck = isPlayerTurn ? setPlayerDeck : setAiDeck
      const setHand = isPlayerTurn ? setPlayerHand : setAiHand
      
      if (deck.length >= 2) {
        const drawnCards = deck.slice(0, 2)
        setHand([...hand, ...drawnCards])
        setDeck(deck.slice(2))
        alert(`${card.name}: Rút 2 lá bài!`)
      }
    } else if (cardName.includes('dark hole')) {
      // Destroy all monsters
      setPlayerField({ ...playerField, monsters: [null, null, null, null, null] })
      setAiField({ ...aiField, monsters: [null, null, null, null, null] })
      alert(`${card.name}: Phá hủy tất cả monsters trên field!`)
    } else if (cardName.includes('monster reborn')) {
      // Revive monster from GY (simplified - just show message)
      alert(`${card.name}: Chọn 1 monster từ GY để hồi sinh! (Tính năng đang phát triển)`)
    } else if (cardName.includes('raigeki')) {
      // Destroy all opponent monsters
      if (isPlayerTurn) {
        setAiField({ ...aiField, monsters: [null, null, null, null, null] })
      } else {
        setPlayerField({ ...playerField, monsters: [null, null, null, null, null] })
      }
      alert(`${card.name}: Phá hủy tất cả monsters của đối thủ!`)
    } else if (cardName.includes('mystical space typhoon') || cardName.includes('mst')) {
      // Destroy 1 spell/trap
      alert(`${card.name}: Chọn 1 Spell/Trap để phá hủy! (Tính năng đang phát triển)`)
    } else {
      // Generic spell activation
      alert(`Kích hoạt: ${card.name}\n\n${card.desc.substring(0, 150)}...`)
    }
  }

  const handleDragStart = (card, index) => {
    // Disabled - using click system now
    return
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDropOnMonsterZone = (zoneIndex, isCurrentPlayer) => {
    // Disabled - using click system now
    return
  }

  const handleDropOnSpellZone = (zoneIndex, isCurrentPlayer) => {
    // Disabled - using click system now
    return
  }

  const handleCardPlacement = (faceUp) => {
    if (!draggedCard || !selectedZone) return

    const card = draggedCard.card
    const handIndex = draggedCard.handIndex

    // Determine which field and hand to update
    const isPlayerTurn = currentTurn === 'player'
    const field = isPlayerTurn ? playerField : aiField
    const setField = isPlayerTurn ? setPlayerField : setAiField
    const hand = isPlayerTurn ? playerHand : aiHand
    const setHand = isPlayerTurn ? setPlayerHand : setAiHand

    // Place card on field
    if (selectedZone.type === 'monster') {
      const newMonsters = [...field.monsters]
      newMonsters[selectedZone.index] = {
        ...card,
        faceUp,
        position: faceUp ? 'attack' : 'defense'
      }
      setField({ ...field, monsters: newMonsters })
    } else {
      const newSpells = [...field.spells]
      newSpells[selectedZone.index] = {
        ...card,
        faceUp
      }
      setField({ ...field, spells: newSpells })
    }

    // Remove card from hand
    const newHand = hand.filter((_, i) => i !== handIndex)
    setHand(newHand)

    // Reset states
    setDraggedCard(null)
    setSelectedZone(null)
    setShowCardOptions(false)
  }

  const handleCardClick = (card, type, index, isCurrentPlayer) => {
    // Close context menu if open
    setContextMenu(null)

    // If clicking on set spell/trap to activate it
    if (type === 'spell' && !card.faceUp && isCurrentPlayer && !battlePhase) {
      // Check if it's a trap (can't activate same turn it was set)
      if (card.type.includes('Trap') && card.canActivate === false) {
        alert('Trap card không thể kích hoạt trong turn được set!')
        return
      }
      
      // Activate the set spell/trap
      handleSetSpellActivation(card, index)
      return
    }

    // If in battle phase and clicking own monster
    if (battlePhase && isCurrentPlayer && type === 'monster' && card.faceUp && card.position === 'attack') {
      setSelectedAttacker({ card, index })
      return
    }

    // If in battle phase and clicking opponent monster with attacker selected
    if (battlePhase && !isCurrentPlayer && type === 'monster' && selectedAttacker) {
      handleBattle(selectedAttacker, { card, index })
      return
    }
  }

  const handleSetSpellActivation = (card, zoneIndex) => {
    const isPlayerTurn = currentTurn === 'player'
    const field = isPlayerTurn ? playerField : aiField
    const setField = isPlayerTurn ? setPlayerField : setAiField
    const graveyard = isPlayerTurn ? playerGraveyard : aiGraveyard
    const setGraveyard = isPlayerTurn ? setPlayerGraveyard : setAiGraveyard

    const spellType = card.race || ''

    // Flip the card face-up
    const newSpells = [...field.spells]
    newSpells[zoneIndex] = {
      ...card,
      faceUp: true,
      isActive: true
    }
    setField({ ...field, spells: newSpells })

    // Show activation
    setActivatingSpell(card)

    // If it's not continuous/field/equip, send to GY after effect
    if (!spellType.includes('Continuous') && !spellType.includes('Field') && !spellType.includes('Equip')) {
      setTimeout(() => {
        setActivatingSpell(null)
        // Remove from field and send to GY
        const finalSpells = [...newSpells]
        finalSpells[zoneIndex] = null
        setField({ ...field, spells: finalSpells })
        setGraveyard([...graveyard, card])
      }, 3000)
    } else {
      setTimeout(() => setActivatingSpell(null), 3000)
    }

    // Apply effect
    applySpellEffect(card, isPlayerTurn)
  }

  const handleRightClick = (e, card, type, index, isCurrentPlayer) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      card,
      type,
      index,
      isCurrentPlayer
    })
  }

  const handleSendToGY = () => {
    if (!contextMenu) return

    const { card, type, index, isCurrentPlayer } = contextMenu
    const field = isCurrentPlayer ? 
      (currentTurn === 'player' ? playerField : aiField) : 
      (currentTurn === 'player' ? aiField : playerField)
    const setField = isCurrentPlayer ? 
      (currentTurn === 'player' ? setPlayerField : setAiField) : 
      (currentTurn === 'player' ? setAiField : setPlayerField)
    const graveyard = isCurrentPlayer ?
      (currentTurn === 'player' ? playerGraveyard : aiGraveyard) :
      (currentTurn === 'player' ? aiGraveyard : playerGraveyard)
    const setGraveyard = isCurrentPlayer ?
      (currentTurn === 'player' ? setPlayerGraveyard : setAiGraveyard) :
      (currentTurn === 'player' ? setAiGraveyard : setPlayerGraveyard)

    // Add to graveyard
    setGraveyard([...graveyard, card])

    // Remove from field
    if (type === 'monster') {
      const newMonsters = [...field.monsters]
      newMonsters[index] = null
      setField({ ...field, monsters: newMonsters })
    } else {
      const newSpells = [...field.spells]
      newSpells[index] = null
      setField({ ...field, spells: newSpells })
    }

    setContextMenu(null)
  }

  const handleTributeSelect = (monster) => {
    if (!tributeCard) return

    const isAlreadySelected = selectedTributes.some(m => m.id === monster.id)
    
    if (isAlreadySelected) {
      // Deselect
      setSelectedTributes(selectedTributes.filter(m => m.id !== monster.id))
    } else {
      // Select
      if (selectedTributes.length < tributeCard.tributesNeeded) {
        setSelectedTributes([...selectedTributes, monster])
      }
    }
  }

  const handleConfirmTribute = (faceUp) => {
    if (!tributeCard || selectedTributes.length !== tributeCard.tributesNeeded) {
      alert(`Vui lòng chọn ${tributeCard.tributesNeeded} monster để tribute!`)
      return
    }

    if (!selectedHandCard) return

    const isPlayerTurn = currentTurn === 'player'
    const field = isPlayerTurn ? playerField : aiField
    const setField = isPlayerTurn ? setPlayerField : setAiField
    const graveyard = isPlayerTurn ? playerGraveyard : aiGraveyard
    const setGraveyard = isPlayerTurn ? setPlayerGraveyard : setAiGraveyard
    const hand = isPlayerTurn ? playerHand : aiHand
    const setHand = isPlayerTurn ? setPlayerHand : setAiHand

    // Close tribute modal first
    setTributeMode(false)

    // Show tribute animation with video
    const tributeAnimation = document.createElement('div')
    tributeAnimation.className = 'tribute-summon-animation'
    tributeAnimation.innerHTML = `
      <video class="tribute-video" autoplay muted playsinline>
        <source src="/sounds/tribute-summon.mp4" type="video/mp4">
      </video>
      <div class="tribute-overlay">
        <div class="tribute-flash"></div>
        <div class="tribute-particles">
          ${Array(20).fill(0).map((_, i) => `<div class="particle" style="--angle: ${i * 18}deg"></div>`).join('')}
        </div>
        <div class="tribute-text">
          <h2>🔥 TRIBUTE SUMMON! 🔥</h2>
          <p>${tributeCard.card.name}</p>
        </div>
      </div>
    `
    document.body.appendChild(tributeAnimation)

    // Add screen shake
    document.querySelector('.duel-field').classList.add('screen-shake')

    // Get video element and handle its end
    const video = tributeAnimation.querySelector('.tribute-video')
    const animationDuration = 2000 // 2 seconds for video + effects

    // Wait for animation
    setTimeout(() => {
      // Send tributed monsters to GY
      setGraveyard([...graveyard, ...selectedTributes.map(m => m.card)])

      // Remove tributed monsters from field
      const newMonsters = [...field.monsters]
      selectedTributes.forEach(monster => {
        const index = newMonsters.findIndex(m => m && m.id === monster.card.id)
        if (index !== -1) {
          newMonsters[index] = null
        }
      })

      // Find first empty zone to place new monster
      const emptyZoneIndex = newMonsters.findIndex(m => m === null)
      if (emptyZoneIndex === -1) {
        alert('Không có zone trống!')
        tributeAnimation.remove()
        document.querySelector('.duel-field').classList.remove('screen-shake')
        return
      }

      // Place new monster (use faceUp from tributeCard if set during tribute selection)
      const shouldBeFaceUp = tributeCard.faceUp !== undefined ? tributeCard.faceUp : faceUp
      newMonsters[emptyZoneIndex] = {
        ...tributeCard.card,
        faceUp: shouldBeFaceUp,
        position: shouldBeFaceUp ? 'attack' : 'defense',
        justSummoned: true
      }

      setField({ ...field, monsters: newMonsters })

      // Remove from hand
      const newHand = hand.filter((_, i) => i !== selectedHandCard.index)
      setHand(newHand)

      // Remove animation and shake
      setTimeout(() => {
        tributeAnimation.remove()
        document.querySelector('.duel-field').classList.remove('screen-shake')
        
        // Remove justSummoned flag after animation
        setTimeout(() => {
          const finalMonsters = [...newMonsters]
          if (finalMonsters[emptyZoneIndex]) {
            delete finalMonsters[emptyZoneIndex].justSummoned
            setField({ ...field, monsters: finalMonsters })
          }
        }, 1000)
      }, 500)

      // Reset states
      setSelectedTributes([])
      setTributeCard(null)
      setSelectedHandCard(null)
    }, animationDuration)
  }

  const handleCancelTribute = () => {
    setTributeMode(false)
    setSelectedTributes([])
    setTributeCard(null)
  }

  const handleBattle = (attacker, defender) => {
    const attackerCard = attacker.card
    const defenderCard = defender.card

    const isPlayerAttacking = currentTurn === 'player'
    const attackerField = isPlayerAttacking ? playerField : aiField
    const defenderField = isPlayerAttacking ? aiField : playerField
    const setAttackerField = isPlayerAttacking ? setPlayerField : setAiField
    const setDefenderField = isPlayerAttacking ? setAiField : setPlayerField
    const attackerGY = isPlayerAttacking ? playerGraveyard : aiGraveyard
    const defenderGY = isPlayerAttacking ? aiGraveyard : playerGraveyard
    const setAttackerGY = isPlayerAttacking ? setPlayerGraveyard : setAiGraveyard
    const setDefenderGY = isPlayerAttacking ? setAiGraveyard : setPlayerGraveyard

    let battleLog = ''
    let damage = 0

    // Battle calculation
    if (defenderCard.faceUp) {
      if (defenderCard.position === 'attack') {
        // Attack vs Attack
        const atkDiff = attackerCard.atk - defenderCard.atk
        
        if (atkDiff > 0) {
          // Attacker wins
          battleLog = `${attackerCard.name} (${attackerCard.atk}) phá hủy ${defenderCard.name} (${defenderCard.atk})!`
          damage = atkDiff
          
          // Destroy defender
          const newDefenderMonsters = [...defenderField.monsters]
          setDefenderGY([...defenderGY, defenderCard])
          newDefenderMonsters[defender.index] = null
          setDefenderField({ ...defenderField, monsters: newDefenderMonsters })
          
          // Damage to defender
          if (isPlayerAttacking) {
            animateLP('ai', damage)
          } else {
            animateLP('player', damage)
          }
        } else if (atkDiff < 0) {
          // Defender wins
          battleLog = `${defenderCard.name} (${defenderCard.atk}) phá hủy ${attackerCard.name} (${attackerCard.atk})!`
          damage = Math.abs(atkDiff)
          
          // Destroy attacker
          const newAttackerMonsters = [...attackerField.monsters]
          setAttackerGY([...attackerGY, attackerCard])
          newAttackerMonsters[attacker.index] = null
          setAttackerField({ ...attackerField, monsters: newAttackerMonsters })
          
          // Damage to attacker
          if (isPlayerAttacking) {
            animateLP('player', damage)
          } else {
            animateLP('ai', damage)
          }
        } else {
          // Draw - both destroyed
          battleLog = `Cả hai quái thú bị phá hủy!`
          
          const newAttackerMonsters = [...attackerField.monsters]
          const newDefenderMonsters = [...defenderField.monsters]
          
          setAttackerGY([...attackerGY, attackerCard])
          setDefenderGY([...defenderGY, defenderCard])
          
          newAttackerMonsters[attacker.index] = null
          newDefenderMonsters[defender.index] = null
          
          setAttackerField({ ...attackerField, monsters: newAttackerMonsters })
          setDefenderField({ ...defenderField, monsters: newDefenderMonsters })
        }
      } else {
        // Attack vs Defense
        const atkVsDef = attackerCard.atk - defenderCard.def
        
        if (atkVsDef > 0) {
          // Attacker wins
          battleLog = `${attackerCard.name} (${attackerCard.atk}) phá hủy ${defenderCard.name} (DEF ${defenderCard.def})!`
          
          // Destroy defender
          const newDefenderMonsters = [...defenderField.monsters]
          setDefenderGY([...defenderGY, defenderCard])
          newDefenderMonsters[defender.index] = null
          setDefenderField({ ...defenderField, monsters: newDefenderMonsters })
        } else if (atkVsDef < 0) {
          // Defender survives
          battleLog = `${defenderCard.name} (DEF ${defenderCard.def}) chặn được tấn công!`
          damage = Math.abs(atkVsDef)
          
          // Damage to attacker
          if (isPlayerAttacking) {
            animateLP('player', damage)
          } else {
            animateLP('ai', damage)
          }
        } else {
          // No damage
          battleLog = `Không có damage!`
        }
      }
    } else {
      // Attack face-down monster - flip it
      const newDefenderMonsters = [...defenderField.monsters]
      newDefenderMonsters[defender.index] = { ...defenderCard, faceUp: true }
      setDefenderField({ ...defenderField, monsters: newDefenderMonsters })
      
      // Then calculate damage
      const atkVsDef = attackerCard.atk - defenderCard.def
      
      if (atkVsDef > 0) {
        battleLog = `Lật bài: ${defenderCard.name} (DEF ${defenderCard.def}) bị phá hủy!`
        setDefenderGY([...defenderGY, defenderCard])
        newDefenderMonsters[defender.index] = null
        setDefenderField({ ...defenderField, monsters: newDefenderMonsters })
      } else if (atkVsDef < 0) {
        battleLog = `Lật bài: ${defenderCard.name} (DEF ${defenderCard.def}) chặn được!`
        damage = Math.abs(atkVsDef)
        
        if (isPlayerAttacking) {
          animateLP('player', damage)
        } else {
          animateLP('ai', damage)
        }
      } else {
        battleLog = `Lật bài: ${defenderCard.name} - Không có damage!`
      }
    }

    alert(battleLog + (damage > 0 ? ` Damage: ${damage}` : ''))
    setSelectedAttacker(null)
  }

  const handleDirectAttack = () => {
    if (!selectedAttacker) return

    const attackerCard = selectedAttacker.card
    const isPlayerAttacking = currentTurn === 'player'
    
    // Check if opponent has no monsters
    const opponentField = isPlayerAttacking ? aiField : playerField
    const hasMonsters = opponentField.monsters.some(m => m !== null)
    
    if (hasMonsters) {
      alert('Đối thủ còn quái thú trên sân!')
      return
    }

    // Direct attack
    const damage = attackerCard.atk
    
    if (isPlayerAttacking) {
      animateLP('ai', damage)
    } else {
      animateLP('player', damage)
    }

    alert(`${attackerCard.name} tấn công trực tiếp! Damage: ${damage}`)
    setSelectedAttacker(null)
  }

  const handleGraveyardClick = (owner) => {
    const graveyard = owner === 'player' ? playerGraveyard : aiGraveyard
    if (graveyard.length === 0) {
      alert('Graveyard trống!')
      return
    }
    setGraveyardOwner(owner)
    setShowGraveyard(true)
  }

  const closeGraveyard = () => {
    setShowGraveyard(false)
    setGraveyardOwner(null)
  }

  const handleDrawCard = () => {
    const isPlayerTurn = currentTurn === 'player'
    const deck = isPlayerTurn ? playerDeck : aiDeck
    const hand = isPlayerTurn ? playerHand : aiHand
    const setDeck = isPlayerTurn ? setPlayerDeck : setAiDeck
    const setHand = isPlayerTurn ? setPlayerHand : setAiHand

    if (deck.length === 0) {
      // Deck out - lose the game
      setGameOver(true)
      setWinner(isPlayerTurn ? 'ai' : 'player')
      alert(`${isPlayerTurn ? player.name : ai.name} không còn bài để rút! Deck Out!`)
      return
    }

    // Draw card
    const drawnCard = deck[0]
    setHand([...hand, drawnCard])
    setDeck(deck.slice(1))
    
    // Show notification
    alert(`Rút bài: ${drawnCard.name}`)
  }

  const animateLP = (target, damage) => {
    // Show damage animation
    if (target === 'player') {
      setDamageAnimation({ ...damageAnimation, player: damage })
      setTimeout(() => setDamageAnimation({ ...damageAnimation, player: null }), 3000)
    } else {
      setDamageAnimation({ ...damageAnimation, ai: damage })
      setTimeout(() => setDamageAnimation({ ...damageAnimation, ai: null }), 3000)
    }

    // Animate LP countdown
    const currentLP = target === 'player' ? playerLP : aiLP
    const targetLP = currentLP - damage
    const setLP = target === 'player' ? setPlayerLP : setAiLP
    const duration = 1800 // 1.8 seconds
    const steps = 40
    const decrement = damage / steps
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const newLP = Math.max(0, Math.round(currentLP - (decrement * step)))
      setLP(newLP)
      
      if (step >= steps || newLP <= targetLP) {
        clearInterval(timer)
        setLP(targetLP)
      }
    }, interval)
  }

  if (!player || !ai) {
    return null
  }

  return (
    <div className="duel-field">
      {/* Game Over Modal */}
      {gameOver && (
        <div className="game-over-modal">
          <div className="game-over-content">
            <div className="game-over-header">
              {winner === 'player' ? (
                <>
                  <h1 className="victory-text">🎉 VICTORY! 🎉</h1>
                  <div className="winner-info">
                    <img src={player.avatar} alt={player.name} className="winner-avatar" />
                    <h2>{player.name} Wins!</h2>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="defeat-text">💔 DEFEAT 💔</h1>
                  <div className="winner-info">
                    <img src={ai.avatar} alt={ai.name} className="winner-avatar" />
                    <h2>{ai.name} Wins!</h2>
                  </div>
                </>
              )}
            </div>
            
            <div className="final-scores">
              <div className="score-item">
                <img src={player.avatar} alt={player.name} className="score-avatar" />
                <div className="score-details">
                  <span className="score-name">{player.name}</span>
                  <span className="score-lp">LP: {playerLP}</span>
                </div>
              </div>
              <div className="vs-divider">VS</div>
              <div className="score-item">
                <img src={ai.avatar} alt={ai.name} className="score-avatar" />
                <div className="score-details">
                  <span className="score-name">{ai.name}</span>
                  <span className="score-lp">LP: {aiLP}</span>
                </div>
              </div>
            </div>

            <div className="game-over-buttons">
              <button 
                className="game-over-btn rematch"
                onClick={() => window.location.reload()}
              >
                🔄 Rematch
              </button>
              <button 
                className="game-over-btn menu"
                onClick={() => navigate('/character-select')}
              >
                🏠 Character Select
              </button>
              <button 
                className="game-over-btn home"
                onClick={() => navigate('/')}
              >
                🏡 Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coin Toss Modal */}
      {showCoinToss && (
        <div className="coin-toss-modal">
          <div className="coin-toss-content">
            <h2>🪙 Tung Đồng Xu</h2>
            <p>Chọn mặt để quyết định ai đi trước!</p>

            {!playerChoice && (
              <div className="coin-choices">
                <button 
                  className="coin-choice-btn heads"
                  onClick={() => handleCoinChoice('heads')}
                >
                  <div className="coin-face">👑</div>
                  <span>Ngửa</span>
                </button>
                <button 
                  className="coin-choice-btn tails"
                  onClick={() => handleCoinChoice('tails')}
                >
                  <div className="coin-face">⚔️</div>
                  <span>Sấp</span>
                </button>
              </div>
            )}

            {coinFlipping && (
              <div className="coin-flipping">
                <div className="coin-animation">🪙</div>
                <p>Đang tung...</p>
              </div>
            )}

            {coinResult && !coinFlipping && (
              <div className="coin-result">
                <div className={`coin-result-face ${coinResult}`}>
                  {coinResult === 'heads' ? '👑' : '⚔️'}
                </div>
                <p className="result-text">
                  Kết quả: <strong>{coinResult === 'heads' ? 'Ngửa' : 'Sấp'}</strong>
                </p>
                {((playerChoice === 'heads' && coinResult === 'heads') || 
                  (playerChoice === 'tails' && coinResult === 'tails')) ? (
                  <p className="winner-text">🎉 Bạn đi trước!</p>
                ) : (
                  <p className="winner-text">😤 Đối thủ đi trước!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Player Info - Bottom Left (Always Player) */}
      <div className="player-info player-info-bottom">
        <img 
          src={player.avatar} 
          alt={player.name} 
          className="player-avatar" 
        />
        <div className="player-details">
          <h3>{player.name}</h3>
          <div className="life-points-container">
            <div className="life-points">LP {playerLP}</div>
            {damageAnimation.player && (
              <div className="damage-number">-{damageAnimation.player}</div>
            )}
          </div>
        </div>
      </div>

      {/* AI Info - Top Right (Always AI) */}
      <div className="player-info ai-info">
        <div className="player-details">
          <h3>{ai.name}</h3>
          <div className="life-points-container">
            <div className="life-points">LP {aiLP}</div>
            {damageAnimation.ai && (
              <div className="damage-number">-{damageAnimation.ai}</div>
            )}
          </div>
        </div>
        <img 
          src={ai.avatar} 
          alt={ai.name} 
          className="player-avatar" 
        />
      </div>

      {/* Opponent Hand (face down) - Top */}
      <div className="hand ai-hand">
        {(currentTurn === 'player' ? aiHand : playerHand).map((card, i) => (
          <div key={i} className="hand-card">
            <div className="card-back-small"></div>
          </div>
        ))}
      </div>

      {/* Main Field Container */}
      <div className="main-field-container">
        {/* Left Side - AI Deck/Extra/GY */}
        <div className="side-zones left-side">
          <div className="zone extra-deck-zone">
            <div className="card-back"></div>
            <div className="zone-label">Extra</div>
          </div>
          <div className="zone deck-zone">
            <div className="card-back"></div>
            <div className="zone-label">Deck</div>
            {(currentTurn === 'player' ? aiDeck : playerDeck).length > 0 && (
              <div className="deck-count">{(currentTurn === 'player' ? aiDeck : playerDeck).length}</div>
            )}
          </div>
          <div className="zone graveyard-zone" onClick={() => handleGraveyardClick('ai')}>
            <div className="card-placeholder">GY</div>
            {aiGraveyard.length > 0 && (
              <div className="gy-count">{aiGraveyard.length}</div>
            )}
          </div>
        </div>

        {/* Center Field */}
        <div className="center-field">
          {/* Opponent Spell/Trap Zones */}
          <div className="spell-trap-zones ai-spells">
            {(currentTurn === 'player' ? aiField : playerField).spells.map((card, i) => (
              <div 
                key={i} 
                className="zone spell-trap-zone"
              >
                {card ? (
                  card.faceUp ? (
                    <img 
                      src={card.image_url} 
                      alt={card.name}
                      className="field-card"
                      onMouseEnter={() => setHoveredCard(card)}
                      onMouseLeave={() => setHoveredCard(null)}
                    />
                  ) : (
                    <div className="card-back"></div>
                  )
                ) : (
                  <div className="card-placeholder"></div>
                )}
              </div>
            ))}
          </div>

          {/* Opponent Monster Zones */}
          <div className="monster-zones ai-monsters">
            {(currentTurn === 'player' ? aiField : playerField).monsters.map((card, i) => (
              <div 
                key={i} 
                className={`zone monster-zone ${battlePhase && card ? 'battle-target' : ''}`}
                onClick={() => card && battlePhase && selectedAttacker && handleCardClick(card, 'monster', i, false)}
                onMouseEnter={() => card && card.faceUp && setHoveredCard(card)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {card ? (
                  card.faceUp ? (
                    <img 
                      src={card.image_url} 
                      alt={card.name}
                      className={`field-card ${card.position}`}
                    />
                  ) : (
                    <div className="card-back"></div>
                  )
                ) : (
                  <div className="card-placeholder"></div>
                )}
              </div>
            ))}
          </div>

          {/* Current Player Monster Zones */}
          <div className="monster-zones player-monsters">
            {(currentTurn === 'player' ? playerField : aiField).monsters.map((card, i) => (
              <div 
                key={i} 
                className={`zone monster-zone ${selectedAttacker?.index === i ? 'selected-attacker' : ''} ${selectingZone && selectedHandCard?.card.type.includes('Monster') ? 'zone-selectable' : ''}`}
                onClick={() => {
                  if (selectingZone && !card && selectedHandCard?.card.type.includes('Monster')) {
                    handleZoneSelect(i, 'monster')
                  } else if (card) {
                    handleCardClick(card, 'monster', i, true)
                  }
                }}
                onMouseEnter={() => card && setHoveredCard(card)}
                onMouseLeave={() => setHoveredCard(null)}
                onContextMenu={(e) => !selectingZone && card && handleRightClick(e, card, 'monster', i, true)}
              >
                {card ? (
                  card.faceUp ? (
                    <img 
                      src={card.image_url} 
                      alt={card.name}
                      className={`field-card ${card.position} ${card.justSummoned ? 'just-summoned' : ''}`}
                    />
                  ) : (
                    <div className="card-back"></div>
                  )
                ) : (
                  <div className="card-placeholder"></div>
                )}
              </div>
            ))}
          </div>

          {/* Current Player Spell/Trap Zones */}
          <div className="spell-trap-zones player-spells">
            {(currentTurn === 'player' ? playerField : aiField).spells.map((card, i) => (
              <div 
                key={i} 
                className={`zone spell-trap-zone ${selectingZone && (selectedHandCard?.card.type.includes('Spell') || selectedHandCard?.card.type.includes('Trap')) ? 'zone-selectable' : ''} ${card && !card.faceUp ? 'has-set-card' : ''}`}
                onClick={() => {
                  if (selectingZone && !card && (selectedHandCard?.card.type.includes('Spell') || selectedHandCard?.card.type.includes('Trap'))) {
                    handleZoneSelect(i, 'spell')
                  }
                }}
                onMouseEnter={() => card && setHoveredCard(card)}
                onMouseLeave={() => setHoveredCard(null)}
                onContextMenu={(e) => !selectingZone && card && handleRightClick(e, card, 'spell', i, true)}
              >
                {card ? (
                  card.faceUp ? (
                    <img 
                      src={card.image_url} 
                      alt={card.name}
                      className="field-card"
                    />
                  ) : (
                    <div className="card-back set-card-glow"></div>
                  )
                ) : (
                  <div className="card-placeholder"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Player Deck/Extra/GY + Battle Button */}
        <div className="side-zones right-side">
          <div className="zone extra-deck-zone" onClick={handleExtraDeckClick}>
            <div className="card-back"></div>
            <div className="zone-label">Extra</div>
          </div>
          <div className="zone deck-zone" onClick={handleDrawCard}>
            <div className="card-back"></div>
            <div className="zone-label">Deck</div>
            {(currentTurn === 'player' ? playerDeck : aiDeck).length > 0 && (
              <div className="deck-count">{(currentTurn === 'player' ? playerDeck : aiDeck).length}</div>
            )}
          </div>
          <div className="zone graveyard-zone" onClick={() => handleGraveyardClick('player')}>
            <div className="card-placeholder">GY</div>
            {playerGraveyard.length > 0 && (
              <div className="gy-count">{playerGraveyard.length}</div>
            )}
          </div>
          <button className="battle-btn" onClick={handleEndTurn}>
            <span className="battle-text">End Turn</span>
          </button>
          <button 
            className={`battle-btn ${battlePhase ? 'battle-active' : ''}`}
            onClick={() => {
              setBattlePhase(!battlePhase)
              setSelectedAttacker(null)
            }}
          >
            <span className="battle-text">{battlePhase ? 'End Battle' : 'Battle'}</span>
          </button>
          {battlePhase && selectedAttacker && (
            <button 
              className="battle-btn direct-attack"
              onClick={handleDirectAttack}
            >
              <span className="battle-text">Direct</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Player Hand - Bottom */}
      <div className="hand player-hand">
        {(currentTurn === 'player' ? playerHand : aiHand).map((card, i) => (
          <div 
            key={i} 
            className={`hand-card ${selectedHandCard?.index === i ? 'selected-hand-card' : ''}`}
            onMouseEnter={() => setHoveredCard(card)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleHandCardClick(card, i)}
            onContextMenu={(e) => {
              e.preventDefault()
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                card,
                type: 'hand',
                index: i,
                isCurrentPlayer: true
              })
            }}
          >
            <img src={card.image_url} alt={card.name} />
          </div>
        ))}
      </div>

      {/* Player Info - Bottom Left */}
      <div className="player-info player-info-bottom">
        <img src={player.avatar} alt={player.name} className="player-avatar" />
        <div className="player-details">
          <h3>{player.name}</h3>
          <div className="life-points">LP {playerLP}</div>
        </div>
      </div>

      {/* Turn Indicator - Floating */}
      <div className="turn-indicator-floating">
        <div className={`turn-text ${currentTurn === 'player' ? 'active' : ''}`}>
          {currentTurn === 'player' ? 'Your Turn' : 'Opponent Turn'}
        </div>
      </div>

      {/* Menu Button */}
      <button className="menu-btn" onClick={() => navigate('/character-select')}>
        ⚙️ Menu
      </button>

      {/* Card Placement Options Modal */}
      {showCardOptions && (
        <div className="card-options-modal">
          <div className="card-options-content">
            <h3>Chọn cách đặt bài</h3>
            <div className="options-buttons">
              <button 
                className="option-btn face-up"
                onClick={() => handleCardPlacement(true)}
              >
                {selectedZone?.type === 'monster' ? '⚔️ Triệu hồi (Ngửa)' : '✨ Kích hoạt (Ngửa)'}
              </button>
              <button 
                className="option-btn face-down"
                onClick={() => handleCardPlacement(false)}
              >
                🎴 Đặt úp (Sấp)
              </button>
              <button 
                className="option-btn cancel"
                onClick={() => {
                  setShowCardOptions(false)
                  setDraggedCard(null)
                  setSelectedZone(null)
                }}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hand Card Summon Options */}
      {selectedHandCard && !tributeMode && !selectingZone && (
        <div className="summon-options-modal">
          <div className="summon-options-content">
            <div className="summon-options-header">
              <img src={selectedHandCard.card.image_url} alt={selectedHandCard.card.name} className="summon-card-preview" />
              <h3>{selectedHandCard.card.name}</h3>
              {selectedHandCard.card.level && <p>⭐ Level {selectedHandCard.card.level}</p>}
            </div>

            <div className="summon-options-buttons">
              {selectedHandCard.card.type.includes('Monster') && (
                <>
                  {(selectedHandCard.card.level || 0) < 5 && (
                    <>
                      <button 
                        className="summon-option-btn normal"
                        onClick={() => handleSummonOption('normal')}
                      >
                        ⚔️ Triệu hồi thường (Tấn công)
                      </button>
                      <button 
                        className="summon-option-btn defense"
                        onClick={() => handleSummonOption('defense')}
                      >
                        🛡️ Triệu hồi thường (Phòng thủ)
                      </button>
                      <button 
                        className="summon-option-btn set"
                        onClick={() => handleSummonOption('set')}
                      >
                        🎴 Úp bài (Thế thủ)
                      </button>
                    </>
                  )}
                  {(selectedHandCard.card.level || 0) >= 5 && (
                    <button 
                      className="summon-option-btn tribute"
                      onClick={() => handleSummonOption('tribute')}
                    >
                      🔥 Triệu hồi hiến tế
                    </button>
                  )}
                </>
              )}
              {(selectedHandCard.card.type.includes('Spell') || selectedHandCard.card.type.includes('Trap')) && (
                <>
                  <button 
                    className="summon-option-btn activate"
                    onClick={() => {
                      setSummonMode('activate')
                      setSelectingZone(true)
                    }}
                  >
                    ✨ Kích hoạt
                  </button>
                  <button 
                    className="summon-option-btn set"
                    onClick={() => handleSummonOption('set')}
                  >
                    🎴 Úp bài
                  </button>
                </>
              )}
              <button 
                className="summon-option-btn cancel"
                onClick={() => setSelectedHandCard(null)}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tribute Mode Modal */}
      {tributeMode && tributeCard && (
        <div className="tribute-modal" onClick={handleCancelTribute}>
          <div className="tribute-content" onClick={(e) => e.stopPropagation()}>
            <div className="tribute-header">
              <h2>🔥 Tribute Summon</h2>
              <p>Chọn {tributeCard.tributesNeeded} monster để hiến tế</p>
            </div>

            <div className="tribute-target-card">
              <img src={tributeCard.card.image_url} alt={tributeCard.card.name} />
              <div className="tribute-target-info">
                <h3>{tributeCard.card.name}</h3>
                <p>⭐ Level {tributeCard.card.level}</p>
                <p>ATK: {tributeCard.card.atk} / DEF: {tributeCard.card.def}</p>
              </div>
            </div>
            
            <div className="tribute-selection-status">
              <p>Đã chọn: {selectedTributes.length} / {tributeCard.tributesNeeded}</p>
            </div>

            <div className="tribute-monsters-grid">
              {tributeCard.availableMonsters.map((monster, index) => {
                const isSelected = selectedTributes.some(m => m.id === monster.id)
                return (
                  <div 
                    key={index}
                    className={`tribute-monster-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTributeSelect({ id: monster.id, card: monster, index })}
                  >
                    <img src={monster.image_url} alt={monster.name} />
                    <div className="tribute-monster-name">{monster.name}</div>
                    {isSelected && <div className="selected-badge">✓</div>}
                  </div>
                )
              })}
            </div>

            <div className="tribute-buttons">
              {selectedTributes.length === tributeCard.tributesNeeded && (
                <button 
                  className="tribute-btn summon"
                  onClick={() => handleConfirmTribute(true)}
                >
                  ⚔️ Tribute Summon
                </button>
              )}
              <button 
                className="tribute-btn cancel"
                onClick={handleCancelTribute}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="context-menu-overlay" onClick={() => setContextMenu(null)} />
          <div 
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="context-menu-header">
              {contextMenu.card.name}
            </div>
            
            {/* Change position option for monsters */}
            {contextMenu.type === 'monster' && contextMenu.card.faceUp && contextMenu.isCurrentPlayer && !battlePhase && (
              <button 
                className="context-menu-item position"
                onClick={() => {
                  const field = currentTurn === 'player' ? playerField : aiField
                  const setField = currentTurn === 'player' ? setPlayerField : setAiField
                  const newMonsters = [...field.monsters]
                  newMonsters[contextMenu.index] = {
                    ...contextMenu.card,
                    position: contextMenu.card.position === 'attack' ? 'defense' : 'attack'
                  }
                  setField({ ...field, monsters: newMonsters })
                  setContextMenu(null)
                }}
              >
                {contextMenu.card.position === 'attack' ? '🛡️ Chuyển sang Thế Thủ' : '⚔️ Chuyển sang Tấn Công'}
              </button>
            )}
            
            {/* Activate option for set spell/trap */}
            {contextMenu.type === 'spell' && !contextMenu.card.faceUp && contextMenu.isCurrentPlayer && (
              <>
                {contextMenu.card.type.includes('Trap') && contextMenu.card.canActivate === false ? (
                  <button 
                    className="context-menu-item disabled"
                    disabled
                  >
                    ⚠️ Trap chưa thể kích hoạt (phải đợi turn sau)
                  </button>
                ) : (
                  <button 
                    className="context-menu-item activate"
                    onClick={() => {
                      handleSetSpellActivation(contextMenu.card, contextMenu.index)
                      setContextMenu(null)
                    }}
                  >
                    ✨ Kích hoạt
                  </button>
                )}
              </>
            )}
            
            <button 
              className="context-menu-item"
              onClick={() => {
                if (contextMenu.type === 'hand') {
                  handleSendHandToGY(contextMenu.index)
                } else {
                  handleSendToGY()
                }
              }}
            >
              🗑️ Send to Graveyard
            </button>
            <button 
              className="context-menu-item cancel"
              onClick={() => setContextMenu(null)}
            >
              ❌ Cancel
            </button>
          </div>
        </>
      )}

      {/* Graveyard Modal */}
      {showGraveyard && (
        <div className="extra-deck-modal" onClick={closeGraveyard}>
          <div className="extra-deck-content" onClick={(e) => e.stopPropagation()}>
            <div className="extra-deck-header">
              <h2>
                {graveyardOwner === 'player' ? player.name : ai.name} - Graveyard
              </h2>
              <button className="close-btn" onClick={closeGraveyard}>✕</button>
            </div>
            <div className="extra-deck-grid">
              {(graveyardOwner === 'player' ? playerGraveyard : aiGraveyard).map((card, i) => (
                <div 
                  key={i} 
                  className="extra-deck-card"
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <img src={card.image_url} alt={card.name} />
                  <div className="card-name">{card.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extra Deck Modal */}
      {showExtraDeck && (
        <div className="extra-deck-modal" onClick={closeExtraDeck}>
          <div className="extra-deck-content" onClick={(e) => e.stopPropagation()}>
            <div className="extra-deck-header">
              <h2>
                {player.name} - Extra Deck
              </h2>
              <button className="close-btn" onClick={closeExtraDeck}>✕</button>
            </div>
            <div className="extra-deck-grid">
              {player.deck.extra.map((card, i) => (
                <div 
                  key={i} 
                  className="extra-deck-card"
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <img src={card.image_url} alt={card.name} />
                  <div className="card-name">{card.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Tooltip */}
      {hoveredCard && (
        <div className="card-detail-tooltip">
          <div className="card-detail-content">
            <img src={hoveredCard.image_url} alt={hoveredCard.name} className="card-detail-image" />
            <div className="card-detail-info">
              <h3>{hoveredCard.name}</h3>
              <div className="card-stats">
                {hoveredCard.type && <span className="card-type">{hoveredCard.type}</span>}
                {hoveredCard.attribute && <span className="card-attribute">{hoveredCard.attribute}</span>}
                {hoveredCard.level && <span className="card-level">⭐ Level {hoveredCard.level}</span>}
              </div>
              {hoveredCard.atk !== undefined && (
                <div className="card-atk-def">
                  <span>ATK: {hoveredCard.atk}</span>
                  <span>DEF: {hoveredCard.def}</span>
                </div>
              )}
              <div className="card-description">
                <p className="description-label">Hiệu ứng:</p>
                <p>{hoveredCard.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spell Activation Animation */}
      {activatingSpell && (
        <div className="spell-activation-overlay">
          <div className="spell-activation-content">
            <div className="spell-activation-flash"></div>
            <div className="spell-card-display">
              <img src={activatingSpell.image_url} alt={activatingSpell.name} />
            </div>
            <div className="spell-activation-text">
              <h2>✨ SPELL CARD ACTIVATED! ✨</h2>
              <p>{activatingSpell.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Discard Cards Modal */}
      {discardingCards && (
        <div className="discard-modal">
          <div className="discard-content">
            <div className="discard-header">
              <h2>⚠️ Giới hạn bài trên tay</h2>
              <p>Bạn có {(currentTurn === 'player' ? playerHand : aiHand).length} lá bài. Giới hạn là {handLimit} lá.</p>
              <p className="discard-instruction">Chọn {(currentTurn === 'player' ? playerHand : aiHand).length - handLimit} lá để loại bỏ vào Graveyard</p>
            </div>

            <div className="discard-cards-grid">
              {(currentTurn === 'player' ? playerHand : aiHand).map((card, i) => (
                <div 
                  key={i}
                  className={`discard-card ${selectedDiscards.includes(i) ? 'selected' : ''}`}
                  onClick={() => handleDiscardSelect(i)}
                >
                  <img src={card.image_url} alt={card.name} />
                  <div className="discard-card-name">{card.name}</div>
                  {selectedDiscards.includes(i) && <div className="discard-badge">✓</div>}
                </div>
              ))}
            </div>

            <div className="discard-status">
              <p>Đã chọn: {selectedDiscards.length} / {(currentTurn === 'player' ? playerHand : aiHand).length - handLimit}</p>
            </div>

            <div className="discard-buttons">
              <button 
                className="discard-btn confirm"
                onClick={handleConfirmDiscard}
                disabled={selectedDiscards.length !== ((currentTurn === 'player' ? playerHand : aiHand).length - handLimit)}
              >
                ✓ Xác nhận loại bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Duel
