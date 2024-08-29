import React from 'react'

export const Transcription = (props) => {
  const {output} = props
  
  return (
    <div>{output.replace('"', '')}</div>
  )
}
