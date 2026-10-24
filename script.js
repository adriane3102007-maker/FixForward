(() => {
  'use strict';

  const STORAGE_KEY = 'fixforward_app_v2';
  const STATUSES = ['Pending', 'Under Review', 'Approved', 'In Progress', 'On Hold', 'Resolved', 'Rejected'];
  const CATEGORIES = ['Electrical', 'Plumbing', 'Air Conditioning and Ventilation', 'Furniture and Fixtures', 'Structural Damage', 'Internet and Connectivity', 'Cleaning and Sanitation', 'Other'];
  const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
  const ROLE_NAMES = { student: 'Student', staff: 'Maintenance staff', admin: 'Administrator', guest: 'Guest' };
  const SAMPLE_REPORTS = [
    { id: 'FF-2026-1001', title: 'Leaking faucet near the wash area', category: 'Plumbing', facility: 'Main Building', location: 'Ground Floor · Wash Area', description: 'Water keeps dripping even when the faucet is closed. The floor may become slippery.', priority: 'High', status: 'Pending', date: '2026-10-20T09:40:00.000Z', reporterId: 'student-demo', reporter: 'Alex Morgan', assignedTo: '', photo: '', resolution: '', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-20T09:40:00.000Z' }] },
    { id: 'FF-2026-1002', title: 'Broken chair in Room 204', category: 'Furniture and Fixtures', facility: 'Academic Building', location: 'Room 204', description: 'The backrest is loose and one leg is unstable. Please inspect before the next class.', priority: 'Medium', status: 'In Progress', date: '2026-10-18T11:15:00.000Z', reporterId: 'student-demo', reporter: 'Alex Morgan', assignedTo: 'Jordan Lee', photo: '', resolution: '', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-18T11:15:00.000Z' }, { type: 'status', text: 'Status changed to In Progress', date: '2026-10-19T08:30:00.000Z' }] },
    { id: 'FF-2026-1003', title: 'Projector is not turning on', category: 'Electrical', facility: 'Science Building', location: 'Lab 1', description: 'The projector does not power on after being plugged in.', priority: 'Medium', status: 'Under Review', date: '2026-10-17T07:20:00.000Z', reporterId: 'student-demo', reporter: 'Alex Morgan', assignedTo: 'Jordan Lee', photo: '', resolution: '', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-17T07:20:00.000Z' }] },
    { id: 'FF-2026-1004', title: 'Light fixture repaired', category: 'Electrical', facility: 'Library', location: 'Reading Area', description: 'The light above the reading tables was flickering. Maintenance replaced the bulb.', priority: 'Low', status: 'Resolved', date: '2026-10-12T12:10:00.000Z', reporterId: 'student-demo', reporter: 'Alex Morgan', assignedTo: 'Jordan Lee', photo: '', resolution: 'Replaced the faulty bulb and tested the fixture.', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-12T12:10:00.000Z' }, { type: 'status', text: 'Request resolved', date: '2026-10-14T13:20:00.000Z' }] },
    { id: 'FF-2026-1005', title: 'Overflowing waste bin', category: 'Cleaning and Sanitation', facility: 'Canteen', location: 'Outdoor Seating', description: 'The bin is full and rubbish is collecting beside it.', priority: 'Low', status: 'Resolved', date: '2026-10-11T05:00:00.000Z', reporterId: 'student-demo', reporter: 'Alex Morgan', assignedTo: 'Jordan Lee', photo: '', resolution: 'Bin emptied and area cleaned.', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-11T05:00:00.000Z' }, { type: 'status', text: 'Request resolved', date: '2026-10-11T07:00:00.000Z' }] },
    { id: 'FF-2026-1006', title: 'Exposed wire near classroom outlet', category: 'Electrical', facility: 'Academic Building', location: 'Room 108', description: 'A wire is visible beside the wall outlet. Please keep the area clear and inspect it.', priority: 'Urgent', status: 'Approved', date: '2026-10-21T04:10:00.000Z', reporterId: 'other-student', reporter: 'Campus reporter', assignedTo: '', photo: '', resolution: '', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-21T04:10:00.000Z' }] },
    { id: 'FF-2026-1007', title: 'Air conditioning not cooling', category: 'Air Conditioning and Ventilation', facility: 'Student Center', location: 'Room 3A', description: 'The room remains warm even when the unit is switched on.', priority: 'High', status: 'On Hold', date: '2026-10-16T02:00:00.000Z', reporterId: 'other-student', reporter: 'Campus reporter', assignedTo: 'Jordan Lee', photo: '', resolution: '', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-16T02:00:00.000Z' }] },
    { id: 'FF-2026-1008', title: 'Damaged stair handrail', category: 'Structural Damage', facility: 'West Hall', location: 'Second floor stairwell', description: 'The handrail is loose where it meets the wall.', priority: 'Urgent', status: 'Pending', date: '2026-10-21T10:35:00.000Z', reporterId: 'other-student', reporter: 'Campus reporter', assignedTo: '', photo: '', resolution: '', activity: [{ type: 'created', text: 'Request submitted', date: '2026-10-21T10:35:00.000Z' }] }
  ];

  const state = { reports: [], notifications: [], users: [], preferences: {}, user: null, page: 'dashboard', requestId: '', query: '', statusFilter: 'All statuses', priorityFilter: 'All priorities', categoryFilter: 'All categories', sort: 'newest', pageNumber: 1, analyticsRange: 'all', pendingPhoto: '' };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const toast = message => {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 3200);
  };
  const dateText = value => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  const dateOnly = value => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
  const isStaff = () => ['staff', 'admin'].includes(state.user?.role);
  const isAdmin = () => state.user?.role === 'admin';

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.reports = Array.isArray(parsed.reports) ? parsed.reports : SAMPLE_REPORTS.map(item => ({ ...item }));
        state.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];
        state.users = Array.isArray(parsed.users) ? parsed.users : [];
        state.preferences = parsed.preferences && typeof parsed.preferences === 'object' ? parsed.preferences : {};
        return;
      }
    } catch (error) {
      console.error('Could not read saved Fix Forward data.', error);
      toast('Saved data could not be read. The sample workspace is loaded instead.');
    }
    state.reports = SAMPLE_REPORTS.map(item => ({ ...item, activity: [...item.activity] }));
    state.notifications = [];
    state.users = [];
    state.preferences = {};
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ reports: state.reports, notifications: state.notifications, users: state.users, preferences: state.preferences }));
      return true;
    } catch (error) {
      console.error('Could not save Fix Forward data.', error);
      toast('Unable to save. Browser storage may be full; remove large photos and try again.');
      return false;
    }
  }

  function notify(userId, title, message, requestId) {
    if (state.preferences[userId] === false) return;
    state.notifications.unshift({ id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, title, message, requestId, date: new Date().toISOString(), read: false });
  }

  function getVisibleReports() {
    if (state.user.role === 'student') return state.reports.filter(report => report.reporterId === state.user.id);
    if (state.user.role === 'guest') return state.reports;
    if (state.user.role === 'staff') return state.reports.filter(report => !report.assignedTo || report.assignedTo === state.user.name);
    return state.reports;
  }

  function startSession(role, name, email, id) {
    state.user = { role, name, email, id };
    state.page = 'dashboard';
    $('#loginScreen').hidden = true;
    $('#app').hidden = false;
    document.body.classList.toggle('guest-mode', role === 'guest');
    render();
    toast(`Welcome${name ? `, ${name}` : ''}. You are using the local demo.`);
  }

  function logout() {
    state.user = null;
    state.page = 'dashboard';
    $('#app').hidden = true;
    $('#loginScreen').hidden = false;
    document.body.classList.remove('guest-mode');
    $('#loginForm').reset();
  }

  const NAV_BY_ROLE = {
    student: [['OVERVIEW', [['dashboard', '⌂', 'Dashboard']]], ['REQUESTS', [['report', '+', 'Report a Problem'], ['requests', '▤', 'My Requests'], ['notifications', '♧', 'Notifications']]]],
    guest: [['OVERVIEW', [['dashboard', '⌂', 'Dashboard'], ['requests', '▤', 'Public Requests'], ['notifications', '♧', 'Notifications']]]],
    staff: [['OVERVIEW', [['dashboard', '⌂', 'Dashboard']]], ['WORKSPACE', [['all-requests', '▤', 'All Maintenance Requests'], ['assigned', '✓', 'Assigned Tasks'], ['report', '+', 'Report a Problem'], ['requests', '▱', 'My Requests'], ['notifications', '♧', 'Notifications'], ['analytics', '▥', 'Reports & Analytics']]]],
    admin: [['OVERVIEW', [['dashboard', '⌂', 'Dashboard']]], ['MANAGEMENT', [['all-requests', '▤', 'All Maintenance Requests'], ['assigned', '✓', 'Assigned Tasks'], ['report', '+', 'Report a Problem'], ['requests', '▱', 'My Requests'], ['notifications', '♧', 'Notifications'], ['analytics', '▥', 'Reports & Analytics'], ['users', '♙', 'User Management'], ['settings', '⚙', 'System Settings']]]]
  };
  const PAGE_TITLES = { dashboard: 'Dashboard', report: 'Report a Problem', requests: 'My Requests', 'all-requests': 'All Maintenance Requests', assigned: 'Assigned Tasks', notifications: 'Notifications', analytics: 'Reports & Analytics', profile: 'Profile & Settings', users: 'User Management', settings: 'System Settings', details: 'Request Details' };

  function renderNav() {
    const groups = NAV_BY_ROLE[state.user.role] || NAV_BY_ROLE.guest;
    $('#sidebarNav').innerHTML = groups.map(([heading, items]) => `<div class="nav-group"><p class="nav-heading">${heading}</p>${items.map(([page, icon, label]) => `<button class="nav-item ${state.page === page ? 'active' : ''}" data-page="${page}"><span class="nav-icon">${icon}</span><span>${label}</span>${page === 'notifications' && unreadCount() ? `<span class="nav-count">${unreadCount()}</span>` : ''}</button>`).join('')}</div>`).join('');
  }

  function unreadCount() {
    return state.notifications.filter(item => item.userId === state.user?.id && !item.read).length;
  }

  function render() {
    if (!state.user) return;
    renderNav();
    const title = PAGE_TITLES[state.page] || 'Dashboard';
    $('#pageTitle').textContent = title;
    $('#pageEyebrow').textContent = state.page === 'details' ? 'REQUEST' : state.page === 'dashboard' ? 'OVERVIEW' : 'WORKSPACE';
    $('#userName').textContent = state.user.name;
    $('#userRole').textContent = ROLE_NAMES[state.user.role] || 'Guest';
    $('#userAvatar').textContent = (state.user.name || 'G').charAt(0).toUpperCase();
    $('#notificationBadge').hidden = !unreadCount();
    $('#pageContent').innerHTML = renderPage();
  }

  function renderPage() {
    switch (state.page) {
      case 'dashboard': return renderDashboard();
      case 'report': return renderReportForm();
      case 'requests': return renderRequests(false);
      case 'all-requests': return renderRequests(true);
      case 'assigned': return renderRequests(true, true);
      case 'details': return renderDetails();
      case 'notifications': return renderNotifications();
      case 'analytics': return renderAnalytics();
      case 'profile': return renderProfile();
      case 'users': return renderUsers();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  }

  function renderDashboard() {
    const reports = getVisibleReports();
    const pending = reports.filter(item => ['Pending', 'Under Review', 'Approved'].includes(item.status)).length;
    const progress = reports.filter(item => ['In Progress', 'On Hold'].includes(item.status)).length;
    const resolved = reports.filter(item => item.status === 'Resolved').length;
    const attention = reports.filter(item => !['Resolved', 'Rejected'].includes(item.status) && (item.priority === 'Urgent' || Date.now() - new Date(item.date).getTime() > 7 * 24 * 60 * 60 * 1000));
    const updates = reports.flatMap(report => report.activity.map(activity => ({ report, activity }))).sort((a, b) => new Date(b.activity.date) - new Date(a.activity.date)).slice(0, 5);
    const greeting = state.user.role === 'guest' ? 'Welcome to Fix Forward' : `Welcome back, ${esc(state.user.name.split(' ')[0])}`;
    return `<section class="welcome-card"><div><p class="eyebrow">CAMPUS FACILITY CARE</p><h2>${greeting}</h2><p>Here’s an overview of maintenance requests and the latest campus updates.</p><span class="demo-chip">DEMO DATA · LOCAL TO THIS BROWSER</span></div><div class="welcome-art" aria-hidden="true"><span>✓</span></div></section>
      <section class="stats-grid" aria-label="Request summary">
        ${statCard('Total Requests', reports.length, 'All visible requests', '▤', 'green')}
        ${statCard('Pending Requests', pending, 'Waiting for review', '◷', 'amber')}
        ${statCard('In Progress', progress, 'Being worked on', '↻', 'blue')}
        ${statCard('Resolved Requests', resolved, 'Completed work', '✓', 'purple')}
      </section>
      ${isStaff() ? `<section class="card attention-card"><div class="card-heading"><div><p class="eyebrow">WORK QUEUE</p><h3>Urgent & overdue work</h3><p class="field-hint">Overdue means open for more than 7 days in this demo.</p></div><button class="text-button" data-page="all-requests">All requests →</button></div>${attention.length ? `<div class="activity-list">${attention.map(report => `<button class="activity-row" data-open="${esc(report.id)}"><span class="priority-badge ${report.priority.toLowerCase()}">${report.priority}</span><span><strong>${esc(report.title)}</strong><small>${esc(report.id)} · ${esc(report.facility)} · ${esc(report.status)}</small></span><time>${dateOnly(report.date)}</time></button>`).join('')}</div>` : emptyState('No urgent or overdue work', 'Requests over 7 days old and unresolved are flagged here.')}</section>` : ''}
      <section class="dashboard-grid"><article class="card quick-card"><div class="card-heading"><div><p class="eyebrow">SHORTCUTS</p><h3>Quick Actions</h3></div></div><div class="quick-actions"><button class="quick-action" data-page="report"><span class="quick-icon">＋</span><span><strong>Report a Problem</strong><small>Tell us what needs attention</small></span><b>→</b></button><button class="quick-action" data-page="requests"><span class="quick-icon">▤</span><span><strong>${state.user.role === 'guest' ? 'View Public Requests' : 'View My Requests'}</strong><small>Track request progress</small></span><b>→</b></button><button class="quick-action" data-page="notifications"><span class="quick-icon">♧</span><span><strong>View Notifications</strong><small>${unreadCount() ? `${unreadCount()} unread update${unreadCount() === 1 ? '' : 's'}` : 'Stay up to date'}</small></span><b>→</b></button></div></article>
      <article class="card activity-card"><div class="card-heading"><div><p class="eyebrow">LATEST UPDATES</p><h3>Recent Activity</h3></div><button class="text-button" data-page="${isStaff() ? 'all-requests' : 'requests'}">View requests →</button></div>${updates.length ? `<div class="activity-list">${updates.map(({ report, activity }) => `<button class="activity-row" data-open="${esc(report.id)}"><span class="activity-mark ${statusClass(report.status)}">•</span><span><strong>${esc(report.title)}</strong><small>${esc(report.id)} · ${esc(activity.text)}</small></span><time>${dateOnly(activity.date)}</time></button>`).join('')}</div>` : emptyState('No activity yet', 'Submitted reports and updates will appear here.')}</article></section>`;
  }

  function statCard(label, value, hint, icon, tone) {
    return `<article class="stat-card"><span class="stat-icon ${tone}">${icon}</span><p>${label}</p><strong>${value}</strong><small>${hint}</small></article>`;
  }

  function renderReportForm() {
    if (state.user.role === 'guest') return `<section class="card empty-card">${emptyState('Sign in to submit a request', 'Guest access is read-only. Use the student demo to try submitting and tracking a report.')}<button class="button button-primary" data-action="logout">Return to sign in</button></section>`;
    return `<div class="page-intro"><div><p class="eyebrow">NEW MAINTENANCE REQUEST</p><h2>Tell us what needs fixing</h2><p>Provide an accurate location and clear details to help maintenance personnel resolve the issue.</p></div></div>
      <div class="form-layout"><form class="card request-form" id="reportForm" novalidate>
        <div class="form-section-title"><span>01</span><div><h3>Problem details</h3><p>Describe the issue and where it is happening.</p></div></div>
        <div class="field-grid"><label>Facility or building <span class="required">*</span><input name="facility" required maxlength="90" placeholder="e.g. Main Building"></label><label>Room or specific location <span class="required">*</span><input name="location" required maxlength="100" placeholder="e.g. Room 204, second floor"></label></div>
        <label>Problem title <span class="required">*</span><input name="title" required maxlength="90" placeholder="A short summary of the issue"></label>
        <div class="field-grid"><label>Problem category <span class="required">*</span><select name="category" required><option value="">Choose category</option>${CATEGORIES.map(item => `<option>${esc(item)}</option>`).join('')}</select></label><label>Priority <span class="required">*</span><select name="priority" required>${PRIORITIES.map(item => `<option ${item === 'Medium' ? 'selected' : ''}>${item}</option>`).join('')}</select></label></div>
        <label>Detailed description <span class="required">*</span><textarea name="description" required maxlength="900" rows="5" placeholder="What happened? When did you notice it? Include any details that may help locate or understand the problem."></textarea></label>
        <div class="form-section-title form-section-spaced"><span>02</span><div><h3>Additional information</h3><p>Optional details to help the team follow up.</p></div></div>
        <div class="field-grid"><label>Contact information <small>(optional)</small><input name="contact" maxlength="120" placeholder="Email or phone, if needed"></label><label>Photos <small>(optional)</small><input id="photoInput" type="file" accept="image/jpeg,image/png,image/webp"><small class="field-hint">JPG, PNG, or WebP · up to 1.2 MB</small></label></div>
        <div id="photoPreview" class="photo-preview" ${state.pendingPhoto ? '' : 'hidden'}>${state.pendingPhoto ? `<img src="${state.pendingPhoto}" alt="Selected issue photo"><button type="button" class="text-button danger" data-action="remove-photo">Remove photo</button>` : ''}</div>
        <p class="form-error" id="reportError" role="alert" hidden></p>
        <div class="form-actions"><button class="button button-primary" type="submit">Review & Submit Request <span>→</span></button><p>Required fields are marked with <span class="required">*</span></p></div>
      </form><aside class="card form-aside"><span class="aside-icon">✦</span><h3>Helpful reporting tips</h3><ul><li>Be specific about the building, room, and nearby landmarks.</li><li>Describe what you observed instead of guessing at the cause.</li><li>Choose Urgent only when a prompt response is needed.</li><li>Do not include passwords or sensitive personal information.</li></ul><div class="safety-note"><strong>Immediate danger?</strong><p>Contact campus staff or emergency services directly. Do not rely on this demo for emergencies.</p></div><p class="local-note">This request will be saved only in this browser. It will not reach campus staff.</p></aside></div>`;
  }

  function renderRequests(manage, assignedOnly = false) {
    let reports = manage ? (state.user.role === 'staff' ? state.reports.filter(report => !report.assignedTo || report.assignedTo === state.user.name) : state.reports) : getVisibleReports();
    if (assignedOnly) reports = reports.filter(report => report.assignedTo === state.user.name);
    const query = state.query.trim().toLowerCase();
    reports = reports.filter(report => (!query || [report.id, report.title, report.description, report.facility, report.location, report.category].join(' ').toLowerCase().includes(query))
      && (state.statusFilter === 'All statuses' || report.status === state.statusFilter)
      && (state.priorityFilter === 'All priorities' || report.priority === state.priorityFilter)
      && (state.categoryFilter === 'All categories' || report.category === state.categoryFilter));
    reports.sort((a, b) => {
      if (state.sort === 'oldest') return new Date(a.date) - new Date(b.date);
      if (state.sort === 'priority-high') return PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
      if (state.sort === 'status') return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
      return new Date(b.date) - new Date(a.date);
    });
    const pageSize = 6;
    const pageCount = Math.max(1, Math.ceil(reports.length / pageSize));
    state.pageNumber = Math.min(state.pageNumber, pageCount);
    const visible = reports.slice((state.pageNumber - 1) * pageSize, state.pageNumber * pageSize);
    const title = assignedOnly ? 'Tasks assigned to you' : manage ? 'Review and manage authorized maintenance requests.' : state.user.role === 'guest' ? 'Public demo requests · reporter details are not shown.' : 'Track the progress of your submitted maintenance reports.';
    return `<div class="page-intro page-intro-row"><div><p class="eyebrow">${manage ? 'MAINTENANCE WORKSPACE' : 'REQUEST TRACKER'}</p><h2>${PAGE_TITLES[state.page]}</h2><p>${title}</p></div>${state.user.role !== 'guest' ? `<button class="button button-primary" data-page="report">＋ Create Request</button>` : ''}</div>
      <section class="card table-card"><div class="filter-bar"><label class="search-field"><span>⌕</span><input id="requestSearch" value="${esc(state.query)}" aria-label="Search requests" placeholder="Search ID, building, title or description"></label><select data-filter="status" aria-label="Filter by status"><option>All statuses</option>${STATUSES.map(item => `<option ${item === state.statusFilter ? 'selected' : ''}>${item}</option>`).join('')}</select><select data-filter="priority" aria-label="Filter by priority"><option>All priorities</option>${PRIORITIES.map(item => `<option ${item === state.priorityFilter ? 'selected' : ''}>${item}</option>`).join('')}</select><select data-filter="category" aria-label="Filter by category"><option>All categories</option>${CATEGORIES.map(item => `<option ${item === state.categoryFilter ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select><select data-filter="sort" aria-label="Sort requests"><option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>Newest first</option><option value="oldest" ${state.sort === 'oldest' ? 'selected' : ''}>Oldest first</option><option value="priority-high" ${state.sort === 'priority-high' ? 'selected' : ''}>Priority: urgent first</option><option value="status" ${state.sort === 'status' ? 'selected' : ''}>Status order</option></select></div>
      ${visible.length ? `<div class="table-wrap"><table><thead><tr><th>REQUEST</th><th>FACILITY / LOCATION</th><th>CATEGORY</th><th>PRIORITY</th><th>DATE REPORTED</th>${manage ? '<th>ASSIGNED STAFF</th>' : ''}<th>STATUS</th><th>ACTION</th></tr></thead><tbody>${visible.map(report => requestRow(report, manage)).join('')}</tbody></table></div><div class="table-footer"><span>Showing ${Math.min(reports.length, (state.pageNumber - 1) * pageSize + 1)}–${Math.min(reports.length, state.pageNumber * pageSize)} of ${reports.length} requests</span><div class="pagination"><button data-action="page-back" ${state.pageNumber <= 1 ? 'disabled' : ''}>← Previous</button><span>Page ${state.pageNumber} of ${pageCount}</span><button data-action="page-forward" ${state.pageNumber >= pageCount ? 'disabled' : ''}>Next →</button></div></div>` : emptyState(state.query || state.statusFilter !== 'All statuses' ? 'No matching requests' : 'No requests yet', state.query || state.statusFilter !== 'All statuses' ? 'Try changing your search or filters.' : 'Submit a maintenance report to start tracking its progress.', state.user.role !== 'guest' ? '<button class="button button-primary" data-page="report">Report a Problem</button>' : '')}
      </section>`;
  }

  function requestRow(report, manage) {
    return `<tr><td><button class="request-link" data-open="${esc(report.id)}"><strong>${esc(report.id)}</strong><span>${esc(report.title)}</span></button></td><td>${esc(report.facility)}<small>${esc(report.location)}</small></td><td>${esc(report.category)}</td><td><span class="priority-badge ${report.priority.toLowerCase()}">${report.priority}</span></td><td>${dateOnly(report.date)}</td>${manage ? `<td>${isAdmin() ? `<select class="assign-select" data-assign="${esc(report.id)}" aria-label="Assign ${esc(report.id)}"><option value="">Unassigned</option>${staffNames().map(name => `<option ${report.assignedTo === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>` : esc(report.assignedTo || 'Unassigned')}</td>` : ''}<td><span class="status-badge ${statusClass(report.status)}">${esc(report.status)}</span></td><td><button class="button button-small button-outline" data-open="${esc(report.id)}">View</button></td></tr>`;
  }

  function renderDetails() {
    const report = state.reports.find(item => item.id === state.requestId);
    if (!report || (state.user.role === 'student' && report.reporterId !== state.user.id)) return `<section class="card">${emptyState('Request not available', 'This request could not be found or you do not have permission to view it.')}<button class="button button-outline" data-page="requests">Back to requests</button></section>`;
    const canManage = isAdmin() || (state.user.role === 'staff' && (!report.assignedTo || report.assignedTo === state.user.name));
    return `<div class="page-intro page-intro-row"><div><button class="text-button back-link" data-page="${isStaff() ? 'all-requests' : 'requests'}">← Back to requests</button><p class="eyebrow">REQUEST ${esc(report.id)}</p><h2>${esc(report.title)}</h2><p>Submitted ${dateText(report.date)}</p></div><span class="status-badge ${statusClass(report.status)} status-large">${esc(report.status)}</span></div>
      <div class="details-layout"><div class="details-main"><section class="card details-card"><div class="card-heading"><div><p class="eyebrow">REQUEST DETAILS</p><h3>Problem information</h3></div><span class="priority-badge ${report.priority.toLowerCase()}">${report.priority} priority</span></div><p class="details-description">${esc(report.description)}</p><div class="detail-grid"><div><small>FACILITY</small><strong>${esc(report.facility)}</strong></div><div><small>LOCATION</small><strong>${esc(report.location)}</strong></div><div><small>CATEGORY</small><strong>${esc(report.category)}</strong></div><div><small>REPORTED BY</small><strong>${state.user.role === 'guest' ? 'Campus reporter' : esc(report.reporter)}</strong></div><div><small>ASSIGNED STAFF</small><strong>${esc(report.assignedTo || 'Not yet assigned')}</strong></div><div><small>CONTACT</small><strong>${state.user.role === 'student' && report.reporterId === state.user.id ? esc(report.contact || 'Not provided') : 'Private'}</strong></div></div>${report.photo ? `<img class="details-photo" src="${report.photo}" alt="Photo attached to ${esc(report.id)}">` : ''}${report.resolution ? `<div class="resolution-note"><strong>Resolution notes</strong><p>${esc(report.resolution)}</p></div>` : ''}</section>
      ${canManage ? `<section class="card staff-update"><p class="eyebrow">STAFF WORKSPACE</p><h3>Update this request</h3><form id="updateForm" data-id="${esc(report.id)}"><label>Request status<select name="status">${(isAdmin() ? STATUSES : staffNextStatuses(report.status)).map(item => `<option ${item === report.status ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>Progress note or resolution summary<textarea name="note" rows="3" placeholder="${report.status === 'Resolved' ? 'A resolution summary is required.' : 'Add an update for the requester.'}">${esc(report.resolution)}</textarea></label><button class="button button-primary" type="submit">Save Update</button></form></section>` : ''}
      <section class="card comments-card"><p class="eyebrow">ACTIVITY</p><h3>Request timeline</h3><div class="timeline">${[...report.activity].sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => `<div class="timeline-item"><span></span><div><strong>${esc(item.text)}</strong><small>${dateText(item.date)}${item.actor ? ` · ${esc(item.actor)}` : ''}</small>${item.note ? `<p>${esc(item.note)}</p>` : ''}</div></div>`).join('')}</div></section></div>
      <aside class="details-aside"><section class="card progress-card"><p class="eyebrow">LIFECYCLE</p><h3>Request progress</h3>${renderProgress(report.status)}</section><section class="card safety-note"><strong>Demo information</strong><p>Status changes and notifications are stored in this browser only. In the real system, authorized staff would receive this request.</p></section></aside></div>`;
  }

  function renderProgress(status) {
    const flow = ['Pending', 'Under Review', 'Approved', 'In Progress', 'Resolved'];
    if (['Rejected', 'On Hold'].includes(status)) return `<div class="exception-state"><span class="status-badge ${statusClass(status)}">${status}</span><p>${status === 'On Hold' ? 'Work is temporarily paused. Check the activity timeline for updates.' : 'This request was not approved. Check the activity timeline for more information.'}</p></div>`;
    const currentIndex = flow.indexOf(status);
    return `<div class="progress-steps">${flow.map((step, index) => `<div class="progress-step ${index < currentIndex ? 'complete' : ''} ${index === currentIndex ? 'current' : ''}"><span>${index < currentIndex ? '✓' : index + 1}</span><strong>${step}</strong></div>`).join('')}</div>`;
  }

  function staffNextStatuses(status) {
    const transitions = {
      Pending: ['Pending', 'Under Review'],
      'Under Review': ['Under Review', 'In Progress', 'On Hold'],
      Approved: ['Approved', 'In Progress', 'On Hold'],
      'In Progress': ['In Progress', 'On Hold', 'Resolved'],
      'On Hold': ['On Hold', 'In Progress', 'Resolved'],
      Resolved: ['Resolved'],
      Rejected: ['Rejected']
    };
    return transitions[status] || [status];
  }

  function renderNotifications() {
    const items = state.notifications.filter(item => item.userId === state.user.id);
    return `<div class="page-intro page-intro-row"><div><p class="eyebrow">UPDATES</p><h2>Notifications</h2><p>Status changes and updates related to your requests.</p></div>${items.some(item => !item.read) ? '<button class="button button-outline" data-action="mark-all">Mark all as read</button>' : ''}</div><section class="card notification-list">${items.length ? items.map(item => `<article class="notification-item ${item.read ? '' : 'unread'}"><span class="notification-icon">♧</span><div><strong>${esc(item.title)}</strong><p>${esc(item.message)}</p><small>${dateText(item.date)}${item.requestId ? ` · ${esc(item.requestId)}` : ''}</small></div><div class="notification-actions">${item.requestId ? `<button class="text-button" data-open="${esc(item.requestId)}">View request</button>` : ''}${!item.read ? `<button class="text-button" data-read="${esc(item.id)}">Mark read</button>` : ''}</div></article>`).join('') : emptyState('You’re all caught up', 'Notifications about request submissions and progress will appear here.')}</section>`;
  }

  function renderAnalytics() {
    if (!isStaff()) return `<section class="card">${emptyState('Staff access required', 'Reports and analytics are available to maintenance staff and administrators.')}</section>`;
    const cutoff = state.analyticsRange === 'all' ? null : Date.now() - Number(state.analyticsRange) * 24 * 60 * 60 * 1000;
    const reports = state.reports.filter(item => cutoff === null || new Date(item.date).getTime() >= cutoff);
    const counts = list => list.map(label => ({ label, count: reports.filter(item => item.status === label || item.category === label || item.priority === label).length }));
    const bars = (items, tone) => `<div class="bar-list">${items.map(item => `<div class="bar-row"><span>${esc(item.label)}</span><div class="bar-track"><i class="${tone}" style="width:${reports.length ? Math.max(5, item.count / reports.length * 100) : 0}%"></i></div><strong>${item.count}</strong></div>`).join('')}</div>`;
    const resolved = reports.filter(item => item.status === 'Resolved');
    const avgHours = resolved.length ? Math.round(resolved.reduce((total, item) => total + Math.max(0, (new Date(item.activity[item.activity.length - 1]?.date || item.date) - new Date(item.date)) / 3600000), 0) / resolved.length) : 0;
    const monthItems = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return { label: new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' }).format(date), count: reports.filter(item => item.date.slice(0, 7) === key).length };
    });
    return `<div class="page-intro page-intro-row"><div><p class="eyebrow">CAMPUS OVERVIEW</p><h2>Reports & Analytics</h2><p>Summary metrics are calculated from request records in this demo browser.</p></div><div class="analytics-actions"><label>Report period<select data-analytics-range aria-label="Filter analytics by date"><option value="all" ${state.analyticsRange === 'all' ? 'selected' : ''}>All time</option><option value="30" ${state.analyticsRange === '30' ? 'selected' : ''}>Last 30 days</option><option value="90" ${state.analyticsRange === '90' ? 'selected' : ''}>Last 90 days</option><option value="365" ${state.analyticsRange === '365' ? 'selected' : ''}>Last 12 months</option></select></label><button class="button button-outline" data-action="export">Export CSV</button></div></div><section class="stats-grid analytics-stats">${statCard('Total Requests', reports.length, 'Requests in selected period', '▤', 'green')}${statCard('Awaiting Review', reports.filter(item => ['Pending', 'Under Review', 'Approved'].includes(item.status)).length, 'Not yet resolved', '◷', 'amber')}${statCard('Average Resolution', `${avgHours} hrs`, 'Based on demo timeline', '↻', 'blue')}${statCard('Urgent Priority', reports.filter(item => item.priority === 'Urgent').length, 'Requires prompt attention', '!', 'purple')}</section><div class="analytics-grid"><section class="card"><p class="eyebrow">MONTHLY TREND</p><h3>Requests by month</h3>${bars(monthItems, 'bar-green')}</section><section class="card"><p class="eyebrow">STATUS</p><h3>Requests by status</h3>${bars(counts(STATUSES), 'bar-green')}</section><section class="card"><p class="eyebrow">CATEGORY</p><h3>Requests by category</h3>${bars(counts(CATEGORIES), 'bar-blue')}</section><section class="card"><p class="eyebrow">PRIORITY</p><h3>Requests by priority</h3>${bars(counts(PRIORITIES), 'bar-amber')}</section><section class="card"><p class="eyebrow">LOCATION</p><h3>Requests by facility</h3>${bars([...new Set(reports.map(item => item.facility))].map(label => ({ label, count: reports.filter(item => item.facility === label).length })), 'bar-purple')}</section></div>`;
  }

  function renderProfile() {
    return `<div class="page-intro"><p class="eyebrow">YOUR ACCOUNT</p><h2>Profile & Settings</h2><p>Manage the profile information used in this local demo.</p></div><div class="profile-grid"><section class="card profile-card"><div class="profile-heading"><span class="avatar avatar-large">${esc(state.user.name.charAt(0).toUpperCase())}</span><div><h3>${esc(state.user.name)}</h3><p>${ROLE_NAMES[state.user.role]} · Local demo</p></div></div><form id="profileForm"><label>Display name<input name="name" value="${esc(state.user.name)}" required maxlength="80"></label><label>Email address<input name="email" value="${esc(state.user.email)}" type="email" required maxlength="120"></label><p class="field-hint">This information is saved in this browser only. Password management requires a real authentication provider.</p><button class="button button-primary" type="submit">Save Profile</button></form></section><section class="card"><p class="eyebrow">PREFERENCES</p><h3>Appearance & notifications</h3><div class="setting-row"><div><strong>Dark mode</strong><small>Adjust the interface theme on this device</small></div><button class="switch" role="switch" aria-checked="${document.body.classList.contains('dark-mode')}" data-action="theme" aria-label="Toggle dark mode"></button></div><div class="setting-row"><div><strong>Request updates</strong><small>On-device alerts for request and assignment changes</small></div><button class="switch" role="switch" aria-checked="${state.preferences[state.user.id] !== false}" data-action="notifications-toggle" aria-label="Toggle request notifications"></button></div><div class="privacy-callout"><strong>Demo account</strong><p>No account password is stored. Data is not sent to university staff or shared across devices.</p></div></section></div>`;
  }

  function renderUsers() {
    if (!isAdmin()) return `<section class="card">${emptyState('Administrator access required', 'Only the administrator demo can manage demo users.')}</section>`;
    const users = [{ name: 'Alex Morgan', email: 'student@fixforward.demo', role: 'Student demo' }, { name: 'Jordan Lee', email: 'staff@fixforward.demo', role: 'Maintenance staff demo' }, { name: 'Taylor Admin', email: 'admin@fixforward.demo', role: 'Administrator demo' }, ...state.users.map(user => ({ ...user, role: 'Registered local profile' }))];
    return `<div class="page-intro"><p class="eyebrow">ACCESS OVERVIEW</p><h2>User Management</h2><p>Demo users and local profiles. This is not a real account directory.</p></div><section class="card table-card"><div class="table-wrap"><table><thead><tr><th>USER</th><th>EMAIL</th><th>ROLE</th><th>ACCESS</th></tr></thead><tbody>${users.map(user => `<tr><td><strong>${esc(user.name)}</strong></td><td>${esc(user.email)}</td><td>${esc(user.role)}</td><td><span class="status-badge status-resolved">Demo only</span></td></tr>`).join('')}</tbody></table></div><div class="privacy-callout"><strong>Production requirement</strong><p>Role enforcement in this static prototype is only a user-interface demo. A real deployment must enforce identity and permissions in a trusted backend.</p></div></section>`;
  }

  function renderSettings() {
    if (!isAdmin()) return `<section class="card">${emptyState('Administrator access required', 'System settings are available to the administrator demo.')}</section>`;
    return `<div class="page-intro"><p class="eyebrow">DEMO CONFIGURATION</p><h2>System Settings</h2><p>Current prototype limits and local demonstration settings.</p></div><div class="settings-grid"><section class="card"><p class="eyebrow">WORKFLOW</p><h3>Request categories</h3><p>${CATEGORIES.map(esc).join(' · ')}</p><h3>Priority levels</h3><p>${PRIORITIES.join(' · ')}</p><h3>Status lifecycle</h3><p>${STATUSES.join(' → ')}</p></section><section class="card"><p class="eyebrow">DATA</p><h3>Local browser storage</h3><p>All requests, updates, and notifications are saved on this device only.</p><button class="button button-danger" data-action="reset-data">Restore sample data</button><p class="field-hint">This replaces local requests, profiles, and notifications with the original sample dataset.</p></section></div>`;
  }

  function emptyState(title, text, extra = '') {
    return `<div class="empty-state"><span class="empty-icon">⌕</span><h3>${title}</h3><p>${text}</p>${extra}</div>`;
  }
  function statusClass(status) { return `status-${String(status).toLowerCase().replace(/\s+/g, '-')}`; }

  function openDetails(id) {
    state.requestId = id;
    state.page = 'details';
    render();
    $('#pageContent').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openModal(title, body, onSubmit) {
    const dialog = $('#modal');
    $('#modalContent').innerHTML = `<div class="modal-header"><div><p class="eyebrow">FIX FORWARD</p><h2>${title}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close dialog">×</button></div><form class="modal-form" id="modalForm">${body}</form>`;
    dialog.showModal();
    const form = $('#modalForm', dialog);
    if (form && onSubmit) form.addEventListener('submit', event => {
      event.preventDefault();
      onSubmit(new FormData(form));
    });
  }

  function submitReport(form) {
    const data = new FormData(form);
    const required = ['facility', 'location', 'title', 'category', 'priority', 'description'];
    const missing = required.filter(key => !String(data.get(key) || '').trim());
    const error = $('#reportError');
    if (missing.length) {
      error.textContent = 'Please complete all required fields before continuing.';
      error.hidden = false;
      form.elements[missing[0]].focus();
      return;
    }
    const report = {
      id: newRequestId(),
      facility: String(data.get('facility')).trim(),
      location: String(data.get('location')).trim(),
      title: String(data.get('title')).trim(),
      category: String(data.get('category')),
      priority: String(data.get('priority')),
      description: String(data.get('description')).trim(),
      contact: String(data.get('contact') || '').trim(),
      reporterId: state.user.id,
      reporter: state.user.name,
      assignedTo: '',
      status: 'Pending',
      date: new Date().toISOString(),
      photo: state.pendingPhoto,
      resolution: '',
      activity: [{ type: 'created', text: 'Request submitted', date: new Date().toISOString(), actor: state.user.name }]
    };
    openModal('Confirm request submission', `<p>Submit <strong>${esc(report.title)}</strong> at <strong>${esc(report.facility)} · ${esc(report.location)}</strong>?</p><p class="modal-hint">This report will be stored in this browser only; it will not be delivered to campus staff.</p><div class="modal-actions"><button class="button button-outline" type="button" data-action="close-modal">Review details</button><button class="button button-primary" type="submit">Submit request</button></div>`, () => {
      state.reports.unshift(report);
      notify(state.user.id, 'Request submitted', `${report.id} — ${report.title} is now pending review.`, report.id);
      if (!saveData()) return;
      $('#modal').close();
      state.pendingPhoto = '';
      state.page = 'details';
      state.requestId = report.id;
      render();
      toast(`Request ${report.id} submitted successfully.`);
    });
  }

  function newRequestId() {
    let id;
    do {
      id = `FF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    } while (state.reports.some(report => report.id === id));
    return id;
  }

  function updateRequest(form) {
    const report = state.reports.find(item => item.id === form.dataset.id);
    if (!report) return;
    const data = new FormData(form);
    const status = String(data.get('status'));
    const note = String(data.get('note') || '').trim();
    if (status === 'Resolved' && !note) {
      toast('A resolution summary is required before resolving this request.');
      form.elements.note.focus();
      return;
    }
    if (['On Hold', 'Rejected'].includes(status) && !note) {
      toast(`Add a reason before moving this request to ${status.toLowerCase()}.`);
      form.elements.note.focus();
      return;
    }
    if (status === report.status && !note) {
      toast('Choose a new status or add a progress note before saving.');
      return;
    }
    if (status !== report.status) {
      report.status = status;
      report.activity.push({ type: 'status', text: `Status changed to ${status}`, date: new Date().toISOString(), actor: state.user.name, note });
      notify(report.reporterId, `Request ${status.toLowerCase()}`, `${report.id} — ${report.title} is now ${status.toLowerCase()}.`, report.id);
    } else if (note) {
      report.activity.push({ type: 'note', text: 'Staff added an update', date: new Date().toISOString(), actor: state.user.name, note });
      notify(report.reporterId, 'New request update', `${report.id} — staff added a progress note.`, report.id);
    }
    if (status === 'Resolved') report.resolution = note;
    if (!saveData()) return;
    render();
    toast('Request update saved in this browser.');
  }

  function staffNames() {
    return [...new Set(['Jordan Lee', ...state.reports.map(report => report.assignedTo).filter(Boolean), ...state.users.filter(user => user.role === 'staff').map(user => user.name)])];
  }

  function assignRequest(id, name) {
    const report = state.reports.find(item => item.id === id);
    if (!report) return;
    report.assignedTo = name;
    report.activity.push({ type: 'assignment', text: name ? `Assigned to ${name}` : 'Assignment removed', date: new Date().toISOString(), actor: state.user.name });
    notify(report.reporterId, name ? 'Maintenance staff assigned' : 'Assignment updated', name ? `${report.id} is assigned to ${name}.` : `${report.id} is no longer assigned.`, report.id);
    if (name) {
      const staffUser = name === 'Jordan Lee' ? { id: 'staff-demo' } : state.users.find(user => user.role === 'staff' && user.name === name);
      if (staffUser) notify(staffUser.id, 'New task assigned', `${report.id} — ${report.title}`, report.id);
    }
    if (!saveData()) return;
    render();
    toast('Assignment updated.');
  }

  function exportCSV() {
    const header = ['Request ID', 'Title', 'Facility', 'Location', 'Category', 'Priority', 'Status', 'Date reported', 'Assigned staff'];
    const rows = state.reports.map(report => [report.id, report.title, report.facility, report.location, report.category, report.priority, report.status, report.date, report.assignedTo]);
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fix-forward-demo-requests.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast('Authorized demo request data exported as CSV.');
  }

  function preserveFocus(renderFn) {
    const active = document.activeElement;
    const id = active?.id;
    const selection = active && 'selectionStart' in active ? active.selectionStart : null;
    renderFn();
    if (id) {
      const target = document.getElementById(id);
      if (target) {
        target.focus();
        if (selection !== null && 'setSelectionRange' in target) target.setSelectionRange(selection, selection);
      }
    }
  }

  function resetFilters() {
    state.query = '';
    state.statusFilter = 'All statuses';
    state.priorityFilter = 'All priorities';
    state.categoryFilter = 'All categories';
    state.sort = 'newest';
    state.pageNumber = 1;
  }

  function changePage(page) {
    state.page = page;
    if (page === 'requests' || page === 'all-requests' || page === 'assigned') resetFilters();
    render();
    $('#sidebar').classList.remove('mobile-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action],[data-page],[data-open],[data-read]');
    if (!button) return;
    if (button.dataset.page) { changePage(button.dataset.page); return; }
    if (button.dataset.open) { openDetails(button.dataset.open); return; }
    if (button.dataset.read) {
      const item = state.notifications.find(notification => notification.id === button.dataset.read);
      if (item) item.read = true;
      saveData(); render(); return;
    }
    switch (button.dataset.action) {
      case 'demo': {
        const role = button.dataset.role;
        const profiles = { student: ['Alex Morgan', 'student@fixforward.demo', 'student-demo'], staff: ['Jordan Lee', 'staff@fixforward.demo', 'staff-demo'], admin: ['Taylor Admin', 'admin@fixforward.demo', 'admin-demo'] };
        startSession(role, ...profiles[role]);
        break;
      }
      case 'guest': startSession('guest', 'Guest visitor', 'guest@fixforward.demo', 'guest-demo'); break;
      case 'logout': logout(); break;
      case 'theme':
        document.body.classList.toggle('dark-mode');
        try { localStorage.setItem('fixforward_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); }
        catch (error) { console.error('Could not save theme preference.', error); }
        $$('[data-action="theme"]').forEach(item => { item.setAttribute('aria-checked', document.body.classList.contains('dark-mode')); });
        break;
      case 'notifications-toggle':
        state.preferences[state.user.id] = state.preferences[state.user.id] === false;
        if (saveData()) { render(); toast(`Request notifications ${state.preferences[state.user.id] ? 'enabled' : 'disabled'}.`); }
        break;
      case 'toggle-password': {
        const password = $('#loginPassword');
        password.type = password.type === 'password' ? 'text' : 'password';
        button.textContent = password.type === 'password' ? 'Show' : 'Hide';
        button.setAttribute('aria-label', password.type === 'password' ? 'Show password' : 'Hide password');
        break;
      }
      case 'reset-password':
        openModal('Reset your password', `<p>Enter your email to preview the password reset flow. This demo cannot send a reset message.</p><label>Email address<input name="email" type="email" required maxlength="120" placeholder="you@school.edu"></label><div class="modal-actions"><button class="button button-outline" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit">Continue</button></div>`, data => {
          const email = String(data.get('email') || '').trim();
          if (!email || !email.includes('@')) { toast('Enter a valid email address.'); return; }
          $('#modal').close();
          toast('Password recovery needs a connected authentication provider; no email was sent.');
        });
        break;
      case 'register':
        openModal('Create a demo profile', `<p>This form previews registration only. The password is checked but never saved; this demo does not create a secure account.</p><label>Your name<input name="name" required maxlength="80"></label><label>Email address<input name="email" required type="email" maxlength="120"></label><label>Password<input name="password" type="password" required minlength="8" autocomplete="new-password"></label><label>Confirm password<input name="confirmPassword" type="password" required minlength="8" autocomplete="new-password"></label><p class="form-error" id="registerError" hidden></p><div class="modal-actions"><button class="button button-outline" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit">Continue as student</button></div>`, data => {
          const name = String(data.get('name')).trim();
          const email = String(data.get('email')).trim().toLowerCase();
          const password = String(data.get('password'));
          const confirmPassword = String(data.get('confirmPassword'));
          if (!name || !email || !email.includes('@') || password.length < 8) { $('#registerError').textContent = 'Enter a name, valid email, and password with at least 8 characters.'; $('#registerError').hidden = false; return; }
          if (password !== confirmPassword) { $('#registerError').textContent = 'The password confirmation does not match.'; $('#registerError').hidden = false; return; }
          if (state.users.some(user => user.email.trim().toLowerCase() === email)) { $('#registerError').textContent = 'A demo profile already uses this email. Sign in with it instead.'; $('#registerError').hidden = false; return; }
          const profile = { id: `profile-${Date.now()}`, name, email, role: 'student' };
          state.users.push(profile);
          if (!saveData()) { state.users.pop(); return; }
          $('#modal').close();
          startSession(profile.role, profile.name, profile.email, profile.id);
        });
        break;
      case 'close-modal': $('#modal').close(); break;
      case 'remove-photo': state.pendingPhoto = ''; $('#photoPreview').innerHTML = ''; $('#photoPreview').hidden = true; $('#photoInput').value = ''; break;
      case 'sidebar': $('#sidebar').classList.toggle('mobile-open'); break;
      case 'mark-all':
        state.notifications.forEach(item => { if (item.userId === state.user.id) item.read = true; });
        saveData(); render(); toast('Notifications marked as read.'); break;
      case 'page-back': state.pageNumber = Math.max(1, state.pageNumber - 1); render(); break;
      case 'page-forward': state.pageNumber += 1; render(); break;
      case 'export': exportCSV(); break;
      case 'reset-data':
        openModal('Restore sample data?', `<p>This replaces local requests, profiles, and notifications with the original demo dataset. This cannot be undone.</p><div class="modal-actions"><button class="button button-outline" type="button" data-action="close-modal">Cancel</button><button class="button button-danger" type="button" data-action="confirm-reset">Restore sample data</button></div>`);
        break;
      case 'confirm-reset':
        state.reports = SAMPLE_REPORTS.map(item => ({ ...item, activity: [...item.activity] }));
        state.notifications = [];
        state.users = [];
        state.preferences = {};
        if (saveData()) { $('#modal').close(); render(); toast('Sample maintenance data restored.'); }
        break;
    }
  });

  document.addEventListener('submit', event => {
    if (event.target.id === 'loginForm') {
      event.preventDefault();
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;
      const error = $('#loginError');
      if (!email || !$('#loginEmail').validity.valid || !password) {
        error.textContent = 'Enter a valid email address and password to continue.';
        error.hidden = false;
        return;
      }
      error.hidden = true;
      const submitButton = event.submitter;
      const label = submitButton?.textContent || 'Sign In';
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Signing in…'; }
      const role = $('.role-tab.active')?.dataset.role || 'student';
      const savedProfile = state.users.find(user => user.email.trim().toLowerCase() === email.toLowerCase());
      const demoProfile = { student: ['Alex Morgan', 'student@fixforward.demo', 'student-demo'], staff: ['Jordan Lee', 'staff@fixforward.demo', 'staff-demo'], admin: ['Taylor Admin', 'admin@fixforward.demo', 'admin-demo'] }[role];
      setTimeout(() => {
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = label; }
        if (savedProfile) startSession(savedProfile.role, savedProfile.name, savedProfile.email, savedProfile.id);
        else startSession(role, ...demoProfile);
      }, 450);
    } else if (event.target.id === 'reportForm') {
      event.preventDefault();
      submitReport(event.target);
    } else if (event.target.id === 'updateForm') {
      event.preventDefault();
      updateRequest(event.target);
    } else if (event.target.id === 'profileForm') {
      event.preventDefault();
      const data = new FormData(event.target);
      const name = String(data.get('name')).trim();
      const email = String(data.get('email')).trim();
      if (!name || !email || !email.includes('@')) { toast('Enter a valid name and email address.'); return; }
      state.user.name = name;
      state.user.email = email;
      const user = state.users.find(item => item.id === state.user.id);
      if (user) { user.name = name; user.email = email; }
      if (saveData()) { render(); toast('Profile saved on this device.'); }
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'requestSearch') {
      state.query = event.target.value;
      state.pageNumber = 1;
      preserveFocus(render);
    }
  });

  document.addEventListener('change', event => {
    if (event.target.matches('[data-filter]')) {
      const { filter } = event.target.dataset;
      if (filter === 'status') state.statusFilter = event.target.value;
      if (filter === 'priority') state.priorityFilter = event.target.value;
      if (filter === 'category') state.categoryFilter = event.target.value;
      if (filter === 'sort') state.sort = event.target.value;
      state.pageNumber = 1;
      render();
    } else if (event.target.matches('[data-assign]')) {
      assignRequest(event.target.dataset.assign, event.target.value);
    } else if (event.target.matches('[data-analytics-range]')) {
      state.analyticsRange = event.target.value;
      render();
    } else if (event.target.id === 'photoInput') {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1_200_000) {
        toast('Choose a JPG, PNG, or WebP image under 1.2 MB.');
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => toast('The selected image could not be read.');
      reader.onload = () => {
        state.pendingPhoto = String(reader.result);
        const preview = $('#photoPreview');
        preview.innerHTML = `<img src="${state.pendingPhoto}" alt="Selected issue photo"><button type="button" class="text-button danger" data-action="remove-photo">Remove photo</button>`;
        preview.hidden = false;
      };
      reader.readAsDataURL(file);
    }
  });

  $$('.role-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.role-tab').forEach(item => item.classList.toggle('active', item === tab));
    $('#loginEmail').placeholder = `${tab.dataset.role}@fixforward.demo`;
    $('#loginError').hidden = true;
  }));

  try {
    if (localStorage.getItem('fixforward_theme') === 'dark') document.body.classList.add('dark-mode');
  } catch (error) {
    console.error('Could not read theme preference.', error);
  }
  loadData();
})();
