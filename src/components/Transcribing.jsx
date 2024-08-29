import React from 'react'

export const Transcribing = () => {
  return (
    <main className='flex-1 p-4 justify-center flex flex-col text-center pb-20 gap-10 md:gap-14'>
        <div>
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl '><span className='text-blue-400 bold'> Transcribing </span></h1>
            <p>warming up the cylinders</p>
        </div>
        <div className='flex flex-col gap-2'>
            {[0,1,2].map((item, itemIndex) => {
                return (
                    <div key={itemIndex} className={'rounded-full bg-slate-400 h-2 loading '+  `loading${item}`}></div>
                )
            })}
        </div>
    </main>
)
}
