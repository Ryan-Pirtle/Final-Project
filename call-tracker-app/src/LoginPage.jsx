import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);


  const navigate = useNavigate();

  useEffect(() => {
    if (!token) setErrorMessage('Please log in.');
  }, [token]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      const fetchedToken = response.data.token;
      setToken(fetchedToken);
      localStorage.setItem('token', fetchedToken);
      setErrorMessage(null); // Clear any existing error message
      goToCallsPage();
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setErrorMessage('Invalid email or password.');
    }
  };

  const goToCallsPage = () => {
    console.log("test")
    navigate('./CallsPage');
  } 

  return (
    <div>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      
    </div>
  );
}

export default LoginPage;
