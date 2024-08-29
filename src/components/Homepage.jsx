import React, { useState, useEffect, useRef } from 'react'

export const Homepage = (props) => {
  const {setFile, audioStream, setAudioStream, recordedUrl, setRecordedUrl, readAudioFromFile} = props
  const [recordingStatus, setRecordingStatus] = useState('inactive')
  const [duration, setDuration] = useState(0)
  const mediaStream = useRef(null)
  const mediaRecorder = useRef(null)
  const mediaChunks = useRef([])
  

  async function startRecording(){
      try{
          // Ask permission to stream
          const stream = await navigator.mediaDevices.getUserMedia(
              {audio: true}
          )
          // Set reference to stream object
          mediaStream.current = stream
          // Set reference to media recorder object
          mediaRecorder.current = new MediaRecorder(stream)
          
          // Set functions of the media recorder
          mediaRecorder.current.ondataavailable = (e) => {
              if (e.data.size > 0){
                  // Record the media chunks
                  mediaChunks.current.push(e.data)
              }
          }
          mediaRecorder.current.onstop = () => {
              const recordedBlob = new Blob(mediaChunks.current, {type: 'audio/webm'})
              setAudioStream(recordedBlob)
              const url = URL.createObjectURL(recordedBlob)
              setRecordedUrl(url)
              mediaChunks.current = []
          }
          
          // Start recording
          mediaRecorder.current.start()
          setRecordingStatus('recording')

      } catch(err){
          console.error(err.message)
      }
  }


  function stopRecording() {
      // Stop recording
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording' ){
          mediaRecorder.current.stop() 
      }

      // Also stop media input for all media tracks (microphone, video, ...)
      if (mediaStream.current){
          mediaStream.current.getTracks().forEach(
              (track) => {
                  track.stop()
              }
          )
      }

      // Set recording status as inactive
      setRecordingStatus('inactive')

      // Set duration to 0
      setDuration(0)
  }

  // Monitor duration using useEffect
  useEffect(() => {
  const interval = setInterval(() => {
    if (recordingStatus === "inactive"){return}
    setDuration(prevDuration => prevDuration + 1); // Functional update!!!
    console.log(duration)
  }, 1000);

  return () => clearInterval(interval);
});

  
  return (
    <main className='flex-1 p-4 justify-center flex flex-col text-center pb-20 gap-3 sm:gap-4'>
        <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>Free<span className='text-blue-400 bold'>Scribe</span></h1>
        <h3>Record <span>&rarr;</span> Transcribe <span>&rarr;</span> Translate</h3>
        <button onClick={recordingStatus === 'inactive' ? startRecording : stopRecording} className='specialBtn flex justify-between w-72 items-center mx-auto mt-4 rounded-md px-2 py-2'>
            <p className='text-blue-400'>{recordingStatus === 'inactive' ? "Record" : "Stop recording"}</p>
            <div className='flex gap-2 items-center'>
                {(recordingStatus ==="recording") && <p>{duration}s</p> }
                <i className={"fa-solid fa-microphone" + (recordingStatus === "recording" ?  " text-rose-300" : "")}></i>
            </div>
        </button>
        <p>Or<label className='cursor-pointer text-blue-400 hover:text-blue-600 duration-200'> upload <input className='hidden' type="file" onChange={(e) => {
            const newFile = e.target.files[0]
            setFile(newFile)
            readAudioFromFile(newFile)
        }} accept=".mp3, .wave"/> </label>a mp3 file</p>
        <p className='italic text-sm text-slate-500'>Free now, free forever</p>
    </main>
  )
}
