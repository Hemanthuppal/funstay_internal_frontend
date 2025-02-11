import React, { useState, useEffect, useContext } from 'react';
import DataTable from './../../../Layout/Table/TableLayout'; // Make sure to import your DataTable component
import Navbar from "../../../Shared/ManagerNavbar/Navbar";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import './MyTeam.css';
import { AuthContext } from '../../../AuthContext/AuthContext';
import { baseURL } from '../../../Apiservices/Api';

const MyTeam = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { authToken, userRole, userId } = useContext(AuthContext);
  const [data, setData] = useState([]);

  // Columns for DataTable component
  const columns = React.useMemo(
    () => [
      // {
      //   Header: "S.No",
      //   accessor: (row, index) => index + 1,
      // },

      {
        Header: "Employee ID",
        accessor: "id",
        Cell: ({ value }) => `EMP${String(value).padStart(5, "0")}`, 
      },
            {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      // {
      //   Header: 'Designation',
      //   accessor: 'designation',
      // },
      // {
      //   Header: 'Actions',
      //   accessor: 'actions',
      //   Cell: ({ row }) => (
      //     <div className="action-icons">
      //       <FaEye onClick={() => handleView(row)} />
      //       <FaEdit onClick={() => handleEdit(row)} />
      //       <FaTrash onClick={() => handleDelete(row)} />
      //     </div>
      //   ),
      // },
    ],
    []
  );

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/employees/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`, // Add the auth token if needed
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees data');
        }

        const result = await response.json();
        setData(result); // Set the fetched data
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchData();
  }, [authToken, userId]);

  // Handle view, edit, and delete actions
  const handleView = (row) => {
    console.log('View Employee:', row.original);
    // Add your logic for viewing the employee details
  };

  const handleEdit = (row) => {
    console.log('Edit Employee:', row.original);
    // Add your logic for editing the employee details
  };

  const handleDelete = (row) => {
    console.log('Delete Employee:', row.original);
    // Add your logic for deleting the employee
  };

  return (
    <div className="manager-myteamcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`manager-myteam ${collapsed ? "collapsed" : ""}`}>
        <div className="manager-myteam-container mb-5">
          <div className="manager-myteam-table-container">
            <h2 className="text-center">My Team</h2>
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
