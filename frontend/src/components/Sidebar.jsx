import React from 'react';
import { 
  LayoutDashboard, Users, CalendarCheck, UserCheck, 
  BarChart3, Layers, HelpCircle, Database
} from 'lucide-react';

export function Sidebar({ 
  currentTab, 
  onSelectTab, 
  pendingLeavesCount = 0,
  onOpenHelp
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      badge: null
    },
    {
      id: 'leaves',
      label: 'Leave Requests',
      icon: CalendarCheck,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : null
    },
    {
      id: 'self_service',
      label: 'Self-Service',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: Layers,
      badge: 'RAP'
    }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Database size={22} />
        </div>
        <div className="sidebar-brand-text">
          <h2>SAP Workforce</h2>
          <span>Management System</span>
        </div>
      </div>

      {/* Main Menu Label */}
      <div className="sidebar-section-title">
        MAIN MENU
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={19} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.id === 'leaves' ? 'nav-badge-amber' : 'nav-badge-blue'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Help / System Info Box (matches screenshot) */}
      <div className="sidebar-footer">
        <div className="sidebar-help-card">
          <div className="help-icon-wrap">
            <HelpCircle size={18} />
          </div>
          <div className="help-content">
            <h4>Need Help?</h4>
            <p>SAP BTP / RAP Cloud</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
