import React from 'react'

export const Header = () => {
  return (
    <header className='flex justify-between items-center p-4'>
    <a href="/"><h1 className='font-medium'>Free<span className='text-blue-400 bold'>Scribe</span></h1></a>        
        <a href="/"><button className='specialBtn flex items-center gap-2 px-3 justify-between rounded-lg py-2 text-blue-400'>
          <p className='text-sm'>New</p>
          <i className="fa-solid fa-plus"></i>
        </button></a>
  </header>
)
}

