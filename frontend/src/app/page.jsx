import Hero from '@/components/Hero/Hero'
import Navbar from '@/components/Navbar/Navbar'
import SearchBar from '@/components/SearchBar/SearchBar'
import Topbar from '@/components/Topbar/Topbar'
import React from 'react'

export default function Home() {
  return (
    <div>
      <Topbar />
      <Navbar />
      <SearchBar />
      <Hero />
    </div>
  )
}
