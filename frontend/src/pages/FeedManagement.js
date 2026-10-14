import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './FeedManagement.css';

const FeedManagement = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
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
      console.error('Error loading feed records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto calculated Total Cost
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
    if (window.confirm('Are you sure you want to delete this feed inventory record?')) {
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

  return (
    <div className="feed-mgmt-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">🌾 Feed Inventory Management</h1>
            <p className="text-muted mb-0">Track poultry feed stock, suppliers, unit costs, and total expenditure</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Feed Entry
          </button>
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
              Feed Entries: {filteredFeeds.length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading feed data...</p>
              </div>
            ) : filteredFeeds.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No feed inventory records found.</h5>
                <p className="mb-0">Click "Add Feed Entry" to create a new record.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 feed-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Feed Name</th>
                      <th>Feed Type</th>
                      <th>Quantity</th>
                      <th>Price / Unit</th>
                      <th>Total Cost</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeeds.map((feed, index) => (
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
                        <td className="fw-bold text-success">${feed.totalCost || feed.quantity * feed.price}</td>
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
                  <div className="alert alert-success d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold">Auto Calculated Total Cost:</span>
                    <span className="fs-5 fw-extrabold text-success">${calculatedTotalCost.toFixed(2)}</span>
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
                      <label className="form-label fw-bold">Date</label>
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

export default FeedManagement;
