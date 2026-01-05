import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Diagnostic from './pages/Diagnostic'
import Result from './pages/Result'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnostic" element={<Diagnostic />} />
        <Route path="/resultat" element={<Result />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
