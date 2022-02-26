import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import {Editor} from './Editor'
import {Player} from './Player'
import { Story } from 'inkjs'
import { ActionBar } from './Editor/ActionBar'

function App() {
  const [story, setStory] = useState(null)

  const [playerActive, setPlayerActive] = useState(false)
  const [editorActive, setEditorActive] = useState(true)
  const [showFileManager, setFileManager] = useState(false);

  const toggleFileManager = () => {
    setFileManager(!showFileManager);
  }

  return (
    <div className="App">
      <div className="row">
              <ActionBar 
                  toggleFileManager={toggleFileManager} 
                  playerActive={playerActive}
                  setPlayerActive={setPlayerActive}
                  editorActive={editorActive}
                  setEditorActive={setEditorActive}
              />
              <Editor 
                    className={editorActive ? '' : 'mobile-hide'}
                    setStory={setStory}  
                    showFileManager={showFileManager}
                    />
              <Player story={story} className={playerActive ? '' : 'mobile-hide'} />
      </div>
    </div>
  )
}

export default App
