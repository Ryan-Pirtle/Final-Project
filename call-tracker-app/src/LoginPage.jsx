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


  // useEffect(() => {
    // const loginAndFetchData = async () => {
    //   if (!token) {
    //     try {
    //       // Login API Request
    //       const loginResponse = await axios.post('http://localhost:5000/api/login', {
    //         email: "rpirdsaftle@jpec.org",
    //         password: "password",
    //       });
    //       const fetchedToken = loginResponse.data.token;
    //       setToken(fetchedToken);
    //       localStorage.setItem('token', fetchedToken);

    //       // Subsequent API Requests (Only if login is successful)
    //       const userDetailsResponse = await axios.get('http://localhost:5000/api/protected', {
    //         headers: { Authorization: `Bearer ${fetchedToken}` },
    //       });
    //       console.log(userDetailsResponse);
    //       setUserDetails(userDetailsResponse.message);
    //       if(data==null){
    //         const otherDataResponse = await axios.get('http://localhost:5000/api/calls', {
    //           headers: { Authorization: `Bearer ${fetchedToken}` },
    //         });
    //         console.log("Calls data ", otherDataResponse)
    //         console.log("Calls data.data ", otherDataResponse.data.data)
    //         setOtherData(otherDataResponse.data.data);
    //       }
          
    //     } catch (error) {
    //       setErrorMessage('Failed to log in or fetch data.');
    //       console.error('Error:', error.response?.data || error.message);
    //     }
    //   }
    // };

  //   loginAndFetchData();
  // }, [token]);

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
      <button onClick={fetchCallData} disabled={isLoading}>
        {isLoading ? 'Fetching...' : 'Fetch Call Data'}
      </button>
      <button onClick={goToDataPage}>Go to Data Page</button>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {Array.isArray(data) && data.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Caller Name</th>
              <th>Caller Address</th>
              <th>Call Type</th>
              <th>Crew Assigned</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.caller_name}</td>
                <td>{item.caller_address}</td>
                <td>{item.call_type}</td>
                <td>{item.crew_assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}

export default LoginPage;
