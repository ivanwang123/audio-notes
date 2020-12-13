import React from 'react'
import axios from 'axios'
import DisplayPage from './components/DisplayPage'

axios.defaults.headers.common = {
  "Content-Type": "application/json"
}

function App() {

  return (
    <div className="App">
      <DisplayPage />
    </div>
  )
}

export default App
