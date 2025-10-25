import { useState } from 'react'
import './App.css'
import ThemeProvider from './theme/ThemeContext'
import Theme from './pages/Theme'
import Name from './pages/Name'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider>

      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() =>
  setCount((count) => count + 1)}>
          count is {count}
        </button>

      </div>

      <Theme />
<Name/>
    </ThemeProvider>
  )
}
export default App
