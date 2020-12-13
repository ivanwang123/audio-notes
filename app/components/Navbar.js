import React, {useState, useRef, useEffect} from 'react'
import axios from 'axios'
import useMousetrap from "react-hook-mousetrap"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars, faChevronLeft} from '@fortawesome/free-solid-svg-icons'
import {secondsToSavedTime} from '../utils/timeConverter'
const {ipcRenderer} = window.require('electron')

function Navbar(props) {

  const {fileId, filePath, fileContent, audioFiles, isLight,
         setFileId, setFilePath, setFileContent, setAudioFiles, setIsLight, handleResetFiles} = props

  const [savedTime, setSavedTime] = useState(0)

  const fileRef = useRef(null)

  useMousetrap(['ctrl+s', 'command+s'], () => {
    handleSaveFile()
  })

  useMousetrap(['ctrl+q', 'command+q'], () => {
    handleCloseWindow()
  })

  useMousetrap(['ctrl+o', 'command+o'], async () => {
    const isSaved = await handleIsFileSaved()
    if (isSaved === 'is-saved' || isSaved === 'no-save' || isSaved === 'save') {
      if (fileRef.current)
        fileRef.current.click()
    }
  })

  useMousetrap(['ctrl+n', 'command+n'], () => {
    handleNewFile()
  })

  useMousetrap(['ctrl+t', 'command+t'], () => {
    handleToggleTheme()
  })

  const convertBase64ToBinary = (base64) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return byteArray
  }

  const handleIsFileSaved = async () => {
    try {
      const saveInfo = await axios.post('/is-saved', {
        data: {
          fileId: fileId,
          filePath: filePath,
          fileContent: fileContent,
          audioFiles: audioFiles
        }
      })

      if (saveInfo.data.isSaved) {
        return 'is-saved'
      } else {
        if (saveInfo.data.action === 'save') {
          if (await handleSaveFile()) {
            return 'save'
          }
        } else if (saveInfo.data.action === 'nosave') {
          return 'no-save'
        }
        return 'cancel'
      }
    } catch (e) {
      return 'cancel'
    }
  }

  const handleOpenFile = async (e) => {
    try { 
      const res = await axios.post('/open-file', {
        data: {
          file: e.target.files[0].path
        }
      })
      setFileId(res.data.fileId)
      setFilePath(res.data.filePath)
      setFileContent(res.data.fileContent)
      let audioData = res.data.audioData

      // Convert base64 to url and store in audio data
      audioData.forEach((data, index) => {
        const binary = convertBase64ToBinary(data.audio)
        const blob = new Blob([binary], {
          type: 'audio/mp3'
        })
        const audioUrl = URL.createObjectURL(blob)
        audioData[index].audio = audioUrl
      })

      setAudioFiles(audioData)
    } catch (e) {
    }
  }

  const handleSaveFile = async () => {
    const saveAudioFiles = audioFiles.map((file) => {
      return {
        id: file.id,
        title: file.title,
        duration: file.duration
      }
    })
    const saveFile = await axios.post('/save-file', {
      data: {
        fileId: fileId,
        filePath: filePath,
        fileContent: fileContent,
        audioFiles: saveAudioFiles
      }
    })

    // Set data and return if successfully saved
    if (saveFile.data) {
      setFileId(saveFile.data.fileId)
      setFilePath(saveFile.data.filePath)
      setSavedTime(new Date().getTime())
      return true
    } else {
      return false
    }
  }

  const handleNewFile = async () => {
    try {
      const isSaved = await handleIsFileSaved()

      if (isSaved === 'is-saved' || isSaved === 'no-save' || isSaved === 'save') {
        handleResetFiles()
        fileRef.current.value = ''
      } 
    } catch (e) {
    }
  }

  const [menuOpen, setMenuOpen] = useState(false)

  const handleCloseWindow = async () => {
    try {
      const isSaved = await handleIsFileSaved()
      
      if (isSaved === 'is-saved' || isSaved === 'no-save' || isSaved === 'save') {
        ipcRenderer.send('close')
      } 
    } catch (e) {
    }
  }

  const handleToggleMenu = () => setMenuOpen((prevMenu) => !prevMenu)

  const handleToggleTheme = () => {
    setIsLight((prevTheme) => !prevTheme)
  }

  return (
    <nav className={`navbar-wrapper ${isLight ? 'navbar-light' : 'navbar-dark'}`}>
      <div className="side-wrapper">
        <div className="saved-time" key={savedTime}>{secondsToSavedTime(savedTime)}</div>
      </div>
      <div className="main-wrapper">
        <div className={`selection-wrapper`}>
          <div className="selection-display" onClick={handleToggleMenu}>
            {menuOpen ? (
              <FontAwesomeIcon icon={faChevronLeft} />
            ) : (
              <FontAwesomeIcon icon={faBars} />
            )}
          </div>
          <div className={`dropdown-wrapper ${menuOpen ? 'dropdown-show' : 'dropdown-hide'}`}>
            <label className="option" onClick={handleNewFile}>New<span className="hotkey">ctrl+n</span></label>
            <label htmlFor="open-file" className="option">Open<span className="hotkey">ctrl+o</span></label>
            <label className="option" onClick={handleSaveFile}>Save<span className="hotkey">ctrl+s</span></label>
            <label className="option" onClick={handleToggleTheme}>{isLight ? 'Dark' : 'Light'}<span className="hotkey">ctrl+t</span></label>
            <label className="option" onClick={handleCloseWindow}>Quit<span className="hotkey">ctrl+q</span></label>
          </div>
        </div>
        <input ref={fileRef} id="open-file" type="file" accept=".txt" onChange={handleOpenFile}></input>
      </div>
    </nav>
  )
}

export default Navbar
