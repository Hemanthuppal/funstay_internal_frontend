import React, { useState, useMemo, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "./../../../../Layout/Table/TableLayout";
import { FaEdit, FaTrash, FaEye, FaUserPlus, FaComment } from "react-icons/fa";
import { Button, Row, Col } from "react-bootstrap";
import Navbar from "../../../../Shared/Sales-ExecutiveNavbar/Navbar";
import "./ViewLeads.css";
import axios from 'axios';
import {baseURL} from "../../../../Apiservices/Api";
import { io } from 'socket.io-client';
import { AuthContext } from '../../../../AuthContext/AuthContext';
import { webhookUrl } from "../../../../Apiservices/Api";

const ViewLeads = () => {
  const { authToken, userRole, userId } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  

  const handleEdit = (leadId) => {
    navigate(`/edit-lead/${leadId}`, {
      state: { leadid: leadId },
    });
  };

  const handleAddUser  = (lead) => {
    navigate(`/create-customer-opportunity/${lead.leadid}`);
  };

  const handleAddLead = () => {
    navigate('/add-lead');
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
console.log(JSON.stringify(body, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/leads/status/${leadId}`, body);
      
      if (response.status === 200) {
        setMessage(response.data.message); // Use the message from the response
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

  const initializeSocket = () => {
    const socket = io(`${webhookUrl}`, {
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setIsConnected(false);
    });
    socket.on('newEnquiry', (newEnquiry) => {
      console.log('Received new enquiry:', newEnquiry);
      setData((prevEnquiries) => [...prevEnquiries, newEnquiry]);
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    return socket;
  };

  useEffect(() => {
    const socket = initializeSocket();
    return () => {
      console.log('Component unmounted. Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    const fetchEnquiries = async () => {
      // console.log("userid=",userId) 
      if (!userId)
      {  
        // console.log("not exist userid=",userId) 
         return; }

      try {
        const response = await fetch(`${webhookUrl}/api/enquiries`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Use authToken for secure API calls
          },
        });
        const data = await response.json();
        // console.log("data=", data.length);

        const filteredData = data.filter(
          (enquiry) => enquiry.assignedSalesId == userId && enquiry.status == 'lead'
        );
        console.log("filterd data=", filteredData.length);
        setData(filteredData);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      }
    };

    fetchEnquiries();
  }, [userId, authToken]); 

  
  

  const handleViewLeads = (lead) => {
    navigate(`/view-lead/${lead.leadid}`, {
      state: { leadid: lead.leadid },
    });
  };

  const columns = useMemo(
    () => [
      // {
      //   Header: "S.No",
      //   accessor: (row, index) => index + 1,
      // },
      {
        Header: "Lead Id",
        accessor: "leadDetails",
        Cell: ({ row }) => (
          <div>
            
            <div>{row.original.leadcode}</div>
            {/* <div>{row.original.lead_type}</div> */}
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
              maxWidth: "150px" // Adjust width as needed
            }}
            title={row.original.email} // Show full email on hover
          >
            {row.original.email}
          </div>
        ),
      },
      
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
        Header: "Source",
        accessor: "sources",
      },
       // Customer Status Column
       {
        Header: "Customer Status",
        accessor: "customer_status",
        
       
      },

      //  {
      //   Header: "Customer Status",
      //   accessor: "customerStatus",
      //   Cell: ({ row }) => (
      //     <div>
      //       {row.index % 2 === 0 ? "New Customer" : "Existing Customer"}
      //     </div>
      //   ),
      // },
      // {
      //   Header: "Actions",
      //   Cell: ({ row }) => (
      //     <div>
      //       <button
      //         className="btn btn-warning edit-button me-1 mb-1"
      //         onClick={() => handleEdit(row.original.leadid)}
      //       >
      //         <FaEdit />
      //       </button>
      //       {/* <button
      //         className="btn btn-danger delete-button me-1 mb-1"
      //         onClick={() => handleDelete(row.original.leadid)}
      //       >
      //         <FaTrash />
      //       </button> */}
      //       <button
      //         className="btn btn-info view-button me-1"
      //         onClick={() => handleViewLeads(row.original)}
      //       >
      //         <FaEye />
      //       </button>
      //       <button
      //         className="btn btn-success add-user-button me-1"
      //         onClick={() => handleAddUser (row.original)}
      //       >
      //         <FaUserPlus />
      //       </button>
      //     </div>
      //   ),
      // },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaEdit
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleEdit(row.original.leadid)}
            />
            <FaEye
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleViewLeads(row.original)}
            />
            <FaUserPlus
              style={{ color: "#ff9966", cursor: "pointer" }}
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
      //         navigate(/comments/${row.original.leadid});
      //       }}
      //     >
      //       <FaComment />
      //     </button>
      //   ),
      // },
    ],
    [data]
  );

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="ViewLead-container mb-5">
          <div className="ViewLead-table-container">
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

export default ViewLeads;