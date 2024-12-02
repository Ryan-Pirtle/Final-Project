import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCallModal from './components/AddCallModal';
import Navigation from './components/Navigation';


function CallsPage() {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [allCallTypes, setAllCallTypes] = useState([]);
  const [callType, setCallType] = useState('none');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [token] = useState(localStorage.getItem('token') || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCallData, setEditCallData] = useState(null); // Stores call data for editing
  const convertToSQLiteDateTime = (isoDateTime) => isoDateTime.replace('T', ' ');

  useEffect(() => {
    const getTypes = async () => {
      try {
        const response = await axios.get('/api/callTypes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const callTypes = response.data.data.map((item) => item.call_type);
        setAllCallTypes(callTypes);
      } catch (error) {
        console.error("Error fetching call types:", error.response?.data || error.message);
        setErrorMessage('Failed to fetch call types.');
      }
    };

    getTypes();
    fetchFilteredData(); // Fetch initial data
  }, []);

  const fetchFilteredData = async () => {
    try {
      let response;
      const filters = { callType, startTime, endTime };
  
      // Default endTime to current datetime if startTime is set but endTime is undefined
      if (filters.startTime && !filters.endTime) {
        const now = new Date();
        filters.endTime = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
      }
  
      if (filters.callType === "none" && !filters.startTime && !filters.endTime) {
        response = await axios.get('/api/calls', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (filters.callType !== "none" && !filters.startTime && !filters.endTime) {
        response = await axios.get(`/api/calls-by-type?callType=${filters.callType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (filters.callType === "none" && filters.startTime && filters.endTime) {
        console.log("Front End times given start and end ", filters.startTime, " ", filters.endTime)
        response = await axios.get(`/api/calls-by-time?time_dispatched=${filters.startTime}&time_completed=${filters.endTime}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (filters.callType !== "none" && filters.startTime && filters.endTime) {
        response = await axios.get(
          `/api/calls-by-type-and-time?callType=${filters.callType}&time_dispatched=${filters.startTime}&time_completed=${filters.endTime}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
  
  const handleDeleteCall = async (id) => {
    try {
      await axios.delete(`/api/calls/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Call deleted successfully.');
      fetchFilteredData(); // Refresh call list
    } catch (error) {
      console.error('Error deleting call:', error.response?.data || error.message);
      alert('Failed to delete call. Please try again.');
    }
  };

  const handleEditCall = (callData) => {
    setEditCallData(callData);
    setIsModalOpen(true); // Open modal with pre-filled data
  };

  return (
    <div>
      <Navigation />
      <h1>Filter Calls</h1>
      <div>
        <label>Choose a Call type:</label>
        <select
          id="callTypeSelection"
          name="calls"
          value={callType}
          onChange={(e) => {setCallType(e.target.value)}}
        >
          <option value="none">All</option>
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
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(convertToSQLiteDateTime(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(convertToSQLiteDateTime(e.target.value))}
          />
        </label>
      </div>
      <button onClick={fetchFilteredData}>Fetch Calls</button>

      <button onClick={() => setIsModalOpen(true)}>Add New Call</button>

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
              <th>Time Called</th>
              <th>Actions</th>
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
                <td>{item.time_called}</td>
                <td>
                  <button onClick={() => handleEditCall(item)}>Edit</button>
                  <button onClick={() => handleDeleteCall(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available.</p>
      )}

      {/* Add/Edit Call Modal */}
      <AddCallModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditCallData(null); // Clear edit data on close
        }}
        onCallAdded={fetchFilteredData} // Callback to refresh call list
        editCallData={editCallData} // Pass data for editing
      />
    </div>
  );
}

export default CallsPage;
