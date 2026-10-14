import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './ChickenManagement.css';

const ChickenManagement = () => {
  const [chickens, setChickens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    breed: '',
    quantity: '',
    age: '',
    gender: 'Hen',
    healthStatus: 'Healthy',
    purchaseDate: new Date().toISOString().split('T')[0],
    price: '',
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchChickens();
  }, []);

  const fetchChickens = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/chickens');
      setChickens(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch chicken records');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      breed: '',
      quantity: '',
      age: '',
      gender: 'Hen',
      healthStatus: 'Healthy',
      purchaseDate: new Date().toISOString().split('T')[0],
      price: '',
    });
    setShowModal(true);
  };

  const openEditModal = (chicken) => {
    setIsEditing(true);
    setCurrentId(chicken._id);
    setFormData({
      breed: chicken.breed,
      quantity: chicken.quantity,
      age: chicken.age,
      gender: chicken.gender,
      healthStatus: chicken.healthStatus,
      purchaseDate: new Date(chicken.purchaseDate).toISOString().split('T')[0],
      price: chicken.price,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/chickens/${currentId}`, formData);
      } else {
        await API.post('/chickens', formData);
      }
      setShowModal(false);
      fetchChickens();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chicken record?')) {
      try {
        await API.delete(`/chickens/${id}`);
        fetchChickens();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete record');
      }
    }
  };

  const filteredChickens = chickens.filter((c) =>
    c.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.healthStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chicken-mgmt-container py-4">
      <div className="container">
        {/* Title Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">🐔 Chicken Flock Management</h1>
            <p className="text-muted mb-0">Record breed details, health status, quantity, and flock purchases</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Chicken Record
          </button>
        </div>

        {error && <div className="alert alert-danger shadow-sm">{error}</div>}

        {/* Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 search-card">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control rounded-3 border-success-subtle"
                placeholder="🔍 Search by breed, gender, or health status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Total Records: {filteredChickens.length}
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading flock data...</p>
              </div>
            ) : filteredChickens.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No chicken records found.</h5>
                <p className="mb-0">Click "Add Chicken Record" to create your first entry.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 chicken-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Breed</th>
                      <th>Quantity</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Health Status</th>
                      <th>Purchase Date</th>
                      <th>Price per Unit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChickens.map((chicken, index) => (
                      <tr key={chicken._id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="fw-bold text-dark">{chicken.breed}</td>
                        <td>
                          <span className="badge bg-light text-dark border px-3 py-2 fw-bold fs-6">
                            {chicken.quantity}
                          </span>
                        </td>
                        <td>{chicken.age}</td>
                        <td>{chicken.gender}</td>
                        <td>
                          <span className={`badge px-3 py-2 ${
                            chicken.healthStatus === 'Healthy' ? 'bg-success' :
                            chicken.healthStatus === 'Sick' ? 'bg-danger' :
                            chicken.healthStatus === 'Vaccinated' ? 'bg-primary' : 'bg-warning text-dark'
                          }`}>
                            {chicken.healthStatus}
                          </span>
                        </td>
                        <td>
                          {new Date(chicken.purchaseDate).toLocaleDateString()}
                        </td>
                        <td className="fw-bold text-success">${chicken.price}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary fw-bold hover-lift"
                              onClick={() => openEditModal(chicken)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger fw-bold hover-lift"
                              onClick={() => handleDelete(chicken._id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  {isEditing ? '✏️ Edit Chicken Record' : '🐔 Add New Chicken Record'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Chicken Breed</label>
                    <input
                      type="text"
                      className="form-control"
                      name="breed"
                      required
                      placeholder="e.g. Rhode Island Red, Leghorn, Broiler"
                      value={formData.breed}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        required
                        min="1"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Age</label>
                      <input
                        type="text"
                        className="form-control"
                        name="age"
                        required
                        placeholder="e.g. 6 weeks, 3 months"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Hen">Hen</option>
                        <option value="Rooster">Rooster</option>
                        <option value="Chick">Chick</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Health Status</label>
                      <select
                        className="form-select"
                        name="healthStatus"
                        value={formData.healthStatus}
                        onChange={handleInputChange}
                      >
                        <option value="Healthy">Healthy</option>
                        <option value="Sick">Sick</option>
                        <option value="Vaccinated">Vaccinated</option>
                        <option value="Quarantine">Quarantine</option>
                        <option value="Under Treatment">Under Treatment</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Purchase Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="purchaseDate"
                        required
                        value={formData.purchaseDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Price per Unit ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-secondary fw-bold"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success fw-bold px-4">
                    {isEditing ? 'Save Changes' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChickenManagement;
