import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || null);
  const [userMobile, setUserMobile] = useState(localStorage.getItem('userMobile') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [assignManager, setAssignManager] = useState(localStorage.getItem('assignManager') || null);
  const [managerId, setManagerId] = useState(localStorage.getItem('managerId') || null);

  const login = (token, id, name, mobile, email, role, assign_manager, managerId) => {
    setAuthToken(token);
    setUserId(id);
    setUserName(name);
    setUserMobile(mobile);
    setUserEmail(email);
    setUserRole(role);
    setAssignManager(assign_manager);
    setManagerId(managerId);

    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('userMobile', mobile);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    localStorage.setItem('assignManager', assign_manager);
    localStorage.setItem('managerId', managerId);
  };

  const logout = () => {
    setAuthToken(null);
    setUserId(null);
    setUserName(null);
    setUserMobile(null);
    setUserEmail(null);
    setUserRole(null);
    setAssignManager(null);
    setManagerId(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('assignManager');
    localStorage.removeItem('managerId');
  };

  useEffect(() => {
    setAuthToken(localStorage.getItem('authToken'));
    setUserId(localStorage.getItem('userId'));
    setUserName(localStorage.getItem('userName'));
    setUserMobile(localStorage.getItem('userMobile'));
    setUserEmail(localStorage.getItem('userEmail'));
    setUserRole(localStorage.getItem('userRole'));
    setAssignManager(localStorage.getItem('assignManager'));
    setManagerId(localStorage.getItem('managerId'));
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, userId, userName, userMobile, userEmail, userRole, assignManager, managerId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};