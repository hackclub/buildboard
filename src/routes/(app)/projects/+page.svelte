<script lang="ts">
    import type { PageData } from "./$types";
    import TaskChecklist from "$lib/components/TaskChecklist.svelte";

    let { data }: { data: PageData } = $props();

    const sortedProjects = $derived(
        [...data.projects].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    );

    const mainProject = $derived(sortedProjects[0] || null);
    const relatedProjects = $derived(sortedProjects.slice(1));

    function formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
        });
    }

    let totalTime = $derived(
        data.projects.reduce((acc, p) => acc + (p.time_spent || 0), 0)
    );
</script>

<div class="page-container">
    <!-- Header -->
    <header class="page-header">
        <h1>Your Project</h1>
        <p>Focus on one thing. Ship it. Make it great.</p>
    </header>

    <!-- Tasks -->
    <div class="tasks-section">
        <TaskChecklist projects={data.projects} />
    </div>

    {#if data.projects.length === 0}
        <!-- Empty State Card -->
        <div class="card empty-card">
            <div class="empty-content">
                <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <h2>What will you build?</h2>
                <p>Pick a project and commit to it. Track your hours, ship your work, and earn rewards.</p>
                <a href="/projects/select" class="btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Choose Your Project
                </a>
            </div>
        </div>
    {:else}
        <!-- Main Project Card -->
        <div class="card main-card">
            <div class="card-badge">Current Project</div>
            
            <a href="/projects/{mainProject.project_id}" class="project-link">
                <h2>{mainProject.project_name}</h2>
                <p class="project-meta">
                    <span>Week {mainProject.submission_week}</span>
                    <span class="dot">•</span>
                    <span>Started {formatDate(mainProject.created_at)}</span>
                </p>
            </a>

            <div class="stats-row">
                <div class="stat">
                    <div class="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                        </svg>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">{formatTime(mainProject.time_spent)}</span>
                        <span class="stat-label">This Project</span>
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">{formatTime(totalTime)}</span>
                        <span class="stat-label">Total Logged</span>
                    </div>
                </div>
            </div>

            <div class="card-actions">
                <a href="/projects/{mainProject.project_id}" class="btn-primary">
                    View Project
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </a>
                {#if mainProject.code_url}
                    <a href={mainProject.code_url} target="_blank" rel="noopener" class="btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                        </svg>
                        Code
                    </a>
                {/if}
            </div>
        </div>

        <!-- Related Work -->
        {#if relatedProjects.length > 0}
            <div class="card related-card">
                <div class="card-header">
                    <h3>Related Work</h3>
                    <span class="card-hint">Sub-projects & modules</span>
                </div>
                <div class="related-list">
                    {#each relatedProjects as project}
                        <a href="/projects/{project.project_id}" class="related-item">
                            <div class="related-content">
                                <span class="related-name">{project.project_name}</span>
                                <span class="related-meta">Week {project.submission_week} • {formatTime(project.time_spent)}</span>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </a>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Add Related -->
        <div class="add-section">
            <a href="/projects/select" class="add-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Add Related Work
            </a>
        </div>
    {/if}
</div>

<style>
    .page-container {
        max-width: 640px;
        margin: 0 auto;
        padding: 0 1rem 3rem;
    }

    /* Header */
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

    /* Tasks */
    .tasks-section {
        margin-bottom: 1.5rem;
    }

    /* Cards */
    .card {
        background: rgba(46, 34, 33, 0.95);
        border-radius: 8px;
        padding: 1.5rem 2rem;
        margin-bottom: 1rem;
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

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 1rem;
    }

    .card-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        margin: 0;
    }

    .card-hint {
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    /* Empty State */
    .empty-card {
        text-align: center;
        padding: 3rem 2rem;
    }

    .empty-content {
        max-width: 320px;
        margin: 0 auto;
    }

    .empty-icon {
        color: var(--bb-text-muted);
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .empty-content h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.5rem;
    }

    .empty-content p {
        font-size: 0.9rem;
        color: var(--bb-text-muted);
        line-height: 1.5;
        margin: 0 0 1.5rem;
    }

    /* Main Project */
    .project-link {
        display: block;
        text-decoration: none;
        margin-bottom: 1.5rem;
    }

    .project-link h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.35rem;
        transition: color 0.2s;
    }

    .project-link:hover h2 {
        color: var(--bb-primary);
    }

    .project-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--bb-text-muted);
        margin: 0;
    }

    .dot {
        opacity: 0.4;
    }

    /* Stats */
    .stats-row {
        display: flex;
        gap: 2rem;
        padding: 1.25rem 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 1.5rem;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .stat-icon {
        color: var(--bb-primary);
        opacity: 0.8;
    }

    .stat-content {
        display: flex;
        flex-direction: column;
    }

    .stat-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--bb-text-primary);
    }

    .stat-label {
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    /* Actions */
    .card-actions {
        display: flex;
        gap: 0.75rem;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1.25rem;
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 0.9rem;
        border-radius: 6px;
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

    .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1.25rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-secondary);
        font-weight: 500;
        font-size: 0.9rem;
        border-radius: 6px;
        text-decoration: none;
        transition: all 0.2s;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
    }

    /* Related Work */
    .related-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .related-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        text-decoration: none;
        transition: all 0.2s;
    }

    .related-item:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    .related-content {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .related-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--bb-text-primary);
    }

    .related-meta {
        font-size: 0.8rem;
        color: var(--bb-text-muted);
    }

    .related-item svg {
        color: var(--bb-text-muted);
        transition: all 0.2s;
    }

    .related-item:hover svg {
        color: var(--bb-primary);
        transform: translateX(2px);
    }

    /* Add Section */
    .add-section {
        text-align: center;
        padding-top: 0.5rem;
    }

    .add-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        color: var(--bb-text-muted);
        font-size: 0.85rem;
        text-decoration: none;
        transition: color 0.2s;
    }

    .add-link:hover {
        color: var(--bb-primary);
    }

    /* Responsive */
    @media (max-width: 640px) {
        .card {
            padding: 1.25rem 1.25rem;
        }

        .page-header h1 {
            font-size: 1.5rem;
        }

        .project-link h2 {
            font-size: 1.25rem;
        }

        .stats-row {
            gap: 1.5rem;
        }

        .card-actions {
            flex-direction: column;
        }

        .btn-primary, .btn-secondary {
            justify-content: center;
        }
    }
</style>
