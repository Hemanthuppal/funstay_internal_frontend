import React, { useState, useEffect,useContext } from "react";
import axios from "axios";
import { AuthContext } from '../../../AuthContext/AuthContext';
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from "react-router-dom";

function FollowUp() {
  const navigate = useNavigate();
  const today = new Date();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = weekdays[today.getDay()];

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [travelOpportunity, setTravelOpportunity] = useState([]);
  const [leads, setLeads] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const { authToken, userRole, userId } = useContext(AuthContext);
  console.log("User ID=",userId)

  useEffect(() => {
    const fetchTravelOpportunity = async () => {
      try {
        const response = await axios.get( `${baseURL}/travel-opportunity`); // Replace with your actual API endpoint
        setTravelOpportunity(response.data);
      } catch (err) {
        console.log("Failed to fetch schedule data");
      }
    };

    fetchTravelOpportunity();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/allleads`); // Replace with your actual API endpoint
        setLeads(response.data);
        console.log("Leads=", response.data);
      } catch (err) {
        console.log("Failed to fetch schedule data");
      }
    };
  
    fetchLeads();
  }, []);
  
  useEffect(() => {
    // Filter leads based on assignedSalesId matching the current userId
    const filteredLeads = leads.filter((lead) => lead.managerid == userId);
  
    // Create a lookup object for filtered leads where leadid is the key
    const leadsLookup = filteredLeads.reduce((acc, lead) => {
      acc[lead.leadid] = lead;
      return acc;
    }, {});
  
    // Create dynamic schedule data based on the filtered leads and selected day
    const dynamicSchedule = travelOpportunity
      .filter((opportunity) => {
        // Convert reminder_setting to the weekday format
        const reminderDate = new Date(opportunity.reminder_setting);
        const reminderDay = weekdays[reminderDate.getDay()];
        return reminderDay == selectedDay && leadsLookup[opportunity.leadid];
      })
      .map((opportunity) => {
        // Use the lookup object to get the lead by leadid
        const lead = leadsLookup[opportunity.leadid];
  
        // Log the lead object to the console to check the matching lead
        console.log("Matching Lead for opportunity:", opportunity.leadid, "is", lead);
  
        const leadName = lead ? lead.name : "Unknown Lead"; // Fallback if no lead is found
  
        return {
          time: "9:00 - 10:00 AM", // Default placeholder for time; update if needed
          title: opportunity.notes || "Untitled Task",
          color: "Sales-badge-orange", // Adjust color dynamically if required
          lead: leadName, // Display lead name instead of leadid
          leadid: opportunity.leadid,
        };
      });
  
    setScheduleData([
      {
        day: selectedDay,
        schedules: dynamicSchedule,
      },
    ]);
  }, [selectedDay, travelOpportunity, leads, userId]); // Include userId in the dependencies// Add 'leads' to dependencies to update when leads change
  
  
  

  const getWeekDays = () => {
    const days = [];
    const currentDate = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - currentDate.getDay() + i); // Set to the start of the week (Sunday) and add days
      days.push({
        day: weekdays[date.getDay()],
        date: date.getDate().toString().padStart(2, "0"), // Format to 2-digit date
      });
    }
    return days;
  };

  const daysOfWeek = getWeekDays();

  const todaySchedule = scheduleData.find((data) => data.day == selectedDay);

  return (
    <div>
      <div className="Sales-follow-up-schedule">
        <div className="Sales-schedule-header d-flex justify-content-between align-items-center">
          <h5>Follow-up Schedule</h5>
          <div className="dropdown">
            {/* <button
              className="btn btn-outline-primary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Show
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li>
                <a className="dropdown-item" href="#">
                  Option 1
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Option 2
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Option 3
                </a>
              </li>
            </ul> */}
          </div>
        </div>
        <div className="Sales-day-selector mt-3 d-flex justify-content-between">
          {daysOfWeek.map(({ day, date }) => (
            <div
              key={day}
              className={`Sales-day ${selectedDay == day ? "active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="Sales-day-label">{day}</div>
              <div className="Sales-day-number">{date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card Sales-lead-card p-3 mt-4 Sales-schedule-container">
        <div className="Sales-schedule-header d-flex justify-content-between align-items-center">
          <h5>Today's Schedule</h5>
          {/* <a href="#" className="Sales-add-schedule-link">
            Add A Schedule
          </a> */}
        </div>
        {/* <div className="Sales-schedule-legends d-flex mb-3">
          <div className="Sales-legend me-3">
            <span className="Sales-legend-color Sales-badge-orange"></span> Meetings
          </div>
          <div className="Sales-legend me-3">
            <span className="Sales-legend-color Sales-badge-green"></span> Calls
          </div>
          <div className="Sales-legend">
            <span className="Sales-legend-color Sales-badge-blue"></span> Demos
          </div>
        </div> */}
       <ul className="Sales-schedule-list">
        {todaySchedule?.schedules.length > 0 ? (
        todaySchedule.schedules.map((item, index) => (
            <li key={index} className="Sales-schedule-item d-flex align-items-center">
            <div className="Sales-badge-container">
                <span className={`Sales-badge ${item.color}`}></span>
            </div>
            <div className="Sales-schedule-details flex-grow-1 ms-3">
                <strong>{item.time}</strong>
                <p className="mb-1">{item.title}</p>
                <small>
                Lead by <span className="Sales-schedule-lead">{item.lead}</span>
                </small>
            </div>
            <button className="btn btn-outline-primary Sales-view-details-btn"
             onClick={() => navigate(`/m-details/${item.leadid}`, { state: { leadid: item.leadid } })}>
                View Details
            </button>
            </li>
        ))
        ) : (
        <li className="Sales-schedule-item d-flex align-items-center justify-content-center">
            <p className="text-muted mt-2"><strong>No schedule today</strong></p>
        </li>
        )}
    </ul>
      </div>
    </div>
  );
}

export default FollowUp;
