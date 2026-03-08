import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './DuelModeLoading.css'

function DuelModeLoading() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Entering Duel Mode...')

  useEffect(() => {
    const loadingDuration = 4000 // 4 seconds
    const intervalTime = 50
    const totalSteps = loadingDuration / intervalTime
    const progressPerStep = 100 / totalSteps

    const texts = [
      'Entering Duel Mode...',
      'Preparing arena...',
      'Loading duelists...',
      'Ready!'
    ]

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += progressPerStep
      
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        setTimeout(() => {
          navigate('/character-select')
        }, 500)
      }

      setProgress(currentProgress)

      const textIndex = Math.floor((currentProgress / 100) * (texts.length - 1))
      setLoadingText(texts[textIndex])
    }, intervalTime)

    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="duel-loading-screen">
      <div className="duel-loading-background" />
      <div className="duel-loading-content">
        <div className="duel-loading-title">
          <h1>⚔️ DUEL MODE ⚔️</h1>
        </div>
        
        <div className="duel-loading-bar-container">
          <div className="duel-loading-bar">
            <div 
              className="duel-loading-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="duel-loading-text">{loadingText}</div>
          <div className="duel-loading-percentage">{Math.floor(progress)}%</div>
        </div>
      </div>
    </div>
  )
}

export default DuelModeLoading
