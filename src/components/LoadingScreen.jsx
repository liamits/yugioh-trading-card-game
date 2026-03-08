import { useState, useEffect } from 'react'
import './LoadingScreen.css'

function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Loading...')

  useEffect(() => {
    const loadingDuration = 6000 // 6 seconds
    const intervalTime = 50 // Update every 50ms
    const totalSteps = loadingDuration / intervalTime
    const progressPerStep = 100 / totalSteps

    const texts = [
      'Loading...',
      'Shuffling deck...',
      'Drawing cards...',
      'Preparing duel field...',
      'Ready to duel!'
    ]

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += progressPerStep
      
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        setTimeout(() => {
          onLoadingComplete()
        }, 500)
      }

      setProgress(currentProgress)

      // Change text based on progress
      const textIndex = Math.floor((currentProgress / 100) * (texts.length - 1))
      setLoadingText(texts[textIndex])
    }, intervalTime)

    return () => clearInterval(interval)
  }, [onLoadingComplete])

  return (
    <div className="loading-screen">
      <div className="loading-background" />
      <div className="loading-content">
        <div className="loading-logo">
          <h1>Yu-Gi-Oh!</h1>
          <p>Duel Arena</p>
        </div>
        
        <div className="loading-bar-container">
          <div className="loading-bar">
            <div 
              className="loading-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="loading-text">{loadingText}</div>
          <div className="loading-percentage">{Math.floor(progress)}%</div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
