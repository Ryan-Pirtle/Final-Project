import React, { useState } from 'react';
import axios from 'axios';

function CallsPage() {

  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // State for filter fields
  const [callType, setCallType] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchFilteredData = async () => {
    try {
      let response;

      // Determine which API route to call based on inputs
      if (!callType && !startTime && !endTime) {
        response = await axios.get('/api/calls');
      } else if (callType && !startTime && !endTime) {
        response = await axios.get(`/api/calls-by-type?callType=${callType}`);
      } else if (!callType && startTime && endTime) {
        response = await axios.get(`/api/calls-by-time?startTime=${startTime}&endTime=${endTime}`);
      } else if (callType && startTime && endTime) {
        response = await axios.get(
          `/api/calls-by-type-and-time?callType=${callType}&startTime=${startTime}&endTime=${endTime}`
        );
      } else {
        setErrorMessage('Invalid filter combination.');
        return;
      }

      setData(response.data); // Update state with fetched data
      setErrorMessage(null); // Clear any existing error messages
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      setErrorMessage('Failed to fetch data. Please try again.');
    }
  };
  const changeType = (event) => {
    setCallType(event.target.value);
  };
  return (
    <div>
      <h1>Filter Calls</h1>
      <div>
        {/* <label>
          Call Type:
          <input
            type="text"
            value={callType}
            onChange={(e) => setCallType(e.target.value)}
            placeholder="Enter call type"
          />
        </label> */}


        <label>Choose a Call type:</label>
        <select id="callTypeSelection" name="calls" value = {callType} onChange={changeType}>
        <option value="none">None</option>

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
