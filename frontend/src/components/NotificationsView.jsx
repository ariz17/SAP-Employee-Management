import React, { useState, useMemo } from 'react';
import { 
  Bell, CheckCheck, TrendingUp, CheckCircle2, XCircle, 
  MessageSquare, Clock, Filter, ShieldCheck, MailOpen,
  ArrowUpRight, AlertCircle, Sparkles
} from 'lucide-react';

export function NotificationsView({ 
  currentEmployee, 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead,
  employees = [],
  onSwitchEmployee,
  userRole = 'employee'
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'

  // Filter notifications for active employee
  const empNotifications = useMemo(() => {
    if (!currentEmployee) return [];
    return notifications.filter(n => String(n.empid).trim() === String(currentEmployee.Empid).trim());
  }, [notifications, currentEmployee]);

  // Counts
  const unreadCount = useMemo(() => {
    return empNotifications.filter(n => !n.read).length;
  }, [empNotifications]);

  const readCount = useMemo(() => {
    return empNotifications.filter(n => n.read).length;
  }, [empNotifications]);

  // Filtered list
  const filteredList = useMemo(() => {
    return empNotifications.filter(item => {
      if (filterType === 'UNREAD') return !item.read;
      if (filterType === 'READ') return item.read;
      return true;
    });
  }, [empNotifications, filterType]);

  // Format timestamp nicely
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="view-content-wrapper">
      {/* Top Header Row */}
      <div className="view-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="view-page-title" style={{ margin: 0 }}>Notifications & Communications</h2>
            {unreadCount > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, #0a6ed1, #2563eb)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 2px 6px rgba(10, 110, 209, 0.3)'
              }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="view-page-subtitle">
            Live updates on your salary raises, leave approvals, and personal memos from HR.
          </p>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Switch Employee Dropdown (if viewing as Admin or tester) */}
          {userRole !== 'employee' && employees.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Viewing:</span>
              <select
                value={currentEmployee?.Empid}
                onChange={(e) => onSwitchEmployee && onSwitchEmployee(e.target.value)}
                className="clean-select"
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                {employees.map(emp => (
                  <option key={emp.Empid} value={emp.Empid}>
                    {emp.Name} ({emp.Empid})
                  </option>
                ))}
              </select>
            </div>
          )}

          {unreadCount > 0 && (
            <button
              type="button"
              className="btn-refresh-data"
              onClick={() => onMarkAllAsRead(currentEmployee?.Empid)}
              title="Mark all notifications as read"
              style={{ padding: '8px 14px' }}
            >
              <CheckCheck size={16} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Overview Pill */}
      {currentEmployee && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem'
            }}>
              {currentEmployee.Name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {currentEmployee.Name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Employee ID: <code>{currentEmployee.Empid}</code></span>
                <span style={{ margin: '0 6px' }}>•</span>
                <span>{currentEmployee.Dept}</span>
                <span style={{ margin: '0 6px' }}>•</span>
                <span>Current Salary: ₹{(parseFloat(currentEmployee.Salary) || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={13} /> Active SAP Account
            </span>
          </div>
        </div>
      )}

      {/* Main Notifications Card Container */}
      <div className="table-container-card" style={{ padding: '20px' }}>
        {/* Filter Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px',
          marginBottom: '20px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'ALL', label: 'All Notifications', count: empNotifications.length },
            { id: 'UNREAD', label: 'Unread', count: unreadCount },
            { id: 'READ', label: 'Read', count: readCount },
          ].map(tab => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--primary-color)' : '1px solid transparent',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--primary-color)' : 'var(--bg-subtle)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {filteredList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--text-muted)'
            }}>
              <Bell size={26} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-main)' }}>
              No notifications in this view
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {filterType === 'UNREAD' 
                ? "You are all caught up! You have zero unread notifications."
                : (filterType === 'READ' ? "No archived read notifications yet." : "New updates from HR or leave outcomes will appear right here.")}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredList.map((notif) => {
              const isSalary = notif.type === 'SALARY_RAISE';
              const isLeave = notif.type === 'LEAVE_STATUS';
              const isMessage = notif.type === 'HR_MESSAGE';
              const isApproved = notif.metadata?.status === 'APPROVED' || notif.title?.toLowerCase().includes('approved');

              return (
                <div
                  key={notif.id}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    gap: '16px',
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    background: notif.read ? 'var(--bg-subtle)' : 'var(--bg-main)',
                    border: notif.read 
                      ? '1px solid var(--border-subtle)' 
                      : '1px solid rgba(10, 110, 209, 0.35)',
                    boxShadow: notif.read ? 'none' : '0 4px 16px rgba(10, 110, 209, 0.08)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Unread Glow Indicator */}
                  {!notif.read && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      boxShadow: '0 0 8px var(--primary-color)'
                    }} title="Unread notification" />
                  )}

                  {/* Left Type Icon Circle */}
                  <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                    {isSalary && (
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981'
                      }}>
                        <TrendingUp size={20} />
                      </div>
                    )}

                    {isLeave && isApproved && (
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981'
                      }}>
                        <CheckCircle2 size={20} />
                      </div>
                    )}

                    {isLeave && !isApproved && (
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444'
                      }}>
                        <XCircle size={20} />
                      </div>
                    )}

                    {isMessage && (
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(10, 110, 209, 0.15), rgba(56, 189, 248, 0.25))',
                        border: '1px solid rgba(10, 110, 209, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)'
                      }}>
                        <MessageSquare size={20} />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1, paddingRight: '20px' }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSalary 
                          ? 'rgba(16, 185, 129, 0.12)' 
                          : isLeave 
                            ? (isApproved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)')
                            : 'rgba(10, 110, 209, 0.12)',
                        color: isSalary 
                          ? '#10b981' 
                          : isLeave 
                            ? (isApproved ? '#10b981' : '#ef4444')
                            : 'var(--primary-color)'
                      }}>
                        {isSalary ? 'Salary Increment' : isLeave ? 'Leave Decision' : 'Direct HR Memo'}
                      </span>

                      {notif.priority === 'HIGH' && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444'
                        }}>
                          High Priority
                        </span>
                      )}

                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                        <Clock size={12} />
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 style={{
                      margin: '0 0 6px 0',
                      fontSize: '0.98rem',
                      fontWeight: notif.read ? 600 : 700,
                      color: 'var(--text-main)'
                    }}>
                      {notif.title}
                    </h4>

                    {/* Message Body */}
                    <p style={{
                      margin: '0 0 10px 0',
                      fontSize: '0.88rem',
                      color: notif.read ? 'var(--text-muted)' : 'var(--text-main)',
                      lineHeight: '1.5'
                    }}>
                      {notif.message}
                    </p>

                    {/* Dynamic Context Card / Metadata */}
                    {isSalary && notif.metadata && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        fontSize: '0.8rem',
                        color: '#10b981',
                        fontWeight: 600,
                        marginTop: '4px'
                      }}>
                        <span>+{notif.metadata.percentage}% Raise Applied</span>
                        {notif.metadata.newSalary && (
                          <span>• New Salary: ₹{parseFloat(notif.metadata.newSalary).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    )}

                    {isLeave && notif.metadata && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isApproved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: isApproved ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: isApproved ? '#10b981' : '#ef4444',
                        marginTop: '4px'
                      }}>
                        <span>Ref #{notif.metadata.leaveId}</span>
                        <span>• Status: {notif.metadata.status}</span>
                      </div>
                    )}

                    {/* Footer Info & Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        From: <strong>{notif.sender || 'HR Administration'}</strong>
                      </span>

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => onMarkAsRead(notif.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary-color)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MailOpen size={14} />
                          <span>Mark as Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
