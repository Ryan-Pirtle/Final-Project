import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from './components/Navigation';
import './CrewsPage.css';

function CrewsPage() {
  const [crews, setCrews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCrewData, setEditCrewData] = useState(null); // For editing a crew
  const [newCrew, setNewCrew] = useState({ crew_name: "", crew_contact: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [token] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    fetchCrews();
  }, []);

  const fetchCrews = async () => {
    try {
      const response = await axios.get("/api/crews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCrews(response.data.data);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching crews:", error.response?.data || error.message);
      setErrorMessage("Failed to fetch crews.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrew((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCrew = async () => {
    try {
      if (editCrewData) {
        // Edit existing crew
        await axios.put(
          `/api/crews/${editCrewData.id}`,
          newCrew,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Add new crew
        await axios.post("/api/crews", newCrew, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchCrews(); // Refresh crew list
      closeModal();
    } catch (error) {
      console.error("Error saving crew:", error.response?.data || error.message);
      setErrorMessage("Failed to save crew. Please try again.");
    }
  };

  const handleDeleteCrew = async (id) => {
    try {
      await axios.delete(`/api/crews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Crew deleted successfully.");
      fetchCrews(); // Refresh crew list
    } catch (error) {
      console.error("Error deleting crew:", error.response?.data || error.message);
      alert("Failed to delete crew. Please try again.");
    }
  };

  const handleExportToCSV = () => {
    if (!crews || crews.length === 0) {
      alert("No crews available to export.");
      return;
    }

    // Convert JSON data to CSV format
    const headers = Object.keys(crews[0]).join(','); // Get column headers
    const rows = crews
      .map((crew) =>
        Object.values(crew)
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
    link.setAttribute('download', 'crews_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up DOM
    URL.revokeObjectURL(url); // Free up memory
  };

  const openModal = (crew = null) => {
    setEditCrewData(crew);
    setNewCrew(crew || { crew_name: "", crew_contact: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCrewData(null);
    setNewCrew({ crew_name: "", crew_contact: "" });
  };

  return (
    <div className="container">
      <Navigation />
      <h1>Manage Crews</h1>
      
      <div className="action-buttons">
        <button onClick={() => openModal()}>Add New Crew</button>
        <button onClick={handleExportToCSV} style={{ marginLeft: "10px" }}>
          Export to CSV
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {crews && crews.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Crew Name</th>
              <th>Crew Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crews.map((crew) => (
              <tr key={crew.id}>
                <td>{crew.id}</td>
                <td>{crew.crew_name}</td>
                <td>{crew.crew_contact}</td>
                <td>
                  <button className="edit" onClick={() => openModal(crew)}>Edit</button>
                  <button className="delete" onClick={() => handleDeleteCrew(crew.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No crews available.</p>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editCrewData ? "Edit Crew" : "Add New Crew"}</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <label>
                Crew Name:
                <input
                  type="text"
                  name="crew_name"
                  value={newCrew.crew_name}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Crew Contact:
                <input
                  type="text"
                  name="crew_contact"
                  value={newCrew.crew_contact}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <div className="action-buttons">
                <button type="button" onClick={handleSaveCrew}>Save</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrewsPage;
