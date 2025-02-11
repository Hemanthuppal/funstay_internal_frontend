import React, { useState, useEffect } from "react";
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Shared/Navbar/Navbar";
import "./AddEmployeeModal.css";

const AddEmployeeModal = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState(""); // Success message
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "",
    assignManager: "",
  });

  const [managers, setManagers] = useState([]); // List of managers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/managers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT token
          },
        });
        const data = await response.json();

        if (response.ok) {
          setManagers(data.data || []); // Populate managers
        } else {
          throw new Error(data.message || "Failed to fetch managers.");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchManagers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const { name, mobile, email, password, role, assignManager } = newEmployee;

    if (!name || !mobile || !email || !password || !role) {
      alert("Please fill in all the fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT token
        },
        body: JSON.stringify(newEmployee),
      });

      const data = await response.json();
      console.log(JSON.stringify(newEmployee));

      if (!response.ok) {
        throw new Error(data.message || "Failed to add employee.");
      }

      // Reset form and show success message
      setNewEmployee({
        name: "",
        mobile: "",
        email: "",
        password: "",
        role: "",
        assignManager: "",
      });
      setMessage("Employee added successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(error.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="addleads-form-container">
          <h2 className="addleads-form-header">Add New Employee</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="addemployee-form-grid">
              <div className="addemployee-input-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="addemployee-input-group">
                <label>Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter Mobile"
                  value={newEmployee.mobile}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, mobile: e.target.value })
                  }
                  required
                />
              </div>
              <div className="addemployee-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="addemployee-input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="addemployee-input-group">
                <label>Role</label>
                <select
                  name="role"
                  value={newEmployee.role}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, role: e.target.value })
                  }
                  required
                >
                  <option value="">Select Role</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              {newEmployee.role === "employee" && (
                <div className="addemployee-input-group">
                  <label>Assign Manager</label>
                  <select
                    name="assignManager"
                    value={newEmployee.assignManager}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        assignManager: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="addleads-form-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
