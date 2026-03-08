import { useEffect, useRef, useState } from 'react'
import './BackgroundMusic.css'

function BackgroundMusic() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set volume
    audio.volume = 0.5

    const playAudio = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (err) {
        console.log('Auto-play prevented. Click play button to start music.')
        setIsPlaying(false)
      }
    }

    // Add event listeners
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Try to auto-play after a short delay
    const timer = setTimeout(() => {
      playAudio()
    }, 500)

    return () => {
      clearTimeout(timer)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(err => {
        console.log('Play error:', err)
      })
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    
    audio.muted = !audio.muted
    setIsMuted(!isMuted)
  }

  return (
    <div className="music-controls">
      <audio 
        ref={audioRef} 
        src="/sounds/backgroundmusic.mp3" 
        loop 
        preload="auto"
      />
      
      <button className="music-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      
      <button className="music-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}

export default BackgroundMusic
