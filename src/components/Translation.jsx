import React, { useEffect, useRef, useState } from 'react'
import { LANGUAGES } from '../utils/presets'

export const Translation = (props) => {
  const {output, translation, setTranslation} = props
  const [toLanguage, setToLanguage] = useState("ron_Latn")

  const worker = useRef(null)

  useEffect(()=>{
    // Initialize worker (if it does not exist)
    if (!worker.current){
      worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url), {
        type:"module"
      })
    }

    // Define and attach event handler for the worker 
    const onMessageReceived = async (e) => {
      switch (e.data.status){
        case "initiate":
          console.log("Initiating...")
          break;
        case "progress":
          console.log("Progress...")
          break;
        case "update":
          setTranslation(e.data.output)
          console.log("Updating...")
          break;
        case "complete":
          console.log("Complete...")
          break;

      }
    } 
    worker.current.addEventListener('message',onMessageReceived)

    // Cleanup
    return ()=> worker.current.removeEventListener('message', onMessageReceived)
  }, [])

  function handleTranslateClick(){
    if (worker.current && toLanguage){
      worker.current.postMessage({
        text: output,
        tgt_lang: toLanguage,
        src_lang: "eng_Latn"
      })
    }
  }

  return (
    <div className='flex flex-col items-start gap-4 mt-4 mx-auto w-full'>
      <p className='text-slate-400 text-xs sm:text-sm'>To language</p>
      <div className="flex w-full items-center justify-between gap-6">
        <select defaultValue="Romanian" onChange={(e) => {
          e.target.value === "Select language..." ? setToLanguage(null) : setToLanguage(e.target.value)
        }} className='bg-white p-2 rounded-lg w-full cursor-pointer'>
          <option key="null" value="Select language...">Select language...</option>
          {Object.entries(LANGUAGES).map(([key, value]) => {
            return (
            <option key={key} value={value}>{key}</option>
            )
          })}
        </select>
        {toLanguage && <button className='specialBtn p-2 text-blue-400 rounded-lg' onClick={handleTranslateClick}>Translate</button>}
      </div>
      {translation && <p>{translation}</p>}
    </div>
  )
}
