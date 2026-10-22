import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './EggManagement.css';

const EggManagement = () => {
  const [eggs, setEggs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');

  // Form state for Add / Edit
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

  // Quick Sell Modal state
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellEggBatch, setSellEggBatch] = useState(null);
  const [sellForm, setSellForm] = useState({
    customerName: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    amountPaid: '',
  });
  const [sellError, setSellError] = useState('');

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
      if (Number(updated.brokenEggs) > Number(updated.totalEggs) && updated.totalEggs !== '') {
        setFormError('⚠️ Broken eggs cannot be greater than total eggs!');
      } else {
        setFormError('');
      }
      return updated;
    });
  };

  // Real-time automatic calculations for Add/Edit
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

  // Open Quick Sell Modal for a specific egg batch
  const openQuickSellModal = (egg) => {
    setSellEggBatch(egg);
    setSellError('');
    setSellForm({
      customerName: '',
      quantity: '',
      price: egg.pricePerEgg || '',
      date: new Date().toISOString().split('T')[0],
      amountPaid: '',
    });
    setShowSellModal(true);
  };

  const handleSellInputChange = (e) => {
    const { name, value } = e.target;
    setSellForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculations for Quick Sell
  const sellAvailable = sellEggBatch
    ? (sellEggBatch.balanceEggs !== undefined ? sellEggBatch.balanceEggs : Math.max(0, (sellEggBatch.goodEggs || 0) - (sellEggBatch.soldEggs || 0)))
    : 0;
  const sellQty = Number(sellForm.quantity) || 0;
  const sellUnitPrice = Number(sellForm.price) || 0;
  const sellTotal = sellQty * sellUnitPrice;
  const sellPaid = sellForm.amountPaid !== '' ? Number(sellForm.amountPaid) : sellTotal;
  const sellBalanceDue = Math.max(0, sellTotal - sellPaid);
  const sellRemainingStock = Math.max(0, sellAvailable - sellQty);

  const handleQuickSellSubmit = async (e) => {
    e.preventDefault();
    if (sellQty <= 0) {
      setSellError('⚠️ Quantity must be greater than 0');
      return;
    }
    if (sellQty > sellAvailable) {
      setSellError(`⚠️ Cannot sell ${sellQty} eggs. Only ${sellAvailable} eggs available in this batch.`);
      return;
    }
    try {
      await API.post('/sales', {
        productType: 'Eggs',
        product: `Fresh Eggs (${sellEggBatch.breed})`,
        eggId: sellEggBatch._id,
        quantity: sellQty,
        price: sellUnitPrice,
        customerName: sellForm.customerName,
        date: sellForm.date,
        amountPaid: sellPaid,
      });
      setShowSellModal(false);
      fetchEggs();
      alert(`✅ Sale recorded successfully! ${sellQty} eggs deducted. Remaining batch balance: ${sellRemainingStock} eggs.`);
    } catch (err) {
      setSellError(err.response?.data?.message || 'Sale recording failed');
    }
  };

  const filteredEggs = eggs.filter((e) =>
    e.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totals for top stat cards
  const totalEggsHarvested = eggs.reduce((sum, e) => sum + (Number(e.totalEggs) || 0), 0);
  const totalBrokenEggs = eggs.reduce((sum, e) => sum + (Number(e.brokenEggs) || 0), 0);
  const totalGoodEggs = eggs.reduce((sum, e) => sum + (Number(e.goodEggs) || 0), 0);
  const totalSoldEggs = eggs.reduce((sum, e) => sum + (Number(e.soldEggs) || 0), 0);
  const totalAvailableEggBalance = eggs.reduce((sum, e) => {
    const bal = e.balanceEggs !== undefined ? e.balanceEggs : Math.max(0, (Number(e.goodEggs) || 0) - (Number(e.soldEggs) || 0));
    return sum + bal;
  }, 0);

  return (
    <div className="egg-mgmt-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">🥚 Egg Production & Inventory Management</h1>
            <p className="text-muted mb-0">Record daily egg harvests, track sold eggs, and monitor real-time available stock balance</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Production Entry
          </button>
        </div>

        {/* Metrics Summary Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Total Harvested</div>
                  <h3 className="fw-extrabold text-dark mb-0">{totalEggsHarvested.toLocaleString()} Eggs</h3>
                  <small className="text-muted">{totalGoodEggs.toLocaleString()} good eggs</small>
                </div>
                <div className="fs-1 text-secondary">🥚</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Broken Eggs</div>
                  <h3 className="fw-extrabold text-danger mb-0">{totalBrokenEggs.toLocaleString()}</h3>
                  <small className="text-danger fw-semibold">Damaged during harvest</small>
                </div>
                <div className="fs-1">💔</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Total Eggs Sold</div>
                  <h3 className="fw-extrabold text-primary mb-0">{totalSoldEggs.toLocaleString()} Eggs</h3>
                  <small className="text-primary fw-semibold">Auto-synced to Sales</small>
                </div>
                <div className="fs-1">💰</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-success-subtle border border-success h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-success-emphasis fw-bold fs-7">Current Stock Balance</div>
                  <h3 className="fw-extrabold text-success mb-0">{totalAvailableEggBalance.toLocaleString()} Eggs</h3>
                  <small className="text-success fw-semibold">Available for sale / use</small>
                </div>
                <div className="fs-1">🧺</div>
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
                placeholder="🔍 Search by chicken breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Total Harvest Batches: {filteredEggs.length}
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
                      <th>Total</th>
                      <th>Broken</th>
                      <th>Good Eggs</th>
                      <th>Sold Eggs</th>
                      <th>Available Balance</th>
                      <th>Price / Egg</th>
                      <th>Total Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEggs.map((egg, index) => {
                      const balance = egg.balanceEggs !== undefined ? egg.balanceEggs : Math.max(0, (egg.goodEggs || 0) - (egg.soldEggs || 0));
                      const isLowStock = balance === 0;
                      return (
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
                            <span className="badge bg-secondary-subtle text-dark border px-2 py-1 fw-bold">
                              {egg.goodEggs}
                            </span>
                          </td>
                          <td>
                            {(egg.soldEggs || 0) > 0 ? (
                              <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1">
                                🍳 {egg.soldEggs} sold
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            {isLowStock ? (
                              <span className="badge bg-light text-muted border px-2 py-1">
                                0 in stock (Sold out)
                              </span>
                            ) : (
                              <span className="badge bg-success px-3 py-2 fw-bold">
                                🥚 {balance} in stock
                              </span>
                            )}
                          </td>
                          <td>${egg.pricePerEgg}</td>
                          <td className="fw-bold text-success">${egg.totalAmount.toFixed(2)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-success fw-bold hover-lift"
                                title="Sell eggs from this batch"
                                onClick={() => openQuickSellModal(egg)}
                                disabled={balance <= 0}
                              >
                                🛒 Sell
                              </button>
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
                      <span className="fw-bold text-dark">Computed Total Harvest Value:</span>
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

      {/* Quick Sell Modal */}
      {showSellModal && sellEggBatch && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  🛒 Quick Sell Eggs ({sellEggBatch.breed})
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSellModal(false)}
                ></button>
              </div>
              <form onSubmit={handleQuickSellSubmit}>
                <div className="modal-body p-4">
                  {sellError && (
                    <div className="alert alert-danger fw-bold shadow-sm mb-3">{sellError}</div>
                  )}

                  {/* Stock Notice */}
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-3 py-2">
                    <span className="fs-4">🧺</span>
                    <div style={{ fontSize: '0.88rem' }}>
                      <strong>Batch Stock Available:</strong> <strong>{sellAvailable}</strong> eggs.
                      {sellQty > 0 && (
                        <div>Remaining Balance after sale: <strong className="text-success">{sellRemainingStock}</strong> eggs</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Customer / Buyer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="customerName"
                      required
                      placeholder="e.g. City Bakery, John Doe"
                      value={sellForm.customerName}
                      onChange={handleSellInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Quantity to Sell</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        required
                        min="1"
                        max={sellAvailable}
                        placeholder={`Max ${sellAvailable}`}
                        value={sellForm.quantity}
                        onChange={handleSellInputChange}
                      />
                      {sellQty > sellAvailable && (
                        <small className="text-danger fw-bold">Exceeds available stock ({sellAvailable})!</small>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Price per Egg ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={sellForm.price}
                        onChange={handleSellInputChange}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Sale Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        required
                        value={sellForm.date}
                        onChange={handleSellInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Amount Paid by Customer ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="amountPaid"
                        min="0"
                        step="0.01"
                        placeholder={sellTotal.toFixed(2)}
                        value={sellForm.amountPaid}
                        onChange={handleSellInputChange}
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="card bg-light border-0 rounded-3 p-3 text-end">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted fs-7">Total Invoice Amount:</span>
                      <span className="fw-bold text-success fs-5">${sellTotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted fs-7">Payment Status:</span>
                      <span className="fw-semibold">
                        {sellBalanceDue > 0 ? (
                          <span className="text-danger">⚠️ Balance Due: ${sellBalanceDue.toFixed(2)}</span>
                        ) : (
                          <span className="text-success">✅ Paid in Full</span>
                        )}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted fs-7">Batch Remaining Egg Balance:</span>
                      <span className="fw-bold text-success fs-6">{sellRemainingStock} eggs</span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-secondary fw-bold"
                    onClick={() => setShowSellModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success fw-bold px-4"
                    disabled={sellQty <= 0 || sellQty > sellAvailable}
                  >
                    Confirm Sale & Deduct Stock
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
