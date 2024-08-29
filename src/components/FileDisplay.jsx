import React, { useRef } from 'react'

export const FileDisplay = (props) => {
    const {file, audioStream, recordedUrl, handleAudioReset, handleFormSubmission, worker} = props
    

    return (<main className='flex-1 p-4 justify-center flex flex-col text-center pb-20 gap-3 sm:gap-4 w-full max-w-prose mx-auto'>
    <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl mb-10'>Your<span className='text-blue-400 bold'> File </span></h1>
    {file && <div className='flex flex-col text-left my-2 w-full'>
        <h1 className='font-semibold'>{"File"}</h1>
        <p>{file.name}</p>
        {recordedUrl ? <audio className='mt-2' controls src={recordedUrl} /> : <i className="mt-2 fa-solid fa-gear mx-auto animate-spin"></i>}
    </div>}
    {audioStream && <div className='flex flex-col text-left mx-auto my-4 w-full'>
        <h1 className='font-semibold'>{"Recording"}</h1>
        {recordedUrl ? <audio className='mt-2' controls src={recordedUrl} /> : <i className="mt-2 fa-solid fa-gear mx-auto animate-spin"></i>}
    </div>}
    {recordedUrl && <div className='flex justify-between items-center'>
        <button onClick={handleAudioReset} className='text-slate-400 hover:text-blue-600 duration-200'>
        <p className='text-sm sm:text-base md:text-lg'>Reset</p>
        </button>
        <button onClick={handleFormSubmission} className='specialBtn rounded-md px-3 py-2 text-blue-400 flex items-center justify-between gap-2'>
        <p>Transcribe</p>
        <i className="fa-solid fa-pen-nib"></i>
        </button>
    </div>}
    </main>
    )
}
