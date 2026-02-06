import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [minutes, setMinutes] = useState(15)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const texts = [
    "Bienvenido",
    "Gracias por acompanarnos",
    "Tiempo para conectar"
  ]

  const sandClockUrl = 'https://via.placeholder.com/300x300.png?text=Sand+Clock'

  useEffect(() => {
    let interval: number | null = null
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          setIsRunning(false)
        }
      }, 1000)
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval!)
    }
    return () => clearInterval(interval!)
  }, [isRunning, seconds, minutes])

  const nextText = () => {
    setCurrentTextIndex((currentTextIndex + 1) % texts.length)
  }


  setTimeout(nextText, 5000)

  return (
    <div className="app">
      <div className="left-half">
        <div className="timer-display">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
      <div className="right-half">
        <div className="text-slider">
          <div className="text-display">{texts[currentTextIndex]}</div>
        </div>
      </div>
    </div>
  )
}

export default App
