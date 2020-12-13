import React, {useState} from 'react'
import Navbar from './Navbar'
import Recorder from './Recorder'
import Playlist from './Playlist'
import AudioPlayer from './AudioPlayer'
import Script from './Script'

function NotesModePage() {

  const [fileId, setFileId] = useState('')
  const [filePath, setFilePath] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [audioFiles, setAudioFiles] = useState([])
  const [selectedAudio, setSelectedAudio] = useState(null)
  const [isLight, setIsLight] = useState(true)

  const handleResetFiles = () => {
    setFileId('')
    setFilePath('')
    setFileContent('')
    setAudioFiles([])
    setSelectedAudio(null)
  }

  return (
    <div className={`notes-mode-container ${isLight ? 'notes-mode-light' : 'notes-mode-dark'}`}>
      <div className="navbar-container">
        <Navbar fileId={fileId} setFileId={setFileId} 
                filePath={filePath} setFilePath={setFilePath}
                fileContent={fileContent} setFileContent={setFileContent} 
                audioFiles={audioFiles} setAudioFiles={setAudioFiles}
                isLight={isLight} setIsLight={setIsLight}
                handleResetFiles={handleResetFiles}
              />
      </div>
      <div className="audio-bar-container">
        <Recorder audioFiles={audioFiles} setAudioFiles={setAudioFiles} setSelectedAudio={setSelectedAudio} isLight={isLight} />
        <AudioPlayer selectedAudio={selectedAudio} audioFiles={audioFiles} setSelectedAudio={setSelectedAudio} setAudioFiles={setAudioFiles} isLight={isLight} />
      </div>
      <div className="audio-container">
        <Playlist audioFiles={audioFiles} selectedAudio={selectedAudio} setSelectedAudio={setSelectedAudio} isLight={isLight} />
      </div>
      <div className="script-container">
        <Script fileContent={fileContent} setFileContent={setFileContent} isLight={isLight} />
      </div>
    </div>
  )
}

export default NotesModePage
