/**
 * CardEffectProcessor
 * Xử lý tất cả các hiệu ứng kỹ năng của lá bài.
 */

export const executeEffect = (card, context) => {
  const { 
    playerLP, setPlayerLP, aiLP, setAiLP,
    playerHand, setPlayerHand, aiHand, setAiHand,
    playerDeck, setPlayerDeck, aiDeck, setAiDeck,
    playerField, setPlayerField, aiField, setAiField,
    playerGraveyard, setPlayerGraveyard, aiGraveyard, setAiGraveyard,
    isPlayerTurn
  } = context;

  console.log(`Executing effect for: ${card.name}`);

  switch (card.name) {
    case 'Pot of Greed':
      return handlePotOfGreed(context);
    case 'Raigeki':
      return handleRaigeki(context);
    case 'Dark Hole':
      return handleDarkHole(context);
    case 'Monster Reborn':
      // Reborn logic requires target selection, usually handled in UI first
      return { type: 'SELECT_TARGET', source: 'GY', count: 1 };
    default:
      console.log(`No specific logic for ${card.name}, using default.`);
      return { type: 'NONE' };
  }
};

const handlePotOfGreed = (context) => {
  const { isPlayerTurn, playerDeck, setPlayerDeck, playerHand, setPlayerHand, aiDeck, setAiDeck, aiHand, setAiHand } = context;
  const deck = isPlayerTurn ? playerDeck : aiDeck;
  const setDeck = isPlayerTurn ? setPlayerDeck : setAiDeck;
  const hand = isPlayerTurn ? playerHand : aiHand;
  const setHand = isPlayerTurn ? setPlayerHand : setAiHand;

  if (deck.length >= 2) {
    const drawn = deck.slice(0, 2);
    setHand([...hand, ...drawn]);
    setDeck(deck.slice(2));
    return { type: 'SUCCESS', message: 'Drawn 2 cards' };
  }
  return { type: 'FAILED', message: 'Not enough cards in deck' };
};

const handleRaigeki = (context) => {
  const { isPlayerTurn, playerField, setPlayerField, aiField, setAiField, playerGraveyard, setPlayerGraveyard, aiGraveyard, setAiGraveyard } = context;
  const opponentField = isPlayerTurn ? aiField : playerField;
  const setOpponentField = isPlayerTurn ? setAiField : setPlayerField;
  const opponentGY = isPlayerTurn ? aiGraveyard : playerGraveyard;
  const setOpponentGY = isPlayerTurn ? setAiGraveyard : setPlayerGraveyard;

  const destroyed = opponentField.monsters.filter(m => m !== null);
  setOpponentGY([...opponentGY, ...destroyed]);
  setOpponentField({ ...opponentField, monsters: new Array(5).fill(null) });

  return { type: 'SUCCESS', message: 'All opponent monsters destroyed' };
};

const handleDarkHole = (context) => {
  const { playerField, setPlayerField, aiField, setAiField, playerGraveyard, setPlayerGraveyard, aiGraveyard, setAiGraveyard } = context;
  
  const pDestroyed = playerField.monsters.filter(m => m !== null);
  const aDestroyed = aiField.monsters.filter(m => m !== null);
  
  setPlayerGraveyard([...playerGraveyard, ...pDestroyed]);
  setAiGraveyard([...aiGraveyard, ...aDestroyed]);
  
  setPlayerField({ ...playerField, monsters: new Array(5).fill(null) });
  setAiField({ ...aiField, monsters: new Array(5).fill(null) });

  return { type: 'SUCCESS', message: 'All monsters destroyed' };
};
