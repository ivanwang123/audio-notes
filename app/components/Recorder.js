import React, {useState, useEffect, useRef} from 'react'
import axios from 'axios'
import getBlobDuration from 'get-blob-duration'
import useMousetrap from "react-hook-mousetrap"
import {secondsToRoundedTime} from '../utils/timeConverter'

function Recorder(props) {

  const {audioFiles, setAudioFiles, setSelectedAudio, isLight} = props

  const [recording, setRecording] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStartTime, setRecordingStartTime] = useState(0)
  const [recordingElapsedTime, setRecordingElapsedTime] = useState(0)

  const recordInterval = useRef(null)

  useMousetrap(['ctrl+r', 'command+r'], () => {
    if (isRecording)
      handleStopRecord()
    else
      handleStartRecord()
  })

  const recordAudio = () => {
    return new Promise((resolve) => {
      navigator.mediaDevices.getUserMedia({audio: true})
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream)
          const audioChunks = []
  
          mediaRecorder.addEventListener("dataavailable", (e) => {
            audioChunks.push(e.data)
          })
  
          const start = () => {
            mediaRecorder.start()
          }
  
          const stop = () => {
            return new Promise((resolve) => {
              mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, {'type': 'audio/mp3'})

                if (audioBlob.size > 0) {
                  const audioUrl = URL.createObjectURL(audioBlob)
                  const audio = new Audio(audioUrl)
                  const play = () => {
                    audio.play()
                  }
      
                  resolve({audioBlob, audioUrl, play})
                } else {
                  resolve(null)
                }
              })
  
              mediaRecorder.stop()
            })
          }
  
          resolve({start, stop})
        })
    })
  }

  const handleStartRecord = async () => {
    if (!recording) {
      const audio = await recordAudio()
      audio.start()
      setRecording(audio)
      setIsRecording(true)
      setRecordingStartTime(new Date().getTime())
      setRecordingElapsedTime(0)
    }
  }

  const handleStopRecord = async () => {
    if (recording) {
      const recordingInfo = await recording.stop()
      setIsRecording(false)

      let fileReader = new FileReader()
      fileReader.onload = async (e) => {
        const audioRes = await axios.post('/save-audio', {
          data: {
            audioBuffer: Buffer(new Uint8Array(e.target.result))
          }
        })

        const blobDuration = await getBlobDuration(recordingInfo.audioBlob)
        const newAudioFile = {
          title: `Recording ${audioFiles.length+1}`,
          id: audioRes.data.audioId,
          duration: blobDuration,
          audio: recordingInfo.audioUrl
        }

        setAudioFiles((prevFiles) => [...prevFiles, newAudioFile])
        setSelectedAudio(newAudioFile)
        setRecording(null)
      }
      fileReader.readAsArrayBuffer(recordingInfo.audioBlob)
    }
  }

  useEffect(() => {
    if (isRecording) {
      recordInterval.current = setInterval(() => {
        const elapsedTime = (new Date().getTime() - recordingStartTime) / 1000
        setRecordingElapsedTime(elapsedTime)

        if (elapsedTime >= 600) {
          handleStopRecord()
        }
      }, 200)
    } else {
      clearInterval(recordInterval.current)
      recordInterval.current = null
    }

    return () => {
      clearInterval(recordInterval.current)
      recordInterval.current = null
    }
  }, [recordInterval.current, recordingStartTime, isRecording])

  return (
    <div className={`recorder-wrapper ${isLight ? 'recorder-light' : 'recorder-dark'}`}>
      {isRecording ? (
        <button type="button" className="stop-button" onClick={handleStopRecord}>{secondsToRoundedTime(recordingElapsedTime)} <span className="limit">/ 10:00</span></button>
      ) : (
        <button type="button" className="play-button" onClick={handleStartRecord}></button>
      )}
    </div>
  )
}

export default Recorder
