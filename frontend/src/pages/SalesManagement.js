import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './SalesManagement.css';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [chickens, setChickens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    productType: 'Chicken', // 'Chicken', 'Eggs', 'Other'
    product: 'Live Chicken',
    chickenId: '',
    quantity: '',
    price: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [salesRes, chickensRes] = await Promise.all([
        API.get('/sales'),
        API.get('/chickens'),
      ]);
      setSales(salesRes.data);
      setChickens(chickensRes.data);
    } catch (err) {
      console.error('Error loading sales or chicken stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-set product name and price if specific flock is chosen
      if (name === 'chickenId') {
        if (value) {
          const selectedFlock = chickens.find((c) => c._id === value);
          if (selectedFlock) {
            updated.product = `${selectedFlock.breed} Chicken`;
            if (selectedFlock.price && !prev.price) {
              updated.price = selectedFlock.price;
            }
          }
        } else {
          updated.product = 'Live Chicken';
        }
      }

      if (name === 'productType') {
        if (value === 'Chicken') {
          updated.product = 'Live Chicken';
        } else if (value === 'Eggs') {
          updated.product = 'Fresh Farm Eggs';
          updated.chickenId = '';
        } else {
          updated.product = '';
          updated.chickenId = '';
        }
      }

      return updated;
    });
  };

  // Compute available stock for selected chicken flock or all flocks
  const totalAvailableChickens = chickens.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
  const selectedFlock = chickens.find((c) => c._id === formData.chickenId);
  const currentAvailable = selectedFlock ? selectedFlock.quantity : totalAvailableChickens;

  // Total computation
  const calculatedTotalAmount = (Number(formData.quantity) || 0) * (Number(formData.price) || 0);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      productType: 'Chicken',
      product: 'Live Chicken',
      chickenId: '',
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
      productType: s.productType || (s.product.toLowerCase().includes('chicken') ? 'Chicken' : 'Other'),
      product: s.product,
      chickenId: s.chickenId || '',
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
      // Refresh both sales and chicken stock
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale entry? Any deducted chickens will be restored back to your flock.')) {
      try {
        await API.delete(`/sales/${id}`);
        fetchInitialData();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredSales = sales.filter((s) =>
    s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
  const totalChickensSold = sales
    .filter((s) => s.productType === 'Chicken' || s.product.toLowerCase().includes('chicken'))
    .reduce((acc, s) => acc + (Number(s.quantity) || 0), 0);

  return (
    <div className="sales-container py-4">
      <div className="container">
        {/* Title Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">💰 Farm Sales Management</h1>
            <p className="text-muted mb-0">Record chicken sales with automatic flock count deduction and revenue tracking</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Log New Sale
          </button>
        </div>

        {/* Sales Metric Summary Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Total Sales Revenue</div>
                  <h3 className="fw-extrabold text-success mb-0">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="fs-1 text-success">💵</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Chickens Sold to Date</div>
                  <h3 className="fw-extrabold text-primary mb-0">{totalChickensSold.toLocaleString()} Chickens</h3>
                </div>
                <div className="fs-1">🐔</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Available Flock in Farm</div>
                  <h3 className="fw-extrabold text-warning mb-0">{totalAvailableChickens.toLocaleString()} Chickens</h3>
                </div>
                <div className="fs-1">🏡</div>
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
                placeholder="🔍 Search product or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Total Sales Logs: {filteredSales.length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading sales logs...</p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No sales transactions recorded yet.</h5>
                <p className="mb-0">Click "Log New Sale" to record an invoice.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 sales-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Customer Name</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Amount</th>
                      <th>Sale Date</th>
                      <th>Inventory Impact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((s, index) => {
                      const isChicken = s.productType === 'Chicken' || s.product.toLowerCase().includes('chicken');
                      return (
                        <tr key={s._id}>
                          <td className="fw-bold">{index + 1}</td>
                          <td className="fw-bold text-dark">
                            {isChicken && '🐔 '}
                            {s.product}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
                              {s.customerName}
                            </span>
                          </td>
                          <td className="fw-bold fs-6">{s.quantity}</td>
                          <td>${Number(s.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="fw-extrabold text-success">
                            ${Number(s.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-muted">
                            {new Date(s.date).toLocaleDateString()}
                          </td>
                          <td>
                            {isChicken ? (
                              <span className="badge bg-danger-subtle text-danger px-2 py-1">
                                ⬇️ -{s.deductedQuantity || s.quantity} Flock Count
                              </span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                                —
                              </span>
                            )}
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
                  {isEditing ? '✏️ Edit Sale Entry' : '💰 Record Product Sale'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {/* Product Type Selector */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Sale Category</label>
                      <select
                        className="form-select form-select-lg"
                        name="productType"
                        value={formData.productType}
                        onChange={handleInputChange}
                      >
                        <option value="Chicken">🐔 Live Chicken / Flock</option>
                        <option value="Eggs">🥚 Fresh Farm Eggs</option>
                        <option value="Other">📦 Other Produce / Manure</option>
                      </select>
                    </div>

                    {formData.productType === 'Chicken' && (
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-bold">Select Specific Flock Breed (Optional)</label>
                        <select
                          className="form-select form-select-lg"
                          name="chickenId"
                          value={formData.chickenId}
                          onChange={handleInputChange}
                        >
                          <option value="">Any Available Flock ({totalAvailableChickens} total available)</option>
                          {chickens.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.breed} — {c.quantity} available (${c.price}/unit)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Stock Deduction Notification */}
                  {formData.productType === 'Chicken' && (
                    <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2">
                      <span className="fs-4">ℹ️</span>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>Automatic Inventory Sync:</strong> When saved, the sold quantity will automatically be deducted from your farm's chicken flock count (Current Available: <strong>{currentAvailable}</strong> chickens).
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Product Description / Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="product"
                        required
                        placeholder="e.g. Broiler Chicken, Rhode Island Red, Fresh Eggs"
                        value={formData.product}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Customer / Buyer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customerName"
                        required
                        placeholder="e.g. Metro Supermarket, John Doe"
                        value={formData.customerName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-bold">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        required
                        min="1"
                        max={formData.productType === 'Chicken' ? currentAvailable : undefined}
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                      />
                      {formData.productType === 'Chicken' && Number(formData.quantity) > currentAvailable && (
                        <small className="text-danger fw-bold">
                          Exceeds available stock ({currentAvailable})!
                        </small>
                      )}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-bold">Selling Price per Unit ($)</label>
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
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-bold">Sale Date</label>
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

                  {/* Computed Total Amount Display */}
                  <div className="card bg-light border-0 rounded-3 p-3 text-end">
                    <span className="text-muted fs-7">Calculated Invoice Amount:</span>
                    <span className="fs-3 fw-extrabold text-success">
                      ${calculatedTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
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
                    disabled={formData.productType === 'Chicken' && Number(formData.quantity) > currentAvailable}
                  >
                    {isEditing ? 'Save Changes' : 'Confirm & Complete Sale'}
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
