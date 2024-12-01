import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        response = await axios.get(`/api/users?role=${roleFilter}`, {
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

  return (
    <div>
      <h1>User Management</h1>

      <div>
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

      <button onClick={() => setIsModalOpen(true)}>Add New User</button>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {data && data.length > 0 ? (
        <table border="1">
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
                  <button onClick={() => handleEditUser(item)}>Edit</button>
                  <button onClick={() => handleDeleteUser(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users available.</p>
      )}

      {/* Add/Edit User Modal */}
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
