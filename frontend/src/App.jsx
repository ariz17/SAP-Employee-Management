import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { LeaveRequestsView } from './components/LeaveRequestsView';
import { SelfServiceView } from './components/SelfServiceView';
import { NotificationsView } from './components/NotificationsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ArchitectureView } from './components/ArchitectureView';
import { LoginScreen } from './components/LoginScreen';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { GiveRaiseModal } from './components/GiveRaiseModal';
import { LeaveManagementModal } from './components/LeaveManagementModal';
import { SendMessageModal } from './components/SendMessageModal';
import { getStoredJwtToken, saveJwtToken, removeJwtToken, decodeJwtToken } from './utils/jwtAuth';

export function App() {
  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('sap_app_theme');
      return savedTheme || 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sap_app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Authentication session state based on JWT
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = getStoredJwtToken();
      if (token) {
        const decoded = decodeJwtToken(token);
        if (decoded) {
          return { ...decoded, token };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Active section tab: 'dashboard' | 'employees' | 'leaves' | 'self_service' | 'analytics' | 'architecture'
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Load persisted state or empty array (100% live SAP data only)
  const [employees, setEmployees] = useState(() => {
    try {
      // Purge old mock data caches if any
      localStorage.removeItem('sap_workforce_employees');
      localStorage.removeItem('sap_workforce_employees_v2');

      const saved = localStorage.getItem('sap_workforce_employees_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only use if it has real SAP employee names
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some(e => e.Name && e.Name.includes('Parag'))) {
          return parsed.map(emp => ({
            ...emp,
            Leaves: (emp.Leaves || []).filter(l => Boolean(l && l.StartDate && l.EndDate))
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedForRaise, setSelectedForRaise] = useState(null);
  const [selectedForLeaves, setSelectedForLeaves] = useState(null);
  const [selectedForMessage, setSelectedForMessage] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Active employee for self-service & notification preview
  const [simulatedEmpId, setSimulatedEmpId] = useState('100101');

  // Notifications state (only user-triggered actions, deduplicated)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('sap_workforce_notifications_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seen = new Set();
          const clean = [];
          parsed.filter(n => !n.id.startsWith('notif_100101_')).forEach(n => {
            const key = `${n.empid}_${n.type}_${n.message}`;
            if (!seen.has(key)) {
              seen.add(key);
              clean.push(n);
            }
          });
          return clean;
        }
      }
    } catch {}
    return [];
  });

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sap_workforce_notifications_v1', JSON.stringify(notifications));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [notifications]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(employees));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [employees]);

  const backendBase = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? '' : 'https://sap-employee-backend.onrender.com');

  // Helper: Merge remote employee data with existing local state/localStorage
  // Ensures leave requests and approval/rejection statuses are NEVER wiped out on reload
  const mergeEmployeesWithLocal = (remoteList, currentList) => {
    if (!Array.isArray(remoteList) || remoteList.length === 0) return currentList;
    if (!Array.isArray(currentList) || currentList.length === 0) return remoteList;

    const currentMap = new Map(currentList.map(e => [e.Empid, e]));

    const merged = remoteList.map(remoteEmp => {
      const localEmp = currentMap.get(remoteEmp.Empid);
      if (!localEmp) return remoteEmp;

      const localLeaves = Array.isArray(localEmp.Leaves) ? localEmp.Leaves : [];
      const remoteLeaves = Array.isArray(remoteEmp.Leaves) ? remoteEmp.Leaves : [];

      const leaveMap = new Map();

      // Start with remote leaves
      remoteLeaves.forEach(l => {
        if (l && l.LeaveId) leaveMap.set(l.LeaveId, l);
      });

      // Overlay local leaves (preserve locally submitted requests and approved/rejected decisions)
      localLeaves.forEach(localL => {
        if (!localL || !localL.LeaveId) return;
        const remoteL = leaveMap.get(localL.LeaveId);
        if (!remoteL) {
          // Leave exists locally but remote doesn't have it yet -> retain it
          leaveMap.set(localL.LeaveId, localL);
        } else {
          // If either local or remote has a processed status (APPROVED/REJECTED), preserve that status
          if (localL.Status === 'APPROVED' || localL.Status === 'REJECTED') {
            leaveMap.set(localL.LeaveId, { ...remoteL, ...localL, Status: localL.Status, HrComment: localL.HrComment || remoteL.HrComment || '' });
          } else if (remoteL.Status === 'APPROVED' || remoteL.Status === 'REJECTED') {
            leaveMap.set(localL.LeaveId, { ...localL, ...remoteL, HrComment: remoteL.HrComment || localL.HrComment || '' });
          } else {
            leaveMap.set(localL.LeaveId, { ...remoteL, ...localL, HrComment: localL.HrComment || remoteL.HrComment || '' });
          }
        }
      });

      return {
        ...remoteEmp,
        ...localEmp, // keep any local raises or status toggles
        Leaves: Array.from(leaveMap.values()).filter(l => Boolean(l && l.StartDate && l.EndDate))
      };
    });

    // Also preserve any locally created employees not in remote list
    const remoteIds = new Set(remoteList.map(e => e.Empid));
    currentList.forEach(localEmp => {
      if (!remoteIds.has(localEmp.Empid)) {
        merged.push(localEmp);
      }
    });

    return merged;
  };

  // Background helper to sync leave status to backend
  const syncLeaveStatusToBackend = async (empid, leaveId, status, hrComment = '') => {
    const primaryUrl = backendBase ? `${backendBase}/api/employees/${empid}/leave/${leaveId}` : `/api/employees/${empid}/leave/${leaveId}`;
    try {
      const res = await fetch(primaryUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, hrComment })
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('Sync leave status failed:', e.message);
    }
  };

  // Background helper to sync newly created leave to backend
  const syncNewLeaveToBackend = async (empid, newLeave) => {
    const primaryUrl = backendBase ? `${backendBase}/api/employees/${empid}/leave` : `/api/employees/${empid}/leave`;
    try {
      const res = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave)
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('Sync new leave failed:', e.message);
    }
  };

  // -----------------------------------------------------------------------
  // Fetch live data directly from SAP NetWeaver Gateway (ABAP)
  // -----------------------------------------------------------------------
  useEffect(() => {
    async function loadEmployees() {
      // 1. Fetch from Node.js BFF / API Gateway (which queries SAP OData live)
      try {
        const response = await fetch(`${backendBase}/api/employees`);
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.data)) {
            setEmployees(prev => {
              const merged = mergeEmployeesWithLocal(prev, resData.data);
              try { localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(merged)); } catch {}
              return merged;
            });
            console.log(`✅ Loaded ${resData.data.length} employees directly from live SAP ABAP backend!`);
            return;
          }
        }
      } catch (backendErr) {
        console.warn('Backend API not reachable, attempting direct SAP Gateway proxy...', backendErr.message);
      }

      // 2. Direct SAP Gateway OData call via Vite proxy
      try {
        const SAP_USER = 'GLBI-100';
        const SAP_PASSWORD = 'Bt@123';
        const headers = {
          'Accept': 'application/json',
          'Authorization': 'Basic ' + btoa(`${SAP_USER}:${SAP_PASSWORD}`)
        };

        const [empRes, leaveRes] = await Promise.all([
          fetch('/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet?$format=json', { headers }),
          fetch('/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/LeaveRequestCollection?$format=json', { headers })
        ]);

        if (empRes.ok) {
          const empData = await empRes.json();
          const rawEmps = empData?.d?.results || [];

          let rawLeaves = [];
          if (leaveRes.ok) {
            const leaveData = await leaveRes.json();
            rawLeaves = leaveData?.d?.results || [];
          }

          const leavesByEmp = {};
          rawLeaves.forEach(l => {
            const empId = String(l.Empid || l.EMPID || '').trim();
            if (!leavesByEmp[empId]) leavesByEmp[empId] = [];
            leavesByEmp[empId].push({
              LeaveId: String(l.LeaveId || l.LEAVE_ID || '').trim(),
              Empid: empId,
              LeaveType: String(l.LeaveType || l.LEAVE_TYPE || 'Annual Vacation').trim(),
              StartDate: l.StartDate || '',
              EndDate: l.EndDate || '',
              DaysCount: parseInt(l.DaysCount || l.DAYS_COUNT, 10) || 1,
              Reason: String(l.Reason || l.REASON || '').trim(),
              Status: String(l.Status || l.STATUS || 'PENDING').trim()
            });
          });

          const sapEmployees = rawEmps.map(emp => {
            const empId = String(emp.Empid || emp.EMPID || '').trim();
            return {
              Empid: empId,
              Name: String(emp.Name || emp.NAME || '').trim(),
              Email: String(emp.Email || emp.EMAIL || '').trim(),
              Dept: String(emp.Dept || emp.DEPT || 'IT Consulting').trim(),
              Salary: parseFloat(emp.Salary || emp.SALARY) || 0,
              Status: String(emp.Status || emp.STATUS || 'ACTIVE').trim(),
              Joindate: '2023-01-15',
              Leaves: leavesByEmp[empId] || []
            };
          });

          setEmployees(sapEmployees);
          try { localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(sapEmployees)); } catch {}
          console.log(`✅ Loaded ${sapEmployees.length} employees directly from SAP Gateway proxy!`);
        }
      } catch (err) {
        console.warn('⚠️ Direct SAP Gateway fallback notice:', err.message);
      }
    }

    loadEmployees();
  }, []); // runs once when the app opens

  // Load initial notifications from backend API with strict deduplication
  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch(`${backendBase}/api/notifications`);
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.data)) {
            const cleanRemote = resData.data.filter(n => !n.id.startsWith('notif_100101_'));
            setNotifications(prev => {
              const seen = new Set();
              const unique = [];
              const localReadMap = new Map(prev.map(p => [p.id, p.read]));

              for (const item of cleanRemote) {
                const key = `${item.empid}_${item.type}_${item.message}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  const isRead = localReadMap.has(item.id) ? localReadMap.get(item.id) : item.read;
                  unique.push({ ...item, read: isRead });
                }
              }

              for (const localItem of prev) {
                if (localItem.id.startsWith('notif_100101_')) continue;
                const key = `${localItem.empid}_${localItem.type}_${localItem.message}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  unique.push(localItem);
                }
              }

              unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
              return unique;
            });
          }
        }
      } catch (err) {
        console.warn('Backend notification fetch notice:', err.message);
      }
    }
    loadNotifications();
  }, [backendBase]);


  // Handle Login via JWT
  const handleLogin = ({ token, user }) => {
    saveJwtToken(token);
    setCurrentUser({ ...user, token });
    if (user.role === 'employee') {
      setCurrentTab('self_service');
      setSimulatedEmpId(user.empid || '100101');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    removeJwtToken();
    setCurrentUser(null);
  };

  // Handler: Add Employee (RAP Create)
  const handleAddEmployee = async (newEmpData) => {
    const newId = (100100 + employees.length + 1).toString();
    const created = {
      Empid: newId,
      ...newEmpData,
      Leaves: []
    };
    setEmployees(prev => {
      const updated = [created, ...prev];
      try { localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await fetch(`${backendBase}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err.message);
    }
  };

  // Handler: RAP Action giveRaise
  const handleApplyRaise = async (empid, percentage, reason) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.Empid === empid) {
        const currentSalary = parseFloat(emp.Salary) || 0;
        const updatedSalary = Math.round(currentSalary * (1 + (percentage / 100)));
        return {
          ...emp,
          Salary: updatedSalary
        };
      }
      return emp;
    }));

    try {
      await fetch(`${backendBase}/api/employees/${empid}/raise`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage, reason })
      });
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err.message);
    }

    // Automatically trigger notification for target employee
    const targetEmp = employees.find(e => e.Empid === empid);
    const updatedSalary = targetEmp ? Math.round((parseFloat(targetEmp.Salary) || 0) * (1 + (percentage / 100))) : 0;
    dispatchNotification({
      empid,
      type: 'SALARY_RAISE',
      title: `Salary Increment Applied (+${percentage}%)`,
      message: `Congratulations! HR has approved a ${percentage}% increment on your compensation. Your new monthly salary is ₹${updatedSalary.toLocaleString('en-IN')}.${reason ? ` Note: "${reason}"` : ''}`,
      sender: currentUser?.name ? `${currentUser.name} (HR)` : 'HR Administration Desk',
      priority: 'HIGH',
      metadata: { percentage, newSalary: updatedSalary, reason }
    });
  };

  // Handler: RAP Action changeStatus (Cycles ACTIVE -> ON_LEAVE -> INACTIVE)
  const handleToggleStatus = async (empid) => {
    let nextStatus = 'ACTIVE';
    setEmployees(prev => prev.map(emp => {
      if (emp.Empid === empid) {
        if (emp.Status === 'ACTIVE') nextStatus = 'ON_LEAVE';
        else if (emp.Status === 'ON_LEAVE') nextStatus = 'INACTIVE';
        else nextStatus = 'ACTIVE';
        return { ...emp, Status: nextStatus };
      }
      return emp;
    }));

    try {
      await fetch(`${backendBase}/api/employees/${empid}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err.message);
    }
  };

  // Handler: Delete Employee
  const handleDeleteEmployee = async (empid) => {
    if (confirm(`Confirm deletion of employee record ${empid}?`)) {
      setEmployees(prev => prev.filter(e => e.Empid !== empid));

      try {
        await fetch(`${backendBase}/api/employees/${empid}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Backend sync failed, saved locally:', err.message);
      }
    }
  };

  // Handler: RAP Action approveLeave (Accept)
  const handleApproveLeave = async (empid, leaveId, hrComment = '') => {
    setEmployees(prev => {
      const updated = prev.map(emp => {
        if (emp.Empid === empid) {
          const updatedLeaves = (emp.Leaves || []).map(leave => {
            if (leave.LeaveId === leaveId) {
              return { ...leave, Status: 'APPROVED', HrComment: hrComment };
            }
            return leave;
          });
          return { ...emp, Leaves: updatedLeaves };
        }
        return emp;
      });
      try {
        localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(updated));
      } catch (e) {
        console.error("Storage error", e);
      }
      return updated;
    });

    if (selectedForLeaves && selectedForLeaves.Empid === empid) {
      setSelectedForLeaves(prev => ({
        ...prev,
        Leaves: (prev.Leaves || []).map(l => l.LeaveId === leaveId ? { ...l, Status: 'APPROVED', HrComment: hrComment } : l)
      }));
    }

    // Background sync to backend
    syncLeaveStatusToBackend(empid, leaveId, 'APPROVED', hrComment);

    // Automatically trigger notification for target employee
    dispatchNotification({
      empid,
      type: 'LEAVE_STATUS',
      title: 'Leave Request Approved',
      message: `Your leave request (#${leaveId}) has been APPROVED by HR Desk.${hrComment ? ` HR Note: "${hrComment}"` : ''}`,
      sender: currentUser?.name ? `${currentUser.name} (HR)` : 'HR Desk',
      priority: 'HIGH',
      metadata: { leaveId, status: 'APPROVED', hrComment }
    });
  };

  // Handler: RAP Action rejectLeave (Reject)
  const handleRejectLeave = async (empid, leaveId, hrComment = '') => {
    setEmployees(prev => {
      const updated = prev.map(emp => {
        if (emp.Empid === empid) {
          const updatedLeaves = (emp.Leaves || []).map(leave => {
            if (leave.LeaveId === leaveId) {
              return { ...leave, Status: 'REJECTED', HrComment: hrComment };
            }
            return leave;
          });
          return { ...emp, Leaves: updatedLeaves };
        }
        return emp;
      });
      try {
        localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(updated));
      } catch (e) {
        console.error("Storage error", e);
      }
      return updated;
    });

    if (selectedForLeaves && selectedForLeaves.Empid === empid) {
      setSelectedForLeaves(prev => ({
        ...prev,
        Leaves: (prev.Leaves || []).map(l => l.LeaveId === leaveId ? { ...l, Status: 'REJECTED', HrComment: hrComment } : l)
      }));
    }

    // Background sync to backend
    syncLeaveStatusToBackend(empid, leaveId, 'REJECTED', hrComment);

    // Automatically trigger notification for target employee
    dispatchNotification({
      empid,
      type: 'LEAVE_STATUS',
      title: 'Leave Request Declined',
      message: `Your leave request (#${leaveId}) has been REJECTED by HR Desk.${hrComment ? ` Reason: "${hrComment}"` : ''}`,
      sender: currentUser?.name ? `${currentUser.name} (HR)` : 'HR Desk',
      priority: 'HIGH',
      metadata: { leaveId, status: 'REJECTED', hrComment }
    });
  };

  // Handler: Add Leave Request (Composition child create)
  const handleAddLeave = async (empid, leaveData) => {
    const newLeaveId = '00000' + (10000 + Math.floor(Math.random() * 90000)).toString();
    const newLeave = {
      LeaveId: newLeaveId,
      Empid: empid,
      Status: 'PENDING',
      ...leaveData
    };

    setEmployees(prev => {
      const updated = prev.map(emp => {
        if (emp.Empid === empid) {
          return {
            ...emp,
            Leaves: [newLeave, ...(emp.Leaves || [])]
          };
        }
        return emp;
      });
      try {
        localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(updated));
      } catch (e) {
        console.error("Storage error", e);
      }
      return updated;
    });

    if (selectedForLeaves && selectedForLeaves.Empid === empid) {
      setSelectedForLeaves(prev => ({
        ...prev,
        Leaves: [newLeave, ...(prev.Leaves || [])]
      }));
    }

    // Persist to backend so it survives refresh, logout, and appears in HR Leave Requests
    await syncNewLeaveToBackend(empid, newLeave);
  };

  // Reload fresh live workforce data from SAP NetWeaver Gateway
  const handleResetData = async () => {
    if (confirm("Refresh live workforce data directly from SAP NetWeaver Gateway (ABAP)?")) {
      localStorage.removeItem('sap_workforce_employees_v3');
      try {
        const response = await fetch(`${backendBase}/api/employees`);
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.data)) {
            setEmployees(resData.data);
            localStorage.setItem('sap_workforce_employees_v3', JSON.stringify(resData.data));
          }
        }
      } catch (err) {
        console.warn('Backend refresh failed:', err.message);
      }
    }
  };

  // Notification Dispatcher & Handlers (Strictly single delivery)
  const dispatchNotification = async ({ empid, type, title, message, sender, priority = 'NORMAL', metadata = {} }) => {
    const notifId = 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newNotif = {
      id: notifId,
      empid: String(empid).trim(),
      type,
      title,
      message,
      sender: sender || (currentUser?.name ? `${currentUser.name} (HR)` : 'HR Administration Desk'),
      priority,
      timestamp: new Date().toISOString(),
      read: false,
      metadata
    };

    setNotifications(prev => {
      // Prevent duplicate insertion of identical notification
      const exists = prev.some(n => 
        n.id === newNotif.id || 
        (n.empid === newNotif.empid && n.type === newNotif.type && n.message === newNotif.message)
      );
      if (exists) return prev;
      return [newNotif, ...prev];
    });

    try {
      await fetch(`${backendBase}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif)
      });
    } catch (err) {
      console.warn('Backend notification sync failed, preserved locally:', err.message);
    }
  };

  const handleMarkNotificationAsRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    try {
      await fetch(`${backendBase}/api/notifications/${notifId}/read`, { method: 'PATCH' });
    } catch (err) {
      console.warn('Backend mark-read failed:', err.message);
    }
  };

  const handleMarkAllNotificationsAsRead = async (empid) => {
    setNotifications(prev => prev.map(n => {
      if (!empid || String(n.empid).trim() === String(empid).trim()) {
        return { ...n, read: true };
      }
      return n;
    }));
    try {
      await fetch(`${backendBase}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empid })
      });
    } catch (err) {
      console.warn('Backend mark-all-read failed:', err.message);
    }
  };

  const handleSendDirectMessage = async ({ empid, subject, message, priority }) => {
    await dispatchNotification({
      empid,
      type: 'HR_MESSAGE',
      title: subject || 'Direct Message from HR',
      message,
      sender: currentUser?.name ? `${currentUser.name} (HR)` : 'HR Administration Desk',
      priority,
      metadata: { subject }
    });
  };

  // Pending leaves count for sidebar badge
  const pendingLeavesCount = employees.reduce((acc, emp) => {
    return acc + (emp.Leaves ? emp.Leaves.filter(l => l.Status === 'PENDING').length : 0);
  }, 0);

  // Active Employee Record for Self-Service & Notifications
  const activeEmpRecord = employees.find(e => e.Empid === (currentUser?.role === 'employee' ? currentUser.empid : simulatedEmpId)) || employees[0];
  const activeEmpId = activeEmpRecord?.Empid || '100101';

  // Unread notifications count for sidebar badge
  const unreadNotificationsCount = notifications.filter(n => {
    if (currentUser?.role === 'employee') {
      return String(n.empid).trim() === String(currentUser.empid).trim() && !n.read;
    }
    return String(n.empid).trim() === String(activeEmpId).trim() && !n.read;
  }).length;

  // If not logged in, render the clean split-card LoginScreen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} employees={employees} />;
  }

  return (
    <div className="portal-app-layout">
      {/* Left Sidebar (Role-based) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingLeavesCount={pendingLeavesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenHelp={() => setCurrentTab('architecture')}
        userRole={currentUser?.role}
      />

      {/* Main Workspace Column */}
      <div className="portal-main-area">
        {/* Top Navbar with Dynamic Title, Light/Dark toggle, User Profile */}
        <TopNavbar
          currentTab={currentTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Tab Views (Role-protected) */}
        <main className="portal-page-body">
          {currentUser?.role !== 'employee' && currentTab === 'dashboard' && (
            <DashboardView
              employees={employees}
              onNavigate={setCurrentTab}
            />
          )}

          {currentUser?.role !== 'employee' && currentTab === 'employees' && (
            <EmployeesView
              employees={employees}
              onOpenAddModal={() => setIsAddOpen(true)}
              onOpenRaiseModal={setSelectedForRaise}
              onOpenLeavesModal={setSelectedForLeaves}
              onOpenMessageModal={(emp) => {
                setSelectedForMessage(emp);
                setIsMessageModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onDeleteEmployee={handleDeleteEmployee}
              onResetData={handleResetData}
            />
          )}

          {currentUser?.role !== 'employee' && currentTab === 'leaves' && (
            <LeaveRequestsView
              employees={employees}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView
              currentEmployee={activeEmpRecord}
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              employees={employees}
              onSwitchEmployee={setSimulatedEmpId}
              userRole={currentUser?.role}
            />
          )}

          {(currentTab === 'self_service' || (currentUser?.role === 'employee' && currentTab !== 'architecture' && currentTab !== 'notifications')) && (
            <SelfServiceView
              currentEmployee={activeEmpRecord}
              employees={employees}
              onApplyLeave={handleAddLeave}
              onSwitchEmployee={setSimulatedEmpId}
            />
          )}

          {currentUser?.role !== 'employee' && currentTab === 'analytics' && (
            <AnalyticsView employees={employees} />
          )}

          {currentTab === 'architecture' && (
            <ArchitectureView />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <GiveRaiseModal
        isOpen={!!selectedForRaise}
        employee={selectedForRaise}
        onClose={() => setSelectedForRaise(null)}
        onApplyRaise={handleApplyRaise}
      />

      <LeaveManagementModal
        isOpen={!!selectedForLeaves}
        employee={selectedForLeaves}
        onClose={() => setSelectedForLeaves(null)}
        onApproveLeave={handleApproveLeave}
        onRejectLeave={handleRejectLeave}
        onAddLeave={handleAddLeave}
      />

      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => {
          setIsMessageModalOpen(false);
          setSelectedForMessage(null);
        }}
        employee={selectedForMessage}
        employees={employees}
        onSendMessage={handleSendDirectMessage}
      />
    </div>
  );
}
