import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userDetails, setUserDetails] = useState(null);
  const [data, setOtherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const loginAndFetchData = async () => {
      if (!token) {
        try {
          // Login API Request
          const loginResponse = await axios.post('http://localhost:5000/api/login', {
            email: "rpirdsaftle@jpec.org",
            password: "password",
          });
          const fetchedToken = loginResponse.data.token;
          setToken(fetchedToken);
          localStorage.setItem('token', fetchedToken);

          // Subsequent API Requests (Only if login is successful)
          const userDetailsResponse = await axios.get('http://localhost:5000/api/protected', {
            headers: { Authorization: `Bearer ${fetchedToken}` },
          });
          console.log(userDetailsResponse);
          setUserDetails(userDetailsResponse.message);
          if(data==null){
            const otherDataResponse = await axios.get('http://localhost:5000/api/calls', {
              headers: { Authorization: `Bearer ${fetchedToken}` },
            });
            console.log("Calls data ", otherDataResponse)
            console.log("Calls data.data ", otherDataResponse.data.data)
            setOtherData(otherDataResponse.data.data);
          }
          
        } catch (error) {
          setErrorMessage('Failed to log in or fetch data.');
          console.error('Error:', error.response?.data || error.message);
        }
      }
    };

    loginAndFetchData();
  }, [token]);

  const fetchCallData = async () => {
    if (token) {
      try {
        const otherDataResponse = await axios.get('http://localhost:5000/api/calls', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Calls data ", otherDataResponse);
        console.log("Calls data.data ", otherDataResponse.data.data);
        setOtherData(otherDataResponse.data.data);
      } catch (error) {
        console.error('Error fetching call data:', error.response?.data || error.message);
        setErrorMessage('Failed to fetch call data.');
      }
    } else {
      setErrorMessage('You need to log in first.');
    }
  };

  return (
    <div>
    {token ? <p>Logged in successfully! Token: {token}</p> : <p>Logging in...</p>}
    <input id= "one" type="text" />
    <input id= "two" type="text" />
    <button onClick={fetchCallData}>Fetch Call Data</button>

    <h1>User List</h1>
      <ul>
        {/* {otherData.data} */}
        {/* {userDetails} */}
        <h1>Call Records</h1>
        
      {data && data.length > 0 ? (
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
      </ul>
    </div>
    

    
  );
}

export default LoginPage;