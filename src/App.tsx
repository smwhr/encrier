import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import {Editor} from './Editor'
import {Player} from './Player'
import { Story } from 'inkjs'

function App() {
  const [count, setCount] = useState(0)
  const [story, setStory] = useState(null)

  return (
    <div className="App">
      <div className="row">
        <Editor setStory={setStory}/>
        <Player story={story} />
      </div>
    </div>
  )
}

export default App
