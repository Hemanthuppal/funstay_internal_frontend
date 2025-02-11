import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Navbar from "./../../../../Shared/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col } from 'react-bootstrap';
import './EditOppLead.css';
import { useLocation } from "react-router-dom";
import { baseURL } from "../../../../Apiservices/Api";

const EditOppLead = () => {
  const location = useLocation();
  const { leadid } = location.state;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    lead_type: "",
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
    start_date: '',
    end_date: '',
    duration: '',
    adults_count: '',
    children_count: '',
    child_ages: [],
    approx_budget: '',

    notes: '',
    comments: '',
    reminder_setting: '',
    opportunity_status1: '',
    opportunity_status2: '',
    primarySource: '',
    secondarySource: '',
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/get-lead-data/${leadid}`);
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
          opportunity_status1: leadData.opportunity_status1 || '',
          opportunity_status2: leadData.opportunity_status2 || '',
          primarySource: leadData.primarySource || '',
          secondarySource: leadData.secondarySource || '',
        }));
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Failed to fetch lead data.");
      }
    };

    const fetchOpportunityData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/get-lead-data/${leadid}`);
        const opportunityData = response.data;
        const formattedStartDate = opportunityData.start_date ? new Date(opportunityData.start_date).toISOString().split('T')[0] : '';
        const formattedEndDate = opportunityData.end_date ? new Date(opportunityData.end_date).toISOString().split('T')[0] : '';
        const reminder = opportunityData.reminder_setting ? new Date(opportunityData.reminder_setting).toISOString().split('T')[0] : '';
        setFormData((prev) => ({
          ...prev,
          destination: opportunityData.destination || '',
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          duration: opportunityData.duration || '',
          adults_count: opportunityData.adults_count || '',
          children_count: opportunityData.children_count || '',
          child_ages: opportunityData.child_ages ? opportunityData.child_ages.split(',') : [],
          approx_budget: opportunityData.approx_budget || '',
          notes: opportunityData.notes || '',
          reminder_setting: reminder,
        }));
      } catch (err) {
        console.error("Error fetching opportunity data:", err);
        setError("Failed to fetch opportunity data.");
      }
    };

    fetchLeadData();
    fetchOpportunityData();
  }, [leadid]);
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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   if (name === "start_date") {
  //     const newStartDate = new Date(value);
  //     const today = new Date();

  //     // Check if the selected start date is in the future
  //     if (newStartDate <= today) {
  //       setError("Start date must be a future date.");
  //       return;
  //     } else {
  //       setError(null); // Clear error if valid
  //     }

  //     // Set the end date to the same as start date by default
  //     setFormData((prev) => ({
  //       ...prev,
  //       start_date: value,
  //       end_date: value, // Set end date to start date
  //       duration: '0', // Reset duration
  //     }));
  //   } else if (name === "end_date") {
  //     const newEndDate = new Date(value);
  //     const startDate = new Date(formData.start_date);

  //     // Ensure end date is after start date
  //     if (newEndDate < startDate) {
  //       setError("End date must be after start date.");
  //       return;
  //     } else {
  //       setError(null); // Clear error if valid
  //     }

  //     setFormData((prev) => ({
  //       ...prev,
  //       end_date: value,
  //       duration: Math.ceil((newEndDate - startDate) / (1000 * 60 * 60 * 24)), // Calculate duration
  //     }));
  //   } else if (name === "reminder_setting") {
  //     const reminderDate = new Date(value);
  //     const startDate = new Date(formData.start_date);

  //     // Ensure reminder setting is before start date
  //     if (reminderDate >= startDate) {
  //       setError("Reminder setting must be before the start date.");
  //       return;
  //     } else {
  //       setError(null); // Clear error if valid
  //     }

  //     setFormData((prev) => ({
  //       ...prev,
  //       reminder_setting: value,
  //     }));
  //   } else {
  //     setFormData({ ...formData, [name]: value });
  //   }



  //   // Handle primary and opportunity status changes
  //   if (name === "primaryStatus") {
  //     setFormData({ ...formData, [name]: value, secondaryStatus: "" });
  //   }

  //   if (name === "opportunity_status1") {
  //     setFormData({ ...formData, [name]: value, opportunity_status2: "" });
  //   }
  // };



  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "start_date") {
      const newStartDate = new Date(value);
      const today = new Date();
  
      // Check if the selected start date is in the future
      if (newStartDate <= today) {
        setError("Start date must be a future date.");
        return;
      } else {
        setError(null); // Clear error if valid
      }
  
      // Set the end date to the same as start date by default
      setFormData((prev) => ({
        ...prev,
        start_date: value,
        end_date: value, // Set end date to start date
        duration: '0', // Reset duration
      }));
    } else if (name === "end_date") {
      const newEndDate = new Date(value);
      const startDate = new Date(formData.start_date);
  
      // Ensure end date is after start date
      if (newEndDate < startDate) {
        setError("End date must be after start date.");
        return;
      } else {
        setError(null); // Clear error if valid
      }
  
      setFormData((prev) => ({
        ...prev,
        end_date: value,
        duration: Math.ceil((newEndDate - startDate) / (1000 * 60 * 60 * 24)), // Calculate duration
      }));
    } else if (name === "reminder_setting") {
      const reminderDate = new Date(value);
      const startDate = new Date(formData.start_date);
  
      // Ensure reminder setting is before start date
      if (reminderDate > startDate) {
        setError("Reminder setting must be before the start date.");
        return;
      } else {
        setError(null); // Clear error if valid
      }
  
      setFormData((prev) => ({
        ...prev,
        reminder_setting: value,
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  
    // Handle primary and opportunity status changes
    if (name === "primaryStatus") {
      setFormData({ ...formData, [name]: value, secondaryStatus: "" });
    }
  
    if (name === "opportunity_status1") {
      setFormData({ ...formData, [name]: value, opportunity_status2: "" });
    }
  };

  const handleChildrenCountChange = (e) => {
    const { value } = e.target;
    const count = parseInt(value, 10);
    const newChildAges = Array.from({ length: count }, (_, i) => formData.child_ages[i] || '');

    setFormData((prev) => ({
      ...prev,
      children_count: count,
      child_ages: newChildAges,
    }));
  };

  const handleChildAgeChange = (index, value) => {
    const newChildAges = [...formData.child_ages];
    newChildAges[index] = value;

    setFormData((prev) => ({
      ...prev,
      child_ages: newChildAges,
    }));
  };

  const subDropdownOptions = {
    Referral: ["Grade 3", "Grade 2", "Grade 1"],
    Community: ["BNI", "Rotary", "Lions", "Association", "Others"],
    "Purchased Leads": ["Tripcrafter", "Others"],
    "Social Media": [" Linkedin", "Others"],
    Google: ["Google Organic", "Google Ad", "Youtube Organic", "Youtube Paid"],
    Meta: [
      "Facebook Organic",
      "Instagram Organic",
      "Facebook (Paid)",
      "Instagram (Paid)",
      "Others",
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      corporate_id: formData.corporate_id,
      primaryStatus: formData.primaryStatus,
      secondaryStatus: formData.secondaryStatus,
      opportunity_status1: formData.opportunity_status1,
      opportunity_status2: formData.opportunity_status2,
      primarySource: formData.primarySource,
      secondarySource: formData.secondarySource,
    };

    const opportunityData = {
      destination: formData.destination,
      start_date: formData.start_date,
      end_date: formData.end_date,
      duration: formData.duration,
      adults_count: formData.adults_count,
      children_count: formData.children_count,
      child_ages: formData.child_ages.join(','),
      approx_budget: formData.approx_budget,

      notes: formData.notes,
      comments: formData.comments,
      reminder_setting: formData.reminder_setting,
    };
    console.log(JSON.stringify(leadData, null, 2));
    console.log(JSON.stringify(opportunityData, null, 2));
    try {
      await axios.put(`${baseURL}/api/leads/${leadid}`, leadData);
      await axios.put(`${baseURL}/api/opportunities/${leadid}`, opportunityData);
      setMessage('Updated Successfully');
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update data.");
    }
  };

  const [dropdownOptions] = useState({
    primary: ["In Progress", "Confirmed", "Lost", "Duplicate", "Cancelled"],
    secondary: {
      "In Progress": [
        "Understood Requirement",
        "Sent first quote",
        "Sent amended quote",
        "Negotiation Process",
        "Verbally Confirmed-Awaiting token amount",
      ],
      Confirmed: ["Upcoming Trip", "Ongoing Trip", "Trip Completed"],
      Lost: [
        "Plan Cancelled",
        "Plan Postponed",
        "High Quote",
        "Low Budget",
        "No response",
        "Options not available",
        "just checking price",
        "Booked from other source",
        "Delay in quote",
        "Concern about reliability/trust",
        "Did not like payment terms",
        "Did not like cancellation policy",
        "Booked different option from us",
      ],
      Duplicate: ["Duplicate"],
      Cancelled: ["Force Majeure", "Medical Urgency", "Personal Reason"],
    },
  });

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="editleads-form-container">
          <h2 className="editleads-form-header">Edit Customer and Opportunity Details</h2>
          <form className="editleads-form" onSubmit={handleSubmit}>
            <div className="s-edit-opp-lead-FormLable">
              <h5>Customer Details</h5>
              {message && <div className="alert alert-info">{message}</div>}
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
                {/* <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primary Status</Form.Label>
                    <Form.Select
                      name="primaryStatus"
                      value={formData.primaryStatus}
                      onChange={handleChange}
                    >
                      <option value="">Select Status</option>
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
                      <option value="">Select Status</option>
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
                </Col> */}
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
              <hr />
              <h5>Opportunity Details</h5>
              <Row>
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
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]} // Disable past dates
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      min={formData.start_date} // Disable dates before start date
                    />
                  </Form.Group>
                </Col>
                {/* <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration (Days)</Form.Label>
                    <Form.Control
                      type="text"
                      name="duration"
                      value={formData.duration}
                      readOnly
                    />
                  </Form.Group>
                </Col> */}

<Col md={4}>
  <Form.Group className="mb-3">
    <Form.Label>Duration (Days)</Form.Label>
    <Form.Control
      type="number"
      name="duration"
      value={formData.duration}
      onChange={(e) => {
        const newDuration = parseInt(e.target.value) || 0;
        setFormData((prev) => ({
          ...prev,
          duration: newDuration,
          end_date: new Date(new Date(formData.start_date).getTime() + newDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Update end date based on duration
        }));
      }}
    />
  </Form.Group>
</Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>No of Adults</Form.Label>
                    <Form.Control
                      type="number"
                      name="adults_count"
                      value={formData.adults_count}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Children Count</Form.Label>
                    <Form.Control
                      type="number"
                      name="children_count"
                      value={formData.children_count}
                      onChange={handleChildrenCountChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                {Array.from({ length: formData.children_count }).map((_, index) => (
                  <Col md={4} key={index}>
                    <Form.Group className="mb-3">
                      <Form.Label>Child Age {index + 1}</Form.Label>
                      <Form.Select
                        value={formData.child_ages[index] || ''}
                        onChange={(e) => handleChildAgeChange(index, e.target.value)}
                      >
                        <option value="">Select Age</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                ))}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Approx Budget</Form.Label>
                    <Form.Control
                      type="number"
                      name="approx_budget"
                      value={formData.approx_budget}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Reminder Setting</Form.Label>
                    <Form.Control
                      type="date"
                      name="reminder_setting"
                      value={formData.reminder_setting}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]} // Disable past dates
                      max={formData.start_date} // Disable dates after start date
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Opportunity Status 1</Form.Label>
                    <Form.Select
                      name="opportunity_status1"
                      value={formData.opportunity_status1}
                      onChange={handleChange}
                    >
                      {!formData.opportunity_status1 && <option value="">Select Status</option>}
                      {dropdownOptions.primary.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Opportunity Status 2</Form.Label>
                    <Form.Select
                      name="opportunity_status2"
                      value={formData.opportunity_status2}
                      onChange={handleChange}
                      disabled={!formData.opportunity_status1}
                    >
                      {!formData.opportunity_status2 && <option value="">Select Status</option>}
                      {formData.opportunity_status1 && dropdownOptions.secondary[formData.opportunity_status1] ? (
                        dropdownOptions.secondary[formData.opportunity_status1].map((status) => (
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

              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
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

export default EditOppLead;