import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../../../Shared/ManagerNavbar/Navbar";
import "./InDetailViewLeads.css";
import axios from "axios"; // Import axios
import {baseURL} from "../../../../../Apiservices/Api";

const InDetailViewLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { leadid } = location.state; // Get leadid from location state
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    lead_type: "",
    name: "",
    email: "",
    country_code: "",
    phone_number: "",
    sources: "",
    destination: "",
    description: "",
    another_name: "",
    another_email: "",
    another_phone_number: "",
    corporate_id: "",
    primaryStatus: "",
    secondaryStatus: "",
    primarySource: "",
    secondarysource: "",
    channel: "",
  });
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/leads/${leadid}`);
        const leadData = response.data;

        setFormData((prev) => ({
          ...prev,
          lead_type: leadData.lead_type || "",
          leadcode: leadData.leadcode || "",
          name: leadData.name || "",
          email: leadData.email || "",
          country_code: leadData.country_code || "",
          phone_number: leadData.phone_number || "",
          destination: leadData.destination || "",
          description: leadData.description || "",
          another_name: leadData.another_name || "",
          another_email: leadData.another_email || "",
          another_phone_number: leadData.another_phone_number || "",
          corporate_id: leadData.corporate_id || "",
          primaryStatus: leadData.primaryStatus || "",
          secondaryStatus: leadData.secondaryStatus || "",
          primarySource: leadData.primarySource || "",
          secondarysource: leadData.secondarysource || "",
          channel: leadData.channel || "",
        }));
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Failed to fetch lead data.");
      }
    };

    if (leadid) {
      fetchLeadData();
    }
  }, [leadid]);

  return (
    <div className="indeatilleadcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`indeatilleadcontent ${collapsed ? "collapsed" : ""}`}>
        <div className="indetail-container">
          <div className="card mt-4">
            <div className="card-body">
              <h2 className="lead-details-header">Lead Details</h2>
              {error && <p className="text-danger">{error}</p>}
              {leadid ? (
                <div className="row">
                  <div className="col-md-6">
                    {/* <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Lead Type:
                      </span>
                      <span>{formData.lead_type}</span>
                    </div> */}
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Lead ID:
                      </span>
                      <span>{formData.leadcode}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Name:
                      </span>
                      <span>{formData.name}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Email:
                      </span>
                      <span>{formData.email}</span>
                    </div>
                    {/* <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Country Code:
                      </span>
                      <span>{formData.country_code}</span>
                    </div> */}
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Phone Number:
                      </span>
                      <span>{formData.country_code}{formData.phone_number}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Primary Source:
                      </span>
                      <span>{formData.primarySource}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Secondary Source:
                      </span>
                      <span>{formData.secondarysource}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Destination:
                      </span>
                      <span>{formData.destination}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Another Name:
                      </span>
                      <span>{formData.another_name}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Another Email:
                      </span>
                      <span>{formData.another_email}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Another Phone Number:
                      </span>
                      <span>{formData.another_phone_number}</span>
                    </div>
                    {/* <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Corporate Id:
                      </span>
                      <span>{formData.corporate_id}</span>
                    </div> */}
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Description:
                      </span>
                      <span>{formData.description}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Primary Status:
                      </span>
                      <span>{formData.primaryStatus}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Secondary Status:
                      </span>
                      <span>{formData.secondaryStatus}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        channel:
                      </span>
                      <span>{formData.channel}</span>
                    </div>
                  </div>
                </div>
              ) : (
                !error && <p>Loading lead details...</p>
              )}
            </div>
          </div>
          <div className="back-button mt-3">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InDetailViewLeads;