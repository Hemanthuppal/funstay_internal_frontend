import React, { useState, useRef, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "./AddLeads.css";
import Navbar from '../../../../Shared/Navbar/Navbar';
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../../../Apiservices/Api";
import { AuthContext } from "../../../../AuthContext/AuthContext";

const DynamicForm = () => {
  const { authToken, userId } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    lead_type: "group",
    name: '',
    email: '',
    phone_number: '',
    country_code: '+91', // Default country code
    primarySource: '',
    secondarySource: '',
    destination: '',
    another_name: '',
    another_email: '',
    another_phone_number: '',
    corporate_id: 1,
    description: '',
    assign_to_manager: "",
    managerid: '',
  });

  const [message, setMessage] = useState(""); // State for success/error message
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const nameInputRef = useRef(null);
  const [phoneError, setPhoneError] = useState(""); // State for phone number error
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/managers`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Include token if needed
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch managers");
        }
        const result = await response.json();
        setManagers(result.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching managers:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchManagers();
  }, [authToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone_number") {
      const formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length <= 10) {
        setFormData({ ...formData, [name]: formattedValue });
      }
    } else if (name === "managerid") {
      const selectedEmployeeId = Number(value);
      const selectedEmployee = managers.find(employee => employee.id === selectedEmployeeId);
      setFormData({
        ...formData,
        managerid: selectedEmployeeId,
        assign_to_manager: selectedEmployee ? selectedEmployee.name : '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.phone_number.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      assign_to_manager: formData.assign_to_manager,
    };

    try {
      const response = await axios.post(`${baseURL}/api/leads`, dataToSubmit);
      console.log(response.data);
      setMessage("Lead added successfully!");
      setTimeout(() => setMessage(""), 3000);

      // Reset form data
      setFormData({
        lead_type: "group",
        name: '',
        email: '',
        phone_number: '',
        country_code: '+91',
        primarySource: '',
        secondarySource: '',
        another_name: '',
        another_email: '',
        another_phone_number: '',
        destination: '',
        description: '',
        managerid: "",
        assign_to_manager: "",
      });
    } catch (error) {
      console.error("Error adding lead:", error);
      setMessage("Error: Failed to add lead. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const renderForm = () => {
    const subDropdownOptions = {
      Referral: ["Grade 3", "Grade 2", "Grade 1"],
      Community: ["BNI", "Rotary", "Lions", "Association", "Others"],
      "Purchased Leads": ["Tripcrafter", "Others"],
      "Social Media": ["Linkedin", "Others"],
      Google: ["Google Organic", "Google Ad", "Youtube Organic", "Youtube Paid"],
      Meta: [
        "Facebook Organic",
        "Instagram Organic",
        "Facebook (Paid)",
        "Instagram (Paid)",
        "Others",
      ],
    };

    // Handle changes in the main dropdown
    const handleSourceChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      // Clear the subdropdown selection when a new main dropdown is selected
      if (name === "primarySource") {
        setFormData({ ...formData, [name]: value, secondarySource: "" });
      }
    };

    return (
      <div className="addleads-form-grid">
        <div className="addleads-input-group">
          <label>Name<span style={{ color: "red" }}> *</span></label>
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={handleChange}
            ref={nameInputRef}
            required
            autoFocus
          />
        </div>
        <div className="addleads-input-group">
          <label>Email<span style={{ color: "red" }}> *</span></label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
              onBlur={() => {
                if (!validateEmail(formData.email)) {
                  setEmailError("Please enter a valid email address.");
                } else {
                  setEmailError("");
                }
              }}
            />
            {/* Show email error message below the input */}
            {emailError && <span style={{ color: "red", fontSize: "12px" }}>{emailError}</span>}
          </div>
        </div>
        <div className="addleads-input-group">
          <label>Phone Number<span style={{ color: "red" }}> *</span></label>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Country Code Input */}
            <select
              name="country_code"
              value={formData.country_code}
              onChange={handleChange}
              style={{
                width: "80px",
                marginRight: "10px",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="+1">+1</option>
              <option value="+91">+91</option>
              <option value="+44">+44</option>
              <option value="+61">+61</option>
              <option value="+81">+81</option>
              {/* Add more country codes as needed */}
            </select>

            {/* Phone Number Input */}
            <input
              type="text"
              name="phone_number"
              placeholder="Enter Phone Number"
              value={formData.phone_number}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleChange(e); // Update the value if it's a valid number
                }
              }}
              onBlur={(e) => {
                if (formData.phone_number.length !== 10) {
                  setPhoneError("Please enter a valid number.");
                } else {
                  setPhoneError("");
                }
              }}
              style={{
                flex: 1,
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              required
            />
          </div>
          {/* Show error message below the input */}
          {phoneError && <span style={{ color: "red", fontSize: "12px" }}>{phoneError}</span>}
        </div>
        <div className="addleads-input-group">
          <label>Primary Source</label>
          <select
            name="primarySource"
            value={formData.primarySource}
            onChange={handleSourceChange}
          >
            <option value="">Select Source</option>
            <option value="Referral">Referral/Repeat</option>
            <option value="Partner Promotion">Partner Promotion</option>
            <option value="Media Coverage">Media Coverage</option>
            <option value="Blog ">Blog</option>
            <option value="Community">Community</option>
            <option value="Purchased Leads">Purchased Leads</option>
            <option value="Social Media">Social Media</option>
            <option value="Google">Google</option>
            <option value="Meta">Meta</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {formData.primarySource && subDropdownOptions[formData.primarySource] && (
          <div className="addleads-input-group">
            <label>{formData.primarySource} SubSource</label>
            <select
              name="secondarySource"
              value={formData.secondarySource || ""}
              onChange={handleChange}
            >
              <option value="">Select SubSource</option>
              {subDropdownOptions[formData.primarySource].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="addleads-input-group">
          <label>Assign To</label>
          <select
            name="managerid"  // Use managerid here to store the ID in formData
            value={formData.managerid}  // Set value to managerid
            onChange={handleChange}
          >
            <option value="">Select Employee</option>
            {managers.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Conditionally render the subdropdown */}
       
        <div className="addleads-input-group">
          <label>Another Name</label>
          <input
            type="text"
            name="another_name"
            placeholder="Enter Another Name"
            value={formData.another_name}
            onChange={handleChange}
          />
        </div>
        <div className="addleads-input-group">
          <label>Another Email</label>
          <input
            type="email"
            name="another_email"
            placeholder="Enter Another Email"
            value={formData.another_email}
            onChange={handleChange}
          />
        </div>
        <div className="addleads-input-group">
          <label>Another Phone Number</label>
          <input
            type="text"
            name="another_phone_number"
            placeholder="Enter Another Phone Number"
            value={formData.another_phone_number}
            onChange={handleChange}
          />
        </div>
        <div className="addleads-input-group">
          <label>Destination</label>
          <input
            type="text"
            name="destination"
            placeholder="Enter Destination"
            value={formData.destination}
            onChange={handleChange}
          />
        </div>
        <div className="addleads-input-group full-width">
          <label>Description</label>
          <textarea
            type="text"
            name="description"
            placeholder="Enter Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="addleads-form-container">
          <h2 className="addleads-form-header">Add Leads</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-info">{message}</div>} {/* Display message */}
          <form onSubmit={handleSubmit} className="addleads-form">
            {renderForm()}
            <div className="addleads-form-footer">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Back
              </button>
              <button className="btn btn-primary" type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;