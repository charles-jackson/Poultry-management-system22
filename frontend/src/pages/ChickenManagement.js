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
    source: 'Available in Farm', // 'Available in Farm' or 'Brought from Outside'
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    price: 0,
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
      source: 'Available in Farm',
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      price: 0,
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
      source: chicken.source || 'Available in Farm',
      supplier: chicken.supplier || '',
      purchaseDate: chicken.purchaseDate
        ? new Date(chicken.purchaseDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      price: chicken.price || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: formData.source === 'Brought from Outside' ? Number(formData.price || 0) : 0,
        supplier: formData.source === 'Brought from Outside' ? formData.supplier : '',
        purchaseDate: formData.source === 'Brought from Outside' ? formData.purchaseDate : new Date(),
      };

      if (isEditing) {
        await API.put(`/chickens/${currentId}`, payload);
      } else {
        await API.post('/chickens', payload);
      }
      setShowModal(false);
      fetchChickens();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chicken record? Any automatically linked purchase expense will also be removed.')) {
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
    c.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.source && c.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.supplier && c.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalFlockCount = chickens.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
  const outsideCount = chickens
    .filter((c) => c.source === 'Brought from Outside')
    .reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
  const farmRaisedCount = totalFlockCount - outsideCount;

  return (
    <div className="chicken-mgmt-container py-4">
      <div className="container">
        {/* Title Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">🐔 Chicken Flock Management</h1>
            <p className="text-muted mb-0">
              Record farm-raised chickens and outside flock purchases with automatic expense tracking
            </p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Chicken Record
          </button>
        </div>

        {error && <div className="alert alert-danger shadow-sm">{error}</div>}

        {/* Quick Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Total Chickens</div>
                  <h3 className="fw-extrabold text-success mb-0">{totalFlockCount.toLocaleString()}</h3>
                </div>
                <div className="fs-2">🐔</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">🏡 Available in Farm</div>
                  <h3 className="fw-extrabold text-primary mb-0">{farmRaisedCount.toLocaleString()}</h3>
                </div>
                <div className="fs-2">🌾</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">🚚 Brought from Outside</div>
                  <h3 className="fw-extrabold text-warning mb-0">{outsideCount.toLocaleString()}</h3>
                </div>
                <div className="fs-2">📦</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 search-card">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control rounded-3 border-success-subtle"
                placeholder="🔍 Search by breed, gender, source, or health status..."
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
                      <th>Source</th>
                      <th>Quantity</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Health Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChickens.map((chicken, index) => {
                      const isOutside = chicken.source === 'Brought from Outside';
                      const totalCost = (Number(chicken.price) || 0) * (Number(chicken.quantity) || 1);

                      return (
                        <tr key={chicken._id}>
                          <td className="fw-bold">{index + 1}</td>
                          <td className="fw-bold text-dark">{chicken.breed}</td>
                          <td>
                            {isOutside ? (
                              <div>
                                <span className="badge bg-warning text-dark px-2 py-1">
                                  🚚 Outside Purchase
                                </span>
                                {totalCost > 0 && (
                                  <div className="text-danger fw-bold mt-1" style={{ fontSize: '0.78rem' }}>
                                    Expense: ₹{totalCost.toLocaleString()} (₹{chicken.price}/unit)
                                  </div>
                                )}
                                {chicken.purchaseDate && (
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    Date: {new Date(chicken.purchaseDate).toLocaleDateString()}
                                  </div>
                                )}
                                {chicken.supplier && (
                                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                    From: {chicken.supplier}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="badge bg-success-subtle text-success px-2 py-1">
                                🏡 Available in Farm
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-3 py-2 fw-bold fs-6">
                              {chicken.quantity}
                            </span>
                          </td>
                          <td>{chicken.age}</td>
                          <td>{chicken.gender}</td>
                          <td>
                            <span
                              className={`badge px-3 py-2 ${
                                chicken.healthStatus === 'Healthy'
                                  ? 'bg-success'
                                  : chicken.healthStatus === 'Sick'
                                  ? 'bg-danger'
                                  : chicken.healthStatus === 'Vaccinated'
                                  ? 'bg-primary'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {chicken.healthStatus}
                            </span>
                          </td>
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
                      );
                    })}
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  {isEditing ? '✏️ Edit Chicken Record' : '🐔 Add Chicken Flock Record'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {/* Origin / Source Selector */}
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-2">Flock Source / Origin</label>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div
                          className={`p-3 rounded-3 border text-center cursor-pointer ${
                            formData.source === 'Available in Farm'
                              ? 'border-success bg-success-subtle shadow-sm'
                              : 'border-secondary-subtle bg-light'
                          }`}
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onClick={() => setFormData((prev) => ({ ...prev, source: 'Available in Farm', price: 0 }))}
                        >
                          <div className="fs-3 mb-1">🏡</div>
                          <div className="fw-bold text-dark">Available in Farm</div>
                          <small className="text-muted">Raised on farm / existing flock (No date & price needed)</small>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div
                          className={`p-3 rounded-3 border text-center cursor-pointer ${
                            formData.source === 'Brought from Outside'
                              ? 'border-warning bg-warning-subtle shadow-sm'
                              : 'border-secondary-subtle bg-light'
                          }`}
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onClick={() => setFormData((prev) => ({ ...prev, source: 'Brought from Outside' }))}
                        >
                          <div className="fs-3 mb-1">🚚</div>
                          <div className="fw-bold text-dark">Brought from Outside</div>
                          <small className="text-muted">Purchased flock (Requires date, price & logs expense)</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informational banner based on Source */}
                  {formData.source === 'Brought from Outside' ? (
                    <div className="alert alert-warning border-warning d-flex align-items-center gap-2 mb-4 py-2">
                      <span className="fs-4">💡</span>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>Expense Integration Active:</strong> When saved, purchase total of{' '}
                        <strong>
                          ₹
                          {(
                            (Number(formData.price) || 0) * (Number(formData.quantity) || 0)
                          ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>{' '}
                        will automatically be created under <strong>Expense Management</strong> as{' '}
                        <em>"Chicken Purchase"</em>.
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-success-subtle border-success-subtle d-flex align-items-center gap-2 mb-4 py-2">
                      <span className="fs-4">🏡</span>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>Farm Raised Flock:</strong> This flock is already available on your farm. No purchase date or estimated price is required.
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-bold">Chicken Breed</label>
                      <input
                        type="text"
                        className="form-control"
                        name="breed"
                        required
                        placeholder="e.g. Rhode Island Red, Leghorn, Broiler, Kadaknath"
                        value={formData.breed}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 col-md-4">
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
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-bold">Age</label>
                      <input
                        type="text"
                        className="form-control"
                        name="age"
                        required
                        placeholder="e.g. 4 weeks, 2 months"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 col-md-4">
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
                    <div className="col-12 col-md-4">
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

                  {/* ONLY show Supplier, Purchase Date, and Price when Brought from Outside */}
                  {formData.source === 'Brought from Outside' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Supplier / Vendor / Origin (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="supplier"
                          placeholder="e.g. Sunrise Hatchery, Local Poultry Market"
                          value={formData.supplier}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
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
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-bold">Purchase Price per Unit (₹)</label>
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
                    </>
                  )}
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
