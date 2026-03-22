import express from 'express'
import Character from '../models/Character.js'

const router = express.Router()

// Get all characters
router.get('/', async (req, res) => {
  try {
    const characters = await Character.find()
    res.json(characters)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get character by name
router.get('/:name', async (req, res) => {
  try {
    const character = await Character.findOne({ name: req.params.name })
    if (!character) {
      return res.status(404).json({ message: 'Character not found' })
    }
    res.json(character)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new character
router.post('/', async (req, res) => {
  const character = new Character({
    name: req.body.name,
    description: req.body.description,
    avatar: req.body.avatar,
    deck: {
      main: req.body.deck?.main || [],
      extra: req.body.deck?.extra || []
    }
  })

  try {
    const newCharacter = await character.save()
    res.status(201).json(newCharacter)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update character deck
router.put('/:name/deck', async (req, res) => {
  try {
    const character = await Character.findOne({ name: req.params.name })
    if (!character) {
      return res.status(404).json({ message: 'Character not found' })
    }

    character.deck.main = req.body.main || character.deck.main
    character.deck.extra = req.body.extra || character.deck.extra

    const updatedCharacter = await character.save()
    res.json(updatedCharacter)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update character stats
router.put('/:name/stats', async (req, res) => {
  try {
    const character = await Character.findOne({ name: req.params.name })
    if (!character) {
      return res.status(404).json({ message: 'Character not found' })
    }

    if (req.body.result === 'win') {
      character.stats.wins += 1
    } else if (req.body.result === 'loss') {
      character.stats.losses += 1
    }
    character.stats.totalDuels += 1

    const updatedCharacter = await character.save()
    res.json(updatedCharacter)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete character
router.delete('/:name', async (req, res) => {
  try {
    const character = await Character.findOneAndDelete({ name: req.params.name })
    if (!character) {
      return res.status(404).json({ message: 'Character not found' })
    }
    res.json({ message: 'Character deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
