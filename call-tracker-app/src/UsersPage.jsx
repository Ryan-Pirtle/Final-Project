import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddEditUserModal from './components/AddEditUserModal';
import Navigation from './components/Navigation';
import './UsersPage.css'; // Import the CSS file

function UsersPage() {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [token] = useState(localStorage.getItem('token') || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      let response;

      if (roleFilter === 'all') {
        response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.get(`/api/users-role?role=${roleFilter}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setData(response.data.data);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      setErrorMessage('Failed to fetch users. Please try again.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deleted successfully.');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error deleting user:', error.response?.data || error.message);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleEditUser = (userData) => {
    setEditUserData(userData);
    setIsModalOpen(true); // Open modal with pre-filled data
  };

  const handleExportToCSV = () => {
    if (!data || !data.length) {
      alert('No data available to export.');
      return;
    }

    // Convert JSON data to CSV format
    const headers = Object.keys(data[0]).join(','); // Get column headers
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`) // Escape values for CSV
          .join(',')
      )
      .join('\n'); // Join rows with a newline

    const csvContent = `${headers}\n${rows}`; // Combine headers and rows

    // Create a downloadable Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a download link and click it programmatically
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up DOM
    URL.revokeObjectURL(url); // Free up memory
  };

  return (
    <div className="container">
      <Navigation />
      <h1>User Management</h1>

      <div className="filter-container">
        <label>Filter by Role:</label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <div className="button-container">
        <button
          style={{ marginBottom: '10px' }}
          className="add-user"
          onClick={() => setIsModalOpen(true)}
        >
          Add New User
        </button>
        <button
          style={{ marginLeft: '10px', marginBottom: '10px' }}
          className="export-to-csv"
          onClick={handleExportToCSV}
        >
          Export to CSV
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {data && data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>
                  <button className="edit" onClick={() => handleEditUser(item)}>
                    Edit
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDeleteUser(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users available.</p>
      )}

      {isModalOpen && (
        <AddEditUserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditUserData(null); // Clear edit data on close
          }}
          onUserAdded={fetchUsers} // Callback to refresh user list
          editUserData={editUserData} // Pass data for editing
        />
      )}
    </div>
  );
}

export default UsersPage;
