import React, { useState, useMemo, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../../Shared/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { FaEdit, FaEye, FaComment ,FaTrash} from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import DataTable from '../../../Layout/Table/TableLayout'; // Import the reusable DataTable component

import './PotentialLeads.css';

import axios from 'axios';
import {baseURL} from "../../../Apiservices/Api";

const AdminDashboard = () => {
  const [message, setMessage] = useState('');

  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isPrimaryChanged, setIsPrimaryChanged] = useState(false);
  const [isSecondaryChanged, setIsSecondaryChanged] = useState(false);
  const [customerIdMap, setCustomerIdMap] = useState({}); // New state for mapping


  
  const [leadIds, setLeadIds] = useState([]);


  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true); // Show loader
      const response = await axios.get(`${baseURL}/api/allleads`);
      if (response.status === 200) {
        const leads = response.data;
        const filteredLeads = leads.filter((lead) => lead.status === 'opportunity');
        setData(filteredLeads);
        console.log('Fetched Leads:', filteredLeads);
      } else {
        console.error('Error fetching leads:', response.statusText);
        alert('Failed to fetch leads.');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Failed to fetch leads.');
    } finally {
      setLoading(false); // Hide loader
    }
  };

     // Log lead IDs when data changes
      useEffect(() => {
        if (data.length > 0) {
          const ids = data.map(lead => lead.leadid);
          setLeadIds(ids);
          console.log("Lead IDs:", ids);
        }
      }, [data]); // <-- This effect runs when data updates

  useEffect(() => {
    fetchLeads(); // Call fetchLeads when the component mounts
  }, []);

  // const [customerIdMap, setCustomerIdMap] = useState({});
  const [opportunityIdMap, setOpportunityIdMap] = useState({});

  const opportunityIdRef = useRef(null);
  
  const fetchCustomerData = async (leadid) => {
    try {
      const response = await axios.get(`${baseURL}/api/customers/by-lead/${leadid}`);
      if (response.status === 200) {
        const customerData = response.data;
        setCustomerIdMap((prev) => ({
          ...prev,
          [leadid]: {
            customerId: customerData.id || "N/A",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  // Fetch opportunity data
  const fetchOpportunityData = async () => {
    try {
      const response = await axios.get(`${baseURL}/travel-opportunity`);
      if (response.status === 200) {
        const mapping = response.data.reduce((acc, opportunity) => {
          acc[opportunity.leadid] = {
            opportunityId: opportunity.id || "N/A",
          };
          return acc;
        }, {});
        setOpportunityIdMap(mapping);
      }
    } catch (error) {
      console.error("Error fetching travel opportunities:", error);
    }
  };

  useEffect(() => {
    // Assuming you have a way to get the lead IDs
    const leadIds = data.map(item => item.leadid); // Replace with your actual lead IDs

    // Fetch data for each lead ID
    leadIds.forEach(leadid => {
      fetchCustomerData(leadid);
    });

    // Fetch opportunity data
    fetchOpportunityData();
  }, [data]);




  // // Fetch leads from API
  // const fetchLeads = async () => {
  //   try {
  //     setLoading(true); // Show loader
  //     const response = await axios.get(`${baseURL}/api/allleads`);
  //     if (response.status === 200) {
  //       const leads = response.data;
  //       const filteredLeads = leads.filter((lead) => lead.status === 'opportunity');
  //       setData(filteredLeads);
  //       console.log('Fetched Leads:', filteredLeads);
  //     } else {
  //       console.error('Error fetching leads:', response.statusText);
  //       alert('Failed to fetch leads.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching leads:', error);
  //     alert('Failed to fetch leads.');
  //   } finally {
  //     setLoading(false); // Hide loader
  //   }
  // };

  // useEffect(() => {
  //   fetchLeads(); // Call fetchLeads when the component mounts
  // }, []);

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

  const handlePrimaryStatusChange = (value, rowId) => {
    setData((prevData) => {
      const updatedData = prevData.map((row) =>
        row.leadid === rowId
          ? {
            ...row,
            opportunity_status1: value,
            opportunity_status2: "",
          }
          : row
      );
   
      handleUpdateStatus(rowId, value, ""); 
      setIsPrimaryChanged(true); 
      return updatedData;
    });
  };

  const handleSecondaryStatusChange = (value, rowId) => {
    setData((prevData) => {
      const updatedData = prevData.map((row) =>
        row.leadid === rowId ? { ...row, opportunity_status2: value } : row
      );
      const primaryStatus = updatedData.find((row) => row.leadid === rowId).opportunity_status1;
      
      handleUpdateStatus(rowId, primaryStatus, value);
      setIsSecondaryChanged(true); 
      return updatedData;
    });
  };


  const handleUpdateStatus = async (leadId, primaryStatus, secondaryStatus) => {
    const body = {
      opportunity_status1: primaryStatus,
      opportunity_status2: secondaryStatus,
    };
  console.log(JSON.stringify(body, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/update-status/${leadId}`, body);
      
      if (response.status === 200) {
       
        let statusChangeMessage = '';
  
        if (primaryStatus && secondaryStatus) {
          statusChangeMessage = 'Both statuses updated successfully!';
        } else if (primaryStatus) {
          statusChangeMessage = 'Primary status updated successfully!';
        } else if (secondaryStatus) {
          statusChangeMessage = 'Secondary status updated successfully!';
        }
  
        // Only show the SweetAlert if both statuses have been updated
        if (primaryStatus && secondaryStatus) {
        
          setMessage(statusChangeMessage)
          setTimeout(() => setMessage(""), 3000);
        }
  
        console.log('Status updated:', response.data);
      } else {
        console.error('Failed to update status:', response.data);
        
        setMessage('Failed to update status. Please try again.')
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    
    
      setMessage('An error occurred while updating the status. Please try again.')
      setTimeout(() => setMessage(""), 3000);
    }
  };
  

  const navigateToLead = (leadId) => {
    navigate(`/a-details/${leadId}`, {
      state: { leadid: leadId },
    });
  };

  const handleEdit = (leadId) => {
    navigate(`/a-edit-opportunity/${leadId}`, {
     
        state: { leadid: leadId },
   
    });
  };


   const handleDelete = async (leadid) => {
      try {
        const response = await fetch(`${baseURL}/api/opportunity/${leadid}`, {
          method: 'DELETE',
        });
    
        if (response.ok) {
          setData((prevData) => prevData.filter((item) => item.leadid !== leadid));
          setMessage('Opportunity has been deleted successfully.');
          setTimeout(() => {
            setMessage('');
          }, 1000);
        } else {
          console.error('Error deleting record');
          setMessage('Failed to delete the opportunity. Please try again.');
          setTimeout(() => {
            setMessage('');
          }, 1000);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('An error occurred while deleting the opportunity.');
        setTimeout(() => {
          setMessage('');
        }, 1000);
      }
    };

const formattedData = useMemo(() => {
  return data.map(item => {
    const customerData = customerIdMap[item.leadid] || { customerId: "N/A" };
    const opportunityData = opportunityIdMap[item.leadid] || { opportunityId: "N/A" };

    return {
      ...item,
      formattedOppId: opportunityData.opportunityId !== "N/A" ? 
        `OPP${String(opportunityData.opportunityId).padStart(4, '0')}` : "N/A",
      formattedCustomerId: customerData.customerId !== "N/A" ? 
        `CUS${String(customerData.customerId).padStart(4, '0')}` : "N/A"
    };
  });
}, [data, customerIdMap, opportunityIdMap]); 
 

  const columns = useMemo(
    () => [
     
      {
        Header: "Opp Id",
        accessor: "formattedOppId", // Direct access to pre-formatted value
      },
      {
        Header: "Customer Id",
        accessor: "formattedCustomerId",
      
      },
   
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <div style={{ cursor: "pointer" }} onClick={() => navigateToLead(row.original.leadid)}>
            <div style={{ color: "blue", textDecoration: "underline" }}>{row.original.name}</div>
            {/* <div>{row.original.phone_number}</div>
            <div>{row.original.email}</div> */}
          </div>
        ),
      },
      {
        Header: "Mobile",
        accessor: "phone_number",
        Cell: ({ row }) => (
          <div >
            {row.original.phone_number}
          </div>
        ),
      },
      // Email Column
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ row }) => (
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "200px" // Adjust width as needed
            }}
            title={row.original.email} // Show full email on hover
          >
            {row.original.email}
          </div>
        ),
      },
      
      {
        Header: "Opportunity Status",
        accessor: "opportunityStatus",
        Cell: ({ row }) => {
          const primaryStatus = row.original.opportunity_status1;
          const secondaryStatus = row.original.opportunity_status2;
          const secondaryOptions = dropdownOptions.secondary[primaryStatus] || [];
          const isSecondaryDisabled = !primaryStatus || secondaryOptions.length === 0;
      
          return (
            <div className="d-flex align-items-center gap-2">
              <select
                value={primaryStatus}
                onChange={(e) =>
                  handlePrimaryStatusChange(e.target.value, row.original.leadid)
                }
                className="form-select"
              >
                {!primaryStatus && <option value="">Select Primary Status</option>}
                {dropdownOptions.primary.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
      
              <select
                value={secondaryStatus}
                onChange={(e) =>
                  handleSecondaryStatusChange(e.target.value, row.original.leadid)
                }
                className="form-select"
                disabled={isSecondaryDisabled}
              >
                {!secondaryStatus && <option value="">Select Secondary Status</option>}
                {secondaryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        },
      },
      

      // {
      //   Header: 'Quotation',
      //   accessor: 'Quotation',
      //   Cell: ({ row }) => (
      //     <div>
      //       Generate
      //     </div>
      //   ),
      // },

      { Header: 'Assigned', accessor: 'assign_to_manager' },
    //  {
    //          Header: "Action",
    //          Cell: ({ row }) => (
    //            <div>
    //              <button
    //                className="btn btn-warning edit-button me-1 mb-1"
    //                onClick={() => handleEdit(row.original.leadid)}
    //              >
    //                <FaEdit />
    //              </button>
    //              <button
    //                className="btn btn-info view-button me-1"
    //                onClick={() =>navigateToLead(row.original.leadid)}
    //              >
    //                <FaEye />
    //              </button>
    //              <button
    //                className="btn btn-danger delete-button me-1 mb-1"
    //                onClick={() => handleDelete(row.original.leadid)}
    //              >
    //                <FaTrash />
    //              </button>
    //            </div>
    //          ),
    //        },

    {
      Header: "Action",
      Cell: ({ row }) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaEdit
            style={{ color: "#ff9966", cursor: "pointer" }}
            onClick={() => handleEdit(row.original.leadid)}
          />
          <FaEye
            style={{ color: "ff9966", cursor: "pointer" }}
            onClick={() => navigateToLead(row.original.leadid)}
          />
          <FaTrash
            style={{ color: "ff9966", cursor: "pointer" }}
            onClick={() => handleDelete(row.original.leadid)}
          />
        </div>
      ),
    },
           {
             Header: 'Comments',
             accessor: 'comments',
             Cell: ({ row }) => (
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <FaComment
            style={{ color: "ff9966", cursor: "pointer" }}
            onClick={() => {
              navigate(`/a-opportunity-comments/${row.original.leadid}`);
            }}
          />
          </div>
              
             ),
           }
    ],
    [dropdownOptions, navigate, customerIdMap]
  );
  

 
 

  return (
    <div className="Admin-ViewOpportunitycontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`Admin-ViewOpportunity ${collapsed ? 'collapsed' : ''}`}>
        <div className="Admin-ViewOpportunity-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>Opportunity Leads</h3>
              {message && <div className="alert alert-info">{message}</div>}
            </Col>
          </Row>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={formattedData} />
          )}
        </div>
        {/* Other modals and components */}
      </div>
    </div>
  );
};

export default AdminDashboard;
