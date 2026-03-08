import { Routes, Route } from 'react-router-dom'
import BackgroundMusic from './components/BackgroundMusic'
import Home from './pages/Home'
import Game from './pages/Game'
import CharacterSelect from './pages/CharacterSelect'

function App() {
  return (
    <>
      <BackgroundMusic />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/character-select" element={<CharacterSelect />} />
      </Routes>
    </>
  )
}

export default App
