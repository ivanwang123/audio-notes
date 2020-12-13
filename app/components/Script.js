import React from 'react'

function Script(props) {

  const {fileContent, setFileContent, isLight} = props

  return (
    <textarea className={`text-wrapper mousetrap ${isLight ? 'text-light' : 'text-dark'}`} value={fileContent} onChange={(e)=>setFileContent(e.target.value)} placeholder="Write away..." autoFocus></textarea>
  )
}

export default Script
