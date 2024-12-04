import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCallModal from './components/AddCallModal';
import Navigation from './components/Navigation';
import './CallsPage.css';

function CallsPage() {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [allCallTypes, setAllCallTypes] = useState([]);
  const [callType, setCallType] = useState('none');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [token] = useState(localStorage.getItem('token') || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCallData, setEditCallData] = useState(null);

  const convertToSQLiteDateTime = (isoDateTime) => isoDateTime.replace('T', ' ');

  useEffect(() => {
    const fetchCallTypes = async () => {
      try {
        const response = await axios.get('/api/callTypes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllCallTypes(response.data.data.map((item) => item.call_type));
      } catch (error) {
        setErrorMessage('Failed to fetch call types.');
      }
    };

    fetchCallTypes();
    fetchFilteredData();
  }, []);

  const fetchFilteredData = async () => {
    try {
      let response;
      const filters = { callType, startTime, endTime };

      // Default endTime to current datetime if startTime is set but endTime is undefined
      if (filters.startTime && !filters.endTime) {
        const now = new Date();
        filters.endTime = now.toISOString().replace('T', ' ').split('.')[0];
      }

      if (filters.callType === 'none' && !filters.startTime && !filters.endTime) {
        response = await axios.get('/api/calls', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (filters.callType !== 'none' && !filters.startTime && !filters.endTime) {
        response = await axios.get(`/api/calls-by-type?callType=${filters.callType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (filters.callType === 'none' && filters.startTime && filters.endTime) {
        response = await axios.get(`/api/calls-by-time?time_dispatched=${filters.startTime}&time_completed=${filters.endTime}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (filters.callType !== 'none' && filters.startTime && filters.endTime) {
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
      setErrorMessage('Failed to fetch calls.');
    }
  };

  const handleDeleteCall = async (id) => {
    try {
      await axios.delete(`/api/calls/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFilteredData();
    } catch (error) {
      alert('Failed to delete call.');
    }
  };

  const openModal = (call = null) => {
    setEditCallData(call);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCallData(null);
  };

  const handleExportToCSV = () => {
    if (!data || !data.length) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(',')
    );
    const csvContent = `${headers}\n${rows.join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'calls_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <Navigation />
      <h1>Manage Calls</h1>
      <div className="action-buttons">
        <button onClick={() => openModal()}>Add New Call</button>
        <button onClick={fetchFilteredData}>Fetch Calls</button>
        <button onClick={handleExportToCSV}>Export to CSV</button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="filter-container">
        <label>
          Call Type:
          <select value={callType} onChange={(e) => setCallType(e.target.value)}>
            <option value="none">All</option>
            {allCallTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(convertToSQLiteDateTime(e.target.value))}
          />
        </label>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(convertToSQLiteDateTime(e.target.value))}
          />
        </label>
      </div>

      {data && data.length > 0 ? (
        <table>
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
                  <button className="edit" onClick={() => openModal(item)}>
                    Edit
                  </button>
                  <button className="delete" onClick={() => handleDeleteCall(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No calls available.</p>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editCallData ? 'Edit Call' : 'Add New Call'}</h2>
            <AddCallModal
              isOpen={isModalOpen}
              onClose={closeModal}
              editCallData={editCallData}
              onCallAdded={fetchFilteredData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CallsPage;
  