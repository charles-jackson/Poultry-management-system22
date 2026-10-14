import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './SalesManagement.css';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    price: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/sales');
      setSales(data);
    } catch (err) {
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Automatic computation
  const calculatedTotalAmount = (Number(formData.quantity) || 0) * (Number(formData.price) || 0);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      product: '',
      quantity: '',
      price: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setIsEditing(true);
    setCurrentId(s._id);
    setFormData({
      product: s.product,
      quantity: s.quantity,
      price: s.price,
      customerName: s.customerName,
      date: new Date(s.date).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/sales/${currentId}`, formData);
      } else {
        await API.post('/sales', formData);
      }
      setShowModal(false);
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale entry?')) {
      try {
        await API.delete(`/sales/${id}`);
        fetchSales();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sales-mgmt-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">💰 Sales & Revenue Management</h1>
            <p className="text-muted mb-0">Record farm product sales (Eggs, Chickens, Meat), customer billing, and gross revenue</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Sale Record
          </button>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 search-card">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control rounded-3 border-success-subtle"
                placeholder="🔍 Search product or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Sales Records: {filteredSales.length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading sales records...</p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No sales transactions recorded.</h5>
                <p className="mb-0">Click "Add Sale Record" to add customer orders.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 sales-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price per Unit</th>
                      <th>Total Amount</th>
                      <th>Customer Name</th>
                      <th>Sale Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((s, index) => (
                      <tr key={s._id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="fw-bold text-dark">{s.product}</td>
                        <td>{s.quantity}</td>
                        <td>${s.price}</td>
                        <td className="fw-extrabold text-success">${(s.totalAmount || s.quantity * s.price).toFixed(2)}</td>
                        <td className="fw-semibold">{s.customerName}</td>
                        <td className="text-muted">
                          {new Date(s.date).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary fw-bold hover-lift"
                              onClick={() => openEditModal(s)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger fw-bold hover-lift"
                              onClick={() => handleDelete(s._id)}
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
                  {isEditing ? '✏️ Edit Sale Entry' : '💰 Log New Product Sale'}
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
                    <label className="form-label fw-bold">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="product"
                      required
                      placeholder="e.g. Fresh Eggs (Crate), Whole Chicken, Manure"
                      value={formData.product}
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

                  {/* Auto calculated total amount */}
                  <div className="alert alert-success d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold">Auto Calculated Total Amount:</span>
                    <span className="fs-5 fw-extrabold text-success">${calculatedTotalAmount.toFixed(2)}</span>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Customer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customerName"
                        required
                        placeholder="e.g. Green Valley Groceries"
                        value={formData.customerName}
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

export default SalesManagement;
