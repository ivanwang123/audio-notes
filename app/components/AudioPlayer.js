import React, {useState, useEffect, useRef} from 'react'
import axios from 'axios'
import useMousetrap from "react-hook-mousetrap"
import {secondsToTime} from '../utils/timeConverter'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlay, faPause, faStepBackward, faStepForward, faFastBackward, faFastForward, faDownload, faTrash} from '@fortawesome/free-solid-svg-icons'

function AudioPlayer(props) {

  const {selectedAudio, audioFiles, setSelectedAudio, setAudioFiles, isLight} = props

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [curAudioTime, setCurAudioTime] = useState(0)
  const [sliderMax, setSliderMax] = useState(0)

  let scrollInterval = useRef(null)
  const audioPlayer = useRef(null)
  const audioScroller = useRef(null)

  useMousetrap(['ctrl+p', 'command+p'], () => {
    if (isPlaying)
      handlePauseAudio()
    else
      handlePlayAudio()
  })

  // Initialize audio player with selected audio data
  useEffect(() => {
    if (selectedAudio) {
      audioPlayer.current.src = selectedAudio.audio
      audioPlayer.current.load()
      setAudioDuration(selectedAudio.duration)
      setSliderMax(Math.ceil(selectedAudio.duration / 0.05))
      handlePlayAudio()
    } else {
      if (audioPlayer.current)
        audioPlayer.current.src = ''
      if (audioScroller.current)
        audioScroller.current.value = 0
      setAudioDuration(0)
      setSliderMax(0)
    }
  }, [selectedAudio, audioPlayer.current, audioScroller.current])

  // Initialize scroll interval
  useEffect(() => {
    if (isPlaying) {
      scrollInterval.current = setInterval(() => {
        if (audioDuration > 0) {
          audioScroller.current.value = audioPlayer.current.currentTime / audioDuration * sliderMax

          if (audioPlayer.current.currentTime >= audioDuration) {
            handlePauseAudio()
            setIsPlaying(false)
          }

          setCurAudioTime(audioPlayer.current.currentTime)
        }
      }, 50)
    } else {
      clearInterval(scrollInterval.current)
      scrollInterval.current = null
    }

    return () => {
      clearInterval(scrollInterval.current)
      scrollInterval.current = null
    }
  }, [scrollInterval.current, audioScroller.current, audioPlayer.current, isPlaying])

  // Scroll audio track
  const handleAudioScrollChange = (e) => {
    if (selectedAudio) {
      setIsPlaying(false)
      audioPlayer.current.pause()
  
      audioScroller.current.value = e.target.value
      setCurAudioTime(audioDuration / sliderMax * audioScroller.current.value)
    }
  }
  
  // Play audio from scrolling release time
  const handleAudioScrollRelease = (e) => {
    if (selectedAudio) {
      setIsPlaying(true)
  
      const timestamp = audioDuration / sliderMax * audioScroller.current.value
      
      if (timestamp !== undefined && timestamp !== Infinity) {
        audioPlayer.current.currentTime = timestamp
        setCurAudioTime(timestamp)
      }
  
      audioPlayer.current.play()
    }
  }

  // Play audio
  const handlePlayAudio = () => {
    if (selectedAudio) {
      if (audioPlayer.current.currentTime === audioDuration)
        audioPlayer.current.currentTime = 0
      
      audioPlayer.current.play()
      setIsPlaying(true)
    }
  }

  // Pause audio
  const handlePauseAudio = () => {
    audioPlayer.current.pause()
    setIsPlaying(false)
  }

  // Go to beginning or end of audio track
  const handleFullStep = (dir) => {
    let timestamp = 0
    
    if (dir === 'forward')
      timestamp = audioDuration

    audioPlayer.current.currentTime = timestamp
    audioScroller.current.value = timestamp / audioDuration * sliderMax
    setCurAudioTime(timestamp)

    if (isPlaying)
      audioPlayer.current.play()
  }

  // Create link to download audio file
  const handleDownload = () => {
    if (selectedAudio) {
      const link = document.createElement('a')
      link.href = selectedAudio.audio
      link.download = selectedAudio.title
      link.click()
      link.remove()
    }
  }

  // Delete audio file
  const handleDelete = () => {
    if (selectedAudio) {
      axios.post('/delete-audio', {
        data: {
          audioId: selectedAudio.id
        }
      })
      const newAudioFiles = audioFiles.filter((file) => file.id !== selectedAudio.id)
      setAudioFiles(newAudioFiles)
      setSelectedAudio(null)
    }
  }

  return (
    <div className={`audio-player-container ${isLight ? 'audio-player-light' : 'audio-player-dark'}`}>
      <audio ref={audioPlayer} src="">
        Audio player is not supported
      </audio>

      <div className="audio-controls-wrapper">
        <button type="button" onClick={()=>handleFullStep('backward')}><FontAwesomeIcon icon={faFastBackward} /></button>
        {isPlaying ? (
          <button type="button" onClick={handlePauseAudio}><FontAwesomeIcon icon={faPause} /></button>
        ) : (
          <button type="button" onClick={handlePlayAudio}><FontAwesomeIcon icon={faPlay} /></button>
        )}
        <button type="button" onClick={()=>handleFullStep('forward')}><FontAwesomeIcon icon={faFastForward} /></button>
      </div>

      <div className="audio-range-wrapper">
        <span className="time-display">{selectedAudio ? secondsToTime(curAudioTime, audioDuration) : '--:--'}</span>
        <input type="range" ref={audioScroller} className="mousetrap" onChange={handleAudioScrollChange} onMouseUp={handleAudioScrollRelease} defaultValue="0" min="0" max={sliderMax} />
        <span className="time-display">{selectedAudio ? secondsToTime(audioDuration) : '--:--'}</span>
      </div>
      {selectedAudio ? (
        <>
          <button type="button" className="time-display" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button type="button" className="time-display" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      ) : (
        null
      )}
    </div>
  )
}

export default AudioPlayer
