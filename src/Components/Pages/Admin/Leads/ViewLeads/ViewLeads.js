import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './../../../../Layout/Table/TableLayout';
import { FaEdit, FaTrash, FaEye, FaComment, FaUserPlus } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import Navbar from '../../../../Shared/Navbar/Navbar';
import { baseURL, webhookUrl } from '../../../../Apiservices/Api';
import axios from 'axios';

import './ViewLeads.css'

const AdminViewLeads = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState(null);


  const [data, setData] = useState([]);

  const handleEdit = (leadId) => {
    navigate(`/a-edit-lead/${leadId}`, {
      state: { leadid: leadId },
    });
  };

  const handleAddUser = (lead) => {
    navigate(`/a-create-customer-opportunity/${lead.leadid}`);
  };



  const handleViewLeads = (lead) => {
    navigate(`/a-view-lead/${lead.leadid}`, {
      state: { leadid: lead.leadid },
    });
  };

  const handleDelete = async (leadid) => {
    try {
      const response = await fetch(`${baseURL}/api/deleteByLeadId/${leadid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setData((prevData) => prevData.filter((item) => item.leadid !== leadid));
        setMessage('The lead has been deleted successfully.');
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage('Failed to delete the lead. Please try again later.');
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage('An unexpected error occurred while deleting the lead.');
      setTimeout(() => setMessage(""), 3000);
    }
  };




  const dropdownOptions = {
    primary: ["New", "No Response", "Duplicate", "False Lead", "Lost"],
    secondary: {
      New: ["Yet to Contact", "Not picking up call", "Asked to call later"],
      "No Response": [],
      Duplicate: [],
      "False Lead": [],
      Lost: ["Plan Cancelled", "Plan Delayed", "Already Booked", "Others"],
    },
  };

  const handlePrimaryStatusChange = (value, rowId) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.leadid === rowId
          ? {
            ...row,
            primaryStatus: value,
            secondaryStatus: "", // Reset secondary status when primary changes
          }
          : row
      )
    );
    updateLeadStatus(rowId, value, ""); // Update without secondary status
  };

  const handleSecondaryStatusChange = (value, rowId) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.leadid === rowId ? { ...row, secondaryStatus: value } : row
      )
    );
    const lead = data.find((lead) => lead.leadid === rowId);
    updateLeadStatus(rowId, lead?.primaryStatus || "", value);
  };
  const updateLeadStatus = async (leadId, primaryStatus, secondaryStatus) => {
    const body = {
      primaryStatus: primaryStatus,
      secondaryStatus: secondaryStatus,
    };
    console.log('JSON:', JSON.stringify(body, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/leads/status/${leadId}`, body);

      if (response.status === 200) {
        // Assuming the response contains a message
        setMessage(response.data.message || 'Status updated successfully.'); // Use the message from the response or a default message
        setTimeout(() => setMessage(""), 3000);
        console.log('Status updated:', response.data);
      } else {
        console.error('Failed to update status:', response.data);
        
        setMessage('Failed to update status. Please try again.');
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      setMessage('An error occurred while updating the status. Please try again.');
      setTimeout(() => setMessage(""), 3000);
    }
  };

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch(`${webhookUrl}/api/enquiries`);
        const data = await response.json();

        const filteredData = data.filter((enquiry) => enquiry.status == 'lead');
        setData(filteredData);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      }
    };
    fetchEnquiries();
  }, []);

  const [managers, setManagers] = useState([]); // State to store fetched managers
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call
  const handleAddLead = () => {
    navigate('/a-add-leads');
  };

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/managers`);
        if (!response.ok) {
          throw new Error("Failed to fetch managers");
        }
        const result = await response.json(); // Parse JSON directly from response
        console.log("Fetched data:", result.data); // Log fetched data
        console.log(JSON.stringify(result.data, null, 2)); // Log fetched data in pretty format
        setManagers(result.data); // Update the managers state
        setLoading(false); // Set loading to false after successful fetch
      } catch (err) {
        console.error("Error fetching managers:", err.message); // Log the error
        setError(err.message); // Update error state
        setLoading(false); // Stop loading on error
      }
    };

    fetchManagers();
  }, []);

  const handleAssignToChange = async (assignee, leadid, managerid) => {
    try {
      const response = await fetch(`${baseURL}/update-assignee`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadid,
          assignee,
          managerid,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => setMessage(""), 3000);
        // Update the data to display the assignee name directly
        setData((prevData) =>
          prevData.map((lead) =>
            lead.leadid === leadid
              ? { ...lead, assign_to_manager: assignee } // Assign the name, not ID
              : lead
          )
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };








 
  const columns = useMemo(
    () => [
      // {
      //   Header: "S.No",
      //   accessor: (row, index) => index + 1,
      // },
      {
        Header: "Lead Id",
        accessor: "leadid",
        Cell: ({ row }) => (
          <div>

            <div>{row.original.leadcode}</div>
            
          </div>
        ),
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <div>
            <div
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => handleViewLeads(row.original)} // Navigate on click
            >
              {row.original.name}
            </div>
          </div>
        ),
      },
       // Phone Number Column
       {
        Header: "Mobile",
        accessor: "phone_number",
        Cell: ({ row }) => (
          <div  >
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
      }
,      
      {
        Header: "Lead Status",
        Cell: ({ row }) => {
          const primaryStatus = row.original.primaryStatus;
          const secondaryStatus = row.original.secondaryStatus;
          const secondaryOptions = dropdownOptions.secondary[primaryStatus] || [];
          const isSecondaryDisabled = !primaryStatus || secondaryOptions.length === 0;
      
          return (
            <div className="d-flex align-items-center">
              <select
                value={primaryStatus}
                onChange={(e) =>
                  handlePrimaryStatusChange(e.target.value, row.original.leadid)
                }
                className="form-select me-2"
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
      
      {
        Header: 'Source',
        accessor: 'sources',
      },
      {
        Header: "Customer Status",
        accessor: "customer_status",
        
       
      },

      {
        Header: 'Assign To',
        Cell: ({ row }) => {
          const isAssigned = row.original.assign_to_manager;
      
          return isAssigned ? (
            <button
              className="btn btn-secondary"
              disabled
              style={{
                maxWidth: '150px', // Adjust as needed
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={isAssigned} // Tooltip to show full name
            >
              {isAssigned} {/* Display the name directly */}
            </button>
          ) : (
            <select
              onChange={(e) => {
                const [managerid, assignee] = e.target.value.split('|');
                handleAssignToChange(assignee, row.original.leadid, managerid);
              }}
              className="form-select"
              disabled={isAssigned}
              style={{ maxWidth: '150px' }} // Adjust as needed
            >
              <option value="">Select Assignee</option>
              {managers.map((manager, index) => (
                <option key={index} value={`${manager.id}|${manager.name}`}>
                  {manager.name}
                </option>
              ))}
            </select>
          );
        },
      },

      

      ,

      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaEdit
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleEdit(row.original.leadid)}
            />
            <FaTrash
              style={{ color: "ff9966", cursor: "pointer" }}
              onClick={() => handleDelete(row.original.leadid)}
            />
            <FaEye
              style={{ color: "ff9966", cursor: "pointer" }}
              onClick={() => handleViewLeads(row.original)}
            />
            <FaUserPlus
              style={{ color: "ff9966", cursor: "pointer" }}
              onClick={() => handleAddUser(row.original)}
            />
          </div>
        ),
      }
      // {
      //   Header: 'Comments',
      //   accessor: 'comments',
      //   Cell: ({ row }) => (
      //     <button
      //       className="btn btn-info"
      //       onClick={() => {
      //         navigate(`/a-comments/${row.original.leadid}`);
      //       }}
      //     >
      //       <FaComment />
      //     </button>
      //   ),
      // },
    ],
    [dropdownOptions, managers]
  );



  return (
    <div className="admin-ViewLeadcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`admin-ViewLead ${collapsed ? "collapsed" : ""}`}>
        <div className="admin-ViewLead-container mb-5">
          <div className="admin-ViewLead-table-container">
            <Row className="mb-3">
              <Col className="d-flex justify-content-between align-items-center">
                <h3>Lead Details</h3>
                {message && <div className="alert alert-info">{message}</div>}
                <Button onClick={handleAddLead}>Add Leads</Button>
              </Col>
            </Row>
            <DataTable columns={columns} data={data} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminViewLeads;
