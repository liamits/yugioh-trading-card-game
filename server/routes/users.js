import express from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// EXP needed for each level: Level * 100
const getExpForLevel = (level) => level * 100

router.post('/progress', requireAuth, async (req, res) => {
  try {
    const { expGained, goldGained, win } = req.body
    const user = await User.findById(req.user.id)
    
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.exp += expGained || 0
    user.gold += goldGained || 0

    // Level up logic
    let leveledUp = false
    while (user.exp >= getExpForLevel(user.level)) {
      user.exp -= getExpForLevel(user.level)
      user.level += 1
      leveledUp = true
      
      // Check character unlocks based on Level (GDD sample)
      if (user.level === 5 && !user.unlockedCharacters.includes('Seto Kaiba')) {
        user.unlockedCharacters.push('Seto Kaiba')
      }
      if (user.level === 10 && !user.unlockedCharacters.includes('Marik Ishtar')) {
        user.unlockedCharacters.push('Marik Ishtar')
      }
    }

    await user.save()
    
    res.json({
      level: user.level,
      exp: user.exp,
      gold: user.gold,
      leveledUp,
      unlockedCharacters: user.unlockedCharacters,
      nextLevelExp: getExpForLevel(user.level)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
