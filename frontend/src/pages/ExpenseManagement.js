import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './ExpenseManagement.css';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Feed Purchase',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
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
      category: 'Feed Purchase',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setShowModal(true);
  };

  const openEditModal = (ex) => {
    setIsEditing(true);
    setCurrentId(ex._id);
    setFormData({
      category: ex.category,
      description: ex.description,
      amount: ex.amount,
      date: new Date(ex.date).toISOString().split('T')[0],
      remarks: ex.remarks || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/expenses/${currentId}`, formData);
      } else {
        await API.post('/expenses', formData);
      }
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      try {
        await API.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredExpenses = expenses.filter(
    (ex) =>
      ex.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="expense-mgmt-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-danger mb-1">💸 Farm Expense Management</h1>
            <p className="text-muted mb-0">Record operational expenses including feed purchases, veterinary costs, utilities, and wages</p>
          </div>
          <button className="btn btn-danger-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Expense Entry
          </button>
        </div>

        {/* Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 search-card">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control rounded-3 border-danger-subtle"
                placeholder="🔍 Search category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Expense Records: {filteredExpenses.length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status"></div>
                <p className="mt-2 text-muted">Loading expense logs...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No expense records found.</h5>
                <p className="mb-0">Click "Add Expense Entry" to record operational costs.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 expense-table">
                  <thead className="table-danger">
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((ex, index) => (
                      <tr key={ex._id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-2 fw-bold">
                            {ex.category}
                          </span>
                        </td>
                        <td className="fw-semibold text-dark">{ex.description}</td>
                        <td className="fw-extrabold text-danger">${ex.amount.toFixed(2)}</td>
                        <td className="text-muted">
                          {new Date(ex.date).toLocaleDateString()}
                        </td>
                        <td className="text-muted">{ex.remarks || '—'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary fw-bold hover-lift"
                              onClick={() => openEditModal(ex)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger fw-bold hover-lift"
                              onClick={() => handleDelete(ex._id)}
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
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  {isEditing ? '✏️ Edit Expense Entry' : '💸 Log New Farm Expense'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Expense Category</label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="Feed Purchase">Feed Purchase</option>
                        <option value="Vaccination & Medicine">Vaccination & Medicine</option>
                        <option value="Utilities & Water">Utilities & Water</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Equipment & Maintenance">Equipment & Maintenance</option>
                        <option value="Transport & Fuel">Transport & Fuel</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Amount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="amount"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      name="description"
                      required
                      placeholder="e.g. Bought 20 bags layer feed from supplier"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Expense Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Remarks</label>
                    <textarea
                      className="form-control"
                      name="remarks"
                      rows="2"
                      placeholder="Additional details..."
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
                  <button type="submit" className="btn btn-danger fw-bold px-4">
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

export default ExpenseManagement;
