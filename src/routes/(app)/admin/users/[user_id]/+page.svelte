<script lang="ts">
    import { page } from '$app/stores';

    interface JourneyStep {
        completed: boolean;
        completed_at: string | null;
    }

    interface UserDetail {
        user: {
            user_id: string;
            email: string;
            handle: string | null;
            slack_id: string | null;
            phone_number: string | null;
            referral_code: string;
            identity_vault_id: string | null;
            idv_country: string | null;
            verification_status: string | null;
            ysws_eligible: boolean | null;
            created_at: string;
            updated_at: string;
        };
        profile: {
            first_name: string | null;
            last_name: string | null;
            avatar_url: string | null;
            bio: string | null;
            is_public: boolean;
            birthday: string | null;
        };
        journey: {
            storyline: JourneyStep;
            slack: JourneyStep;
            idv: JourneyStep;
            hackatime: JourneyStep;
            onboarding: JourneyStep;
        };
        roles: string[];
        stats: {
            total_projects: number;
            shipped_projects: number;
            total_hours: number;
            total_hackatime_seconds: number;
            votes_cast: number;
            votes_received: number;
            reviews_received: number;
            login_count: number;
            referred_users: number;
        };
        referrer: { user_id: string; handle: string } | null;
        projects: Array<{
            project_id: string;
            project_name: string;
            project_description: string;
            project_type: string;
            submission_week: string;
            shipped: boolean;
            hackatime_hours: number | null;
            review_status: string;
            code_url: string | null;
            live_url: string | null;
            created_at: string;
        }>;
        hackatime_projects: Array<{
            id: string;
            name: string;
            seconds: number;
            hours: number;
            updated_at: string;
        }>;
        recent_logins: Array<{
            id: string;
            logged_in_at: string;
        }>;
        onboarding_events: Array<{
            id: string;
            event: string;
            slide: number | null;
            created_at: string;
        }>;
        audit_logs: Array<{
            id: string;
            action: string;
            details: Record<string, unknown> | null;
            created_at: string;
        }>;
    }

    let data = $state<UserDetail | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    async function fetchUser() {
        loading = true;
        error = null;
        try {
            const res = await fetch(`/api/admin/users/${$page.params.user_id}`);
            if (!res.ok) throw new Error('Failed to fetch user');
            data = await res.json();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            loading = false;
        }
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatHours(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    }

    $effect(() => {
        fetchUser();
    });
</script>

<div class="page-container">
    <header class="page-header">
        <a href="/admin/users" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Users
        </a>
    </header>

    {#if loading}
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading user...</p>
        </div>
    {:else if error}
        <div class="error-card">
            <p>{error}</p>
            <button class="btn-secondary" onclick={() => fetchUser()}>Retry</button>
        </div>
    {:else if data}
        <!-- User Header -->
        <div class="user-header card">
            <div class="user-avatar">
                {#if data.profile.avatar_url}
                    <img src={data.profile.avatar_url} alt="Avatar" />
                {:else}
                    <div class="avatar-placeholder">
                        {(data.user.handle || data.user.email)?.[0]?.toUpperCase() || '?'}
                    </div>
                {/if}
            </div>
            <div class="user-info">
                <h1>@{data.user.handle || 'unknown'}</h1>
                <p class="user-name">
                    {data.profile.first_name || ''} {data.profile.last_name || ''}
                </p>
                <p class="user-email">{data.user.email}</p>
                <div class="user-badges">
                    {#each data.roles as role}
                        <span class="badge role-badge">{role}</span>
                    {/each}
                    {#if data.user.ysws_eligible}
                        <span class="badge ysws-badge">YSWS Eligible</span>
                    {/if}
                    {#if data.profile.is_public}
                        <span class="badge public-badge">Public Profile</span>
                    {/if}
                </div>
            </div>
            <div class="user-meta">
                <p><strong>User ID:</strong> <code>{data.user.user_id}</code></p>
                <p><strong>Joined:</strong> {formatDate(data.user.created_at)}</p>
                <p><strong>Last Updated:</strong> {formatDate(data.user.updated_at)}</p>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-row">
            <div class="stat-card">
                <span class="stat-value">{data.stats.total_projects}</span>
                <span class="stat-label">Projects</span>
            </div>
            <div class="stat-card">
                <span class="stat-value success">{data.stats.shipped_projects}</span>
                <span class="stat-label">Shipped</span>
            </div>
            <div class="stat-card">
                <span class="stat-value accent">{data.stats.total_hours.toFixed(1)}h</span>
                <span class="stat-label">Hours Logged</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">{data.stats.votes_cast}</span>
                <span class="stat-label">Votes Cast</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">{data.stats.votes_received}</span>
                <span class="stat-label">Votes Received</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">{data.stats.referred_users}</span>
                <span class="stat-label">Referrals</span>
            </div>
        </div>

        <div class="content-grid">
            <!-- Journey Progress -->
            <div class="card">
                <div class="card-badge">Journey Progress</div>
                <div class="journey-list">
                    {#each Object.entries(data.journey) as [step, info]}
                        <div class="journey-item" class:completed={info.completed}>
                            <span class="journey-icon">
                                {#if step === 'storyline'}📖
                                {:else if step === 'slack'}💬
                                {:else if step === 'idv'}✅
                                {:else if step === 'hackatime'}⏱️
                                {:else if step === 'onboarding'}🎉
                                {/if}
                            </span>
                            <span class="journey-name">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                            {#if info.completed && info.completed_at}
                                <span class="journey-date">{formatDate(info.completed_at)}</span>
                            {:else}
                                <span class="journey-pending">Pending</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Account Details -->
            <div class="card">
                <div class="card-badge">Account Details</div>
                <div class="details-list">
                    <div class="detail-row">
                        <span class="detail-label">Slack ID</span>
                        <span class="detail-value">{data.user.slack_id || '—'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">{data.user.phone_number || '—'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Referral Code</span>
                        <code class="detail-value">{data.user.referral_code}</code>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">IDV Country</span>
                        <span class="detail-value">{data.user.idv_country || '—'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Verification</span>
                        <span class="detail-value">{data.user.verification_status || '—'}</span>
                    </div>
                    {#if data.referrer}
                        <div class="detail-row">
                            <span class="detail-label">Referred By</span>
                            <a href="/admin/users/{data.referrer.user_id}" class="detail-value link">
                                @{data.referrer.handle || 'unknown'}
                            </a>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Projects Section -->
        <div class="card">
            <div class="card-badge">Projects ({data.projects.length})</div>
            {#if data.projects.length === 0}
                <p class="empty-text">No projects yet</p>
            {:else}
                <div class="projects-list">
                    {#each data.projects as project}
                        <div class="project-item">
                            <div class="project-header">
                                <h3>{project.project_name}</h3>
                                <div class="project-badges">
                                    {#if project.shipped}
                                        <span class="badge shipped-badge">Shipped</span>
                                    {/if}
                                    <span class="badge status-badge" class:approved={project.review_status === 'approved'} class:rejected={project.review_status === 'rejected'} class:pending={project.review_status === 'pending'}>
                                        {project.review_status}
                                    </span>
                                </div>
                            </div>
                            <p class="project-desc">{project.project_description}</p>
                            <div class="project-meta">
                                <span>Week: {project.submission_week}</span>
                                <span>Hours: {project.hackatime_hours?.toFixed(1) || '0'}h</span>
                                <span>Created: {formatDate(project.created_at)}</span>
                                {#if project.code_url}
                                    <a href={project.code_url} target="_blank" rel="noopener">Code</a>
                                {/if}
                                {#if project.live_url}
                                    <a href={project.live_url} target="_blank" rel="noopener">Live</a>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Hackatime Projects -->
        <div class="card">
            <div class="card-badge">Hackatime Projects ({data.hackatime_projects.length})</div>
            {#if data.hackatime_projects.length === 0}
                <p class="empty-text">No Hackatime projects linked</p>
            {:else}
                <div class="hackatime-list">
                    {#each data.hackatime_projects as hp}
                        <div class="hackatime-item">
                            <span class="hackatime-name">{hp.name}</span>
                            <span class="hackatime-hours">{hp.hours}h</span>
                        </div>
                    {/each}
                </div>
                <div class="hackatime-total">
                    Total: {formatHours(data.stats.total_hackatime_seconds)}
                </div>
            {/if}
        </div>

        <!-- Recent Activity Grid -->
        <div class="content-grid">
            <!-- Recent Logins -->
            <div class="card">
                <div class="card-badge">Recent Logins ({data.recent_logins.length})</div>
                {#if data.recent_logins.length === 0}
                    <p class="empty-text">No login events</p>
                {:else}
                    <div class="events-list">
                        {#each data.recent_logins as login}
                            <div class="event-item">
                                <span class="event-icon">🔐</span>
                                <span class="event-date">{formatDate(login.logged_in_at)}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Onboarding Events -->
            <div class="card">
                <div class="card-badge">Onboarding Events</div>
                {#if data.onboarding_events.length === 0}
                    <p class="empty-text">No onboarding events</p>
                {:else}
                    <div class="events-list">
                        {#each data.onboarding_events as event}
                            <div class="event-item">
                                <span class="event-name">{event.event}</span>
                                {#if event.slide !== null}
                                    <span class="event-slide">Slide {event.slide}</span>
                                {/if}
                                <span class="event-date">{formatDate(event.created_at)}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Audit Log -->
        {#if data.audit_logs.length > 0}
            <div class="card">
                <div class="card-badge">Audit Log</div>
                <div class="audit-list">
                    {#each data.audit_logs as log}
                        <div class="audit-item">
                            <span class="audit-action">{log.action}</span>
                            <span class="audit-date">{formatDate(log.created_at)}</span>
                            {#if log.details}
                                <pre class="audit-details">{JSON.stringify(log.details, null, 2)}</pre>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 1rem 3rem;
    }

    .page-header {
        padding: 0.5rem 0 1rem;
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

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
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
        padding: 1.5rem;
        text-align: center;
    }

    .error-card p {
        color: #fca5a5;
        margin: 0 0 1rem;
    }

    .card {
        background: rgba(46, 34, 33, 0.95);
        padding: 1.5rem;
        margin-bottom: 1rem;
    }

    .card-badge {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--bb-primary);
        margin-bottom: 1rem;
    }

    /* User Header */
    .user-header {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;
    }

    .user-avatar img,
    .avatar-placeholder {
        width: 80px;
        height: 80px;
        object-fit: cover;
    }

    .avatar-placeholder {
        background: var(--bb-primary);
        color: var(--bb-bg-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 700;
    }

    .user-info {
        flex: 1;
    }

    .user-info h1 {
        font-size: 1.5rem;
        margin: 0 0 0.25rem;
        color: var(--bb-text-primary);
    }

    .user-name {
        font-size: 1rem;
        color: var(--bb-text-secondary);
        margin: 0 0 0.25rem;
    }

    .user-email {
        font-size: 0.9rem;
        color: var(--bb-text-muted);
        margin: 0 0 0.75rem;
    }

    .user-badges {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .role-badge {
        background: rgba(139, 92, 246, 0.2);
        color: #a78bfa;
    }

    .ysws-badge {
        background: rgba(74, 222, 128, 0.2);
        color: #4ade80;
    }

    .public-badge {
        background: rgba(59, 130, 246, 0.2);
        color: #60a5fa;
    }

    .shipped-badge {
        background: rgba(74, 222, 128, 0.2);
        color: #4ade80;
    }

    .status-badge.approved { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
    .status-badge.rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .status-badge.pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }

    .user-meta {
        text-align: right;
        font-size: 0.8rem;
        color: var(--bb-text-muted);
    }

    .user-meta p {
        margin: 0 0 0.25rem;
    }

    .user-meta code {
        font-size: 0.7rem;
        background: rgba(0,0,0,0.3);
        padding: 0.1rem 0.3rem;
    }

    /* Stats Row */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
        .stats-row {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .stat-card {
        background: rgba(46, 34, 33, 0.95);
        padding: 1rem;
        text-align: center;
    }

    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--bb-text-primary);
    }

    .stat-value.success { color: #4ade80; }
    .stat-value.accent { color: var(--bb-primary); }

    .stat-label {
        font-size: 0.7rem;
        color: var(--bb-text-muted);
        text-transform: uppercase;
    }

    /* Content Grid */
    .content-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
        .content-grid {
            grid-template-columns: 1fr;
        }
        .user-header {
            flex-direction: column;
        }
        .user-meta {
            text-align: left;
        }
    }

    /* Journey List */
    .journey-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .journey-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.03);
        opacity: 0.5;
    }

    .journey-item.completed {
        opacity: 1;
    }

    .journey-icon {
        font-size: 1.2rem;
    }

    .journey-name {
        flex: 1;
        font-weight: 500;
        color: var(--bb-text-primary);
    }

    .journey-date {
        font-size: 0.75rem;
        color: #4ade80;
    }

    .journey-pending {
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    /* Details List */
    .details-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.03);
    }

    .detail-label {
        font-size: 0.85rem;
        color: var(--bb-text-muted);
    }

    .detail-value {
        font-size: 0.85rem;
        color: var(--bb-text-primary);
    }

    .detail-value.link {
        color: var(--bb-primary);
        text-decoration: none;
    }

    .detail-value.link:hover {
        text-decoration: underline;
    }

    /* Projects List */
    .projects-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .project-item {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
    }

    .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
    }

    .project-header h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--bb-text-primary);
    }

    .project-badges {
        display: flex;
        gap: 0.25rem;
    }

    .project-desc {
        font-size: 0.85rem;
        color: var(--bb-text-muted);
        margin: 0 0 0.75rem;
    }

    .project-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    .project-meta a {
        color: var(--bb-primary);
        text-decoration: none;
    }

    /* Hackatime List */
    .hackatime-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .hackatime-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.03);
    }

    .hackatime-name {
        color: var(--bb-text-primary);
    }

    .hackatime-hours {
        color: var(--bb-primary);
        font-weight: 600;
    }

    .hackatime-total {
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        text-align: right;
        font-weight: 600;
        color: var(--bb-primary);
    }

    /* Events List */
    .events-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .event-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.03);
        font-size: 0.85rem;
    }

    .event-icon {
        font-size: 1rem;
    }

    .event-name {
        flex: 1;
        color: var(--bb-text-primary);
    }

    .event-slide {
        color: var(--bb-text-muted);
        font-size: 0.75rem;
    }

    .event-date {
        color: var(--bb-text-muted);
        font-size: 0.75rem;
    }

    /* Audit List */
    .audit-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .audit-item {
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.03);
    }

    .audit-action {
        font-weight: 500;
        color: var(--bb-text-primary);
    }

    .audit-date {
        margin-left: 1rem;
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    .audit-details {
        margin: 0.5rem 0 0;
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.3);
        font-size: 0.75rem;
        color: var(--bb-text-muted);
        overflow-x: auto;
    }

    .empty-text {
        color: var(--bb-text-muted);
        font-style: italic;
        margin: 0;
    }

    .btn-secondary {
        padding: 0.6rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-secondary);
        font-weight: 500;
        font-size: 0.85rem;
        border: none;
        cursor: pointer;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    code {
        font-family: monospace;
    }
</style>
