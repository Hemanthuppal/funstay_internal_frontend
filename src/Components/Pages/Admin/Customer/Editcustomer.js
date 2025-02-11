import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Row, Col, Card, Accordion, Form, Button } from "react-bootstrap";
import "../Potentialleads/LeadDetails.css";
import Navbar from "../../../Shared/Navbar/Navbar";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import { baseURL } from "../../../Apiservices/Api";
const EditLeadOppView = () => {
    const [message, setMessage] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [travelOpportunity, setTravelOpportunity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [travelLoading, setTravelLoading] = useState(true);
    const [error, setError] = useState(null);
    const [travelError, setTravelError] = useState(null);
    const [activeKey, setActiveKey] = useState("0");
    const [editCustomerMode, setEditCustomerMode] = useState(true); // Toggle for Customer Edit Mode
    const [editOpportunityMode, setEditOpportunityMode] = useState({}); // Toggle for Opportunity Edit Mode
    const location = useLocation();
    const navigate = useNavigate();
    const [originalOpportunities, setOriginalOpportunities] = useState({});
    const customerId = location.state?.id || null;

    const fetchCustomerDetails = async (id) => {
        try {
            const response = await axios.get(`${baseURL}/api/customers/${id}`);
            if (response.data && typeof response.data === "object") {
                setCustomer(response.data.customer || response.data);
            } else {
                throw new Error("Invalid API response structure");
            }
        } catch (err) {
            console.error("Error fetching customer details:", err);
            setError("Failed to fetch customer details");
        } finally {
            setLoading(false);
        }
    };

    const fetchopportunityDetails = async (id) => {
        try {
            const response = await axios.get(`${baseURL}/api/travel-opportunities/${id}`);
            const opportunities = response.data;

            const opportunitiesWithComments = await Promise.all(
                opportunities.map(async (trip) => {
                    const commentsResponse = await axios.get(`${baseURL}/comments/${trip.leadid}`);

                    // Split child_ages string into an array
                    const childAgesArray = trip.child_ages ? trip.child_ages.split(',') : [];

                    return {
                        ...trip,
                        comments: commentsResponse.data,
                        child_ages: childAgesArray, // Set child_ages as an array
                    };
                })
            );

            setTravelOpportunity(opportunitiesWithComments);
        } catch (err) {
            setTravelError("Failed to fetch TravelOpportunity details");
        } finally {
            setTravelLoading(false);
        }
    };

    useEffect(() => {
        if (!customerId) {
            console.error("No customer ID found! Redirecting...");
            return;
        }
        fetchCustomerDetails(customerId);
        fetchopportunityDetails(customerId);
    }, [customerId]);

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomer({ ...customer, [name]: value });
    };

    const handleOpportunityChange = (index, e) => {
        const { name, value } = e.target;
        const updatedOpportunities = [...travelOpportunity];
        const currentTrip = updatedOpportunities[index];

        // Update the changed field
        currentTrip[name] = value;

        // Handle dependencies between start_date, duration, and end_date
        if (name === 'duration') {
            // Calculate end_date based on start_date and new duration
            const durationDays = parseInt(value, 10);
            if (!isNaN(durationDays) && currentTrip.start_date) {
                const startDate = new Date(currentTrip.start_date);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + durationDays);
                currentTrip.end_date = endDate.toISOString().split('T')[0];
            }
        } else if (name === 'end_date') {
            // Calculate duration based on start_date and new end_date
            if (currentTrip.start_date && value) {
                const startDate = new Date(currentTrip.start_date);
                const endDate = new Date(value);
                const timeDiff = endDate.getTime() - startDate.getTime();
                const durationDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                currentTrip.duration = durationDays >= 0 ? durationDays.toString() : '0';
            }
        } else if (name === 'start_date') {
            // Update end_date if duration exists, or update duration if end_date exists
            if (currentTrip.duration) {
                const durationDays = parseInt(currentTrip.duration, 10);
                if (!isNaN(durationDays) && value) {
                    const startDate = new Date(value);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + durationDays);
                    currentTrip.end_date = endDate.toISOString().split('T')[0];
                }
            } else if (currentTrip.end_date) {
                const startDate = new Date(value);
                const endDate = new Date(currentTrip.end_date);
                const timeDiff = endDate.getTime() - startDate.getTime();
                const durationDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                currentTrip.duration = durationDays >= 0 ? durationDays.toString() : '0';
            }
        }

        setTravelOpportunity(updatedOpportunities);
    };

    const handleEditOpportunity = (index, e) => {
        e.stopPropagation();
        const original = { ...travelOpportunity[index] };
        setOriginalOpportunities(prev => ({ ...prev, [index]: original }));
        setEditOpportunityMode(prev => ({ ...prev, [index]: true }));
    };

    const handleCancelOpportunity = (index) => {
        const updatedOpportunities = [...travelOpportunity];
        updatedOpportunities[index] = originalOpportunities[index];
        setTravelOpportunity(updatedOpportunities);
        setEditOpportunityMode(prev => ({ ...prev, [index]: false }));
    };

    const handleCustomerSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted"); // Debugging line
        try {
            const response = await axios.put(`${baseURL}/api/customers/${customerId}`, customer);
            if (response.status === 200) {
                setMessage("Customer details updated successfully!");
                setTimeout(() => setMessage(""), 3000);
                setEditCustomerMode(false);
            } else {
                throw new Error("Failed to update customer details");
            }
        } catch (err) {
            console.error("Error updating customer details:", err);
            setMessage("Failed to update customer details");
            setTimeout(() => setMessage(""), 3000);
        }
    };
    const handleOpportunitySubmit = async (index) => {
        try {
            const trip = travelOpportunity[index];

            // Join child ages into a single string
            const childAgesString = trip.child_ages.join(',');

            // Prepare the data to be sent to the API
            const updatedTrip = {
                ...trip,
                child_ages: childAgesString, // Set child_ages as a string
            };

            await axios.put(`${baseURL}/api/travel-opportunities/${trip.id}`, updatedTrip);
            setMessage("Opportunity details updated successfully!");
            setTimeout(() => setMessage(""), 3000);
            setEditOpportunityMode({ ...editOpportunityMode, [index]: false });
        } catch (err) {
            console.error("Error updating opportunity details:", err);
            setMessage("Failed to update opportunity details");
            setTimeout(() => setMessage(""), 3000);
        }
    };

    // Handle children count change
    const handleChildrenCountChange = (index, e) => {
        const { value } = e.target;
        const count = parseInt(value, 10);
        const newChildAges = Array.from({ length: count }, (_, i) => travelOpportunity[index].child_ages[i] || '');

        setTravelOpportunity((prev) => {
            const updatedOpportunities = [...prev];
            updatedOpportunities[index] = { ...updatedOpportunities[index], children_count: count, child_ages: newChildAges };
            return updatedOpportunities;
        });
    };

    // Handle child age change
    const handleChildAgeChange = (index, childIndex, value) => {
        setTravelOpportunity((prev) => {
            const updatedOpportunities = [...prev];
            const updatedChildAges = [...updatedOpportunities[index].child_ages];
            updatedChildAges[childIndex] = value;
            updatedOpportunities[index] = { ...updatedOpportunities[index], child_ages: updatedChildAges };
            return updatedOpportunities;
        });
    };

    return (
        <div className="salesViewLeadsContainer">
            <Navbar onToggleSidebar={setCollapsed} />
            <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
                <div className="lead-opportunity-view">
                    <Card className="mb-4">
                        <Card.Header className="s-LeadOppView-modal-header">
                            <h2>Edit Customer Details</h2>

                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleCustomerSubmit}>
                                {message && <div className="alert alert-info">{message}</div>}
                                <Row>
                                    <Col md={5}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5>Customer Details</h5>
                                            {!editCustomerMode ? (
                                                <Button
                                                    variant="primary"
                                                    type="button" // Prevents form submission
                                                    onClick={() => setEditCustomerMode(true)} // Only enables edit mode
                                                >
                                                    Edit
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        type="submit" // Submits the form
                                                    >
                                                        Update
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        type="button" // Prevents form submission
                                                        onClick={() => setEditCustomerMode(false)} // Cancels edit mode
                                                        style={{ marginLeft: "10px" }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                        {loading ? (
                                            <p>Loading customer details...</p>
                                        ) : error ? (
                                            <p style={{ color: "red" }}>{error}</p>
                                        ) : customer ? (
                                            <>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Customer Id</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={customer.id ? `CUS${String(customer.id).padStart(4, '0')}` : "N/A"}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="name"
                                                                value={customer.name || ""}
                                                                onChange={handleCustomerChange}
                                                                disabled={!editCustomerMode}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label><FaPhone /> Phone Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="phone_number"
                                                                value={customer.phone_number || ""}
                                                                onChange={handleCustomerChange}
                                                                disabled={!editCustomerMode}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label><FaEnvelope /> Email</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                name="email"
                                                                value={customer.email || ""}
                                                                onChange={handleCustomerChange}
                                                                disabled={!editCustomerMode}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </>
                                        ) : (
                                            <p>No customer data found.</p>
                                        )}
                                        <hr />
                                        <h5>Opportunity Details</h5>
                                        <h5>History</h5>
                                        {Array.isArray(travelOpportunity) && travelOpportunity.length > 0 ? (
                                            <Accordion
                                                defaultActiveKey="0"
                                                activeKey={activeKey}
                                                onSelect={(key) => setActiveKey(key)}
                                            >
                                                {travelOpportunity.map((trip, index) => (
                                                    <Accordion.Item eventKey={index.toString()} key={index}>
                                                        <Accordion.Header>
                                                            <div className="d-flex justify-content-between align-items-center w-100">
                                                                <span>
                                                                    Booked {trip.destination} on {new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                                                                </span>
                                                                {!editOpportunityMode[index] ? (
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={(e) => handleEditOpportunity(index, e)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            variant="success"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleOpportunitySubmit(index);
                                                                            }}
                                                                            style={{ marginRight: "5px" }}
                                                                        >
                                                                            Update
                                                                        </Button>
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCancelOpportunity(index);
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </Accordion.Header>
                                                        <Accordion.Body>
                                                            <Row>
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>Destination</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            name="destination"
                                                                            value={trip.destination || ""}
                                                                            onChange={(e) => handleOpportunityChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>Start Date</Form.Label>
                                                                        <Form.Control
                                                                            type="date"
                                                                            name="start_date"
                                                                            value={trip.start_date || ""}
                                                                            onChange={(e) => handleOpportunityChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                            min={new Date().toISOString().split("T")[0]} // Disable past dates
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>End Date</Form.Label>
                                                                        <Form.Control
                                                                            type="date"
                                                                            name="end_date"
                                                                            value={trip.end_date || ""}
                                                                            onChange={(e) => handleOpportunityChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                            min={trip.start_date} // Dynamically set min to start_date
                                                                        />
                                                                    </Form.Group>
                                                                </Col>

                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>Duration</Form.Label>

                                                                        <Form.Control
                                                                            type="text"
                                                                            name="duration"
                                                                            value={trip.duration || ""}
                                                                            onChange={(e) => handleOpportunityChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                            min="1"
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>Adults</Form.Label>
                                                                        <Form.Control
                                                                            type="number"
                                                                            name="adults_count"
                                                                            value={trip.adults_count || ""}
                                                                            onChange={(e) => handleOpportunityChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>Children</Form.Label>
                                                                        <Form.Control
                                                                            type="number"
                                                                            name="children_count"
                                                                            value={trip.children_count || ""}
                                                                            onChange={(e) => handleChildrenCountChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                            min="0"
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                {/* Dynamic Child Age Dropdowns */}
                                                                {Array.from({ length: trip.children_count }).map((_, childIndex) => (
                                                                    <Col md={6} key={childIndex}>
                                                                        <Form.Group>
                                                                            <Form.Label>Child Age {childIndex + 1}</Form.Label>
                                                                            <Form.Select
                                                                                value={trip.child_ages[childIndex] || ''}
                                                                                onChange={(e) => handleChildAgeChange(index, childIndex, e.target.value)}
                                                                                disabled={!editOpportunityMode[index]}
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
                                                                ))}                                                          <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label>Approx Budget</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            name="approx_budget"
                                                                            value={trip.approx_budget || ""}
                                                                            onChange={(e) => handleOpportunityChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col md={12}>
                                                                    <Form.Group>
                                                                        <Form.Label>Reminder Setting</Form.Label>
                                                                        <Form.Control
                                                                            type="date"
                                                                            name="reminder_setting"
                                                                            value={trip.reminder_setting || ""}
                                                                            onChange={(e) => handleOpportunityChange(index, e)}
                                                                            disabled={!editOpportunityMode[index]}
                                                                            min={new Date().toISOString().split("T")[0]} // Disable past dates
                                                                            max={trip.start_date} // Disable dates after start date
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Accordion.Body>
                                                    </Accordion.Item>
                                                ))}
                                            </Accordion>
                                        ) : (
                                            <p>No travel opportunities available.</p>
                                        )}
                                    </Col>
                                    <Col md={3}>
                                        <h5>Additional Details</h5>
                                        <Form.Group>
                                            <Form.Label>Status</Form.Label>
                                            <Form.Control type="text" value="Confirmed" disabled />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Recent Quote</Form.Label>
                                            <Form.Control type="text" value="Qu0003" disabled />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Amount Paid</Form.Label>
                                            <Form.Control type="text" value="10000" disabled />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Amount Due</Form.Label>
                                            <Form.Control type="text" value="5000" disabled />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Reminder Date</Form.Label>
                                            <Form.Control type="date" value="2025-02-05" disabled />
                                        </Form.Group>
                                    </Col>
                                    {travelOpportunity.length > 0 && activeKey !== null ? (
                                        <Col md={4}>
                                            <h5>Customer Interaction Log</h5>
                                            <Form.Group>
                                                <Form.Label>Notes</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="notes"
                                                    value={travelOpportunity[activeKey]?.notes || ""}
                                                    onChange={(e) => handleOpportunityChange(activeKey, e)}
                                                    disabled={!editOpportunityMode[activeKey]}
                                                />
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>Comments</Form.Label>
                                                {travelOpportunity[activeKey]?.comments?.length > 0 ? (
                                                    travelOpportunity[activeKey].comments.map((comment, index) => (
                                                        <div key={index} className="comment" style={{ marginBottom: "10px" }}>
                                                            <p>
                                                                <strong>{comment.name}</strong> (
                                                                {new Date(comment.timestamp).toLocaleString("en-IN", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    second: "2-digit",
                                                                    hour12: true,
                                                                })}
                                                                )
                                                            </p>
                                                            <p>{comment.text}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No comments available</p>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    ) : null}
                                </Row>
                                <Card.Footer className="s-LeadOppView-footer">
                                    <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
                                </Card.Footer>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditLeadOppView;