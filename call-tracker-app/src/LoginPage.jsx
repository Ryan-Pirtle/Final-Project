import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setOtherData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setErrorMessage('Invalid email or password.');
    }
  };

  const fetchCallData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/calls', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOtherData(response.data.data || []);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      setErrorMessage('Failed to fetch call data.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToDataPage = () => {
    console.log("test")
    navigate('./DataPage');
  } 

  return (
    <div>
      {token ? <p>Logged in successfully! Token: {token}</p> : <p>Please log in:</p>}
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
      

      
    </div>
  );
}

export default LoginPage;
