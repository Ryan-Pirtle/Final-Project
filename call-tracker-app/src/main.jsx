import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './LoginPage.jsx'
import CallPage from './CallPage.jsx'
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallsPage from './CallsPage.jsx'
import UsersPage from './UsersPage.jsx'
import CrewsPage from './CrewsPage.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
        <Router>
        <Routes>
        <Route path='/' element={<LoginPage />}/>
        <Route path='/CallsPage' element={<CallsPage />}/>
        <Route path='/UsersPage' element={<UsersPage />}></Route>
        <Route path='/CrewsPage' element={<CrewsPage />}/>
        </Routes>
        </Router>
  </StrictMode>,
)
