import React, { useState, useRef, useEffect } from 'react'
import { Transcription } from './Transcription'
import { Translation } from './Translation'
import { MessageTypes } from '../utils/presets'

export const Information = (props) => {
  const {
          file, 
          audioStream, 
          recordedUrl, 
          output, 
          setOutput,
          loading, 
          setLoading, 
          downloading, 
          setDownloading, 
          finished, 
          setFinished
        } = props

  const [tab, setTab] = useState('transcription')
  const [copied, setCopied] = useState(false)
  const [translation, setTranslation] = useState(null)


  // HARDCODED, needs to be changed
  const textElement = (tab === "transcription" ? output : translation || '')
  console.log(translation)


  async function handleCopy(){
    navigator.clipboard.writeText(textElement)
    setCopied(true)
    setTimeout(()=> {
      setCopied(false)
    },1000)
  } 

  function handleDownload(){
    const blob = new Blob([textElement], {type: 'text/plain'})
    const element = document.createElement("a")
    element.href = URL.createObjectURL(blob)
    const currentDate = new Date(Date.now())
    element.download = "FreeScribe_" + `${currentDate.getFullYear()}${currentDate.getMonth()+1}${currentDate.getDate()}` + ".txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }


    return (
  <main className='flex-1 p-4 justify-center flex flex-col text-center pb-20 gap-3 sm:gap-4 w-full max-w-prose mx-auto'>
        <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl mb-10'>Your<span className='text-blue-400 bold'> Transcription </span></h1>
        <div className='grid grid-cols-2 rounded-full border mx-auto items-center bg-white blueShadow'>
            <button onClick={()=>{setTab("transcription")}} className={"px-4 py-1 rounded-l-full duration-200" + 
            (tab === "transcription" ? " bg-blue-400 text-white" : " text-blue-400 hover:text-blue-600")
            }>Transcription</button>
            <button onClick={()=>{setTab("translation")}}  className={"px-4 rounded-r-full py-1 duration-200" + 
            (tab === "translation" ? " bg-blue-400 text-white" : " text-blue-400 hover:text-blue-600")}>Translation</button>
        </div>
        {(tab === "transcription" && <Transcription output={output}/>)}
        {(tab === "translation" && <Translation output={output} translation={translation} setTranslation={setTranslation}/>)}
        <div className='flex gap-10 mx-auto mt-5 text-xl text-blue-400'>
          <button title='Download' className='hover:text-blue-600 duration-200' onClick={handleDownload}>
            <i className="fa-solid fa-download bg-white p-3 rounded-lg aspect-square"></i>
          </button>
          <button onClick={handleCopy} title='Copy (clipboard)' className='hover:text-blue-600'>
            {!copied ? 
            <i className="fa-solid fa-clipboard bg-white p-3 rounded-lg aspect-square"></i> : 
            <i className="fa-solid fa-check p-3 rounded-lg aspect-square"></i>}
          </button>
        </div>
        {/*copied && <div className=' text-white font-medium bg-blue-400 p-4 rounded-md w-fit mx-auto'>Copied to clipboard</div>*/}
    </main>
    )
}
 