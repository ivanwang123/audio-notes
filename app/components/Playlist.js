import React, {useState, useEffect, useRef} from 'react'
import useMousetrap from "react-hook-mousetrap"
import {secondsToText} from '../utils/timeConverter'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPen, faChevronRight} from '@fortawesome/free-solid-svg-icons'

function Recording(props) {

  const {isSelected, file, setSelectedAudio, index, isLight} = props

  const [title, setTitle] = useState('')
  const [canEdit, setCanEdit] = useState(false)

  const titleRef = useRef(null)

  const editTitle = (e) => {
    if (canEdit) {
      setTitle(e.target.value)
      file.title = e.target.value
    }
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13)
      disableEdit()
  }

  const enableEdit = (e) => {
    e.stopPropagation()
    setCanEdit(true)
  }

  const disableEdit = () => {
    if (title.length === 0) {
      const tempTitle = `Recording ${index+1}`
      setTitle(tempTitle)
      file.title = tempTitle
    }
    setCanEdit(false)
  }

  useEffect(() => {
    // Auto focus and highlight when editing title
    if (titleRef.current) {
      if (canEdit) {
        titleRef.current.focus()
        titleRef.current.setSelectionRange(0, titleRef.current.value.length)
      } else {
        titleRef.current.blur()
      }
    }
  }, [canEdit, titleRef.current])

  return (
    <div className={`recording-wrapper ${canEdit ? 'editing-recording' : isSelected ? 'selected-recording' : ''}`} onClick={()=>setSelectedAudio(file)}>
      <span className="selected-icon"><FontAwesomeIcon className="selected-icon" icon={faChevronRight} /></span>
      <button type="button" className="edit-btn" onClick={enableEdit}><FontAwesomeIcon icon={faPen} /></button>
      <input type="text" ref={titleRef} className="title" onChange={editTitle} value={file.title} onKeyDown={handleKeyDown} onBlur={disableEdit} disabled={!canEdit} />
    </div>
  )
}

function Playlist(props) {

  const {audioFiles, selectedAudio, setSelectedAudio, isLight} = props

  useMousetrap(['ctrl+1', 'command+1'], ()=>handleSetAudioShortcut(0))
  useMousetrap(['ctrl+2', 'command+2'], ()=>handleSetAudioShortcut(1))
  useMousetrap(['ctrl+3', 'command+3'], ()=>handleSetAudioShortcut(2))
  useMousetrap(['ctrl+4', 'command+4'], ()=>handleSetAudioShortcut(3))
  useMousetrap(['ctrl+5', 'command+5'], ()=>handleSetAudioShortcut(4))
  useMousetrap(['ctrl+6', 'command+6'], ()=>handleSetAudioShortcut(5))
  useMousetrap(['ctrl+7', 'command+7'], ()=>handleSetAudioShortcut(6))
  useMousetrap(['ctrl+8', 'command+8'], ()=>handleSetAudioShortcut(7))
  useMousetrap(['ctrl+9', 'command+9'], ()=>handleSetAudioShortcut(8))

  const handleSetAudioShortcut = (i) => {
    if (i < audioFiles.length)
      setSelectedAudio(audioFiles[i])
  }

  return (
    <div className={`playlist-wrapper ${isLight ? 'playlist-light' : 'playlist-dark'}`}>
      {audioFiles.map((file, index) => {
        let isSelected = false
        if (selectedAudio)
          isSelected = file.id === selectedAudio.id

        return (
          <Recording isSelected={isSelected} file={file} setSelectedAudio={setSelectedAudio} index={index} isLight={isLight} />
        )
      })}
    </div>
  )
}

export default Playlist
