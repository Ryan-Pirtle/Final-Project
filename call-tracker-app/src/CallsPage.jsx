import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCallModal from './components/AddCallModal';
import Navigation from './components/Navigation';
import "./CallsPage.css";
import 'bootstrap/dist/css/bootstrap.min.css';


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
        console.log(response);
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

  const handleExportToCSV = () => {
    // Check if data exists and has items
    if (!data || !data.length) {
      alert('No data available to export.');
      return;
    }
  
    // Access the inner `data` array
    const callsData = data; // Assuming `data` is already the inner data array
    if (!callsData || !callsData.length) {
      alert('No valid data to export.');
      return;
    }
  
    // Convert JSON data to CSV
    const headers = Object.keys(callsData[0]).join(','); // Get the column headers
    const rows = callsData.map((row) => Object.values(row).map(value => `"${value}"`).join(',')).join('\n'); // Escape values for CSV format
  
    const csvContent = `${headers}\n${rows}`; // Combine headers and rows
  
    // Create a downloadable Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    // Create a download link and click it programmatically
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'calls_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the DOM
    URL.revokeObjectURL(url); // Free up memory
  };
  
  return (
    <div>
      <Navigation />
      <h1>Filter Calls</h1>
      <div className="filter-container">
  <div>
    <label>Choose a Call Type:</label>
    <select
      id="callTypeSelection"
      name="calls"
      value={callType}
      onChange={(e) => setCallType(e.target.value)}
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

  <div>
    <button onClick={fetchFilteredData}>Fetch Calls</button>
  </div>
</div>

      <button onClick={() => setIsModalOpen(true)} style={{ marginLeft: '10px' }}>Add New Call</button>

      <button onClick={handleExportToCSV} style={{ marginLeft: '10px' }}>
        Export to CSV
      </button>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {data && data.length > 0 ? (
        <table className="table table-striped table-bordered">
        <thead className="thead-dark">
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
              <td className="actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleEditCall(item)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCall(item.id)}>
                  Delete
                </button>
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
