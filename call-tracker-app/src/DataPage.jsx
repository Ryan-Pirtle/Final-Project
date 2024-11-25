import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DataPage() {
  const [users, setUsers] = useState([]);
  const [calls, setCalls] = useState([]);
  const [crew, setCrew] = useState([]);

  // Filters for Calls
  const [callType, setCallType] = useState('');
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });

  const navigate = useNavigate();

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('/api/users');
        const callsResponse = await axios.get('/api/calls');
        const crewResponse = await axios.get('/api/crews');

        // Filter users to include only managers and dispatchers
        const filteredUsers = usersResponse.data.data.filter(
          (user) => user.role === 'manager' || user.role === 'dispatcher'
        );

        setUsers(filteredUsers);
        setCalls(callsResponse.data.data);
        setCrew(crewResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch filtered calls
  const fetchFilteredCalls = async () => {
    try {
      const params = {
        ...(callType && { callType }),
        ...(timeRange.start && timeRange.end && {
          time_dispatched: timeRange.start,
          time_completed: timeRange.end,
        }),
      };

      const response = await axios.get('/api/calls-by-type-and-time', {
        params,
      });

      setCalls(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered calls:', error);
    }
  };

  // Navigate to login page
  const goToLoginPage = () => {
    navigate('./');
  };

  return (
    <div>
      <button onClick={goToLoginPage}>Go to Login Page</button>

      <h1>Data Display Page</h1>

      {/* Users Table */}
      <h2>Users (Managers and Dispatchers)</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Call Filters */}
      <h2>Filter Calls</h2>
      <div>
        <label>
          Call Type:
          <input
            type="text"
            value={callType}
            onChange={(e) => setCallType(e.target.value)}
          />
        </label>
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={timeRange.start}
            onChange={(e) =>
              setTimeRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
        </label>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={timeRange.end}
            onChange={(e) =>
              setTimeRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </label>
        <button onClick={fetchFilteredCalls}>Apply Filters</button>
      </div>

      {/* Calls Table */}
      <h2>Calls</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr key={call.id}>
              <td>{call.id}</td>
              <td>{call.call_type}</td>
              <td>{call.time_dispatched}</td>
              <td>{call.details}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Crew Table */}
      <h2>Crew</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {crew.map((member) => (
            <tr key={member.id}>
              <td>{member.id}</td>
              <td>{member.crew_name}</td>
              <td>{member.crew_contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataPage;
