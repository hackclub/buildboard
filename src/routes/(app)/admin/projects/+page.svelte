<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';

    interface ProjectUser {
        user_id: string;
        handle: string;
        email: string;
    }

    interface Project {
        project_id: string;
        project_name: string;
        project_description: string;
        project_type: string;
        submission_week: string;
        shipped: boolean;
        hackatime_hours: number;
        review_status: string;
        review_notes: string | null;
        reviewed_by: string | null;
        reviewed_at: string | null;
        created_at: string;
        sent_to_airtable?: boolean;
        user: ProjectUser;
    }

    type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

    let projects = $state<Project[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let currentPage = $state(0);
    let hasMore = $state(true);
    const limit = 50;

    let searchQuery = $state('');
    let reviewStatusFilter = $state<string>('');
    let shippedFilter = $state<string>('');
    let weekFilter = $state('');

    let reviewingProject = $state<Project | null>(null);
    let reviewStatus = $state<ReviewStatus>('pending');
    let reviewNotes = $state('');
    let reviewLoading = $state(false);

    $effect(() => {
        if (browser) {
            const params = $page.url.searchParams;
            searchQuery = params.get('q') || '';
            reviewStatusFilter = params.get('review_status') || '';
            shippedFilter = params.get('shipped') || '';
            weekFilter = params.get('week') || '';
            currentPage = parseInt(params.get('page') || '0', 10);
        }
    });

    function updateUrl() {
        if (!browser) return;
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (reviewStatusFilter) params.set('review_status', reviewStatusFilter);
        if (shippedFilter) params.set('shipped', shippedFilter);
        if (weekFilter) params.set('week', weekFilter);
        if (currentPage > 0) params.set('page', currentPage.toString());
        
        const newUrl = params.toString() ? `?${params.toString()}` : '/admin/projects';
        goto(newUrl, { replaceState: true, keepFocus: true });
    }

    async function fetchProjects() {
        loading = true;
        error = null;
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (reviewStatusFilter) params.set('review_status', reviewStatusFilter);
            if (shippedFilter) params.set('shipped', shippedFilter);
            if (weekFilter) params.set('week', weekFilter);
            params.set('skip', (currentPage * limit).toString());
            params.set('limit', limit.toString());

            const res = await fetch(`/api/admin/projects?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            projects = await res.json();
            hasMore = projects.length === limit;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            loading = false;
        }
    }

    function applyFilters() {
        currentPage = 0;
        updateUrl();
        fetchProjects();
    }

    function clearFilters() {
        searchQuery = '';
        reviewStatusFilter = '';
        shippedFilter = '';
        weekFilter = '';
        currentPage = 0;
        updateUrl();
        fetchProjects();
    }

    function goToPage(page: number) {
        currentPage = page;
        updateUrl();
        fetchProjects();
    }

    function getStatusClass(status: string): string {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            case 'flagged': return 'status-flagged';
            default: return '';
        }
    }

    function openReviewModal(project: Project) {
        reviewingProject = project;
        reviewStatus = (project.review_status as ReviewStatus) || 'pending';
        reviewNotes = project.review_notes || '';
    }

    function closeReviewModal() {
        reviewingProject = null;
        reviewNotes = '';
        reviewLoading = false;
    }

    async function submitReview() {
        if (!reviewingProject) return;
        reviewLoading = true;
        try {
            const res = await fetch(`/api/admin/projects/${reviewingProject.project_id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: reviewStatus, notes: reviewNotes })
            });
            if (!res.ok) throw new Error('Failed to update review');
            const idx = projects.findIndex(p => p.project_id === reviewingProject!.project_id);
            if (idx !== -1) {
                projects[idx] = { ...projects[idx], review_status: reviewStatus, review_notes: reviewNotes };
            }
            closeReviewModal();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to update review';
        } finally {
            reviewLoading = false;
        }
    }

    async function quickReview(project: Project, status: ReviewStatus) {
        try {
            const res = await fetch(`/api/admin/projects/${project.project_id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, notes: '' })
            });
            if (!res.ok) throw new Error('Failed to update review');
            const idx = projects.findIndex(p => p.project_id === project.project_id);
            if (idx !== -1) {
                projects[idx] = { ...projects[idx], review_status: status };
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to update review';
        }
    }

    $effect(() => {
        fetchProjects();
    });
</script>

<div class="page-container">
    <header class="page-header">
        <div>
            <h1>Projects</h1>
            <p>Manage and review all platform projects</p>
        </div>
        <a href="/admin" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
        </a>
    </header>

    <!-- Filters -->
    <div class="filters-card">
        <div class="filters-row">
            <input
                type="text"
                bind:value={searchQuery}
                onkeydown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Search projects..."
                class="search-input"
            />
            <select bind:value={reviewStatusFilter} onchange={applyFilters} class="filter-select">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
            </select>
            <select bind:value={shippedFilter} onchange={applyFilters} class="filter-select">
                <option value="">All</option>
                <option value="true">Shipped</option>
                <option value="false">Not Shipped</option>
            </select>
            <button class="btn-primary" onclick={applyFilters}>Search</button>
            <button class="btn-secondary" onclick={clearFilters}>Clear</button>
        </div>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading projects...</p>
        </div>
    {:else if error}
        <div class="error-card">
            <p>{error}</p>
            <button class="btn-secondary" onclick={() => { error = null; fetchProjects(); }}>Dismiss</button>
        </div>
    {:else if projects.length === 0}
        <div class="empty-state">
            <p>No projects found</p>
            {#if searchQuery || reviewStatusFilter || shippedFilter}
                <button class="btn-secondary" onclick={clearFilters}>Clear Filters</button>
            {/if}
        </div>
    {:else}
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>User</th>
                        <th>Hours</th>
                        <th>Status</th>
                        <th>Shipped</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each projects as project}
                        <tr>
                            <td>
                                <a href="/projects/{project.project_id}" class="project-link">
                                    {project.project_name}
                                </a>
                                <span class="project-week">Week {project.submission_week}</span>
                            </td>
                            <td>
                                <a href="/admin/users/{project.user.user_id}" class="user-link">
                                    @{project.user.handle || 'unknown'}
                                </a>
                            </td>
                            <td>
                                <span class="hours-value" class:hours-zero={!project.hackatime_hours} class:hours-high={project.hackatime_hours > 80}>
                                    {project.hackatime_hours?.toFixed(1) || '0'}h
                                </span>
                            </td>
                            <td>
                                <span class="status-badge {getStatusClass(project.review_status)}">
                                    {project.review_status || 'pending'}
                                </span>
                            </td>
                            <td>
                                {#if project.shipped}
                                    <span class="shipped-badge">Shipped</span>
                                {:else}
                                    <span class="not-shipped">—</span>
                                {/if}
                            </td>
                            <td class="actions-cell">
                                {#if project.review_status !== 'approved'}
                                    <button class="action-btn approve" onclick={() => quickReview(project, 'approved')} title="Approve">✓</button>
                                {/if}
                                {#if project.review_status !== 'rejected'}
                                    <button class="action-btn reject" onclick={() => quickReview(project, 'rejected')} title="Reject">✗</button>
                                {/if}
                                {#if project.review_status !== 'flagged'}
                                    <button class="action-btn flag" onclick={() => quickReview(project, 'flagged')} title="Flag">⚑</button>
                                {/if}
                                <button class="action-btn edit" onclick={() => openReviewModal(project)} title="Edit">✎</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="pagination">
            <span class="pagination-info">Page {currentPage + 1}</span>
            <div class="pagination-btns">
                <button class="btn-secondary" onclick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
                <button class="btn-secondary" onclick={() => goToPage(currentPage + 1)} disabled={!hasMore}>Next</button>
            </div>
        </div>
    {/if}
</div>

{#if reviewingProject}
    <div class="modal-overlay" onclick={closeReviewModal}>
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <h2>Review Project</h2>
            <p class="modal-subtitle">{reviewingProject.project_name}</p>
            
            <div class="form-group">
                <label for="status">Status</label>
                <select id="status" bind:value={reviewStatus} class="filter-select">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="flagged">Flagged</option>
                </select>
            </div>

            <div class="form-group">
                <label for="notes">Notes</label>
                <textarea id="notes" bind:value={reviewNotes} placeholder="Add review notes..." rows="3"></textarea>
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" onclick={closeReviewModal}>Cancel</button>
                <button class="btn-primary" onclick={submitReview} disabled={reviewLoading}>
                    {reviewLoading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .page-container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1rem 3rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0.5rem 0 1.5rem;
    }

    .page-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.25rem;
    }

    .page-header p {
        font-size: 1rem;
        color: var(--bb-text-muted);
        margin: 0;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--bb-primary);
    }

    .filters-card {
        background: rgba(46, 34, 33, 0.95);
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .filters-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .search-input {
        flex: 1;
        min-width: 200px;
        padding: 0.6rem 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
        font-size: 0.9rem;
    }

    .search-input::placeholder {
        color: var(--bb-text-muted);
    }

    .filter-select {
        padding: 0.6rem 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
        font-size: 0.9rem;
    }

    .loading-state, .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        gap: 1rem;
        color: var(--bb-text-muted);
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--bb-accent-dark);
        border-top-color: var(--bb-primary);
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-card {
        background: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .error-card p {
        color: #fca5a5;
        margin: 0;
    }

    .table-card {
        background: rgba(46, 34, 33, 0.95);
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 0.75rem 1rem;
        text-align: left;
    }

    th {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--bb-text-muted);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        font-size: 0.9rem;
    }

    tr:hover td {
        background: rgba(255, 255, 255, 0.02);
    }

    .project-link {
        color: var(--bb-text-primary);
        text-decoration: none;
        font-weight: 500;
    }

    .project-link:hover {
        color: var(--bb-primary);
    }

    .project-week {
        display: block;
        font-size: 0.75rem;
        color: var(--bb-text-muted);
        margin-top: 0.15rem;
    }

    .user-link {
        color: var(--bb-text-secondary);
        text-decoration: none;
        font-size: 0.85rem;
    }

    .user-link:hover {
        color: var(--bb-primary);
    }

    .hours-value {
        color: var(--bb-text-primary);
    }

    .hours-zero {
        color: #f87171;
    }

    .hours-high {
        color: #fbbf24;
    }

    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .status-pending {
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
    }

    .status-approved {
        background: rgba(74, 222, 128, 0.2);
        color: #4ade80;
    }

    .status-rejected {
        background: rgba(248, 113, 113, 0.2);
        color: #f87171;
    }

    .status-flagged {
        background: rgba(251, 146, 60, 0.2);
        color: #fb923c;
    }

    .shipped-badge {
        color: #4ade80;
        font-size: 0.8rem;
    }

    .not-shipped {
        color: var(--bb-text-muted);
    }

    .actions-cell {
        display: flex;
        gap: 0.25rem;
    }

    .action-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s;
    }

    .action-btn.approve { color: #4ade80; }
    .action-btn.approve:hover { background: rgba(74, 222, 128, 0.2); }
    .action-btn.reject { color: #f87171; }
    .action-btn.reject:hover { background: rgba(248, 113, 113, 0.2); }
    .action-btn.flag { color: #fb923c; }
    .action-btn.flag:hover { background: rgba(251, 146, 60, 0.2); }
    .action-btn.edit { color: var(--bb-text-muted); }
    .action-btn.edit:hover { background: rgba(255, 255, 255, 0.1); color: var(--bb-text-primary); }

    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
    }

    .pagination-info {
        color: var(--bb-text-muted);
        font-size: 0.9rem;
    }

    .pagination-btns {
        display: flex;
        gap: 0.5rem;
    }

    .btn-primary {
        padding: 0.6rem 1rem;
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 0.85rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-primary:hover {
        transform: translateY(-1px);
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .btn-secondary {
        padding: 0.6rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-secondary);
        font-weight: 500;
        font-size: 0.85rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
    }

    .btn-secondary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .modal-content {
        background: rgba(46, 34, 33, 0.98);
        padding: 1.5rem;
        width: 100%;
        max-width: 400px;
        margin: 1rem;
    }

    .modal-content h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.25rem;
    }

    .modal-subtitle {
        color: var(--bb-text-muted);
        margin: 0 0 1.5rem;
        font-size: 0.9rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        font-size: 0.85rem;
        color: var(--bb-text-secondary);
        margin-bottom: 0.5rem;
    }

    .form-group textarea {
        width: 100%;
        padding: 0.6rem 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
        font-size: 0.9rem;
        resize: none;
    }

    .form-group textarea::placeholder {
        color: var(--bb-text-muted);
    }

    .modal-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
</style>
