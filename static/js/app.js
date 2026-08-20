/**
 * Adobe Hackathon 2026 Dashboard - Client App Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    q: '',
    org: '',
    size: '',
    cross_org: null,
    sort_by: 'relevance',
    order: 'asc',
    page: 1,
    limit: 24,
    view: localStorage.getItem('adobe_dashboard_view') || 'grid'
  };

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const orgSelect = document.getElementById('orgSelect');
  const sizeSelect = document.getElementById('sizeSelect');
  const crossOrgBtn = document.getElementById('crossOrgBtn');
  const sortSelect = document.getElementById('sortSelect');
  const sortOrderBtn = document.getElementById('sortOrderBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  const gridViewBtn = document.getElementById('gridViewBtn');
  const tableViewBtn = document.getElementById('tableViewBtn');

  const teamsGrid = document.getElementById('teamsGrid');
  const teamsTableWrap = document.getElementById('teamsTableWrap');
  const teamsTableBody = document.getElementById('teamsTableBody');

  const matchCount = document.getElementById('matchCount');
  const querySpeed = document.getElementById('querySpeed');
  const paginationContainer = document.getElementById('paginationContainer');

  const teamModalOverlay = document.getElementById('teamModalOverlay');
  const modalContent = document.getElementById('modalContent');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  let debounceTimer = null;

  // Initialize Theme
  initTheme();

  // Initialize View Mode
  setViewMode(state.view);

  // Initial Fetch if dashboard elements present
  if (teamsGrid) {
    fetchTeams();
  }

  // Search Input Handler (Debounced)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.q = e.target.value;
      state.page = 1;
      
      if (clearSearchBtn) {
        clearSearchBtn.style.display = state.q ? 'block' : 'none';
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchTeams();
      }, 250);
    });

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.q = '';
        state.page = 1;
        clearSearchBtn.style.display = 'none';
        fetchTeams();
      });
    }
  }

  // Filter Event Listeners
  if (orgSelect) {
    orgSelect.addEventListener('change', (e) => {
      state.org = e.target.value;
      state.page = 1;
      fetchTeams();
    });
  }

  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      state.size = e.target.value;
      state.page = 1;
      fetchTeams();
    });
  }

  if (crossOrgBtn) {
    crossOrgBtn.addEventListener('click', () => {
      if (state.cross_org === true) {
        state.cross_org = null;
        crossOrgBtn.classList.remove('active');
      } else {
        state.cross_org = true;
        crossOrgBtn.classList.add('active');
      }
      state.page = 1;
      fetchTeams();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort_by = e.target.value;
      state.page = 1;
      fetchTeams();
    });
  }

  if (sortOrderBtn) {
    sortOrderBtn.addEventListener('click', () => {
      state.order = state.order === 'asc' ? 'desc' : 'asc';
      sortOrderBtn.innerHTML = state.order === 'asc' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg> ASC`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg> DESC`;
      state.page = 1;
      fetchTeams();
    });
  }

  // View Mode Toggles
  if (gridViewBtn && tableViewBtn) {
    gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    tableViewBtn.addEventListener('click', () => setViewMode('table'));
  }

  // CSV Export Button
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const params = new URLSearchParams();
      if (state.q) params.set('q', state.q);
      if (state.org) params.set('org', state.org);
      if (state.size) params.set('size', state.size);
      if (state.cross_org !== null) params.set('cross_org', state.cross_org);
      params.set('sort_by', state.sort_by);
      params.set('order', state.order);

      window.location.href = `/api/export?${params.toString()}`;
    });
  }

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Modal Close
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (teamModalOverlay) {
    teamModalOverlay.addEventListener('click', (e) => {
      if (e.target === teamModalOverlay) closeModal();
    });
  }

  // API Fetch Function
  async function fetchTeams() {
    if (!teamsGrid) return;

    // Show Loading Spinner
    teamsGrid.innerHTML = `<div class="spinner"></div>`;
    if (teamsTableBody) teamsTableBody.innerHTML = `<tr><td colspan="6" class="text-center"><div class="spinner"></div></td></tr>`;

    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.org) params.set('org', state.org);
    if (state.size) params.set('size', state.size);
    if (state.cross_org !== null) params.set('cross_org', state.cross_org);
    params.set('sort_by', state.sort_by);
    params.set('order', state.order);
    params.set('page', state.page);
    params.set('limit', state.limit);

    try {
      const response = await fetch(`/api/teams?${params.toString()}`);
      const data = await response.json();

      renderResults(data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      teamsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to load dataset</h3>
          <p>An error occurred while fetching hackathon results.</p>
        </div>
      `;
    }
  }

  // Render Results
  function renderResults(data) {
    const { teams, total_matches, page, total_pages, query_time_ms } = data;

    // Update Metadata
    if (matchCount) matchCount.textContent = total_matches.toLocaleString();
    if (querySpeed) querySpeed.textContent = `(${query_time_ms} ms)`;

    if (!teams || teams.length === 0) {
      const emptyHtml = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No teams matched your criteria</h3>
          <p>Try clearing your search query or adjusting your filters.</p>
        </div>
      `;
      teamsGrid.innerHTML = emptyHtml;
      if (teamsTableBody) teamsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No matching results</td></tr>`;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    // Render Grid Cards
    teamsGrid.innerHTML = teams.map(team => createTeamCardHtml(team)).join('');

    // Render Table Rows
    if (teamsTableBody) {
      teamsTableBody.innerHTML = teams.map(team => createTeamTableRowHtml(team)).join('');
    }

    // Attach Click Handlers for Details Buttons
    document.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const teamIndex = e.currentTarget.dataset.index;
        openTeamModal(teamIndex);
      });
    });

    // Render Pagination
    renderPagination(page, total_pages);
  }

  // HTML Generator: Team Card
  function createTeamCardHtml(team) {
    const safeTeamName = escapeHtml(team.team_name);
    const safeLeaderOrg = escapeHtml(team.leader_org || 'N/A');

    const membersHtml = team.members.map(m => `
      <div class="member-item">
        <div class="member-main">
          <span class="role-badge ${m.role.toLowerCase() === 'leader' ? 'leader' : 'member'}">${escapeHtml(m.role)}</span>
          <span class="member-name" title="${escapeHtml(m.player_name)}">${escapeHtml(m.player_name)}</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="team-card">
        <div>
          <div class="team-card-header">
            <div>
              <span class="team-index-badge">#${team.entry_index}</span>
              ${team.is_cross_org ? '<span class="team-size-tag" style="background:rgba(234, 179, 8, 0.15); color:#facc15; margin-left:6px;">Cross-Org</span>' : ''}
            </div>
            <span class="team-size-tag">${team.member_count} Members</span>
          </div>

          <h3 class="team-title">${safeTeamName}</h3>
          
          <div class="team-members-list">
            ${membersHtml}
          </div>
        </div>

        <div class="team-card-footer">
          <span class="team-org-name" title="${safeLeaderOrg}">${safeLeaderOrg}</span>
          <button class="btn-view-details" data-index="${team.entry_index}">
            Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  // HTML Generator: Team Table Row
  function createTeamTableRowHtml(team) {
    const leader = team.members.find(m => m.role.toLowerCase() === 'leader') || team.members[0];
    const memberNames = team.members.map(m => escapeHtml(m.player_name)).join(', ');

    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight:700;">#${team.entry_index}</td>
        <td style="font-weight:700;">${escapeHtml(team.team_name)}</td>
        <td>${leader ? escapeHtml(leader.player_name) : 'N/A'}</td>
        <td style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(team.leader_org)}">${escapeHtml(team.leader_org)}</td>
        <td><span class="team-size-tag">${team.member_count}</span></td>
        <td>
          <button class="btn-view-details" data-index="${team.entry_index}">Inspect</button>
        </td>
      </tr>
    `;
  }

  // Pagination Renderer
  function renderPagination(currentPage, totalPages) {
    if (!paginationContainer) return;
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let buttons = [];

    // Prev Button
    buttons.push(`
      <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    `);

    // Dynamic Page Range
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      buttons.push(`<button class="page-btn" onclick="changePage(1)">1</button>`);
      if (startPage > 2) buttons.push(`<span style="color:var(--text-muted);">...</span>`);
    }

    for (let p = startPage; p <= endPage; p++) {
      buttons.push(`
        <button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="changePage(${p})">${p}</button>
      `);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push(`<span style="color:var(--text-muted);">...</span>`);
      buttons.push(`<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`);
    }

    // Next Button
    buttons.push(`
      <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    `);

    paginationContainer.innerHTML = `
      <div class="page-numbers">
        ${buttons.join('')}
      </div>
      <div style="font-size:0.85rem; color:var(--text-secondary);">
        Page ${currentPage} of ${totalPages}
      </div>
    `;
  }

  // Global Page Change
  window.changePage = function(page) {
    state.page = page;
    fetchTeams();
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Open Team Modal Drawer
  async function openTeamModal(entryIndex) {
    if (!teamModalOverlay || !modalContent) return;

    modalContent.innerHTML = `<div class="spinner"></div>`;
    teamModalOverlay.classList.add('active');

    try {
      const response = await fetch(`/api/team/${entryIndex}`);
      const team = await response.json();

      const membersList = team.members.map(m => `
        <div style="background:var(--input-bg); border:1px solid var(--card-border); padding:1rem; border-radius:var(--radius-md); margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="role-badge ${m.role.toLowerCase() === 'leader' ? 'leader' : 'member'}">${escapeHtml(m.role)}</span>
              <strong style="font-size:1.05rem;">${escapeHtml(m.player_name)}</strong>
            </div>
          </div>
          <div style="font-size:0.85rem; color:var(--text-secondary);">
            🏛️ ${escapeHtml(m.organisation || 'N/A')}
          </div>
        </div>
      `).join('');

      modalContent.innerHTML = `
        <div style="margin-bottom:1.5rem;">
          <span class="team-index-badge">Team #${team.entry_index}</span>
          <h2 style="font-size:1.6rem; font-weight:800; margin:0.5rem 0;">${escapeHtml(team.team_name)}</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem;">${team.member_count} Total Participants</p>
        </div>

        <h4 style="font-size:0.9rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:0.75rem;">Team Members</h4>
        ${membersList}
      `;
    } catch (err) {
      modalContent.innerHTML = `<p style="color:var(--accent-red);">Failed to load team details.</p>`;
    }
  }

  function closeModal() {
    if (teamModalOverlay) teamModalOverlay.classList.remove('active');
  }

  // View Mode Switcher
  function setViewMode(mode) {
    state.view = mode;
    localStorage.setItem('adobe_dashboard_view', mode);

    if (mode === 'table') {
      if (teamsGrid) teamsGrid.style.display = 'none';
      if (teamsTableWrap) teamsTableWrap.style.display = 'block';
      if (gridViewBtn) gridViewBtn.classList.remove('active');
      if (tableViewBtn) tableViewBtn.classList.add('active');
    } else {
      if (teamsGrid) teamsGrid.style.display = 'grid';
      if (teamsTableWrap) teamsTableWrap.style.display = 'none';
      if (gridViewBtn) gridViewBtn.classList.add('active');
      if (tableViewBtn) tableViewBtn.classList.remove('active');
    }
  }

  // Theme Initializer
  function initTheme() {
    const savedTheme = localStorage.getItem('adobe_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('adobe_theme', next);
        themeToggleBtn.innerHTML = next === 'dark' ? '☀️' : '🌙';
      });
    }
  }

  // Helper Utilities
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }
});
