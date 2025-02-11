import React, { useState, useEffect } from "react";
import { Row, Col, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import './LeadDetails.css';
import Navbar from '../../../Shared/Navbar/Navbar';
import { baseURL } from "../../../Apiservices/Api";

const LeadOppView = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [lead, setLead] = useState(null);
    const location = useLocation();
    const { leadid } = location.state;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeadDetails = async () => {
            try {
                const response = await fetch(`${baseURL}/api/leadsoppcomment/${leadid}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(data); // Log the data to see its structure
                setLead(data);
            } catch (error) {
                console.error('Error fetching lead details:', error);
            }
        };

        fetchLeadDetails();
    }, [leadid]);

    if (!lead) {
        return <div>Loading...</div>; // Show a loading state while fetching data
    }

    const handleEdit = (leadId) => {
        navigate(`/a-edit-opportunity/${leadId}`, {
            state: { leadid: leadId }, // Pass leadid to the edit page
        });
    };

    // Sort comments by timestamp in descending order
    const sortedComments = lead.comments ? lead.comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

    return (
        <div className="salesViewLeadsContainer">
            <Navbar onToggleSidebar={setCollapsed} />
            <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
                <div className="lead-opportunity-view">
                    <Card className="mb-4">
                        <Card.Header className='s-LeadOppView-modal-header'>
                            <h2> Customer and Opportunity Details</h2>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {/* Customer Details Section */}
                                <Col md={6}>
                                    <h5>Customer Details</h5>
                                    {/* <p><strong>Lead Type:</strong> {lead.lead.lead_type || 'N/A'}</p> */}
                                    {lead.travelOpportunities && lead.travelOpportunities.length > 0 && (
  <>
    <p>
      <strong>Opp Id:</strong> {`OPP${String(lead.travelOpportunities[0].id).padStart(4, '0')}`}
    </p>
  </>
)}

                                    <p><strong>Name:</strong> {lead.lead.name || 'N/A'}</p>
                                    <p><strong>Phone Number:</strong> {lead.lead.country_code} {lead.lead.phone_number || 'N/A'}</p>
                                    <p><strong>Email ID:</strong> {lead.lead.email || 'N/A'}</p>
                                    <p><strong>Primary Source:</strong> {lead.lead.primarySource || 'N/A'}</p>
                                    <p><strong>Secondary Source:</strong> {lead.lead.secondarysource || 'N/A'}</p>
                                    
                                    <p><strong>Primary Status:</strong> {lead.lead.opportunity_status1 || 'N/A'}</p>
                                    <p><strong>Secondary Status:</strong> {lead.lead.opportunity_status2 || 'N/A'}</p>
                                    <p><strong>Travel Type:</strong> {lead.lead.travel_type || 'N/A'}</p>
                                    <p><strong>Channel:</strong> {lead.lead.channel || 'N/A'}</p>
                                    <hr />
                                    
                                    <h5>Opportunity Details</h5>
                                    {lead.travelOpportunities && lead.travelOpportunities.length > 0 && (
                                        <>
                                            <p><strong>Destination:</strong> {lead.travelOpportunities[0].destination || 'N/A'}</p>
                                            <p><strong>Start Date:</strong> {lead.travelOpportunities[0].start_date ? new Date(lead.travelOpportunities[0].start_date).toLocaleDateString() : 'N/A'}</p>
                                            <p><strong>End Date:</strong> {lead.travelOpportunities[0].end_date ? new Date(lead.travelOpportunities[0].end_date).toLocaleDateString() : 'N/A'}</p>
                                            <p><strong>Duration:</strong> {lead.travelOpportunities[0].duration || 'N/A'}</p>
                                            <p><strong>Number of Adults:</strong> {lead.travelOpportunities[0].adults_count || 'N/A'}</p>
                                            <p><strong>Number of Children:</strong> {lead.travelOpportunities[0].children_count || 'N/A'}</p>
                                            <p><strong>Child Age:</strong> {lead.travelOpportunities[0].child_ages || 'N/A'}</p>
                                            <p><strong>Approx Budget:</strong> {lead.travelOpportunities[0].approx_budget || 'N/A'}</p>
                                            {/* <p><strong>Notes:</strong> {lead.travelOpportunities[0].notes || 'N/A'}</p> */}
                                            <p><strong>Reminder Setting:</strong> {lead.travelOpportunities[0].reminder_setting ? new Date(lead.travelOpportunities[0].reminder_setting).toLocaleString() : 'N/A'}</p>
                                            <p><strong>Created Date:</strong>{lead.travelOpportunities[0].created_at? new Date(lead.travelOpportunities[0].created_at).toLocaleString() : 'N/A'}</p>
                                        </>
                                    )}
                                </Col>

                                <Col md={6}>
                                    <h5>Additional Details</h5>
                                    <p><strong>Notes:</strong></p>
                                    <div className="s-Opp-Commentsection">
                                    {lead.travelOpportunities && lead.travelOpportunities.length > 0 && (
                                         <>
                                         <p> {lead.travelOpportunities[0].notes || 'N/A'}</p>
                                         </>
                                        )}
                                        </div>
                                    <p><strong>Comments:</strong></p>
                                    <div className="s-Opp-Commentsection">
                                        {sortedComments.length > 0 ? (
                                            sortedComments.map(comment => (
                                                <div key={comment.id}>
                                                    <p>
                                                        <strong>{new Date(comment.timestamp).toLocaleString()}:</strong>
                                                    </p>
                                                    <p><strong>{comment.name}</strong>{comment.text}</p>
                                                    <hr /> {/* Optional: Add a horizontal line between comments */}
                                                </div>
                                            ))
                                        ) : (
                                            <p>No comments available.</p>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer className='s-LeadOppView-footer'>
                            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                                Back
                            </button>
                            <button className='btn btn-primary' onClick={() => handleEdit(leadid)}>Edit</button>
                        </Card.Footer>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LeadOppView;