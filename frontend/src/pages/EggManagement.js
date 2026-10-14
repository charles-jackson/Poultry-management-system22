import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './EggManagement.css';

const EggManagement = () => {
  const [eggs, setEggs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    breed: '',
    productionDate: new Date().toISOString().split('T')[0],
    totalEggs: '',
    brokenEggs: '',
    pricePerEgg: '',
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEggs();
  }, []);

  const fetchEggs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/eggs');
      setEggs(data);
    } catch (err) {
      console.error('Error fetching egg records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Check validation
      if (Number(updated.brokenEggs) > Number(updated.totalEggs) && updated.totalEggs !== '') {
        setFormError('⚠️ Broken eggs cannot be greater than total eggs!');
      } else {
        setFormError('');
      }
      return updated;
    });
  };

  // Real-time automatic calculations
  const total = Number(formData.totalEggs) || 0;
  const broken = Number(formData.brokenEggs) || 0;
  const calculatedGoodEggs = Math.max(0, total - broken);
  const price = Number(formData.pricePerEgg) || 0;
  const calculatedTotalAmount = calculatedGoodEggs * price;

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormError('');
    setFormData({
      breed: '',
      productionDate: new Date().toISOString().split('T')[0],
      totalEggs: '',
      brokenEggs: '',
      pricePerEgg: '',
    });
    setShowModal(true);
  };

  const openEditModal = (egg) => {
    setIsEditing(true);
    setCurrentId(egg._id);
    setFormError('');
    setFormData({
      breed: egg.breed,
      productionDate: new Date(egg.productionDate).toISOString().split('T')[0],
      totalEggs: egg.totalEggs,
      brokenEggs: egg.brokenEggs,
      pricePerEgg: egg.pricePerEgg,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (broken > total) {
      setFormError('⚠️ Broken eggs cannot be greater than total eggs!');
      return;
    }
    try {
      if (isEditing) {
        await API.put(`/eggs/${currentId}`, formData);
      } else {
        await API.post('/eggs', formData);
      }
      setShowModal(false);
      fetchEggs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this egg production record?')) {
      try {
        await API.delete(`/eggs/${id}`);
        fetchEggs();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredEggs = eggs.filter((e) =>
    e.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="egg-mgmt-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">🥚 Egg Production Management</h1>
            <p className="text-muted mb-0">Record daily egg harvests, track broken vs good eggs, and monitor egg sales revenue</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Production Entry
          </button>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 search-card">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control rounded-3 border-success-subtle"
                placeholder="🔍 Search by chicken breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Production Entries: {filteredEggs.length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading egg production data...</p>
              </div>
            ) : filteredEggs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No egg production records found.</h5>
                <p className="mb-0">Click "Add Production Entry" to log today's egg harvest.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 egg-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Breed</th>
                      <th>Production Date</th>
                      <th>Total Eggs</th>
                      <th>Broken Eggs</th>
                      <th>Good Eggs</th>
                      <th>Price / Egg</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEggs.map((egg, index) => (
                      <tr key={egg._id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="fw-bold text-dark">{egg.breed}</td>
                        <td className="text-muted">
                          {new Date(egg.productionDate).toLocaleDateString()}
                        </td>
                        <td className="fw-bold">{egg.totalEggs}</td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger border border-danger px-2 py-1">
                            {egg.brokenEggs}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success px-3 py-2 fw-bold">
                            {egg.goodEggs}
                          </span>
                        </td>
                        <td>${egg.pricePerEgg}</td>
                        <td className="fw-bold text-success">${egg.totalAmount.toFixed(2)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary fw-bold hover-lift"
                              onClick={() => openEditModal(egg)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger fw-bold hover-lift"
                              onClick={() => handleDelete(egg._id)}
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
                  {isEditing ? '✏️ Edit Egg Production Record' : '🥚 Add Egg Production Entry'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger fw-bold shadow-sm mb-3">{formError}</div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Chicken Breed</label>
                      <input
                        type="text"
                        className="form-control"
                        name="breed"
                        required
                        placeholder="e.g. Lohmann Brown"
                        value={formData.breed}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Production Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="productionDate"
                        required
                        value={formData.productionDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Total Eggs Collected</label>
                      <input
                        type="number"
                        className="form-control"
                        name="totalEggs"
                        required
                        min="0"
                        placeholder="Total Eggs"
                        value={formData.totalEggs}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Broken Eggs</label>
                      <input
                        type="number"
                        className="form-control"
                        name="brokenEggs"
                        required
                        min="0"
                        placeholder="Broken Eggs"
                        value={formData.brokenEggs}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Price per Egg ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="pricePerEgg"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.25"
                      value={formData.pricePerEgg}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Real-time Calculation Card */}
                  <div className="card bg-success-subtle border-success rounded-3 p-3 mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-bold text-dark">Computed Good Eggs:</span>
                      <span className="fw-bold text-success fs-6">{calculatedGoodEggs} eggs</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold text-dark">Computed Total Revenue:</span>
                      <span className="fw-extrabold text-success fs-5">${calculatedTotalAmount.toFixed(2)}</span>
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
                  <button
                    type="submit"
                    className="btn btn-success fw-bold px-4"
                    disabled={!!formError}
                  >
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

export default EggManagement;
