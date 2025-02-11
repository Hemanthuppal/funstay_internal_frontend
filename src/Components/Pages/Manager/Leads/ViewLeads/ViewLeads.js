import React, { useState, useMemo, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "./../../../../Layout/Table/TableLayout";
import {Button, Row, Col, Form } from "react-bootstrap";
import Navbar from "../../../../Shared/ManagerNavbar/Navbar";
import { FaEdit, FaTrash, FaEye, FaUserPlus, FaComment } from "react-icons/fa";
import "./ViewLeads.css";
import axios from "axios";
import { AuthContext } from "../../../../AuthContext/AuthContext";
import {baseURL} from "../../../../Apiservices/Api";
import { webhookUrl } from "../../../../Apiservices/Api";

const ViewLeads = () => {
  const [message, setMessage] = useState('');
  const { authToken ,userId, managerId} = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Fetch leads and employees data on component mount
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch(`${webhookUrl}/api/enquiries`);
        const data = await response.json();
        const filteredData = data.filter((enquiry) =>  enquiry.managerid == userId && enquiry.status == "lead");
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${baseURL}/employeesassign`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        console.log(response.data);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEnquiries();
    fetchEmployees();
  }, [authToken,userId]);

  const handleEdit = (leadId) => {
    navigate(`/m-edit-lead/${leadId}`, {
      state: { leadid: leadId },
    });
  };

  const handleAddUser  = (lead) => {
    navigate(`/m-create-customer-opportunity/${lead.leadid}`);
  };
  const handleAddLead = () => {
    navigate('/m-add-leads');
  };
 

  const handleViewLeads = (lead) => {
    navigate(`/m-view-lead/${lead.leadid}`, {
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
console.log(JSON.stringify(body, null, 2));
    try {
        const response = await axios.put(`${baseURL}/api/leads/status/${leadId}`, body);
        
        if (response.status === 200) {
            // Assuming the response contains a message
            setMessage(response.data.message || 'Status updated successfully.');
            setTimeout(() => setMessage(""), 3000); // Use the message from the response or a default message
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

  // Handle lead assignment when an employee is selected
  const handleAssignLead = async (leadid, employeeId) => {
    const selectedEmp = employees.find((emp) => emp.id === parseInt(employeeId));
    const employeeName = selectedEmp ? selectedEmp.name : "";

    if (!employeeName) {
      setMessage("Please select a valid employee.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
console.log(leadid, employeeId, employeeName);
    try {
      const response = await axios.post(`${baseURL}/api/assign-lead`, {
        leadid,
        employeeId,
        employeeName,
        managerId
      });
      setMessage(response.data.message);
      setTimeout(() => setMessage(""), 3000);
      // Update the assigned lead locally
      setData((prevData) =>
        prevData.map((lead) =>
          lead.leadid === leadid ? { ...lead, assignedSalesName: employeeName } : lead
        )
      );
    } catch (error) {
      console.error("Error assigning lead:", error);
    }
  };

  // Columns for DataTable with dynamic employee assignment
  // const columns = useMemo(
  //   () => [
  //     {
  //       Header: "S.No",
  //       accessor: (row, index) => index + 1,
  //     },
  //     {
  //       Header: "Lead Details",
  //       accessor: "leadDetails",
  //       Cell: ({ row }) => (
  //         <div>
  //           <div>{row.original.leadcode}</div>
  //           <div>{row.original.lead_type}</div>
  //         </div>
  //       ),
  //     },
  //     {
  //       Header: "Contact Info",
  //       accessor: "contactInfo",
  //       Cell: ({ row }) => (
  //         <div>
  //           <div>{row.original.name}</div>
  //           <div>{row.original.phone_number}</div>
  //           <div>{row.original.email}</div>
  //         </div>
  //       ),
  //     },
  //     {
  //       Header: "Lead Status",
  //       Cell: ({ row }) => {
  //         const primaryStatus = row.original.primaryStatus;
  //         const secondaryOptions = dropdownOptions.secondary[primaryStatus] || [];
  //         const isSecondaryDisabled = !primaryStatus || secondaryOptions.length === 0;

  //         return (
  //           <div className="d-flex align-items-center">
  //             <select
  //               value={primaryStatus}
  //               onChange={(e) =>
  //                 handlePrimaryStatusChange(e.target.value, row.original.leadid)
  //               }
  //               className="form-select me-2"
  //             >
  //               <option value="">Select Primary Status</option>
  //               {dropdownOptions.primary.map((option) => (
  //                 <option key={option} value={option}>
  //                   {option}
  //                 </option>
  //               ))}
  //             </select>
  //             <select
  //               value={row.original.secondaryStatus}
  //               onChange={(e) =>
  //                 handleSecondaryStatusChange(e.target.value, row.original.leadid)
  //               }
  //               className="form-select"
  //               disabled={isSecondaryDisabled} // Disable if no primary status or no secondary options
  //             >
  //               <option value="">Select Secondary Status</option>
  //               {secondaryOptions.map((option) => (
  //                 <option key={option} value={option}>
  //                   {option}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       Header: "Source",
  //       accessor: "sources",
  //     },
  //     {
  //       Header: "Assign",
  //       accessor: "id",
  //       Cell: ({ cell: { row } }) => {
  //         const assignedSalesName = row.original.assignedSalesName; // Fetch assignedSalesName from the data row

  //         return assignedSalesName ? (
  //           <button className="btn btn-secondary" disabled>
  //             {assignedSalesName}
  //           </button>
  //         ) : (
  //           <Form.Select
  //             value=""
  //             onChange={(e) => handleAssignLead(row.original.leadid, e.target.value)}
  //           >
  //             <option value="">Select Employee</option>
  //             {employees.map((employee) => (
  //               <option key={employee.id} value={employee.id}>
  //                 {employee.name}
  //               </option>
  //             ))}
  //           </Form.Select>
  //         );
  //       },
  //     },
  //     {
  //       Header: "Actions",
  //       Cell: ({ row }) => (
  //         <div>
  //           <button
  //             className="btn btn-warning edit-button me-1 mb-1"
  //             onClick={() => handleEdit(row.original.leadid)}
  //           >
  //             <FaEdit />
  //           </button>
  //           <button
  //             className="btn btn-danger delete-button me-1 mb-1"
  //             onClick={() => handleDelete(row.original.leadid)}
  //           >
  //             <FaTrash />
  //           </button>
  //           <button
  //             className="btn btn-info view-button me-1"
  //             onClick={() => handleViewLeads(row.original)}
  //           >
  //             <FaEye />
  //           </button>
  //           <button
  //             className="btn btn-success add-user-button me-1"
  //             onClick={() => handleAddUser (row.original)}
  //           >
  //             <FaUserPlus />
  //           </button>
  //         </div>
  //       ),
  //     },
  //     // {
  //     //   Header: 'Comments',
  //     //   accessor: 'comments',
  //     //   Cell: ({ row }) => (
  //     //     <button
  //     //       className="btn btn-info"
  //     //       onClick={() => {
  //     //         navigate(`/m-comments/${row.original.leadid}`);
  //     //       }}
  //     //     >
  //     //       <FaComment />
  //     //     </button>
  //     //   ),
  //     // },
  //   ],
  //   [employees]
  // );

  // Columns for DataTable with dynamic employee assignment
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
              maxWidth: "200px" // Adjust width as needed
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
      }
      ,
      {
        Header: "Source",
        accessor: "sources",
      },
      // Customer Status Column
      // {
      //   Header: "Customer Status",
      //   accessor: "customerStatus",
      //   Cell: ({ row }) => (
      //     <div>
      //       {row.index % 2 === 0 ? "New Customer" : "Existing Customer"}
      //     </div>
      //   ),
      // },
      {
        Header: "Customer Status",
        accessor: "customer_status",
        
       
      },

      {
        Header: "Assign",
        accessor: "id",
        Cell: ({ cell: { row } }) => {
          const assignedSalesName = row.original.assignedSalesName; // Fetch assignedSalesName from the data row

          return assignedSalesName ? (
            <button className="btn btn-secondary" disabled
            style={{
              maxWidth: '150px', // Adjust as needed
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {assignedSalesName}
            </button>
          ) : (
            <Form.Select
              value=""
              onChange={(e) => handleAssignLead(row.original.leadid, e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </Form.Select>
          );
        },
      },
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
      //       {/* <button
      //         className="btn btn-success add-user-button me-1"
      //         onClick={() => handleAddUser(row.original)}
      //       >
      //         <FaUserPlus />
      //       </button> */}
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
            <FaTrash
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleDelete(row.original.leadid)}
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
      //         navigate( `/m-comments/${row.original.leadid}`);
      //       }}
      //     >
      //       <FaComment />
      //     </button>
      //   ),
      // },
    ],
    [employees]
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