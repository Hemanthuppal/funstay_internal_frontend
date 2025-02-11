import React, { useState, useEffect } from "react";
import "./CreateandOpportunity.css";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../Shared/ManagerNavbar/Navbar";

import {baseURL} from "../../../../../Apiservices/Api";




const CreateCustomerOpportunity = () => {
  const navigate = useNavigate();
  const { leadid } = useParams();
  const [activeTab, setActiveTab] = useState("customer"); // Default to "customer"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [customerData, setCustomerData] = useState({
    name: "",
    phone_number: "",
    email: "",
    travel_type: "",
    passport_number: "",
    preferred_contact_method: "",
    special_requirement: "",
    customer_status: "", // Add customer_status to the state
  });
  const [formData, setFormData] = useState({
    destination: "",
    adults_count: "",
    children_count: "",
    approx_budget: "",
    reminder_setting: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [childrenAges, setChildrenAges] = useState([]);
  const [message, setMessage] = useState("");
  const [leadData, setLeadData] = useState(null); // New state for lead data

  const handleTabClick = (tabName) => setActiveTab(tabName);

  // const calculateDuration = (start, end) => {
  //   if (start && end) {
  //     const startDateObj = new Date(start);
  //     const endDateObj = new Date(end);
  //     const diffTime = endDateObj - startDateObj;
  //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //     setDuration(diffDays >= 0 ? `${diffDays} days` : "Invalid duration");
  //   } else {
  //     setDuration("");
  //   }
  // };

  const calculateDuration = (start, end) => {
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const diffTime = endDateObj - startDateObj;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays >= 0 ? diffDays : 0); // Set duration as a number
    } else {
      setDuration("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (activeTab === "customer") {
      setCustomerData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "children_count") {
      const count = parseInt(value) || 0;
      setChildrenAges(Array.from({ length: count }, (_, i) => childrenAges[i] || ""));
    }
  };

  const handleChildAgeChange = (index, value) => {
    const updatedAges = [...childrenAges];
    updatedAges[index] = value;
    setChildrenAges(updatedAges);
  };

  const handleSubmitCustomer = async () => {
    setLoading(true);
    setError(null);
    console.log("customerData", JSON.stringify(customerData, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/customers/update/by-lead/${leadid}`, customerData);
      console.log(JSON.stringify(response, null, 2));
      if (response.status === 200) {
        setMessage("Customer data submitted successfully!");
        setTimeout(() => setMessage(""), 3000);
        setActiveTab("opportunity"); // Switch to the "opportunity" tab after submission
      }
    } catch (err) {
      console.error("Error updating customer and lead data:", err);
      setError("Error updating customer and lead data.");
      setMessage("Failed to update customer and lead data. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOpportunity = async () => {
    setLoading(true);
    setError(null);

    if (!formData.destination || !startDate || !endDate || !formData.reminder_setting || !formData.notes) {
      setError("All required fields must be filled in.");
      setLoading(false);
      return;
    }

    const opportunityData = {
      leadid: leadid,
      customerid: customerData.id, // Ensure customerData.id is available
      destination: formData.destination,
      start_date: startDate,
      end_date: endDate,
      duration: duration,
      adults_count: formData.adults_count,
      children_count: formData.children_count,
      child_ages: childrenAges.join(","),
      approx_budget: formData.approx_budget,
      notes: formData.notes,
      reminder_setting: formData.reminder_setting,
    };

    console.log("Opportunity data being submitted:", JSON.stringify(opportunityData, null, 2));

    try {
      const response = await axios.post(`${baseURL}/api/opportunities/create`, opportunityData);
      if (response.status === 201) {
        setMessage("Opportunity created successfully!");
        setTimeout(() => setMessage(""), 3000);
        navigate("/m-potential-leads");
      }
    } catch (err) {
      console.error("Error creating opportunity:", err);
      setError("Error creating opportunity. Please try again.");
      setMessage("Failed to create opportunity. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLeadData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/leads/${leadid}`);
        console.log("Fetched lead data:", JSON.stringify(response.data, null, 2));
        setLeadData(response.data);

        // Pre-fill destination if available in lead data
        if (response.data.destination) {
          setFormData((prev) => ({ ...prev, destination: response.data.destination }));
        }
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Error fetching lead data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/customers/by-lead/${leadid}`);
        console.log("Fetched customer data:", JSON.stringify(response.data, null, 2));
        setCustomerData(response.data);
        setFormData((prev) => ({
          ...prev,
          name: response.data.name || "",
          phone_number: response.data.phone_number || "",
          email: response.data.email || "",
          travel_type: response.data.travel_type || "",
          passport_number: response.data.passport_number || "",
          preferred_contact_method: response.data.preferred_contact_method || "",
          special_requirement: response.data.special_requirement || "",
        }));

        // If customer is existing, set the active tab to "opportunity"
        if (response.data.customer_status === "existing") {
          setActiveTab("opportunity");
        }
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Error fetching customer data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData(); // Fetch lead data first
    fetchCustomerData(); // Fetch customer data
  }, [leadid]);

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="createcustomer-form-container">
          <h2 className="createcustomer-form-header">
            {customerData.customer_status === "existing" ? "Customer and Opportunity" : "Create Customer and Opportunity"}
          </h2>
          {message && <div className="alert alert-info">{message}</div>}

          {/* Always show both tabs */}
          <div className="createcustomer-tabs">
            <button
              className={`createcustomer-tab-button ${activeTab === "customer" ? "active" : ""}`}
              onClick={() => handleTabClick("customer")}
            >
              {customerData.customer_status === "existing" ? "Customer Details" : "Create Customer"}
            </button>
            <button
              className={`createcustomer-tab-button ${activeTab === "opportunity" ? "active" : ""}`}
              onClick={() => handleTabClick("opportunity")}
            >
              Create Opportunity
            </button>
          </div>

          {/* Render the appropriate tab content based on activeTab */}
          <div className={`createcustomer-tab-content ${activeTab === "customer" ? "active" : ""}`}>
            <div className="createcustomer-form-grid">
              <div className="createcustomer-input-group">
                <label>Name</label>
                <input type="text" name="name" value={customerData.name} onChange={handleChange} />
              </div>
              <div className="createcustomer-input-group">
                <label>Mobile</label>
                <input type="number" name="phone_number" value={customerData.phone_number} onChange={handleChange} />
              </div>
              <div className="createcustomer-input-group">
                <label>Email ID</label>
                <input type="email" name="email" value={customerData.email} onChange={handleChange} />
              </div>
              <div className="createcustomer-input-group">
                <label>Type of Travel</label>
                <input type="text" name="travel_type" value={customerData.travel_type} onChange={handleChange} />
              </div>
              <div className="createcustomer-input-group">
                <label>Passport Number</label>
                <input type="text" name="passport_number" value={customerData.passport_number} onChange={handleChange} />
              </div>
              <div className="createcustomer-input-group">
                <label>Preferred Contact Method</label>
                <select
                  name="preferred_contact_method"
                  value={customerData.preferred_contact_method}
                  onChange={handleChange}
                >
                  <option value="">Select a contact method</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
              <div className="createcustomer-input-group full-width">
                <label>Special Requirement</label>
                <textarea
                  name="special_requirement"
                  value={customerData.special_requirement}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className={`createcustomer-tab-content ${activeTab === "opportunity" ? "active" : ""}`}>
            <div className="createcustomer-form-grid">
              <div className="createcustomer-input-group">
                <label>Destination<span style={{ color: "red" }}> *</span></label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="createcustomer-input-group">
                <label>Start Date<span style={{ color: "red" }}> *</span></label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setStartDate(newStartDate);
                    calculateDuration(newStartDate, endDate);
                  }}
                  required
                />
              </div>
              <div className="createcustomer-input-group">
                <label>End Date<span style={{ color: "red" }}> *</span></label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    setEndDate(newEndDate);
                    calculateDuration(startDate, newEndDate);
                  }}
                  required
                />
              </div>
              {/* <div className="createcustomer-input-group">
                <label>Duration (Calculated)</label>
                <input type="text" value={duration} readOnly />
              </div> */}
              <div className="createcustomer-input-group">
              <label>Duration (Calculated)</label>
  <input
    type="number"
    value={duration ? parseInt(duration) : ""}
    onChange={(e) => {
      const newDuration = parseInt(e.target.value) || 0;
      setDuration(newDuration);
      if (startDate) {
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + newDuration);
        setEndDate(newEndDate.toISOString().split("T")[0]);
      }
    }}
    required
  />
</div>

              <div className="createcustomer-input-group">
                <label>No of Adults</label>
                <input
                  type="number"
                  name="adults_count"
                  value={formData.adults_count}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="createcustomer-input-group">
                <label>No of Children</label>
                <input
                  type="number"
                  name="children_count"
                  value={formData.children_count}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              {Array.from({ length: formData.children_count || 0 }, (_, index) => (
                <div className="createcustomer-input-group" key={index}>
                  <label>Child Age {index + 1}</label>
                  <select
                    value={childrenAges[index] || ""}
                    onChange={(e) => handleChildAgeChange(index, e.target.value)}
                  >
                    <option value="">Select Age</option>
                    {Array.from({ length: 12 }, (_, age) => (
                      <option key={age} value={age + 1}>{age + 1}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="createcustomer-input-group">
                <label>Approx Budget</label>
                <input
                  type="number"
                  name="approx_budget"
                  value={formData.approx_budget}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="createcustomer-input-group">
                <label>Reminder Setting<span style={{ color: "red" }}> *</span></label>
                <input
                  type="date"
                  name="reminder_setting"
                  min={new Date().toISOString().split("T")[0]}
                  max={startDate}
                  value={formData.reminder_setting}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="createcustomer-input-group full-width">
                <label>Notes<span style={{ color: "red" }}> *</span></label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="createcustomer-form-footer">
            <button className="createcustomer-btn createcustomer-close-btn" onClick={() => navigate(-1)}>
              Back
            </button>
            <button
              className="createcustomer-btn createcustomer-submit-btn"
              onClick={activeTab === "customer" ? handleSubmitCustomer : handleSubmitOpportunity}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerOpportunity;
