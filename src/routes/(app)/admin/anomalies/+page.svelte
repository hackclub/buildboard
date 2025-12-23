<script lang="ts">
    interface ProjectUser {
        user_id: string;
        handle: string;
    }

    interface AnomalyProject {
        project_id: string;
        project_name: string;
        anomaly_type: 'zero_hours' | 'high_hours' | 'null_hours';
        hackatime_hours: number | null;
        submission_week: string;
        review_status: string;
        created_at: string;
        user: ProjectUser;
    }

    type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

    let projects = $state<AnomalyProject[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let currentPage = $state(0);
    let hasMore = $state(true);
    const limit = 50;

    async function fetchProjects() {
        loading = true;
        error = null;
        try {
            const params = new URLSearchParams({
                skip: (currentPage * limit).toString(),
                limit: limit.toString()
            });
            const res = await fetch(`/api/admin/projects/anomalies?${params}`);
            if (!res.ok) throw new Error('Failed to fetch anomalies');
            projects = await res.json();
            hasMore = projects.length === limit;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            loading = false;
        }
    }

    function goToPage(page: number) {
        currentPage = page;
        fetchProjects();
    }

    function getAnomalyInfo(type: string): { label: string; class: string } {
        switch (type) {
            case 'zero_hours': return { label: 'Zero Hours', class: 'anomaly-zero' };
            case 'high_hours': return { label: '>80 Hours', class: 'anomaly-high' };
            case 'null_hours': return { label: 'No Data', class: 'anomaly-null' };
            default: return { label: 'Unknown', class: '' };
        }
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

    async function quickReview(project: AnomalyProject, status: ReviewStatus) {
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

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    $effect(() => {
        fetchProjects();
    });
</script>

<div class="page-container">
    <header class="page-header">
        <div>
            <h1>Hours Anomalies</h1>
            <p>Projects with unusual hackatime data</p>
        </div>
        <a href="/admin" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
        </a>
    </header>

    <div class="legend-card">
        <span class="legend-item"><span class="dot anomaly-zero"></span> Zero Hours</span>
        <span class="legend-item"><span class="dot anomaly-high"></span> High (&gt;80h)</span>
        <span class="legend-item"><span class="dot anomaly-null"></span> No Data</span>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading anomalies...</p>
        </div>
    {:else if error}
        <div class="error-card">
            <p>{error}</p>
            <button class="btn-secondary" onclick={() => { error = null; fetchProjects(); }}>Dismiss</button>
        </div>
    {:else if projects.length === 0}
        <div class="empty-state">
            <p>No anomalies found 🎉</p>
        </div>
    {:else}
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>User</th>
                        <th>Anomaly</th>
                        <th>Hours</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each projects as project}
                        {@const anomaly = getAnomalyInfo(project.anomaly_type)}
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
                                <span class="anomaly-badge {anomaly.class}">{anomaly.label}</span>
                            </td>
                            <td class="hours-cell">
                                {project.hackatime_hours !== null ? project.hackatime_hours.toFixed(1) : '—'}
                            </td>
                            <td>
                                <span class="status-badge {getStatusClass(project.review_status)}">
                                    {project.review_status || 'pending'}
                                </span>
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

<style>
    .page-container {
        max-width: 900px;
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

    .legend-card {
        background: rgba(46, 34, 33, 0.95);
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--bb-text-secondary);
    }

    .dot {
        width: 10px;
        height: 10px;
    }

    .dot.anomaly-zero { background: #f87171; }
    .dot.anomaly-high { background: #fbbf24; }
    .dot.anomaly-null { background: #a3a3a3; }

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

    .anomaly-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .anomaly-zero {
        background: rgba(248, 113, 113, 0.2);
        color: #f87171;
    }

    .anomaly-high {
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
    }

    .anomaly-null {
        background: rgba(163, 163, 163, 0.2);
        color: #a3a3a3;
    }

    .hours-cell {
        color: var(--bb-text-muted);
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
</style>
