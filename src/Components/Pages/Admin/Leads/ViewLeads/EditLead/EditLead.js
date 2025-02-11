import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Navbar from "../../../../../Shared/Navbar/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Row, Col } from 'react-bootstrap';
import './EditLead.css';
import { baseURL } from "../../../../../Apiservices/Api";

const EditOppLead = () => {
  const location = useLocation();
  const { leadid } = location.state;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    lead_type: '',
    name: '',
    phone_number: '',
    email: '',
    sources: '',
    description: '',
    another_name: '',
    another_email: '',
    another_phone_number: '',
    corporate_id: '',
    primaryStatus: '',
    secondaryStatus: '',
    destination: '',
    primarySource: '',
    secondarySource: '',
  });
  const [error, setError] = useState(null);
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

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/leads/${leadid}`);
        const leadData = response.data;

        setFormData((prev) => ({
          ...prev,
          lead_type: leadData.lead_type || '',
          name: leadData.name || '',
          phone_number: leadData.phone_number || '',
          email: leadData.email || '',
          sources: leadData.sources || '',
          description: leadData.description || '',
          another_name: leadData.another_name || '',
          another_email: leadData.another_email || '',
          another_phone_number: leadData.another_phone_number || '',
          corporate_id: leadData.corporate_id || '',
          primaryStatus: leadData.primaryStatus || '',
          secondaryStatus: leadData.secondaryStatus || '',
          destination: leadData.destination || '',
          primarySource: leadData.primarySource || '',
          secondarySource: leadData.secondarySource || '',
        }));
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Failed to fetch lead data.");
      }
    };

    fetchLeadData();
  }, [leadid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const leadData = {
      lead_type: formData.lead_type,
      name: formData.name,
      phone_number: formData.phone_number,
      email: formData.email,
      sources: formData.sources,
      description: formData.description,
      another_name: formData.another_name,
      another_email: formData.another_email,
      another_phone_number: formData.another_phone_number,
      destination: formData.destination,
      corporate_id: formData.corporate_id,
      primaryStatus: formData.primaryStatus,
      secondaryStatus: formData.secondaryStatus,
      primarySource: formData.primarySource,
      secondarySource: formData.secondarySource,
    };
    console.log(JSON.stringify(leadData, null, 2));
    try {
      await axios.put(`${baseURL}/api/leads/${leadid}`, leadData);
      setMessage('Updated Successfully');
      setTimeout(() => setMessage(""), 3000);
      // navigate('/view-lead'); 
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update data.");
    }
  };

  const [leadDropdownOptions] = useState({
    primary: ["New", "No Response", "Duplicate", "False Lead", "Lost"],
    secondary: {
      New: ["Yet to Contact", "Not picking up call", "Asked to call later"],
      "No Response": [],
      Duplicate: [],
      "False Lead": [],
      Lost: ["Plan Cancelled", "Plan Delayed", "Already Booked", "Others"],
    },
  });

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="editlead-form-container">
          <h2 className="editlead-form-header">Edit Leads</h2>

          <div className="editlead-form">
            <Form className="s-edit-opp-lead-FormLable" onSubmit={handleFormSubmit}>
              {/* Customer Details Section */}
              <h5>Lead Details</h5>
              {message && <div className="alert alert-info">{message}</div>} {/* Display message */}
              {error && <div className="alert alert-danger">{error}</div>} {/* Display error message */}

              <Row>
                {/* <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lead Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.lead_type}
                      onChange={handleChange}
                      readOnly
                    />
                  </Form.Group>
                </Col> */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primary Source</Form.Label>
                    <Form.Select
                      name="primarySource"
                      value={formData.primarySource}
                      onChange={handleChange}
                    >
                      <option value="">Select Source</option>
                      <option value="Referral">Referral/Repeat</option>
                      <option value="Partner Promotion">Partner Promotion</option>
                      <option value="Media Coverage">Media Coverage</option>
                      <option value="Blog">Blog</option>
                      <option value="Community">Community</option>
                      <option value="Purchased Leads">Purchased Leads</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Google">Google</option>
                      <option value="Meta">Meta</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                {subDropdownOptions[formData.primarySource] && (
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{formData.primarySource} SubSource</Form.Label>
                      <Form.Select
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
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Destination</Form.Label>
                    <Form.Control
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Another Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="another_name"
                      value={formData.another_name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Another Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="another_email"
                      value={formData.another_email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Another Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="another_phone_number"
                      value={formData.another_phone_number}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                {/* <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Corporate ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="corporate_id"
                      value={formData.corporate_id}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col> */}
               <Col md={4}>
  <Form.Group className="mb-3">
    <Form.Label>Primary Status</Form.Label>
    <Form.Select
      name="primaryStatus"
      value={formData.primaryStatus}
      onChange={handleChange}
    >
      {!formData.primaryStatus && <option value="">Select Status</option>}
      {leadDropdownOptions.primary.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>

<Col md={4}>
  <Form.Group className="mb-3">
    <Form.Label>Secondary Status</Form.Label>
    <Form.Select
      name="secondaryStatus"
      value={formData.secondaryStatus}
      onChange={handleChange}
      disabled={
        !formData.primaryStatus ||
        ["No Response", "Duplicate", "False Lead"].includes(formData.primaryStatus)
      }
    >
      {!formData.secondaryStatus && <option value="">Select Status</option>}
      {formData.primaryStatus && leadDropdownOptions.secondary[formData.primaryStatus] ? (
        leadDropdownOptions.secondary[formData.primaryStatus].map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))
      ) : (
        <option value="" disabled>No options available</option>
      )}
    </Form.Select>
  </Form.Group>
</Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="addleads-form-footer">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Back
                </button>
                <button className="btn btn-primary" type="submit">
                  Submit
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOppLead;