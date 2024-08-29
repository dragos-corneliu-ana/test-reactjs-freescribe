import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Homepage } from './components/Homepage'
import { FileDisplay } from './components/FileDisplay'
import { Information } from './components/Information'
import { Transcribing } from './components/Transcribing'
import * as WavEncoder from 'wav-encoder';
import { MessageTypes } from './utils/presets'


function App() {
const [file, setFile] = useState(null)
const [audioStream, setAudioStream] = useState(null)
const [recordedUrl, setRecordedUrl] = useState('')
const [output, setOutput] = useState(false)
const [loading, setLoading] = useState(false)
const [downloading, setDownloading] = useState(false)
const [finished, setFinished] = useState(false)


const worker = useRef(null)

const fileOrAudioStreamAvailable = file || audioStream 

function handleAudioReset() {
  setFile(null)
  setAudioStream(null)
}

async function readAudioFromFile(audioFile){
  // Create audio context
  const samplingRate = 16000
  const audioContext = new AudioContext({sampleRate: samplingRate})
  // Get array buffer from audio File
  const response = await audioFile.arrayBuffer()
  // Decode audio
  const decodedAudio = await audioContext.decodeAudioData(response)
  
  // Create offline audio context to render the buffer
  const offlineAudioContext = new OfflineAudioContext({
    numberOfChannels: decodedAudio.numberOfChannels,
    length: decodedAudio.length,
    sampleRate: decodedAudio.sampleRate
  })
  // Copy the decoded audio context into the offline buffer
  const source = offlineAudioContext.createBufferSource()
  source.buffer = decodedAudio
  source.connect(offlineAudioContext.destination)
  // Start rendering (offline, faster than online and it is not going through speakers)
  source.start()
  const renderedBuffer = await offlineAudioContext.startRendering()

  // Convert rendered buffer to wavData and get corresponding medial blob and url
  const wavData = await WavEncoder.encode({
    sampleRate: renderedBuffer.sampleRate,
    channelData: [renderedBuffer.getChannelData(0)]
  });
  const mediaBlob = new Blob([wavData], {type: 'audio/wav'})
  //const mediaUrl = URL.createObjectURL(audio)
  const mediaUrl = URL.createObjectURL(mediaBlob)
  setRecordedUrl(mediaUrl)

  // Return encoded audio data
  const audio = decodedAudio.getChannelData(0)
  return audio
}



async function handleFormSubmission() {
  if (!file && !audioStream){return}

  let audio = await readAudioFromFile(file ? file : audioStream)
  const model_name = "openai/whisper-tiny.en"


  worker.current.postMessage({
    type:MessageTypes.INFERENCE_REQUEST,
    audio,
    model_name
    })
  }

  useEffect(()=>{
    // Create worker instance if it does not exist
    if (!worker.current){
      worker.current = new Worker(new URL('./utils/whisper.worker.js', import.meta.url), {
        type:"module"
      })
    }

    // Define event handler for the worker  
    const onMessageReceived = async (e) => {
      switch (e.data.type){
        case MessageTypes.DOWNLOADING:
          setDownloading(true)
          console.log('DOWNLOADING')
          break;
        case MessageTypes.LOADING:
          setLoading(true)
          console.log('LOADING')
          break;
        case MessageTypes.RESULT:
          console.log(e.data.result)
          setOutput(e.data.result.text.trim().replace('"',''))
          console.log('RESULT RECEIVED')
          break;
        case MessageTypes.INFERENCE_DONE:
          setFinished(true)
          console.log('DONE')
          break;
        default:
          console.log('INVALID EVENT FROM WORKER ' + `${e.data.type}`)
      }
    }
    worker.current.addEventListener('message', onMessageReceived)


    return () => worker.current.removeEventListener('message', onMessageReceived)
  },[])


return (
  <>
    <div className='flex flex-col w-full max-w-[1000px] mx-auto p-4'>
      <section className='min-h-screen flex flex-col'>
        <Header />
      {
      output ? (
      <Information file={file} audioStream={audioStream} recordedUrl={recordedUrl} output={output} setOutput={setOutput} loading={loading} setLoading={setLoading} downloading={downloading} setDownloading={setDownloading} finished={finished} setFinished={setFinished}/>
      ) : loading ? <Transcribing /> : fileOrAudioStreamAvailable ? (
      <FileDisplay file={file} audioStream={audioStream} recordedUrl={recordedUrl} handleAudioReset = {handleAudioReset} worker={worker} handleFormSubmission={handleFormSubmission}/>
      ) : (
      <Homepage audioStream = {audioStream} recordedUrl = {recordedUrl} setFile={setFile} setAudioStream={setAudioStream} setRecordedUrl = {setRecordedUrl} readAudioFromFile={readAudioFromFile}/>
      )
      }
      </section>
      <footer></footer>
    </div>
  </>
)
}

export default App
