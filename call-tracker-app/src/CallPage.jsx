import React, { useState, useEffect } from 'react';
import './CallPage.css';

const CallPage = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for filters
  const [callType, setCallType] = useState('');
  const [timeDispatchedStart, setTimeDispatchedStart] = useState('');
  const [timeDispatchedEnd, setTimeDispatchedEnd] = useState('');

  // Fetch all calls
  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/calls', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error fetching call data');
      }
      const data = await response.json();
      setCalls(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered calls
  const fetchFilteredCalls = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (callType) queryParams.append('callType', callType);
      if (timeDispatchedStart && timeDispatchedEnd) {
        queryParams.append('time_dispatched', timeDispatchedStart);
        queryParams.append('time_completed', timeDispatchedEnd);
      }

      const response = await fetch(`http://localhost:5000/api/calls-by-type-and-time?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching filtered call data');
      }
      const data = await response.json();
      setCalls(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (callType || (timeDispatchedStart && timeDispatchedEnd)) {
      fetchFilteredCalls();
    } else {
      fetchCalls();
    }
  }, [callType, timeDispatchedStart, timeDispatchedEnd]);

  return (
    <div className="call-page-container">
      <h1>Call Page</h1>
      
      {/* Filter Section */}
      <div className="filters">
        <select onChange={(e) => setCallType(e.target.value)} value={callType}>
          <option value="">Select Call Type</option>
          <option value="Emergency">Emergency</option>
          <option value="Maintenance">Maintenance</option>
          <option value="General">General</option>
          {/* Add more call types here */}
        </select>

        <input
          type="date"
          placeholder="Start Date"
          onChange={(e) => setTimeDispatchedStart(e.target.value)}
        />
        <input
          type="date"
          placeholder="End Date"
          onChange={(e) => setTimeDispatchedEnd(e.target.value)}
        />

        <button onClick={fetchFilteredCalls}>Filter</button>
      </div>

      {/* Loading/Error Handling */}
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {/* Display Calls */}
      <div className="call-table-container">
        <table className="call-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Caller Name</th>
              <th>Call Type</th>
              <th>Time Dispatched</th>
              <th>Time Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id}>
                <td>{call.id}</td>
                <td>{call.caller_name}</td>
                <td>{call.call_type}</td>
                <td>{new Date(call.time_dispatched).toLocaleString()}</td>
                <td>{call.time_completed ? new Date(call.time_completed).toLocaleString() : 'N/A'}</td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="action-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallPage;
