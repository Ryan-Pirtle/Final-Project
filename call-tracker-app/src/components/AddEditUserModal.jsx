import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddEditUserModal.css'

function AddEditUserModal({ isOpen, onClose, onUserAdded, editUserData }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('dispatcher');
  const [token] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (editUserData) {
      setName(editUserData.name);
      setEmail(editUserData.email);
      setPassword(''); // Leave password empty for security
      setRole(editUserData.role);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('dispatcher');
    }
  }, [editUserData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editUserData) {
        // Update user
        await axios.put(
          `/api/users/${editUserData.id}`,
          { name, email, password, role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('User updated successfully.');
      } else {
        // Add new user
        await axios.post(
          '/api/users',
          { name, email, password, role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('User added successfully.');
      }

      onUserAdded(); // Refresh user list
      onClose(); // Close modal
    } catch (error) {
      console.error('Error saving user:', error.response?.data || error.message);
      alert('Failed to save user. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{editUserData ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editUserData} // Password required only for new user
            />
          </label>
          <label>
            Role:
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="dispatcher">Dispatcher</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <button type="submit">{editUserData ? 'Update' : 'Add'}</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEditUserModal;
