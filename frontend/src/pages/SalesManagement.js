import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './SalesManagement.css';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [chickens, setChickens] = useState([]);
  const [eggs, setEggs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    productType: 'Chicken', // 'Chicken', 'Eggs', 'Other'
    product: 'Live Chicken',
    chickenId: '',
    eggId: '',
    quantity: '',
    price: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    amountPaid: '',
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [salesRes, chickensRes, eggsRes] = await Promise.all([
        API.get('/sales'),
        API.get('/chickens'),
        API.get('/eggs'),
      ]);
      setSales(salesRes.data);
      setChickens(chickensRes.data);
      setEggs(eggsRes.data);
    } catch (err) {
      console.error('Error loading sales, chicken, or egg stock:', err);
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

      // Auto-set product name and price if specific egg batch is chosen
      if (name === 'eggId') {
        if (value) {
          const selectedEgg = eggs.find((eg) => eg._id === value);
          if (selectedEgg) {
            updated.product = `Fresh Eggs (${selectedEgg.breed})`;
            if (selectedEgg.pricePerEgg && !prev.price) {
              updated.price = selectedEgg.pricePerEgg;
            }
          }
        } else {
          updated.product = 'Fresh Farm Eggs';
        }
      }

      if (name === 'productType') {
        if (value === 'Chicken') {
          updated.product = 'Live Chicken';
          updated.eggId = '';
        } else if (value === 'Eggs') {
          updated.product = 'Fresh Farm Eggs';
          updated.chickenId = '';
          // If default egg batch has price, suggest it
          const firstEggWithPrice = eggs.find((eg) => eg.pricePerEgg > 0);
          if (firstEggWithPrice && !prev.price) {
            updated.price = firstEggWithPrice.pricePerEgg;
          }
        } else {
          updated.product = '';
          updated.chickenId = '';
          updated.eggId = '';
        }
      }

      return updated;
    });
  };

  // Compute available stock for chickens
  const totalAvailableChickens = chickens.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
  const selectedFlock = chickens.find((c) => c._id === formData.chickenId);
  const currentAvailableChickens = selectedFlock ? selectedFlock.quantity : totalAvailableChickens;

  // Compute available stock for eggs (balanceEggs)
  const totalAvailableEggs = eggs.reduce((acc, eg) => {
    const bal = eg.balanceEggs !== undefined ? eg.balanceEggs : Math.max(0, (Number(eg.goodEggs) || 0) - (Number(eg.soldEggs) || 0));
    return acc + bal;
  }, 0);
  const selectedEggBatch = eggs.find((eg) => eg._id === formData.eggId);
  const currentAvailableEggs = selectedEggBatch
    ? (selectedEggBatch.balanceEggs !== undefined ? selectedEggBatch.balanceEggs : Math.max(0, (Number(selectedEggBatch.goodEggs) || 0) - (Number(selectedEggBatch.soldEggs) || 0)))
    : totalAvailableEggs;

  // Current active item's available stock and balance after sale
  const isChickenType = formData.productType === 'Chicken';
  const isEggType = formData.productType === 'Eggs';
  const currentAvailableStock = isChickenType ? currentAvailableChickens : isEggType ? currentAvailableEggs : Infinity;
  const qtyNum = Number(formData.quantity) || 0;
  const stockBalanceAfterSale = Math.max(0, currentAvailableStock - qtyNum);

  // Total invoice & payment balance computation
  const calculatedTotalAmount = qtyNum * (Number(formData.price) || 0);
  const paidAmount = formData.amountPaid !== '' ? Number(formData.amountPaid) : calculatedTotalAmount;
  const paymentBalanceDue = Math.max(0, calculatedTotalAmount - paidAmount);
  const changeDue = Math.max(0, paidAmount - calculatedTotalAmount);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      productType: 'Chicken',
      product: 'Live Chicken',
      chickenId: '',
      eggId: '',
      quantity: '',
      price: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      amountPaid: '',
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setIsEditing(true);
    setCurrentId(s._id);
    const prodType = s.productType || (s.product.toLowerCase().includes('chicken') ? 'Chicken' : s.product.toLowerCase().includes('egg') ? 'Eggs' : 'Other');
    setFormData({
      productType: prodType,
      product: s.product,
      chickenId: s.chickenId || '',
      eggId: s.eggId || '',
      quantity: s.quantity,
      price: s.price,
      customerName: s.customerName,
      date: new Date(s.date).toISOString().split('T')[0],
      amountPaid: s.amountPaid !== undefined ? s.amountPaid : s.totalAmount,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((isChickenType || isEggType) && qtyNum > currentAvailableStock && !isEditing) {
      alert(`⚠️ Insufficient stock! Only ${currentAvailableStock} available.`);
      return;
    }
    try {
      const payload = {
        ...formData,
        amountPaid: formData.amountPaid !== '' ? Number(formData.amountPaid) : calculatedTotalAmount,
      };
      if (isEditing) {
        await API.put(`/sales/${currentId}`, payload);
      } else {
        await API.post('/sales', payload);
      }
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale entry? Any deducted chickens or eggs will be restored back to your farm inventory.')) {
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
  const totalEggsSold = sales
    .filter((s) => s.productType === 'Eggs' || s.product.toLowerCase().includes('egg'))
    .reduce((acc, s) => acc + (Number(s.quantity) || 0), 0);

  return (
    <div className="sales-container py-4">
      <div className="container">
        {/* Title Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">💰 Farm Sales Management</h1>
            <p className="text-muted mb-0">Record chicken & egg sales with automatic inventory stock reduction and balance tracking</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Log New Sale
          </button>
        </div>

        {/* Sales Metric Summary Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
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
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Chickens Sold</div>
                  <h3 className="fw-extrabold text-primary mb-0">{totalChickensSold.toLocaleString()}</h3>
                  <small className="text-muted">{totalAvailableChickens} available in flock</small>
                </div>
                <div className="fs-1">🐔</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fw-semibold fs-7">Eggs Sold</div>
                  <h3 className="fw-extrabold text-info mb-0">{totalEggsSold.toLocaleString()}</h3>
                  <small className="text-success fw-bold">🥚 {totalAvailableEggs.toLocaleString()} Balance in farm</small>
                </div>
                <div className="fs-1">🍳</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm rounded-4 p-3 bg-success-subtle border border-success h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-success-emphasis fw-bold fs-7">Available Egg Balance</div>
                  <h3 className="fw-extrabold text-success mb-0">{totalAvailableEggs.toLocaleString()} Eggs</h3>
                  <small className="text-success fw-semibold">Ready for market sale</small>
                </div>
                <div className="fs-1">🥚</div>
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
                      <th>Payment & Balance</th>
                      <th>Sale Date</th>
                      <th>Inventory Impact & Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((s, index) => {
                      const isChicken = s.productType === 'Chicken' || s.product.toLowerCase().includes('chicken');
                      const isEgg = s.productType === 'Eggs' || s.product.toLowerCase().includes('egg');
                      const hasBalanceDue = (Number(s.paymentBalance) || 0) > 0;
                      return (
                        <tr key={s._id}>
                          <td className="fw-bold">{index + 1}</td>
                          <td className="fw-bold text-dark">
                            {isChicken && '🐔 '}
                            {isEgg && '🥚 '}
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
                          <td>
                            {hasBalanceDue ? (
                              <span className="badge bg-warning-subtle text-dark border border-warning px-2 py-1">
                                ⚠️ Due: ${Number(s.paymentBalance).toFixed(2)}
                              </span>
                            ) : (
                              <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                ✅ Paid in Full
                              </span>
                            )}
                          </td>
                          <td className="text-muted">
                            {new Date(s.date).toLocaleDateString()}
                          </td>
                          <td>
                            {isChicken ? (
                              <span className="badge bg-danger-subtle text-danger px-2 py-1">
                                ⬇️ -{s.deductedQuantity || s.quantity} Chickens
                                {s.remainingStockBalance !== undefined && (
                                  <span className="ms-1 fw-bold">(Bal: {s.remainingStockBalance})</span>
                                )}
                              </span>
                            ) : isEgg ? (
                              <span className="badge bg-info-subtle text-info-emphasis px-2 py-1">
                                ⬇️ -{s.deductedQuantity || s.quantity} Eggs
                                {s.remainingStockBalance !== undefined && (
                                  <span className="ms-1 fw-bold">(Bal: {s.remainingStockBalance})</span>
                                )}
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

                    {formData.productType === 'Eggs' && (
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-bold">Select Egg Production Batch (Optional)</label>
                        <select
                          className="form-select form-select-lg"
                          name="eggId"
                          value={formData.eggId}
                          onChange={handleInputChange}
                        >
                          <option value="">All Available Harvests ({totalAvailableEggs} balance eggs available)</option>
                          {eggs.map((eg) => {
                            const bal = eg.balanceEggs !== undefined ? eg.balanceEggs : Math.max(0, (eg.goodEggs || 0) - (eg.soldEggs || 0));
                            return (
                              <option key={eg._id} value={eg._id} disabled={bal <= 0}>
                                {eg.breed} ({new Date(eg.productionDate).toLocaleDateString()}) — {bal} eggs in balance (${eg.pricePerEgg}/egg)
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Stock Deduction & Balance Notification */}
                  {formData.productType === 'Chicken' && (
                    <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2">
                      <span className="fs-4">ℹ️</span>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>Automatic Chicken Inventory Sync:</strong> Sold count will automatically reduce flock count.
                        <div className="mt-1">
                          Current Available: <strong>{currentAvailableChickens}</strong> chickens | Balance After Sale: <strong className="text-success">{stockBalanceAfterSale}</strong> chickens
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.productType === 'Eggs' && (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-3 py-2">
                      <span className="fs-4">🥚</span>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>Automatic Egg Reduction & Balance:</strong> Sold eggs will automatically be deducted from the egg harvest inventory.
                        <div className="mt-1">
                          Current Available Stock: <strong>{currentAvailableEggs}</strong> eggs | Balance Remaining After Sale: <strong className="text-success fs-6">{stockBalanceAfterSale}</strong> eggs
                        </div>
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
                        max={(isChickenType || isEggType) ? currentAvailableStock : undefined}
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                      />
                      {(isChickenType || isEggType) && qtyNum > currentAvailableStock && (
                        <small className="text-danger fw-bold">
                          Exceeds available balance ({currentAvailableStock})!
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

                  {/* Customer Payment & Balance Section */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Amount Paid by Customer ($)</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          name="amountPaid"
                          min="0"
                          step="0.01"
                          placeholder={calculatedTotalAmount.toFixed(2)}
                          value={formData.amountPaid}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setFormData((prev) => ({ ...prev, amountPaid: calculatedTotalAmount }))}
                        >
                          Full
                        </button>
                      </div>
                      <small className="text-muted">Leave blank or click "Full" if paid in full</small>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Payment Balance Status</label>
                      <div className="p-2 border rounded-3 bg-light">
                        {paymentBalanceDue > 0 ? (
                          <div className="text-danger fw-bold">
                            ⚠️ Balance Due from Customer: ${paymentBalanceDue.toFixed(2)}
                          </div>
                        ) : changeDue > 0 ? (
                          <div className="text-primary fw-bold">
                            💵 Change / Balance Return: ${changeDue.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-success fw-bold">
                            ✅ Fully Paid (Balance: $0.00)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Computed Total Amount Display */}
                  <div className="card bg-light border-0 rounded-3 p-3 text-end">
                    <span className="text-muted fs-7">Calculated Invoice Amount:</span>
                    <span className="fs-3 fw-extrabold text-success">
                      ${calculatedTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {(isChickenType || isEggType) && (
                      <span className="text-muted fs-7 mt-1">
                        Stock Remaining Balance: <strong>{stockBalanceAfterSale} {isChickenType ? 'chickens' : 'eggs'}</strong>
                      </span>
                    )}
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
                    disabled={(isChickenType || isEggType) && qtyNum > currentAvailableStock && !isEditing}
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
