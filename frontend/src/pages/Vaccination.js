import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './Vaccination.css';

const Vaccination = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    breed: '',
    vaccineName: '',
    vaccinationDate: new Date().toISOString().split('T')[0],
    nextVaccinationDate: '',
    quantity: '',
    cost: '',
    remarks: '',
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/vaccinations');
      setVaccinations(data);
    } catch (err) {
      console.error('Error fetching vaccination records:', err);
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
      vaccineName: '',
      vaccinationDate: new Date().toISOString().split('T')[0],
      nextVaccinationDate: '',
      quantity: '',
      cost: '',
      remarks: '',
    });
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setIsEditing(true);
    setCurrentId(v._id);
    setFormData({
      breed: v.breed,
      vaccineName: v.vaccineName,
      vaccinationDate: new Date(v.vaccinationDate).toISOString().split('T')[0],
      nextVaccinationDate: v.nextVaccinationDate
        ? new Date(v.nextVaccinationDate).toISOString().split('T')[0]
        : '',
      quantity: v.quantity,
      cost: v.cost || '',
      remarks: v.remarks || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cost: Number(formData.cost || 0),
      };

      if (isEditing) {
        await API.put(`/vaccinations/${currentId}`, payload);
      } else {
        await API.post('/vaccinations', payload);
      }
      setShowModal(false);
      fetchVaccinations();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vaccination record? Any linked expense entry will also be deleted.')) {
      try {
        await API.delete(`/vaccinations/${id}`);
        fetchVaccinations();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredVaccinations = vaccinations.filter(
    (v) =>
      v.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.remarks && v.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalVaccinationCost = vaccinations.reduce((acc, v) => acc + (Number(v.cost) || 0), 0);
  const totalDosesGiven = vaccinations.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0);

  return (
    <div className="vaccination-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">💉 Vaccination Schedule & Records</h1>
            <p className="text-muted mb-0">Track flock immunization, vaccine doses, booster dates, and automatic expense synchronization</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Log Vaccination
          </button>
        </div>

        {/* Quick Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Total Recorded Doses</div>
                  <h3 className="fw-extrabold text-success mb-0">{totalDosesGiven.toLocaleString()}</h3>
                </div>
                <div className="fs-1">💉</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Vaccination Expenses</div>
                  <h3 className="fw-extrabold text-danger mb-0">${totalVaccinationCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="fs-1">💸</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Active Protocols</div>
                  <h3 className="fw-extrabold text-primary mb-0">{vaccinations.length}</h3>
                </div>
                <div className="fs-1">📋</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 search-card">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control rounded-3 border-success-subtle"
                placeholder="🔍 Search chicken breed, vaccine name, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Vaccination Records: {filteredVaccinations.length}
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading vaccination logs...</p>
              </div>
            ) : filteredVaccinations.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No vaccination records found.</h5>
                <p className="mb-0">Click "Log Vaccination" to record a new immunization dose.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 vaccination-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Chicken / Breed</th>
                      <th>Vaccine Name</th>
                      <th>Dose Quantity</th>
                      <th>Cost & Expense</th>
                      <th>Vaccination Date</th>
                      <th>Next Booster Date</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVaccinations.map((v, index) => (
                      <tr key={v._id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="fw-bold text-dark">{v.breed}</td>
                        <td>
                          <span className="badge bg-warning-subtle text-dark border border-warning px-3 py-2 fw-bold">
                            💉 {v.vaccineName}
                          </span>
                        </td>
                        <td className="fw-bold">{v.quantity} doses</td>
                        <td>
                          {Number(v.cost) > 0 ? (
                            <>
                              <div className="fw-bold text-danger">
                                ${Number(v.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              <small className="text-danger fw-semibold" title="Synced to Expense Management">
                                💸 Synced Expense
                              </small>
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-muted">
                          {new Date(v.vaccinationDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge bg-primary px-3 py-2">
                            {new Date(v.nextVaccinationDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="text-muted">{v.remarks || '—'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary fw-bold hover-lift"
                              onClick={() => openEditModal(v)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger fw-bold hover-lift"
                              onClick={() => handleDelete(v._id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  {isEditing ? '✏️ Edit Vaccination Record' : '💉 Log Vaccination Entry'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {/* Expense Sync Note */}
                  <div className="alert alert-warning border-warning d-flex align-items-center gap-2 mb-3 py-2">
                    <span className="fs-4">💡</span>
                    <div style={{ fontSize: '0.88rem' }}>
                      <strong>Expense Integration Active:</strong> Any vaccination/medicine cost entered here will automatically be recorded under <strong>Expense Management</strong> as <em>"Vaccination & Medicine"</em>.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Chicken / Breed</label>
                    <input
                      type="text"
                      className="form-control"
                      name="breed"
                      required
                      placeholder="e.g. Rhode Island Red - Batch A, Broilers"
                      value={formData.breed}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Vaccine Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="vaccineName"
                        required
                        placeholder="e.g. Newcastle (LaSota), Gumboro, Marek's"
                        value={formData.vaccineName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label fw-bold">Dose Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        required
                        min="1"
                        placeholder="e.g. 500"
                        value={formData.quantity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label fw-bold">Vaccine Cost ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="cost"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.cost}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>Leave 0 if no cost</small>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Vaccination Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="vaccinationDate"
                        required
                        value={formData.vaccinationDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Next Booster Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="nextVaccinationDate"
                        required
                        value={formData.nextVaccinationDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Remarks / Notes</label>
                    <textarea
                      className="form-control"
                      name="remarks"
                      rows="3"
                      placeholder="e.g. Administered via drinking water, supplier details, batch observations..."
                      value={formData.remarks}
                      onChange={handleInputChange}
                    ></textarea>
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
                    {isEditing ? 'Save Changes' : 'Save & Record Expense'}
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

export default Vaccination;
