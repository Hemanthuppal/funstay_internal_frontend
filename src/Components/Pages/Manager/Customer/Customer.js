import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import DataTable from './../../../Layout/Table/TableLayout'; // Make sure to import your DataTable component
import Navbar from "../../../Shared/ManagerNavbar/Navbar";
import "./Customer.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../../AuthContext/AuthContext";

const SalesCustomer = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]); // State for storing customers
  const navigate = useNavigate();
  const { authToken, userId } = useContext(AuthContext);
const [message, setMessage] = useState(null);
  // Fetch customers on component load


  useEffect(() => {
    const fetchCustomersAndLeads = async () => {
      try {
        // Fetch all leads
        const leadsResponse = await axios.get(`${baseURL}/api/allleads`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (leadsResponse.status === 200) {
          const leadsData = leadsResponse.data;
  
          // Filter leads matching criteria
          const filteredLeads = leadsData.filter(
            (lead) => lead.managerid == userId && lead.status == 'opportunity'
          );
  
          // Fetch all customers
          const customersResponse = await axios.get(`${baseURL}/api/customers`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
  
          if (customersResponse.status === 200) {
            const customersData = customersResponse.data;
  
            // Find matching customers based on customerid in filtered leads
            const matchedCustomers = customersData
            .filter(customer =>
              filteredLeads.some(lead => lead.customerid == customer.id)
            )
            .map(customer => ({
              ...customer,
              formattedId: `CUS${String(customer.id).padStart(4, '0')}` // Format the ID here
            }));
  
            setData(matchedCustomers); // Update state with matched customer data
          } else {
            console.error("Error fetching customers:", customersResponse.statusText);
          }
        } else {
          console.error("Error fetching leads:", leadsResponse.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data.");
      }
    };
  
    fetchCustomersAndLeads();
  }, [authToken, userId]);
  
  const handleDeleteCustomer = async (customerId) => {
   

    try {
      const response = await axios.delete(`${baseURL}/api/customers/${customerId}`);
      setMessage(response.data.message); // Show success message
      setTimeout(() => setMessage(""), 3000);

      // Optionally, update UI by removing the deleted customer
      // Example: If using state to store customers, filter out the deleted one
      setData((prevCustomers) => prevCustomers.filter(customer => customer.id !== customerId));

    } catch (error) {
      console.error("Error deleting customer:", error);
      setMessage("Failed to delete customer. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // useEffect(() => {
  //   const fetchCustomers = async () => {
  //     try {
  //       const response = await axios.get(`${baseURL}/api/customers`, {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`, // Include token if needed
  //         },
  //       });
  //       if (response.status === 200) {
  //         // Filter customers based on manager ID
  //         const filteredCustomers = response.data.filter(
  //           (customer) => customer.managerid === userId
  //         );
  //         setData(filteredCustomers); // Update state with filtered customer data
  //       } else {
  //         console.error("Error fetching customers:", response.statusText);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching customers:", error);
  //       alert("Failed to fetch customers.");
  //     }
  //   };

  //   fetchCustomers();
  // }, [authToken, userId]); // Add userId to the dependency array

  // const navigateToLead = (leadId) => {
  //   navigate(`/m-customer-details/${leadId}`, {
  //     state: { leadid: leadId },
  //   });
  // };


  //dummy data
  const navigateToLead = (id) => {
    navigate(`/m-customerdetails/${id}`, {
      state: { id: id },
    });
  };
    const navigateToEditLead = (id) => {
      navigate(`/m-editcustomerdetails/${id}`, {
        state: { id: id },
      });
    };
  
   
  // Columns for DataTable component
  const columns = React.useMemo(
    () => [
      {
        Header: "S.No",
        accessor: (row, index) => index + 1,  // This will generate the serial number based on the row index
      },
      {
        Header: "Customer ID",
        accessor: "formattedId", // This is the key in your customer data
      
      },
      {
        Header: "Name",
        accessor: "name", // Ensure this matches the key in your customer data
        Cell: ({ row }) => (
          <div
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            onClick={() => navigateToLead(row.original.id)} // Navigate on click
          >
            {row.original.name}
          </div>
        ),
      },
      {
        Header: "Mobile No",
        accessor: "phone_number", // Ensure this matches the key in your customer data
      },
      {
        Header: "Email",
        accessor: "email", // Ensure this matches the key in your customer data
      },
      // {
      //   Header: "Actions",
      //   accessor: "actions",
      //   Cell: ({ row }) => (
      //     <div>
      //       <button
      //         className="btn btn-primary btn-sm me-2"
      //         onClick={() => navigateToLead(row.original.id)} // Use customer ID
      //       >
      //         <FaEye />
      //       </button>
      //       {/* <button
      //         className="btn btn-warning btn-sm me-2"
      //         onClick={() => editCustomer(row.original)}
      //       >
      //         <FaEdit />
      //       </button>
      //       <button
      //         className="btn btn-danger btn-sm"
      //         onClick={() => deleteCustomer(row.original.id)} // Use customer ID
      //       >
      //         <FaTrash />
      //       </button> */}
      //     </div>
      //   ),
      // },

      {
                    Header: "Actions",
                    Cell: ({ row }) => (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaEye
                          style={{ color: "#ff9966", cursor: "pointer" }}
                          onClick={() => navigateToLead(row.original.id)}
                        />
                        <FaTrash
                                            style={{ color: "#ff9966", cursor: "pointer" }}
                                            onClick={() => handleDeleteCustomer(row.original.id)}
                                          />
                                           <FaEdit
    style={{ color: "#ff9966", cursor: "pointer" }}
    onClick={() => navigateToEditLead(row.original.id)}
  />
                      </div>
                    ),
                  }
    ],
    []
  );

  // Placeholder actions
  const editCustomer = (customer) => {
    alert(`Editing customer: ${customer.name}`);
    // Implement your edit logic here
  };

  const deleteCustomer = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      // Perform delete logic here
      alert(`Customer with ID ${customerId} deleted.`);
      // Optionally, refresh the customer list after deletion
    }
  };

  return (
    <div className="ManagerCustomercontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`ManagerCustomer ${collapsed ? "collapsed" : ""}`}>
        <div className="ManagerCustomer-container mb-5">
          <div className="ManagerCustomer-table-container">
            <h3 className="d-flex justify-content-between align-items-center">
              Customer Details
            </h3>
            {message && <div className="alert alert-success">{message}</div>}
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesCustomer;