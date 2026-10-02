import React from 'react';
import { LogOut, Shield, UserCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function TopNavbar({ 
  currentTab, 
  currentUser, 
  onLogout,
  theme,
  onToggleTheme
}) {
  const getTitles = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Monitor workforce operations, leave requests, and departmental activities.'
        };
      case 'employees':
        return {
          title: 'Employees Directory',
          subtitle: 'Manage employee master records stored in SAP table ZEMPLY_MNG_DBTAB.'
        };
      case 'leaves':
        return {
          title: 'Leave Requests Desk',
          subtitle: 'Process and approve or reject employee leave requests via SAP NetWeaver Gateway.'
        };
      case 'self_service':
        return {
          title: 'Employee Self-Service',
          subtitle: 'Personal profile, apply for leave, and view live application status.'
        };
      case 'analytics':
        return {
          title: 'Workforce Analytics',
          subtitle: 'Detailed metrics and distribution across IT service departments.'
        };
      case 'architecture':
        return {
          title: 'SAP System Architecture Explorer',
          subtitle: 'Technical specification of SE11 tables, SEGW OData service, and Node.js BFF.'
        };
      default:
        return {
          title: 'Employee Management',
          subtitle: 'Manage workforce operations efficiently.'
        };
    }
  };

  const { title, subtitle } = getTitles();
  const userName = currentUser?.name || currentUser?.userId || 'Arbab Rizvi';
  const userRole = currentUser?.role === 'admin' ? 'HR Admin' : 'Employee';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="top-navbar">
      <div className="navbar-titles">
        <h1 className="navbar-title">{title}</h1>
        <p className="navbar-subtitle">{subtitle}</p>
      </div>

      <div className="navbar-actions">
        {/* Light / Dark Mode Switcher */}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        {/* User Profile Pill */}
        <div className="user-profile-pill">
          <div className="user-avatar-circle">
            {initial}
          </div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>

        {/* Logout Button (Styled with soft red container like the screenshot) */}
        <button
          type="button"
          className="navbar-logout-btn"
          onClick={onLogout}
          title="Sign out of SAP Session"
          aria-label="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
