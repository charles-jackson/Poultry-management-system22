import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    phone: '',
    address: '',
    gender: 'Male',
    jobRole: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
    attendance: 'Present',
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
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
      employeeName: '',
      phone: '',
      address: '',
      gender: 'Male',
      jobRole: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: '',
      attendance: 'Present',
    });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setIsEditing(true);
    setCurrentId(emp._id);
    setFormData({
      employeeName: emp.employeeName,
      phone: emp.phone,
      address: emp.address,
      gender: emp.gender,
      jobRole: emp.jobRole,
      joiningDate: new Date(emp.joiningDate).toISOString().split('T')[0],
      salary: emp.salary,
      attendance: emp.attendance,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/employees/${currentId}`, formData);
      } else {
        await API.post('/employees', formData);
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      try {
        await API.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm)
  );

  return (
    <div className="employee-mgmt-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="fw-bold text-success mb-1">👨‍🌾 Employee & Staff Management</h1>
            <p className="text-muted mb-0">Manage farm workers, job roles, contact details, salaries, and attendance status</p>
          </div>
          <button className="btn btn-success-glow fw-bold px-4 py-2" onClick={openAddModal}>
            ➕ Add Employee
          </button>
        </div>

        {/* Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 search-card">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control rounded-3 border-success-subtle"
                placeholder="🔍 Search employee name, job role, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted fw-semibold">
              Total Staff: {filteredEmployees.length}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading employee records...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No employee records found.</h5>
                <p className="mb-0">Click "Add Employee" to register staff members.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 employee-table">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Employee Name</th>
                      <th>Job Role</th>
                      <th>Phone</th>
                      <th>Gender</th>
                      <th>Joining Date</th>
                      <th>Salary</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, index) => (
                      <tr key={emp._id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="fw-bold text-dark">{emp.employeeName}</td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border px-3 py-1 fw-bold">
                            {emp.jobRole}
                          </span>
                        </td>
                        <td>{emp.phone}</td>
                        <td>{emp.gender}</td>
                        <td className="text-muted">
                          {new Date(emp.joiningDate).toLocaleDateString()}
                        </td>
                        <td className="fw-bold text-success">₹{emp.salary.toLocaleString()}</td>
                        <td>
                          <span className={`badge px-3 py-2 ${
                            emp.attendance === 'Present' ? 'bg-success' :
                            emp.attendance === 'Absent' ? 'bg-danger' :
                            emp.attendance === 'On Leave' ? 'bg-warning text-dark' : 'bg-info'
                          }`}>
                            {emp.attendance}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary fw-bold hover-lift"
                              onClick={() => openEditModal(emp)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger fw-bold hover-lift"
                              onClick={() => handleDelete(emp._id)}
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
                  {isEditing ? '✏️ Edit Employee Details' : '👨‍🌾 Register New Employee'}
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
                    <label className="form-label fw-bold">Employee Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="employeeName"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.employeeName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Job Role</label>
                      <input
                        type="text"
                        className="form-control"
                        name="jobRole"
                        required
                        placeholder="e.g. Farm Supervisor, Feeder, Vet Assistant"
                        value={formData.jobRole}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        required
                        placeholder="+1 555-0199"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Residential Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      required
                      placeholder="123 Farm Rd, Sector 4"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Joining Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="joiningDate"
                        required
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Monthly Salary (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="salary"
                        required
                        min="0"
                        placeholder="2500"
                        value={formData.salary}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">Attendance Status</label>
                      <select
                        className="form-select"
                        name="attendance"
                        value={formData.attendance}
                        onChange={handleInputChange}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Half Day">Half Day</option>
                      </select>
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

export default EmployeeManagement;
