import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CallsPage() {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [allCallTypes, setAllCallTypes] = useState([]);
  const [callType, setCallType] = useState('none');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || null);


  useEffect(() => {
    const getTypes = async () => {
      try {
        const response = await axios.get('/api/callTypes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response);
        const callTypes = response.data.data.map((item) => item.call_type); // Extract call_type values
        setAllCallTypes(callTypes);
        console.log(callTypes)
      } catch (error) {
        console.error("Error fetching call types:", error.response?.data || error.message);
        setErrorMessage('Failed to fetch call types.');
      }
    };
  
    getTypes();
  }, []); // Dependency array ensures it runs only once
  
  const fetchFilteredData = async () => {
    try {
      let response;

      if (callType =="none" && !startTime && !endTime) {
        response = await axios.get('/api/calls', {
                    headers: { Authorization: `Bearer ${token}` },
                  });
      } else if (callType !="none" && !startTime && !endTime) {
        response = await axios.get(`/api/calls-by-type?callType=${callType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (callType =="none" && startTime && endTime) {
        response = await axios.get(`/api/calls-by-time?startTime=${startTime}&endTime=${endTime}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (callType !="none" && startTime && endTime) {
        response = await axios.get(
          `/api/calls-by-type-and-time?callType=${callType}&startTime=${startTime}&endTime=${endTime}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
      } else {
        setErrorMessage('Invalid filter combination.');
        return;
      }

      setData(response.data.data);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      setErrorMessage('Failed to fetch data. Please try again.');
    }
  };

  return (
    <div>
      <h1>Filter Calls</h1>
      <div>
        <label>Choose a Call type:</label>
        <select
  id="callTypeSelection"
  name="calls"
  value={callType}
  onChange={(e) => setCallType(e.target.value)}
>
  <option value="none">None</option>
  {allCallTypes &&
    allCallTypes.map((type, index) => (
      <option key={index} value={type}>
        {type}
      </option>
    ))}
</select>

      </div>

      <div>
        <label>
          Start Time:
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          End Time:
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
      </div>
      <button onClick={fetchFilteredData}>Fetch Calls</button>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

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
    </div>
  );
}

export default CallsPage;
