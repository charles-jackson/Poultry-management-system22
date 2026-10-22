import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './FeedManagement.css';

const FeedManagement = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    feedName: '',
    feedType: 'Starter Feed',
    quantity: '',
    unit: 'Kg',
    price: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/feed');
      setFeeds(data);
    } catch (err) {
      console.error('Error fetching feed inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Live auto calculation
  const calculatedTotalCost = (Number(formData.quantity) || 0) * (Number(formData.price) || 0);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      feedName: '',
      feedType: 'Starter Feed',
      quantity: '',
      unit: 'Kg',
      price: '',
      supplier: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEditModal = (feed) => {
    setIsEditing(true);
    setCurrentId(feed._id);
    setFormData({
      feedName: feed.feedName,
      feedType: feed.feedType,
      quantity: feed.quantity,
      unit: feed.unit,
      price: feed.price,
      supplier: feed.supplier,
      date: new Date(feed.date).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/feed/${currentId}`, formData);
      } else {
        await API.post('/feed', formData);
      }
      setShowModal(false);
      fetchFeeds();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feed inventory record? Any linked expense entry will also be deleted.')) {
      try {
        await API.delete(`/feed/${id}`);
        fetchFeeds();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredFeeds = feeds.filter(
    (f) =>
      f.feedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.feedType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockKg = feeds.reduce((acc, f) => {
    const q = Number(f.quantity) || 0;
    if (f.unit === 'Ton') return acc + q * 1000;
    if (f.unit === 'Bags') return acc + q * 50; // standard approx 50kg bag
    if (f.unit === 'Grams') return acc + q / 1000;
    return acc + q;
  }, 0);

  const totalSpend = feeds.reduce((acc, f) => acc + (f.totalCost || (Number(f.quantity) * Number(f.price)) || 0), 0);

  return (
    <div className="feed-mgmt-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">🌾 Feed Inventory Management</h1>
            <p className="text-muted mb-0">Track poultry feed stock, suppliers, unit costs, and automatic expense synchronization</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Feed Entry
          </button>
        </div>

        {/* Quick Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Total Feed Stock (~Kg)</div>
                  <h3 className="fw-extrabold text-success mb-0">{Math.round(totalStockKg).toLocaleString()} Kg</h3>
                </div>
                <div className="fs-1">🌾</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Total Feed Expenses</div>
                  <h3 className="fw-extrabold text-danger mb-0">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="fs-1">💸</div>
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
                placeholder="🔍 Search feed name, type, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Total Feed Records: {filteredFeeds.length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading feed inventory...</p>
              </div>
            ) : filteredFeeds.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No feed stock recorded yet.</h5>
                <p className="mb-0">Click "Add Feed Entry" to log feed purchases.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 feed-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Feed Name</th>
                      <th>Category Type</th>
                      <th>Quantity</th>
                      <th>Price/Unit</th>
                      <th>Total Cost & Expense</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeeds.map((feed, index) => {
                      const cost = feed.totalCost || (feed.quantity * feed.price);
                      return (
                        <tr key={feed._id}>
                          <td className="fw-bold">{index + 1}</td>
                          <td className="fw-bold text-dark">{feed.feedName}</td>
                          <td>
                            <span className="badge bg-success-subtle text-success border px-3 py-2 fw-semibold">
                              {feed.feedType}
                            </span>
                          </td>
                          <td className="fw-bold">
                            {feed.quantity} {feed.unit}
                          </td>
                          <td>${feed.price}</td>
                          <td>
                            <div className="fw-bold text-success">${Number(cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <small className="text-danger fw-semibold" title="Synced to Expense Management">
                              💸 Synced Expense
                            </small>
                          </td>
                          <td className="text-muted">{feed.supplier}</td>
                          <td className="text-muted">
                            {new Date(feed.date).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary fw-bold hover-lift"
                                onClick={() => openEditModal(feed)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger fw-bold hover-lift"
                                onClick={() => handleDelete(feed._id)}
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  {isEditing ? '✏️ Edit Feed Inventory' : '🌾 Add New Feed Purchase'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {/* Expense Notice */}
                  <div className="alert alert-warning border-warning d-flex align-items-center gap-2 mb-3 py-2">
                    <span className="fs-4">💡</span>
                    <div style={{ fontSize: '0.88rem' }}>
                      <strong>Expense Integration Active:</strong> When saved, this purchase total of{' '}
                      <strong>
                        ${calculatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>{' '}
                      will automatically be added under <strong>Expense Management</strong> as <em>"Feed Purchase"</em>.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Feed Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="feedName"
                      required
                      placeholder="e.g. Premium Layer Mash, Broiler Starter"
                      value={formData.feedName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Feed Type</label>
                      <select
                        className="form-select"
                        name="feedType"
                        value={formData.feedType}
                        onChange={handleInputChange}
                      >
                        <option value="Starter Feed">Starter Feed</option>
                        <option value="Grower Feed">Grower Feed</option>
                        <option value="Layer Feed">Layer Feed</option>
                        <option value="Broiler Feed">Broiler Feed</option>
                        <option value="Finisher Feed">Finisher Feed</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Unit</label>
                      <select
                        className="form-select"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                      >
                        <option value="Kg">Kg</option>
                        <option value="Bags">Bags</option>
                        <option value="Ton">Ton</option>
                        <option value="Grams">Grams</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        required
                        min="0"
                        placeholder="Quantity"
                        value={formData.quantity}
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

                  {/* Auto Calculated Total Cost Display */}
                  <div className="alert alert-success d-flex justify-content-between align-items-center mb-3 py-2">
                    <span className="fw-bold">Calculated Purchase Cost:</span>
                    <span className="fs-5 fw-extrabold text-success">
                      ${calculatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Supplier Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="supplier"
                        required
                        placeholder="e.g. AgriFeed Supplies Co."
                        value={formData.supplier}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Purchase Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        required
                        value={formData.date}
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

export default FeedManagement;
