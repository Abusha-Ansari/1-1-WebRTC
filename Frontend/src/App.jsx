import React from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Sender from './components/Sender'
import Receiver from './components/Receiver'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App