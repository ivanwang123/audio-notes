// Convert seconds to #m #s format
export const secondsToText = (seconds) => {
  if (seconds >= 1) {
    const roundedSecs = seconds.toFixed(0)
    const mins = Math.floor(roundedSecs / 60)
    const secs = roundedSecs % 60
    let formatted = ''

    if (mins > 0)
      formatted += `${mins}m `
    formatted += `${secs}s`

    return formatted
  } else {
    const roundedSecs = seconds.toFixed(1)
    let formatted = `${roundedSecs}s`
    formatted = formatted.substr(1)
    return formatted
  }
}

// Convert seconds to ##:##.## format
export const secondsToTime = (seconds) => {
  let roundedSecs = seconds.toFixed(2)
  let milliSecs = ((roundedSecs % 1)*100).toFixed(0)
  let secs = Math.floor(roundedSecs) % 60
  let mins = Math.floor(roundedSecs / 60)
  milliSecs = ('0'+milliSecs).substr(-2)
  secs = ('0'+secs).substr(-2)

  const formatted = `${mins}:${secs}.${milliSecs}`
  return formatted
}

// Convert seconds to ##:## format
export const secondsToRoundedTime = (seconds) => {
  const roundedSecs = seconds.toFixed(0)
  let mins = Math.floor(roundedSecs / 60)
  let secs = roundedSecs % 60

  secs = ('0'+secs).slice(-2)
  
  const formatted = `${mins}:${secs}`
  return formatted
}

export const secondsToSavedTime = (seconds) => {
  if (seconds <= 0)
    return ''

  const date = new Date(seconds)
  let hrs = date.getHours()
  let mins = date.getMinutes()
  let period = 'AM'

  if (hrs >= 12) {
    period = 'PM'
    hrs -= 12
  }
  if (hrs === 0)
    hrs = 12

  mins = ('0'+mins).slice(-2)

  return `Saved ${hrs}:${mins} ${period}`
}