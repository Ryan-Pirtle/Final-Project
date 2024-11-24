import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginPage from './LoginPage.jsx'
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataPage from './DataPage.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
        <Router>
        <Routes>
        <Route path='/' element={<LoginPage />}/>
        <Route path='/DataPage' element={<DataPage />}/>
        </Routes>
        </Router>
  </StrictMode>,
)
