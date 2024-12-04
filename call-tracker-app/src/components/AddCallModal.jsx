import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddCallModal.css';


function AddCallModal({ isOpen, onClose, onCallAdded, token, editCallData = null }) {
    
  const [formData, setFormData] = useState({
    caller_name: '',
    caller_address: '',
    call_type: '',
    crew_assigned: '',
    time_called: '',
    time_dispatched: '',
    time_completed: '',
    issue_reported: '',
    issue_found: '',
    dispatcher_id: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (editCallData) {
      setFormData(editCallData); // Pre-fill form with existing data
    } else {
      setFormData({
        caller_name: '',
        caller_address: '',
        call_type: '',
        crew_assigned: '',
        time_called: '',
        time_dispatched: '',
        time_completed: '',
        issue_reported: '',
        issue_found: '',
        dispatcher_id: '',
      });
    }
  }, [editCallData]);
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCallData) {
        // Update existing call
        await axios.put(`/api/calls/${editCallData.id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        alert('Call updated successfully.');
      } else {
        // Add new call
        await axios.post('/api/calls', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        alert('Call added successfully.');
      }
      onCallAdded(); // Refresh call list
      onClose(); // Close modal
    } catch (error) {
      console.error('Error saving call:', error.response?.data || error.message);
      alert('Failed to save call. Please try again.');
    }
  };
  

  if (!isOpen) return null; // Do not render the modal if not open

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Call</h2>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label>Caller Name:</label>
            <input
              type="text"
              name="caller_name"
              value={formData.caller_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Caller Address:</label>
            <input
              type="text"
              name="caller_address"
              value={formData.caller_address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Call Type:</label>
            <input
              type="text"
              name="call_type"
              value={formData.call_type}
              onChange={handleInputChange}
              required
            />
              </div>
          <div>
            <label>Crew Assigned:</label>
            <input
              type="text"
              name="crew_assigned"
              value={formData.crew_assigned}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Time Called:</label>
            <input
              type="datetime-local"
              name="time_called"
              value={formData.time_called}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Time Dispatched:</label>
            <input
              type="datetime-local"
              name="time_dispatched"
              value={formData.time_dispatched}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Time Completed:</label>
            <input
              type="datetime-local"
              name="time_completed"
              value={formData.time_completed}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Issue Reported:</label>
            <textarea
              name="issue_reported"
              value={formData.issue_reported}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Issue Found:</label>
            <textarea
              name="issue_found"
              value={formData.issue_found}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Dispatcher ID:</label>
            <input
              type="number"
              name="dispatcher_id"
              value={formData.dispatcher_id}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Add Call</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
   
    
    </div>
    
  );
}

export default AddCallModal;
