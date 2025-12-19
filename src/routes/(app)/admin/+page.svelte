<script lang="ts">
    import FunnelChart from '$lib/components/FunnelChart.svelte';

    interface Stats {
        projects: {
            total: number;
            this_week: number;
            shipped: number;
            unshipped: number;
            pending_review: number;
            approved: number;
            rejected: number;
            flagged: number;
        };
        users: {
            total: number;
            with_projects: number;
            new_this_week: number;
            onboarding_completed: number;
        };
        hackatime: {
            total_hours: number;
            hours_this_week: number;
            projects_with_no_hours: number;
            projects_with_high_hours: number;
        };
        onboarding: {
            starts_total: number;
            completions_total: number;
            starts_last_7d: number;
            completions_last_7d: number;
        };
        user_journey: {
            total_users: number;
            storyline_completed: number;
            slack_linked: number;
            idv_completed: number;
            hackatime_completed: number;
            onboarding_completed: number;
            has_projects: number;
            has_shipped: number;
        };
    }

    let { data } = $props();
    let stats = $state<Stats | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    async function fetchStats() {
        loading = true;
        error = null;
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) {
                throw new Error('Failed to fetch stats');
            }
            stats = await res.json();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        fetchStats();
    });

    const journeySteps = $derived(stats?.user_journey ? [
        { label: 'signed up', value: stats.user_journey.total_users },
        { label: 'onboarding', value: stats.user_journey.storyline_completed },
        { label: 'Linked Slack', value: stats.user_journey.slack_linked },
        { label: 'ID Verified', value: stats.user_journey.idv_completed },
        { label: 'Hackatime', value: stats.user_journey.hackatime_completed },
        { label: 'Has Projects', value: stats.user_journey.has_projects },
        { label: 'Shipped', value: stats.user_journey.has_shipped },
    ] : []);
</script>

<div class="page-container">
    <header class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Monitor platform health and manage users</p>
    </header>

    {#if loading}
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading stats...</p>
        </div>
    {:else if error}
        <div class="error-card">
            <p>{error}</p>
            <button class="btn-secondary" onclick={() => fetchStats()}>Retry</button>
        </div>
    {:else if stats}
        <div class="stats-grid">
            <!-- Projects Card -->
            <div class="card">
                <div class="card-badge">Projects</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-value">{stats.projects.total}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value accent">{stats.projects.this_week}</span>
                        <span class="stat-label">This Week</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value success">{stats.projects.shipped}</span>
                        <span class="stat-label">Shipped</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value muted">{stats.projects.unshipped}</span>
                        <span class="stat-label">Unshipped</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value warning">{stats.projects.pending_review}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value success">{stats.projects.approved}</span>
                        <span class="stat-label">Approved</span>
                    </div>
                </div>
                <div class="card-actions">
                    <a href="/admin/projects" class="btn-secondary">View All</a>
                    <a href="/admin/projects?review_status=pending" class="btn-primary">
                        Review Pending
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Users Card -->
            <div class="card">
                <div class="card-badge">Users</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-value">{stats.users.total}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value accent">{stats.users.with_projects}</span>
                        <span class="stat-label">With Projects</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value success">{stats.users.new_this_week}</span>
                        <span class="stat-label">New This Week</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value success">{stats.users.onboarding_completed}</span>
                        <span class="stat-label">Onboarded</span>
                    </div>
                </div>
                <div class="card-actions">
                    <a href="/admin/users" class="btn-primary">
                        View Users
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Hackatime Card -->
            <div class="card">
                <div class="card-badge">Hackatime Hours</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-value">{stats.hackatime.total_hours.toFixed(1)}</span>
                        <span class="stat-label">Total Hours</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value accent">{stats.hackatime.hours_this_week.toFixed(1)}</span>
                        <span class="stat-label">This Week</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value warning">{stats.hackatime.projects_with_no_hours}</span>
                        <span class="stat-label">No Hours</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value warning">{stats.hackatime.projects_with_high_hours}</span>
                        <span class="stat-label">&gt;80h</span>
                    </div>
                </div>
                <div class="card-actions">
                    <a href="/admin/anomalies" class="btn-primary warning-btn">
                        View Anomalies
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Onboarding Card -->
            <div class="card">
                <div class="card-badge">Onboarding</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-value">{stats.onboarding.starts_total}</span>
                        <span class="stat-label">Starts (Total)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value success">{stats.onboarding.completions_total}</span>
                        <span class="stat-label">Completions</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value accent">{stats.onboarding.starts_last_7d}</span>
                        <span class="stat-label">Starts (7d)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value success">{stats.onboarding.completions_last_7d}</span>
                        <span class="stat-label">Done (7d)</span>
                    </div>
                </div>
                <div class="completion-rate">
                    {#if stats.onboarding.starts_total > 0}
                        <span class="rate-label">Completion rate:</span>
                        <span class="rate-value">{((stats.onboarding.completions_total / stats.onboarding.starts_total) * 100).toFixed(1)}%</span>
                    {:else}
                        <span class="rate-label">No onboarding data</span>
                    {/if}
                </div>
            </div>

            <!-- User Journey Funnel Card -->
            {#if stats.user_journey && journeySteps.length > 0}
                <div class="card card-full-width">
                    <div class="card-badge">User Journey Funnel</div>
                    <FunnelChart steps={journeySteps} height={320} />
                    <div class="funnel-summary">
                        <span class="rate-label">Total conversion (Registered → Shipped):</span>
                        <span class="rate-value">
                            {#if stats.user_journey.total_users > 0}
                                {((stats.user_journey.has_shipped / stats.user_journey.total_users) * 100).toFixed(1)}%
                            {:else}
                                0%
                            {/if}
                        </span>
                    </div>
                </div>
            {/if}
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

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        gap: 1rem;
    }

    .loading-state p {
        color: var(--bb-text-muted);
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--bb-accent-dark);
        border-top-color: var(--bb-primary);
        border-radius: 0;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .error-card {
        background: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        padding: 1.5rem;
        text-align: center;
    }

    .error-card p {
        color: #fca5a5;
        margin: 0 0 1rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }

    .card {
        background: rgba(46, 34, 33, 0.95);
        padding: 1.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    }

    .card-badge {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--bb-primary);
        margin-bottom: 1rem;
    }

    .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.03);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--bb-text-primary);
    }

    .stat-value.accent {
        color: var(--bb-primary);
    }

    .stat-value.success {
        color: #4ade80;
    }

    .stat-value.warning {
        color: #fbbf24;
    }

    .stat-value.muted {
        color: var(--bb-text-muted);
    }

    .stat-label {
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    .card-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 0.85rem;
        text-decoration: none;
        transition: all 0.2s;
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn-primary.warning-btn {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
    }

    .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-secondary);
        font-weight: 500;
        font-size: 0.85rem;
        text-decoration: none;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
    }

    .completion-rate {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .rate-label {
        font-size: 0.85rem;
        color: var(--bb-text-muted);
    }

    .rate-value {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--bb-primary);
    }

    .card-full-width {
        grid-column: 1 / -1;
    }

    .funnel-summary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-top: 1rem;
        margin-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
</style>
