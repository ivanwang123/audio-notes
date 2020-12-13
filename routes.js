const {Router} = require('express')
const Store = require('./Store')
const electron = require('electron')
const {dialog} = require('electron')
const fs = require('fs')
const path = require('path')
const randomize = require('randomatic')

const store = new Store({
  configName: 'saved-files',
  defaults: {}
})

const routes = Router()

routes.post('/open-file', (req, res) => {
  const {file} = req.body.data

  // Use created date time as file id
  const {birthtime} = fs.statSync(file)
  const fileId = new Date(birthtime).getTime().toString()
  let fileContent = fs.readFileSync(file, {encoding: 'utf-8'})

  // Get file if it exists, else create it using id
  let audioFiles = store.get(fileId)
  let audioPromises = []
  let audioData = []
  if (!audioFiles) {
    store.set(fileId, [])

    const payload = {
      fileId: fileId,
      filePath: file,
      fileContent: fileContent,
      audioData: audioData
    }
    res.send(payload)
  } else {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')

    // Create read audio file promises
    audioFiles.forEach((file) => {
      const filePath = path.join(userDataPath, 'Recordings', `${file.id}.mp3`)
      const audioPromise = new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            resolve(null)
          } else {
            const newAudioFile = {
              title: file.title,
              id: file.id,
              duration: file.duration,
              audio: data.toString('base64')
            }
            resolve(newAudioFile)
          }
        })
      })
      audioPromises.push(audioPromise)
    })

    // Resolve all audio promises and return data
    Promise.all(audioPromises).then((data) => {
      audioData = data.filter((file) => file && file.audio.length > 0)
      const payload = {
        fileId: fileId,
        filePath: file,
        fileContent: fileContent,
        audioData: audioData
      }
      res.send(payload)
    })
  }
})

routes.post('/save-file', (req, res) => {
  const {fileId, filePath, fileContent, audioFiles} = req.body.data

  let saveFileId = fileId
  let saveFilePath = filePath

  try {
    fs.writeFileSync(saveFilePath, fileContent, {encoding: 'utf-8'})
  } catch (e) {
    const newFilePath = dialog.showSaveDialogSync({
      filters: [{name: '', extensions: ['txt']}]
    })

    if (newFilePath) {
      fs.writeFileSync(newFilePath, fileContent, {encoding: 'utf-8'})
  
      const {birthtime} = fs.statSync(newFilePath)
      const newFileId = new Date(birthtime).getTime()
      
      saveFileId = newFileId
      saveFilePath = newFilePath
    }
  }
  
  if (saveFileId && saveFilePath) {
    store.set(saveFileId, audioFiles)
  
    const payload = {
      fileId: saveFileId,
      filePath: saveFilePath,
      fileContent: fileContent,
      audioFiles: store.get(saveFileId)
    }
    res.send(payload)
  } else {
    res.send(null)
  }
})

routes.post('/save-audio', (req, res) => {
  const {audioBuffer} = req.body.data

  try {
    // Create write stream to new mp3 file in user's app data
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')
    const recordingsPath = path.join(userDataPath, 'Recordings')

    // Create /Recordings folder if it does not exist
    if (!fs.existsSync(recordingsPath))
      fs.mkdirSync(recordingsPath)
    const defaultFileName = path.join(recordingsPath, `${randomize('a0', 5)}.mp3`)
    const mp3File = fs.createWriteStream(defaultFileName)
  
    mp3File.on('open', () => {

      // Write audio buffer to mp3 file
      mp3File.write(Buffer.from(audioBuffer.data))
      mp3File.end()
  
      // Use created date time as file name and id
      const {birthtime} = fs.statSync(mp3File.path)
      const audioId = new Date(birthtime).getTime()
  
      // Rename file to it's id
      fs.rename(defaultFileName, userDataPath+`/Recordings/${audioId}.mp3`, (err) => {
        if (err)
          res.send({audioId: 0})
        else
          res.send({audioId: audioId})
      })
    })
  } catch(e) {
    // Send id of 0 if error occurs
    res.send({audioId: 0})
  }
})

routes.post('/delete-audio', (req, res) => {
  const {audioId} = req.body.data

  const userDataPath = (electron.app || electron.remote.app).getPath('userData')
  const filePath = path.join(userDataPath, 'Recordings', `${audioId}.mp3`)

  try {
    fs.unlinkSync(filePath)
  } catch (e) {
  }
})

routes.post('/is-saved', (req, res) => {
  const {fileId, filePath, fileContent, audioFiles} = req.body.data

  let isSaved = false

  if (fileId && filePath) {
    let prevAudioFiles = store.get(fileId)
    let prevFileContent = fs.readFileSync(filePath, {encoding: 'utf-8'})
  
    if (prevFileContent === fileContent) {
      if (prevAudioFiles.length === audioFiles.length) {
        let audioSaved = true
        prevAudioFiles.forEach((prevFile) => {
          if (!audioFiles.find((file) => file.id === prevFile.id && file.title === prevFile.title))
            audioSaved = false
        })
        isSaved = audioSaved
      }
    }
  } else {
    if (fileContent.length === 0 && audioFiles.length === 0) {
      res.send({isSaved: false, action: "nosave"})
      return
    }
  }

  if (isSaved) {
    res.send({isSaved: true})
  } else {
    const options  = {
      buttons: ["Save", "Don't Save", "Cancel"],
      message: "Do you want to save changes?"
    }
  
    const dialogRes = dialog.showMessageBoxSync(options)
    switch (dialogRes) {
      case 0: res.send({isSaved: false, action: "save"}); break;
      case 1: res.send({isSaved: false, action: "nosave"}); break;
      case 2: res.send({isSaved: false, action: "cancel"}); break;
      default: res.send({isSaved: isSaved}); break;
    }
  }
})

module.exports = routes